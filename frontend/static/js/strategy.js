let rowCount = 0;  // Counter to keep track of the number of rows
let chart = null;

function addRow(option_action="Sell", quantity="1", option_type="Put", K="", T="", sigma="", premium="") {
    rowCount++;  // Increment the counter for each new row
    const table = document.getElementById('option-table');
    const tbody = table.querySelector('tbody');
    
    const newRow = document.createElement('tr');
    
    // Define unique IDs for each element
    const uniqueId = `row-${rowCount}`;
    
    const cells = `
        <td>
            <select class="form-value" id="${uniqueId}-option_action" value="${option_action}"  >
                <option value="Buy" selected>Buy</option>
                <option value="Sell">Sell</option>
            </select>
        </td>
        <td><input type="number" class="form-value" id="${uniqueId}-quantity"  min="1" value="1"></td>
        <td>
            <select class="form-value" id="${uniqueId}-option_type" value="${option_type}">
                <option value="Call" selected>Call</option>
                <option value="Put">Put</option>
                <option value="Stock">Stock</option>
            </select>
        </td>
        <td><input type="number" class="form-value" id="${uniqueId}-K" step="0.01" placeholder="Enter strike price" value="${K}"></td>
        <td><input type="number" class="form-value" id="${uniqueId}-T" step="0.01" placeholder="Enter time to expiration in days" value="${T}"></td>
        <td><input type="number" class="form-value" id="${uniqueId}-sigma" step="0.01" placeholder="Enter volatility" value="${sigma}"></td>
        <td><input type="number" class="form-value" id="${uniqueId}-premium" step="0.01" value="${premium}" readonly></td>
        <td><button class="delete-btn">X</button></td> <!-- X button added here -->
    `;

    newRow.innerHTML = cells;
    tbody.appendChild(newRow);


    renumberRows()
}


document.getElementById('add-row-button').addEventListener('click', addRow);




function extractTableData() {
    const globalS = parseFloat(document.getElementById('global-S').value) || 0;
    const globalR = parseFloat(document.getElementById('global-r').value) / 100 || 0;

    const rows = document.querySelectorAll('table tr'); // Select all rows in the table
    const data = [];

    rows.forEach(row => {
        // Find all input and select elements within the current row
        const option_action = row.querySelector('select[id^="row-"][id$="-option_action"]')?.value;
        const quantity = row.querySelector('input[id^="row-"][id$="-quantity"]')?.value;
        const option_type = row.querySelector('select[id^="row-"][id$="-option_type"]')?.value;
        const S = row.querySelector('input[id^="row-"][id$="-S"]')?.value;
        const K = row.querySelector('input[id^="row-"][id$="-K"]')?.value;
        const r = row.querySelector('input[id^="row-"][id$="-r"]')?.value/100;
        const T = row.querySelector('input[id^="row-"][id$="-T"]')?.value;
        const sigma = row.querySelector('input[id^="row-"][id$="-sigma"]')?.value/100;
        const premium = row.querySelector('input[id^="row-"][id$="-premium"]')?.value;

        // Only add the row data if any of the fields are populated
        if (option_action || quantity || option_type || S || K || r || T || sigma || premium) {
            data.push({
                option_action,
                quantity: parseFloat(quantity) || 0,
                option_type,
                S: globalS || 0,
                K: parseFloat(K) || 0,
                r: globalR || 0,
                T: parseFloat(T) || 0,
                sigma: parseFloat(sigma) || 0,
                premium: parseFloat(premium) || 0
            });
        }
    });

    return data; // Return the array of objects
}




function updateTable() {
    const data = extractTableData()

    axios.post('/api/option-strategy-calculator', data)
        .then(response => {
            const [premiums, payoffs] = response.data;
            
            document.querySelectorAll('#option-table tbody tr').forEach(row => {
                // Get the unique row id for the premium
                const premiumInput = row.querySelector('input[id$="-premium"]');
                
                if (premiumInput) {
                    const rowId = premiumInput.id; // Get the ID of the input element
                    const premiumKey = `option_premium_${rowId.split('-')[1]}`;
                    
                    // Update the premium value
                    premiumInput.value = premiums[premiumKey] ? premiums[premiumKey].toFixed(2) : 'N/A';
                }
            });
            
            
            plotData(payoffs)
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
        
    }


function plotData(data) {
    const strategies = Object.keys(data);
    const series = strategies.map((strategy) => ({
        name: strategy,
        data: data[strategy], // Array of payoffs for this strategy
    }));
   
       var options = {
           chart: {
               type: 'line', // Change to 'bar' or other types if needed
               height: 600
           },
           series: series,
           xaxis: {
               type: 'numeric',
               title: {
                   text: 'Stock Price' // Change this if your x-axis represents something else
               }
           },
           title: {
               text: 'Option Payoff Strategies',
               align: 'left'
           },
           colors: ['#FF4560', '#00E396', '#008FFB'], // Customize colors based on the number of series
           legend: {
               position: 'top'
           }
       };
       
       if (chart === null) {
        chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
        console.log("plotting")
    } else {
        chart.updateSeries(series);
        
        console.log("updating")
    }

}

document.getElementById('option-table').addEventListener('input', updateTable);
document.getElementById('global-inputs').addEventListener('input', updateTable);





function renumberRows() {
    const rows = document.querySelectorAll('#option-table tbody tr');
    rows.forEach((row, index) => {
        const rowId = index + 1; // New row ID starts from 1

        // Update IDs of all input/select elements in this row
        const inputs = row.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            // Replace the old row number with the new one
            input.id = input.id.replace(/-\d+/, `-${rowId}`);
        });
        
        // Update "X" button
        const deleteBtn = row.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteRow(row));
    });
}

document.addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('delete-btn')) {
        const row = event.target.closest('tr');
        row.remove();
        renumberRows()
        updateTable()
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const strategyDropdown = document.getElementById('strategy-dropdown');
    const addRowButton = document.getElementById('add-row-button');


    function updateStrategy() {
        const selectedStrategy = strategyDropdown.value;

        if (selectedStrategy === "Sandbox") {
            addRowButton.classList.remove("hidden");
        }
        else {
            addRowButton.classList.add("hidden");
            const data = {"strategy": selectedStrategy}
            axios.post('/api/display-preset-strategy', data)
            .then(response => {
                
                description = document.getElementById("description");
                description.innerHTML = response.data.description;
                const rows = response.data.options

                rows.forEach( row => {
                    console.log(row)
                    addRow(option_action=row.option_action, quantity=row.quantity, option_type=row.option_type, K=row.K, T=row.T, sigma=row.sigma, premium="")
                });
                
            })
            
        }
    }
    strategyDropdown.addEventListener('change', updateStrategy);

    // Initial call to set the visibility based on the default dropdown value
    updateStrategy();

});