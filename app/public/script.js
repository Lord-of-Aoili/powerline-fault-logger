let currentObserverName = 'None';
let currentDepot = 'None';
let currentFlightNumber = null;
let currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '_');


function showFaultModal(buttonId) {
    const faultOptions = document.getElementById('faultOptions');
    const poleEquipmentInputContainer = document.getElementById('poleEquipmentInputContainer');
    poleEquipmentInputContainer.style.display = 'none'; // Hide text input by default

    const faults = {
        pole: ['Burnt Pole', 'Termite or Insect damage', 'Defective Pole', 'Birds Nest'],
        guy: ['Guy Faulty', 'Guy Loose/Pole Leaning Sag'],
        crossarm: ['Badly weathered crossarm', 'Burnt Crossarm', 'Split Crossarm', 'Brace/Kingbolt'],
        insulator: ['Defective Insulator', 'Pin Loose/Leaning', 'Steel Bracket Loose/Unattached'],
        conductor: ['Broken Strand', 'Broken Ties', 'Foreign Object on Line'],
        vegetation: ['Vegetation Touching Bare LV', 'Vegetation Touching HV', 'Vegetation Near HV. 0m – 1.5m', 'Vegetation Overhanging HV'],
        poleEquipment: 'text', // Indicates this needs text input
    };

    const faultType = faults[buttonId];
    faultOptions.innerHTML = ''; // Clear previous options

    if (faultType === 'text') {
        poleEquipmentInputContainer.style.display = 'block'; // Show text input for Pole Equipment
    } else {
        faultType.forEach(fault => {
            const option = document.createElement('button');
            option.textContent = fault;
            option.onclick = () => logFault(buttonId, fault);
            faultOptions.appendChild(option);
        });
    }

    document.getElementById('faultModal').style.display = 'block'; // Show modal
    document.getElementById('faultTitle').textContent = `Select Fault for ${buttonId}`;
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.style.display = 'none');
}

function handlePoleEquipmentInput(event) {
    if (event.key === 'Enter') {
        const input = document.getElementById('poleEquipmentInput').value.trim();
        if (!input) {
            alert('Please specify a condition for Pole Equipment.');
            return;
        }
        logFault('poleEquipment', input);
    }
}

function logFault(buttonId, condition) {
    closeModal();

    if (!currentObserverName || currentObserverName === 'None') {
        alert('Please set an Observer Name before logging a fault.');
        return;
    }

    if (!currentDepot || currentDepot === 'None') {
        alert('Please set a Depot before logging a fault.');
        return;
    }

    // Create a fault record with relevant fields populated
    const faultRecord = {
        Longitude: '',          // Not populated
        Latitude: '',           // Not populated
        WASP_ID: '',            // Not populated
        Label: '',              // Not populated
        'Image #1': '',         // Not populated
        'Image #2': '',         // Not populated
        Depot: currentDepot,    // Always populated with the current depot
        Vicinity: '',           // Not populated
        'Source Code': '',      // Not populated
        'Bush Fire Area': '',   // Not populated
        'Reported_Date': new Date().toISOString().split('T')[0], // Current date
        'Observer_Name': currentObserverName, // Set observer name
        Notes: condition,       // Fault condition (e.g., "Burnt Pole")
    };

    console.log('Logged fault record:', faultRecord);

    // Replace with your server call to log the data
    fetch('/log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(faultRecord),
    })
        .then(response => response.text())
        .then(data => {
            console.log('Server response:', data);
            displayFeedback(`Logged fault: ${condition}`);
        })
        .catch(error => {
            console.error('Error logging fault:', error);
            alert('Failed to log fault.');
        });
}

function displayFeedback(message) {
    const feedbackElement = document.getElementById('feedback');

    // Create a new message element
    const messageDiv = document.createElement('div');
    messageDiv.className = 'feedback-message'; // Use the feedback-message class
    messageDiv.textContent = message;

    // Add the new message to the end of the feedback queue
    feedbackElement.appendChild(messageDiv);

    // Automatically remove the message after 8 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            feedbackElement.removeChild(messageDiv);
        }
    }, 8000);
}

function showInputModal(type) {
    const inputModal = document.getElementById('inputModal');
    const inputTitle = document.getElementById('inputTitle');
    const inputField = document.getElementById('inputField');

    inputField.value = ''; // Clear the input field

    if (type === 'observer') {
        inputTitle.textContent = 'Set Observer Name';
        inputField.setAttribute('data-type', 'observer');
    } else if (type === 'depot') {
        inputTitle.textContent = 'Set Depot';
        inputField.setAttribute('data-type', 'depot');
    }

    inputModal.style.display = 'block';
}

function handleInputField(event) {
    if (event.key === 'Enter') {
        const inputField = document.getElementById('inputField');
        const type = inputField.getAttribute('data-type');
        const value = inputField.value.trim();

        if (!value) {
            alert('Please enter a value.');
            return;
        }

        if (type === 'observer') {
            setObserverName(value);
        } else if (type === 'depot') {
            setDepot(value);
        }

        closeModal();
    }
}

function setObserverName(observerName) {
    currentObserverName = observerName;
    document.getElementById('currentObserver').textContent = currentObserverName;
    console.log('Observer updated to:', currentObserverName);
}

function setDepot(depotName) {
    currentDepot = depotName;
    document.getElementById('currentDepot').textContent = currentDepot;
    console.log('Depot updated to:', currentDepot);
}

// Function to download all records as a CSV
function downloadCSV() {
    const currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '_'); // Format as DD_MM_YY
    const filename = `${currentDate}_fault_record_flight_${currentFlightNumber}.csv`;

    let csvContent = "data:text/csv;charset=utf-8,Longitude,Latitude,WASP_ID,Label,Image #1,Image #2,Depot,Vicinity,Source Code,Bush Fire Area,Reported_Date,Observer_Name,Notes\n";
    
    // Example: Replace with actual data collected
    const dummyRecords = [
        { Longitude: '', Latitude: '', WASP_ID: '', Label: '', 'Image #1': '', 'Image #2': '', Depot: currentDepot, Vicinity: '', 'Source Code': '', 'Bush Fire Area': '', Reported_Date: new Date().toISOString().split('T')[0], Observer_Name: currentObserverName, Notes: 'Sample Fault' }
    ];

    dummyRecords.forEach(record => {
        const row = `${record.Longitude},${record.Latitude},${record.WASP_ID},${record.Label},${record['Image #1']},${record['Image #2']},${record.Depot},${record.Vicinity},${record['Source Code']},${record['Bush Fire Area']},${record.Reported_Date},${record.Observer_Name},${record.Notes}`;
        csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// Function to check server health
function checkServerStatus() {
    fetch('/health', { method: 'GET' }) // Endpoint for server health
        .then(response => {
            if (response.ok) {
                updateStatusBar('online'); // Server is reachable
            } else {
                updateStatusBar('offline'); // Server returned an error
            }
        })
        .catch(() => {
            updateStatusBar('offline'); // Network or server unreachable
        });
}

// Function to update the status bar
function updateStatusBar(status) {
    const statusElement = document.getElementById('status');
    if (status === 'online') {
        statusElement.textContent = 'Online';
        statusElement.className = 'status-online';
    } else {
        statusElement.textContent = 'Offline';
        statusElement.className = 'status-offline';
    }
}

// Periodically check server status every 2 seconds
setInterval(checkServerStatus, 2000);

// Call the function on page load to ensure immediate feedback
document.addEventListener('DOMContentLoaded', checkServerStatus);


// Shutdown server functionality
function shutdownServer() {
    if (confirm("Are you sure you want to shut down the server?")) {
        alert("Logs Complete :)\nShutting down");

        fetch('/shutdown', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.text())
        .then(data => {
            console.log('Server response:', data);
            setTimeout(() => {
                window.location.reload(true);
            }, 2000); // Adjust timing if necessary
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to shut down the server.');
        });
    } else {
        alert("Shutdown canceled by user.");
    }
}

function fetchCurrentFlightNumber() {
    fetch(`/current-flight?date=${currentDate}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentFlightNumber = data.flightNumber || 1; // Default to flight 1 if no flight exists
                document.getElementById('currentFlight').textContent = `Flight ${currentFlightNumber}`;
                console.log(`Current flight number is ${currentFlightNumber}`);
            } else {
                console.error('Failed to fetch current flight number:', data.message);
                currentFlightNumber = null;
                document.getElementById('currentFlight').textContent = 'None';
            }
        })
        .catch(error => {
            console.error('Error fetching current flight number:', error);
            currentFlightNumber = null;
            document.getElementById('currentFlight').textContent = 'None';
        });
}

// Call this function on page load
document.addEventListener('DOMContentLoaded', fetchCurrentFlightNumber);

// Function to create a new flight and generate a new CSV
function startNewFlight() {
    // Check if the observer name is set
    if (!currentObserverName || currentObserverName === 'None') {
        alert("Please set an Observer Name before starting a new flight.");
        return; // Exit the function if no observer is set
    }

    const currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '_'); // Format date as DD_MM_YY
    fetch(`/new-flight`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: currentDate }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update the current flight information
                currentFlightNumber = data.filename.match(/flight_(\d+)/)[1]; // Extract flight number from the filename
                document.getElementById('currentFlight').textContent = `Flight ${currentFlightNumber}`;
                displayFeedback(`New flight started: ${data.filename}`);
            } else {
                alert('Failed to create a new flight CSV.');
            }
        })
        .catch(error => {
            console.error('Error creating a new flight:', error);
            alert('Failed to create a new flight CSV.');
        });
}
