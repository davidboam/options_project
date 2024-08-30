from flask import Flask, request, jsonify, render_template
from flask_socketio import SocketIO, emit
from utils.black_scholes import Option, OptionArray, OptionStrategy


import time
import random
import threading

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')
socketio = SocketIO(app)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/calculator')
def calculator():
    return render_template('calculator.html')

@app.route('/sandbox')
def sandbox():
    return render_template('sandbox.html')

@app.route('/strategy')
def strategy():
    return render_template('strategy.html')



def update_price():
    while True:
        time.sleep(1)  # Update interval
        socketio.emit('price', get_stock_price())  # Use socketio.emit

@socketio.on('connect')
def handle_connect():
    # Start a background task to update the price regularly
    socketio.start_background_task(target=update_price)
    emit('price', get_stock_price())
        

def get_stock_price():
    return random.uniform(100, 200)

##Calculator Part of Application
@app.route('/api/option-price-calculator', methods=['POST'])
def option_price():
    data = request.json
    S = data['S']
    K = data['K']
    T = data['T']
    r = data['r']
    sigma = data['sigma']
    option_values = Option(S, K, T, r, sigma).calc_all()
    print(option_values)
    return jsonify(option_values)
    
@app.route('/api/option-strategy-calculator', methods=['POST'])
def option_strategy():
    data = request.json
    option_rows = [
        Option(
            option_type=opt["option_type"],
            quantity=opt["quantity"],
            option_action=opt["option_action"],
            S=opt["S"],
            K=opt["K"],
            r=opt["r"],
            T=opt["T"],
            sigma=opt["sigma"]
        )
        for opt in data
    ]
    
    option_array = OptionArray(option_rows)
    payoffs = option_array.calculate_profit()
    print(f"Option array: {option_array}")

    premiums = option_array.calculate_premiums()
    print(f"Premiums: {premiums}")

    
    
    print("Return value:", jsonify(premiums,payoffs))
    
    return jsonify(premiums,payoffs)

@app.route('/api/display-preset-strategy', methods=['POST'])
def display_preset_strategy():
    data = request.json
    strategy_name = data.get("strategy")

    option_strategy = OptionStrategy()

    strategy_details = option_strategy.get_strategy(strategy_name)

    return jsonify(strategy_details)

if __name__ == '__main__':
    socketio.run(app, debug=True)