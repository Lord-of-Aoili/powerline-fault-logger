const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

const logsDir = path.join(__dirname, 'logs');

app.use(express.static('public'));
app.use(bodyParser.json());

function ensureLogsDirectory() {
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
}

// Function to get the next flight number for a given date
function getNextFlightNumber(date) {
    ensureLogsDirectory();

    const files = fs.readdirSync(logsDir);
    const flightNumbers = files
        .filter(file => file.startsWith(`${date}_fault_record_flight_`))
        .map(file => {
            const match = file.match(/flight_(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
        });

    return flightNumbers.length ? Math.max(...flightNumbers) + 1 : 1;
}

let currentFileName = '';
let fileStream = null;

function openNewFileStream(date, flightNumber) {
    ensureLogsDirectory();

    const newFileName = path.join(logsDir, `${date}_fault_record_flight_${flightNumber}.csv`);
    const fileExists = fs.existsSync(newFileName);

    if (fileStream && currentFileName !== newFileName) {
        fileStream.end();
        fileStream = null;
    }

    if (!fileStream) {
        fileStream = fs.createWriteStream(newFileName, { flags: 'a' });
        currentFileName = newFileName;
    }

    // Write headers only if the file does not already exist
    if (!fileExists) {
        fileStream.write(
            "Longitude,Latitude,WASP_ID,Label,Image #1,Image #2,Depot,Vicinity,Source Code,Bush Fire Area,Reported_Date,Observer_Name,Notes\n"
        );
    }
}


app.post('/log', (req, res) => {
    const faultRecord = req.body;
    const {
        Longitude = '',
        Latitude = '',
        WASP_ID = '',
        Label = '',
        Image1 = '',
        Image2 = '',
        Depot = '',
        Vicinity = '',
        Source_Code = '',
        Bush_Fire_Area = '',
        Reported_Date,
        Observer_Name,
        Notes,
    } = faultRecord;

    if (!Observer_Name || !Reported_Date || !Notes) {
        res.status(400).send('Missing required fields: Observer Name, Reported Date, or Notes');
        return;
    }

    const currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '_'); // Format as DD_MM_YY
    const flightNumber = getExistingFlightNumberOrCreateNew(currentDate); // Get the current flight or create flight 1

    openNewFileStream(currentDate, flightNumber); // Adjusted call to openNewFileStream

    const csvLine = `${Longitude},${Latitude},${WASP_ID},${Label},${Image1},${Image2},${Depot},${Vicinity},${Source_Code},${Bush_Fire_Area},${Reported_Date},${Observer_Name},${Notes}\n`;

    fileStream.write(csvLine, (err) => {
        if (err) {
            console.error('Failed to write to CSV:', err);
            res.status(500).send('Failed to log data');
        } else {
            res.send('Fault logged successfully');
        }
    });
});

function getExistingFlightNumberOrCreateNew(date) {
    ensureLogsDirectory();

    const files = fs.readdirSync(logsDir);
    const flightNumbers = files
        .filter(file => file.startsWith(`${date}_fault_record_flight_`))
        .map(file => {
            const match = file.match(/flight_(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
        });

    if (flightNumbers.length === 0) {
        // No flights for this date, default to flight 1
        return 1;
    }

    // Return the highest flight number if no "New Flight" is selected
    return Math.max(...flightNumbers);
}

app.get('/current-flight', (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ success: false, message: 'Date is required.' });
    }

    const flightNumbers = fs.readdirSync(logsDir)
        .filter(file => file.startsWith(`${date}_fault_record_flight_`))
        .map(file => {
            const match = file.match(/flight_(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
        });

    if (flightNumbers.length === 0) {
        return res.json({ success: true, flightNumber: null }); // No flight exists
    }

    const currentFlight = Math.max(...flightNumbers);
    res.json({ success: true, flightNumber: currentFlight });
});

app.post('/new-flight', express.json(), (req, res) => {
    const { date } = req.body;
    if (!date) {
        return res.status(400).json({ success: false, message: 'Date is required.' });
    }

    const flightNumber = getNextFlightNumber(date);
    const filename = `${date}_fault_record_flight_${flightNumber}.csv`;
    const filepath = path.join(logsDir, filename);

    try {
        if (!fs.existsSync(filepath)) {
            fs.writeFileSync(filepath, 'Longitude,Latitude,WASP_ID,Label,Image #1,Image #2,Depot,Vicinity,Source Code,Bush Fire Area,Reported_Date,Observer_Name,Notes\n');
        }
        res.json({ success: true, flightNumber, filename });
    } catch (error) {
        console.error('Error creating new flight CSV:', error);
        res.status(500).json({ success: false, message: 'Error creating CSV file.' });
    }
});

app.get('/check-file', (req, res) => {
    const { date, flightNumber } = req.query; // Expect `date` and `flightNumber` in the query params
    if (!date || !flightNumber) {
        res.status(400).send('Missing required parameters: date and flightNumber');
        return;
    }

    const filePath = path.join(logsDir, `${date}_fault_record_flight_${flightNumber}.csv`);
    console.log(`Checking existence for ${filePath}`);
    
    if (fs.existsSync(filePath)) {
        res.json({ exists: true });
    } else {
        res.json({ exists: false });
    }
});


app.post('/shutdown', (req, res) => {
    res.send('Server shutting down...');
    console.log('Shutdown initiated');
    setTimeout(() => {
        process.exit(0);
    }, 1000); // Delay to ensure the message is sent before shutting down
});

app.get('/health', (req, res) => {
    res.sendStatus(200); // Server is alive
});

app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://0.0.0.0:3000');
});
