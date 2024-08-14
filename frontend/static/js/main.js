
document.getElementById('option-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const data = {
        S: parseFloat(document.getElementById('S').value),
        K: parseFloat(document.getElementById('K').value),
        T: parseFloat(document.getElementById('T').value),
        r: parseFloat(document.getElementById('r').value/100),
        sigma: parseFloat(document.getElementById('sigma').value/100),
        option_type: document.getElementById('option_type').value
    };

    axios.post('/api/option-price', data)
        .then(response => {
            const {call, put, greeks} = response.data;
            console.log(greeks.delta)
            const elements = {
                'option-premium-call': `$${call.toFixed(2)}`,
                'option-premium-put': `$${put.toFixed(2)}`,
                'delta-call': greeks.delta_call.toFixed(2),
                'delta-put': greeks.delta_put.toFixed(2),
                'gamma': greeks.gamma.toFixed(2),
                'vega': greeks.vega.toFixed(2),
                'theta-call': greeks.theta_call.toFixed(2),
                'theta-put': greeks.theta_put.toFixed(2),
                // 'rho': greeks.rho.toFixed(2)
            
            };
            
            Object.keys(elements).forEach(id => {
                document.getElementById(id).innerText = elements[id];
            });



        })
        .catch(error => {
            document.getElementById('option-premium-call').innerText = 'Error: ' + error.response.data.error;
            document.getElementById('option-premium-put').innerText = 'Error: ' + error.response.data.error;
        }); 
});


function generatePayoffData(S, K, optionPrice, optionType) {
    const step = 1;               // Incremental step size for the stock price
    const maxPrice = S * 3;       // Maximum stock price to display on the chart
    const data = [];

    for (let price = 0; price <= maxPrice; price += step) {
        let payoff;
        if (optionType === 'call') {
            // Payoff calculation for a call option
            payoff = Math.max(0, price - K) - optionPrice;
        } else if (optionType === 'put') {
            // Payoff calculation for a put option
            payoff = Math.max(0, K - price) - optionPrice;
        }
        data.push({ x: price, y: payoff });
    }
    return data;
}

//function sumPayoffData()

function plotPayoff(data) {
    const trace = {
        x: data.map(point => point.x),
        y: data.map(point => point.y),
        mode: 'points',
        type: 'line'
    };

    const layout = {
        title: 'Option Payoff Diagram',
        xaxis: { title: 'Stock Price' },
        yaxis: { title: 'Payoff' }
    };

    Plotly.newPlot('payoff-chart', [trace], layout);
}