// Board
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; // 32 * 16
let boardHeight = tileSize * rows; // 32 * 16
let context;

// Ship
let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = tileSize * columns / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;

let ship = {
    x: shipX,
    y: shipY,
    width: shipWidth,
    height: shipHeight
}

let shipImg;
let shipVelocityX = tileSize; // Ship moving speed

// Aliens
let alienArray = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let initialAlienRows = 2;
let initialAlienColumns = 3;
let alienRows = initialAlienRows;
let alienColumns = initialAlienColumns;
let alienCount = 0; // Number of aliens to defeat
let alienVelocityX = 1; // Alien moving speed

// Bullets
let bulletArray = [];
let bulletVelocityY = -10; // Bullet moving speed

let score = 0;
let gameOver = false;

window.onload = function () {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); // Used for drawing on the board

    // Load images
    shipImg = new Image();
    shipImg.src = "/static/images/ship.png";
    shipImg.onload = function () {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    alienImg = new Image();
    alienImg.src = "/static/images/alien.png";

    createAliens();

    requestAnimationFrame(update);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", shoot);
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        displayGameOver();
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    // Ship
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    // Aliens
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX;

            // If alien touches the borders
            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX * 2;

                // Move all aliens up by one row
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

            if (alien.y >= ship.y) {
                gameOver = true;
            }
        }
    }

    // Bullets
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // Bullet collision with aliens
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;
            }
        }
    }

    // Clear bullets
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift(); // Removes the first element of the array
    }

    // Next level
    if (alienCount == 0) {
        // Increase the number of aliens in columns and rows by 1
        score += alienColumns * alienRows * 100; // Bonus points :)
        alienColumns = Math.min(alienColumns + 1, columns / 2 - 2); // Cap at 16/2 -2 = 6
        alienRows = Math.min(alienRows + 1, rows - 4); // Cap at 16-4 = 12
        if (alienVelocityX > 0) {
            alienVelocityX += 0.2; // Increase the alien movement speed towards the right
        } else {
            alienVelocityX -= 0.2; // Increase the alien movement speed towards the left
        }
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

    // Score
    context.fillStyle = "white";
    context.font = "16px courier";
    context.fillText("Score: " + score, 5, 20);
}

function moveShip(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX; // Move left one tile
    } else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX; // Move right one tile
    }
}

function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let alien = {
                img: alienImg,
                x: alienX + c * alienWidth,
                y: alienY + r * alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function shoot(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "Space") {
        // Shoot
        let bullet = {
            x: ship.x + shipWidth * 15 / 32,
            y: ship.y,
            width: tileSize / 8,
            height: tileSize / 2,
            used: false
        }
        bulletArray.push(bullet);
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   // A's top left corner doesn't reach B's top right corner
           a.x + a.width > b.x &&   // A's top right corner passes B's top left corner
           a.y < b.y + b.height &&  // A's top left corner doesn't reach B's bottom left corner
           a.y + a.height > b.y;    // A's bottom left corner passes B's top left corner
}

function displayGameOver() {
    context.fillStyle = "white";
    context.font = "24px courier";
    context.textAlign = "center";
    context.fillText("Game Over", boardWidth / 2, boardHeight / 2 - 30);
    context.fillText("Score: " + score, boardWidth / 2, boardHeight / 2);
    context.fillText("Press Space to Restart", boardWidth / 2, boardHeight / 2 + 30);
}

function restartGame() {
    // Reset game state
    score = 0;
    alienArray = [];
    bulletArray = [];
    alienRows = initialAlienRows;
    alienColumns = initialAlienColumns;
    alienVelocityX = 0.30; // Reset alien speed
    createAliens();
    gameOver = false;
    requestAnimationFrame(update);
}

function handleKeyDown(e) {
    if (e.code === "Space") {
        if (gameOver) {
            restartGame();
        } else {
            moveShip(e);
        }
    } else {
        moveShip(e);
    }
}
