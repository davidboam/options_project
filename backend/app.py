from flask import Flask, request, jsonify, render_template
from utils.black_scholes import Option

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


@app.route('/api/option-price', methods=['POST'])
def option_price():
    data = request.json
    S = data['S']
    K = data['K']
    T = data['T']
    r = data['r']
    sigma = data['sigma']
    option_type = data['option_type']

    if option_type == 'call':
        price = Option(S, K, T, r, sigma).call()
    elif option_type == 'put':
        price = Option(S, K, T, r, sigma).put()

    option_values = Option(S, K, T, r, sigma).calc_all()
    print(option_values)
    return jsonify(option_values)

if __name__ == "__main__":
    app.run(debug=True)