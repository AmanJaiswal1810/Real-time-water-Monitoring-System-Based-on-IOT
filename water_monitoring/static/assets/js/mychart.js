   


    function fetchLatestDataAndUpdate(endpoint, username, parameter, elementId) {
        fetch(endpoint)
            .then(response => response.json())
            .then(data => {
                // Filter data based on the username
                const userData = data.filter(entry => entry.username === username);
                // Assuming the filtered data array is not empty
                if (userData.length > 0) {
                    // Get the latest object from the filtered array
                    const latestData = userData[userData.length - 1];
                    // Get the value of the specified parameter from the latest object
                    const value = latestData[parameter];
                    // Update the content of the element with the specified ID
                    document.getElementById(elementId).textContent = value;
                } else {
                    console.error('No data available for the specified username:', username);
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }
    
    // Call the function for each parameter
    // Assuming you have set the username variable in your HTML
    fetchLatestDataAndUpdate('https://aman12345.pythonanywhere.com/api/iotData/', username, 'pHValue', 'phValue');
    fetchLatestDataAndUpdate('https://aman12345.pythonanywhere.com/api/iotData/', username, 'turbidity', 'turbidityValue');
    fetchLatestDataAndUpdate('https://aman12345.pythonanywhere.com/api/iotData/', username, 'temperature', 'temperatureValue');
    fetchLatestDataAndUpdate('https://aman12345.pythonanywhere.com/api/iotData/', username, 'dissolved_oxygen', 'oxygenValue'); // Assuming dissolved oxygen is represented by 'dissolved_oxygen' in your API
    
   
    
    async function fetchData(username) {
        try {
            const response = await fetch('https://aman12345.pythonanywhere.com/api/iotData/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json', // Set appropriate headers
                    // Add any other headers you need (e.g., authentication tokens)
                },
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
            console.log('Data from API:', data); // Display the fetched data in the console
            const userData = data.filter(entry => entry.username === username);
    
            // Get the latest entry from the data array
            const latestEntry = data[data.length - 1];
    
            // Extracting data for plotting
            const label = latestEntry.id;
            const pHValue = latestEntry.pHValue;
            const temperature = latestEntry.temperature;
            const turbidity = latestEntry.turbidity/100;
            const dissolved_oxygen = latestEntry.dissolved_oxygen;
    
            // Define ideal ranges for pH, temperature, turbidity, and dissolved_oxygen
            const idealRanges = {
                pH: { min: 6.5, max: 8.5 },
                temperature: { min: 0, max: 30 },
                turbidity: { min: 0, max: 5 },
                dissolved_oxygen: { min: 0, max: 15 }
            };
    
            // Function to determine background color based on value and ideal range
            function getBackgroundColor(value, idealRange) {
                if ( value > idealRange.max) {
                    return 'red'; // Value outside ideal range
                } else if (value >= idealRange.min && value <= idealRange.max) {
                    return 'green'; // Value within ideal range
                } else {
                    return 'yellow'; // Edge case
                }
            }
    
            // Creating the bar chart with dynamically changing background colors
            const ctx = document.getElementById('myChart').getContext('2d');
            const myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['pH Value', 'Temperature', 'Turbidity', 'Oxygen'],
                    datasets: [{
                        label: 'Latest Data',
                        data: [pHValue, temperature, turbidity, dissolved_oxygen],
                        backgroundColor: [
                            getBackgroundColor(pHValue, idealRanges.pH),
                            getBackgroundColor(temperature, idealRanges.temperature),
                            getBackgroundColor(turbidity, idealRanges.turbidity),
                            getBackgroundColor(dissolved_oxygen, idealRanges.dissolved_oxygen)
                        ]
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
            
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    
    // Call the fetchData function when the page loads
    window.addEventListener('load', () => {
        fetchData();
    });

    
    // Function to fetch and populate table data for the logged-in user
async function fetchDataAndPopulateTableForUser(username) {
    try {
        const response = await fetch('https://aman12345.pythonanywhere.com/api/iotData/');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Data from API:', data);
        
        // Filter data based on the username
        const userData = data.filter(entry => entry.username === username);
        userData.sort((a, b) => b.id - a.id);
        // Get the table body element
        const tableBody = document.getElementById('tableBody');
        
        // Clear existing rows
        tableBody.innerHTML = '';
        
        // Loop through the filtered data and populate the table
        userData.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.username}</td>
                <td>${entry.id}</td>
                <td>${entry.pHValue}</td>
                <td>${entry.turbidity}</td>
                <td>${entry.temperature}</td>
                <td>${entry.dissolved_oxygen}</td>
                <td><span class="status ${getWQILabel(entry)}">${getWQILabel(entry)}</span></td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Call the fetchDataAndPopulateTableForUser function when the page loads
window.addEventListener('load', () => {
    // Assuming you have set the username variable in your HTML
    fetchDataAndPopulateTableForUser(username);
});

    
    // Function to determine status based on pH and turbidity values
    function getWQILabel(entry) {
        const wqi = calculateWQI(entry.pHValue, entry.turbidity, entry.temperature, entry.dissolved_oxygen);
        if (wqi >= 60) {
            return 'safe';
        } else {
            return 'NotSafe';
        }
    }
    
    // Call the fetchDataAndPopulateTable function when the page loads
    window.addEventListener('load', () => {
        fetchDataAndPopulateTable();
    });

    
    async function fetchDataAndPlotChart(username) {
        try {
            const response = await fetch('https://aman12345.pythonanywhere.com/api/iotData/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
            console.log('Data from API:', data);
            const userData = data.filter(entry => entry.username === username); 
    
            // Calculate WQI for each entry
            const wqiData = data.map(entry => {
                const wqi = calculateWQI(entry.pHValue, entry.turbidity, entry.temperature, entry.dissolved_oxygen);
                return { timestamp: entry.id, wqi: wqi };
            });
    
            console.log('WQI Data:', wqiData);
    
            // Get the last 15 entries from the WQI data
            const last15WQIData = wqiData.slice(-15);
    
            // Extract timestamps and WQI values for plotting
            const timestamps = last15WQIData.map(entry => entry.timestamp);
            const wqiValues = last15WQIData.map(entry => entry.wqi);
    
            // Get the canvas element
            const canvas = document.getElementById('lineChart');
    
            // Plot the line chart
            const ctx = canvas.getContext('2d');
            const myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: timestamps,
                    datasets: [{
                        label: 'Water Quality Index (WQI)',
                        data: wqiValues,
                        borderColor: 'blue',
                        borderWidth: 2,
                        fill: false
                    }]
                },
                options: {
                    scales: {
                        xAxes: [{
                            type: 'linear',
                            position: 'bottom',
                            scaleLabel: {
                                display: true,
                                labelString: 'Timestamp'
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                stepSize: 10
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'WQI'
                            }
                        }]
                    }
                }
            });
    
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    
    // Call the fetchDataAndPlotChart function when the page loads
    window.addEventListener('load', () => {
        const username = "{{ username }}"; // Assuming you have a way to retrieve the username
        fetchDataAndPlotChart(username);
    });
    
    function calculateWQI(pH, turbidity, temperature, dissolved_oxygen) {
        // Define weights for each parameter
        const pHWeight = 0.25;
        const turbidityWeight = 0.25;
        const temperatureWeight = 0.25;
        const dissolved_oxygenWeight = 0.25;
    
        // Normalize parameters to a 0-100 scale
        const normalize = (value, min, max) => {
            return Math.min(Math.max((value - min) / (max - min) * 100, 0), 100);
        };
        turbidity/=100;
        // Calculate sub-indices for each parameter
        const pHSubIndex = normalize(pH, 6.5, 8.5);
        const turbiditySubIndex = normalize(turbidity, 0, 100);
        const temperatureSubIndex = normalize(temperature, 0, 30);
        const dissolved_oxygenSubIndex = normalize(dissolved_oxygen, 0, 15);
    
        // Calculate overall WQI using weighted sum of sub-indices
        const overallWQI = (pHSubIndex * pHWeight + turbiditySubIndex * turbidityWeight +
            temperatureSubIndex * temperatureWeight + dissolved_oxygenSubIndex * dissolved_oxygenWeight) /
            (pHWeight + turbidityWeight + temperatureWeight + dissolved_oxygenWeight);
    
        // Return the calculated WQI
        
        return overallWQI;
    }
    // console.log(calculateWQI());

   console.log(username,"error");