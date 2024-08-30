// Function to get form data
function getFormData() {
    return {
        S: parseFloat(document.getElementById('S').value),
        K: parseFloat(document.getElementById('K').value),
        T: parseFloat(document.getElementById('T').value),
        r: parseFloat(document.getElementById('r').value / 100),
        sigma: parseFloat(document.getElementById('sigma').value / 100),
    };
}

// Function to update results
function updateResults() {
    const data = getFormData();

    axios.post('/api/option-price-calculator', data)
        .then(response => {
            const { call, put, greeks } = response.data;
            const elements = {
                'option-premium-call': `$${call.toFixed(2)}`,
                'option-premium-put': `$${put.toFixed(2)}`,
                'delta-call': greeks.delta_call.toFixed(4),
                'delta-put': greeks.delta_put.toFixed(4),
                'gamma': greeks.gamma.toFixed(4),
                'vega': greeks.vega.toFixed(4),
                'theta-call': greeks.theta_call.toFixed(4),
                'theta-put': greeks.theta_put.toFixed(4),
                'rho-call': greeks.rho_call.toFixed(4),
                'rho-put': greeks.rho_put.toFixed(4)
            };

            Object.keys(elements).forEach(id => {
                document.getElementById(id).innerText = elements[id];
            });

        })
        .catch(error => {
            document.getElementById('option-premium-call').innerText = 'Error: ' + (error.response?.data?.error || 'Unknown error');
            document.getElementById('option-premium-put').innerText = 'Error: ' + (error.response?.data?.error || 'Unknown error');
        });
}

// Attach event listeners to form fields
document.getElementById('option-form').addEventListener('input', updateResults);

// Initial call to set results on page load if needed
updateResults();


