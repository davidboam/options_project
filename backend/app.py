from flask import Flask, request, jsonify, render_template
from utils.black_scholes import Option, OptionArray

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/calculator')
def calculator():
    return render_template('calculator.html')

@app.route('/strategy')
def strategy():
    return render_template('strategy.html')

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
    
    
    print(jsonify(payoffs))
    return jsonify(payoffs)


    

if __name__ == "__main__":
    app.run(debug=True)