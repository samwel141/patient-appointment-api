
// const express = require('express');
// const morgan = require('morgan');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const fs = require('fs');
// const path = require('path');
// const { v4: uuid4 } = require('uuid');
// const dotenv = require('dotenv');
// dotenv.config();

// const app = express();

// app.use(cors({
//     origin: '*',
//     methods: ['GET', 'POST', 'PUT'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.options('*', cors());

// app.use(morgan('dev'));
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// const PORT = process.env.PORT || 3001;

// app.get('/', (req, res) => {
//     res.send('Welcome to the Patient Appointment API!');
// });

// app.post('/api/appointment', async (req, res) => {
//     try {
//         console.log('Received request body:', req.body);
//         const patientData = req.body.patientData; 

//         if (!patientData || typeof patientData !== 'object') {
//             return res.status(400).json({ message: 'Invalid patient data provided' });
//         }

//         const dataFilePath = path.join(__dirname, 'data.json');
//         let data = [];

//         try {
//             if (fs.existsSync(dataFilePath)) {
//                 const fileContent = fs.readFileSync(dataFilePath, 'utf8');
//                 if (fileContent) {
//                     data = JSON.parse(fileContent);
//                 }
//             }
//         } catch (error) {
//             console.error('Error reading data from file:', error);
//             return res.status(500).json({ message: 'Error reading data from file.' });
//         }
//         const id = uuid4();
//         const formattedData = {
//             id,
//             firstname: patientData.firstname,
//             middlename: patientData.middlename,
//             surname: patientData.surname,
//             clinician: patientData.clinician,
//             time: patientData.time,
//             gender: patientData.gender
//         };
//         data.push(formattedData);

//         try {
//             fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 4));
//         } catch (error) {
//             console.error('Error writing data to file:', error);
//             return res.status(500).json({ message: 'Error writing data to file.' });
//         }

//         res.status(200).json({ message: 'Data saved successfully', data: [formattedData] });
//     } catch (error) {
//         console.error('Error:', error.message);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });



const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuid4 } = require('uuid');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;
const dataFilePath = path.join(__dirname, 'data.json');

// Function to read data from file
function readDataFromFile() {
    try {
        if (fs.existsSync(dataFilePath)) {
            const fileContent = fs.readFileSync(dataFilePath, 'utf8');
            if (fileContent) {
                return JSON.parse(fileContent);
            }
        }
        return [];
    } catch (error) {
        console.error('Error reading data from file:', error);
        return [];
    }
}

app.get('/', (req, res) => {
    res.send('Welcome to the Patient Appointment API!');
});

// POST endpoint to save appointment data
app.post('/api/appointment', async (req, res) => {
    try {
        console.log('Received request body:', req.body);
        const patientData = req.body.patientData;

        if (!patientData || typeof patientData !== 'object') {
            return res.status(400).json({ message: 'Invalid patient data provided' });
        }

        let data = readDataFromFile();

        const id = uuid4();
        const formattedData = {
            id,
            firstname: patientData.firstname,
            middlename: patientData.middlename,
            surname: patientData.surname,
            clinician: patientData.clinician,
            time: patientData.time,
            gender: patientData.gender,
            status: 'pending'
        };
        data.push(formattedData);

        try {
            fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 4));
        } catch (error) {
            console.error('Error writing data to file:', error);
            return res.status(500).json({ message: 'Error writing data to file.' });
        }

        res.status(200).json({ message: 'Data saved successfully', data: [formattedData] });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET endpoint to fetch all appointment data
app.get('/api/appointment', (req, res) => {
    try {
        const data = readDataFromFile();
        res.status(200).json({ message: 'Data retrieved successfully', data });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.put('/api/appointment/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        let data = readDataFromFile();
        const appointmentIndex = data.findIndex(appointment => appointment.id === id);

        if (appointmentIndex === -1) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        data[appointmentIndex].status = status;


        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 4));

        res.status(200).json({ message: 'Appointment status updated', updatedAppointment: data[appointmentIndex] });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
