from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('main.html')

@app.route('/connect_four')
def connect_four():
    return render_template('connect_four.html')

@app.route('/wordle')
def wordle():
    return render_template('word.html')

@app.route('/flappybird')
def flappybird():
    return render_template('flappybird.html')

@app.route('/space')
def space():
    return render_template('space.html')

@app.route('/2048')
def game_2048():
    return render_template('2048.html')

if __name__ == '__main__':
    app.run(debug=True)
