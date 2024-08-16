let rowCount = 0;  // Counter to keep track of the number of rows


function addRow() {
    rowCount++;  // Increment the counter for each new row
    const table = document.getElementById('option-table');
    const tbody = table.querySelector('tbody');
    
    const newRow = document.createElement('tr');
    
    // Define unique IDs for each element
    const uniqueId = `row-${rowCount}`;
    
    const cells = `
        <td>
            <select class="form-value" id="${uniqueId}-option_action" >
                <option value="Buy">Buy</option>
                <option value="Sell">Sell</option>
            </select>
        </td>
        <td><input type="number" class="form-value" id="${uniqueId}-quantity"  min="1" value="1"></td>
        <td>
            <select class="form-value" id="${uniqueId}-option_type">
                <option value="Call">Call</option>
                <option value="Put">Put</option>
                <option value="Stock">Stock</option>
            </select>
        </td>
        <td><input type="number" class="form-value" id="${uniqueId}-S" step="0.01" placeholder="Enter underlying price"></td>
        <td><input type="number" class="form-value" id="${uniqueId}-K" step="0.01" placeholder="Enter strike price"></td>
        <td><input type="number" class="form-value" id="${uniqueId}-r" step="0.01" placeholder="Enter risk-free rate"></td>
        <td><input type="number" class="form-value" id="${uniqueId}-T" step="0.01" placeholder="Enter time to expiration in days"></td>
        <td><input type="number" class="form-value" id="${uniqueId}-sigma" step="0.01" placeholder="Enter volatility"></td>
        <td><input type="number" class="form-value" id="${uniqueId}-premium" step="0.01" readonly></td>
    `;

    newRow.innerHTML = cells;
    tbody.appendChild(newRow);
}

addRow()
document.getElementById('add-row-button').addEventListener('click', addRow);




function extractTableData() {
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
                S: parseFloat(S) || 0,
                K: parseFloat(K) || 0,
                r: parseFloat(r) || 0,
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
            
            

            // Plot payoff data
            
            plotData(payoffs);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
    }



function plotData(data) {
    // Clear previous plots
    d3.select("#chart").selectAll("*").remove();

    // Extract strategies and their corresponding data
    const strategies = Object.keys(data);

 

    // Define margins and dimensions
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleLinear().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);

    // Append SVG element
    const svg = d3.select("#chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Calculate the maximum length from the data arrays
    const maxX = Math.max(...strategies.map(key => data[key].length - 1));

    // Set domains based on data
    xScale.domain([0, maxX]); // X-axis: from 0 to max index
    yScale.domain([d3.min(Object.values(data).flat()), d3.max(Object.values(data).flat())]); // Y-axis: min and max of all values


    // Define color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Plot each strategy
    strategies.forEach((key, i) => {
        svg.append("path")
            .datum(data[key])
            .attr("fill", "none")
            .attr("stroke", color(i))
            .attr("stroke-width", 2)
            .attr("d", d3.line()
                .x((d, i) => xScale(i))
                .y(d => yScale(d))
            );
    });

    // Add X and Y axes
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(10));

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale).ticks(10));
}

document.getElementById('option-table').addEventListener('input', updateTable);
