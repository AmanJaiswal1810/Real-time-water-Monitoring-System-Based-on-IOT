
    // Function to fetch latest data from the API and update the respective card's value
    function fetchLatestDataAndUpdate(endpoint, parameter, elementId) {
        fetch(endpoint)
            .then(response => response.json())
            .then(data => {
                // Assuming the API response contains an array of objects with the latest data
                // Get the latest object from the array
                const latestData = data[data.length - 1];
                // Get the value of the specified parameter from the latest object
                const value = latestData[parameter];
                // Update the content of the element with the specified ID
                document.getElementById(elementId).textContent = value;
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    // Call the function for each parameter
    fetchLatestDataAndUpdate('https://aman12345.pythonanywhere.com/api/iotData/', 'pHValue', 'phValue');
    fetchLatestDataAndUpdate('https://aman12345.pythonanywhere.com/api/iotData/', 'turbidity', 'turbidityValue');
    fetchLatestDataAndUpdate('https://aman12345.pythonanywhere.com/api/iotData/', 'temperature', 'temperatureValue');
    fetchLatestDataAndUpdate('https://aman12345.pythonanywhere.com/api/iotData/', 'salinity', 'oxygenValue'); // Assuming dissolved oxygen is represented by 'salinity' in your API

    async function fetchData() {
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
    
            // Get the latest entry from the data array
            const latestEntry = data[data.length - 1];
    
            // Extracting data for plotting
            const label = latestEntry.id;
            const pHValue = latestEntry.pHValue;
            const temperature = latestEntry.temperature;
            const turbidity = latestEntry.turbidity/100;
            const salinity = latestEntry.salinity;
    
            // Define ideal ranges for pH, temperature, turbidity, and salinity
            const idealRanges = {
                pH: { min: 6.5, max: 8.5 },
                temperature: { min: 0, max: 30 },
                turbidity: { min: 0, max: 5 },
                salinity: { min: 0, max: 15 }
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
                        data: [pHValue, temperature, turbidity, salinity],
                        backgroundColor: [
                            getBackgroundColor(pHValue, idealRanges.pH),
                            getBackgroundColor(temperature, idealRanges.temperature),
                            getBackgroundColor(turbidity, idealRanges.turbidity),
                            getBackgroundColor(salinity, idealRanges.salinity)
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

    async function fetchDataAndPopulateTable() {
        try {
            const response = await fetch('https://aman12345.pythonanywhere.com/api/iotData/');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('Data from API:', data);
            
            // Sort the data in decreasing order of the "id" field
            data.sort((a, b) => b.id - a.id);
            
            // Get the table body element
            const tableBody = document.getElementById('tableBody');
            
            // Clear existing rows
            tableBody.innerHTML = '';
            
            // Loop through the sorted data and populate the table
            data.forEach(entry => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${entry.username}</td>
                    <td>${entry.id}</td>
                    <td>${entry.pHValue}</td>
                    <td>${entry.turbidity}</td>
                    <td>${entry.temperature}</td>
                    <td>${entry.salinity}</td>
                    <td><span class="status ${getWQILabel(entry)}">${getWQILabel(entry)}</span></td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    
    // Function to determine status based on pH and turbidity values
    function getWQILabel(entry) {
        const wqi = calculateWQI(entry.pHValue, entry.turbidity, entry.temperature, entry.salinity);
        if (wqi <= 100) {
            return 'safe';
        } else {
            return 'NotSafe';
        }
    }
    
    // Call the fetchDataAndPopulateTable function when the page loads
    window.addEventListener('load', () => {
        fetchDataAndPopulateTable();
    });
    

    async function fetchDataAndPlotChart() {
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
    
            // Calculate WQI for each entry
            const wqiData = data.map(entry => {
                const wqi = calculateWQI(entry.pHValue, entry.turbidity, entry.temperature, entry.salinity);
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
        fetchDataAndPlotChart();
    });
    
    // Function to calculate Water Quality Index (WQI)
    function calculateWQI(pH, turbidity, temperature, salinity) {
        // Define weights for each parameter
        const pHWeight = 0.25;
        const turbidityWeight = 0.25;
        const temperatureWeight = 0.25;
        const salinityWeight = 0.25;
    
        // Calculate sub-indices for each parameter
        const pHSubIndex = (pH - 6) / (9 - 6) * 100;
        const turbiditySubIndex = (turbidity - 0) / (5 - 0) * 100;
        const temperatureSubIndex = (temperature - 0) / (30 - 0) * 100;
        const salinitySubIndex = (salinity - 0) / (15 - 0) * 100;
    
        // Calculate overall WQI using weighted sum of sub-indices
        const overallWQI = (pHSubIndex * pHWeight + turbiditySubIndex * turbidityWeight +
            temperatureSubIndex * temperatureWeight + salinitySubIndex * salinityWeight) /
            (pHWeight + turbidityWeight + temperatureWeight + salinityWeight);
    
        // Return the calculated WQI
        return overallWQI;
    }

    // ---------------------------------History Manipulation------------------------
    document.addEventListener('DOMContentLoaded', function() {
        const viewAllButton = document.getElementById('viewAllButton');
    
        // Add event listener to the View All button
        viewAllButton.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default behavior of the link
            // Toggle visibility of all table rows
            const rows = document.querySelectorAll('#tableBody tr');
            for (const row of rows) {
                row.style.display = 'table-row';
            }
            // Hide the View All button after clicking
            viewAllButton.style.display = 'none';
        });
    
        // Hide rows after the 15th initially
        const rows = document.querySelectorAll('#tableBody tr');
        for (let i = 15; i < rows.length; i++) {
            rows[i].style.display = 'none';
        }
    });
    
    
    
    
    

