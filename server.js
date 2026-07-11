const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Data storage file
const DATA_FILE = path.join(__dirname, 'leads.json');
const CSV_FILE = path.join(__dirname, 'leads.csv');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Email configuration (Update with your email settings)
const emailConfig = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
};

// Create email transporter
const transporter = nodemailer.createTransport(emailConfig);

// Google Sheets configuration
let sheets;
try {
    const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH || './credentials.json';
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    
    const auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    sheets = google.sheets({ version: 'v4', auth });
    console.log('Google Sheets API initialized successfully');
    
    // Initialize sheet with headers
    initializeGoogleSheet();
} catch (error) {
    console.log('Google Sheets API not configured. Data will only be saved locally.');
    console.log('To enable Google Sheets, set up credentials.json and update .env');
}

// Submit lead
app.post('/api/submit', async (req, res) => {
    try {
        const lead = {
            ...req.body,
            id: Date.now(),
            timestamp: new Date().toISOString()
        };

        // Read existing leads
        const leads = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        leads.push(lead);

        // Save to JSON file
        fs.writeFileSync(DATA_FILE, JSON.stringify(leads, null, 2));

        // Export to CSV
        await exportToCSV(leads);

        // Send email notification
        await sendEmailNotification(lead);

        // Append to Google Sheets
        await appendToGoogleSheet(lead);

        res.json({ success: true, message: 'Lead submitted successfully' });
    } catch (error) {
        console.error('Error submitting lead:', error);
        res.status(500).json({ success: false, message: 'Error submitting lead' });
    }
});

// Get all leads (admin endpoint)
app.get('/api/leads', (req, res) => {
    try {
        const leads = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        res.json(leads);
    } catch (error) {
        console.error('Error reading leads:', error);
        res.status(500).json({ success: false, message: 'Error reading leads' });
    }
});

// Download CSV
app.get('/api/download/csv', (req, res) => {
    try {
        if (fs.existsSync(CSV_FILE)) {
            res.download(CSV_FILE, 'leads.csv');
        } else {
            res.status(404).json({ success: false, message: 'CSV file not found' });
        }
    } catch (error) {
        console.error('Error downloading CSV:', error);
        res.status(500).json({ success: false, message: 'Error downloading CSV' });
    }
});

// Export to CSV
async function exportToCSV(leads) {
    const csvWriter = createObjectCsvWriter({
        path: CSV_FILE,
        header: [
            { id: 'id', title: 'ID' },
            { id: 'timestamp', title: 'Timestamp' },
            { id: 'phone', title: 'Phone' },
            { id: 'gender', title: 'Gender' },
            { id: 'smoking', title: 'Smoking Status' },
            { id: 'occupation', title: 'Occupation' },
            { id: 'age', title: 'Age Range' }
        ]
    });

    await csvWriter.writeRecords(leads);
}

// Send email notification
async function sendEmailNotification(lead) {
    const mailOptions = {
        from: emailConfig.auth.user,
        to: emailConfig.auth.user, // Send to the same email configured in .env
        subject: '🎯 New Lead Submitted!',
        html: `
            <h2>New Lead Information</h2>
            <table style="border-collapse: collapse; width: 100%;">
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Phone:</strong></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${lead.phone}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Gender:</strong></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${lead.gender}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Smoking Status:</strong></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${lead.smoking}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Occupation:</strong></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${lead.occupation}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Age Range:</strong></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${lead.age}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Submitted:</strong></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${new Date(lead.timestamp).toLocaleString()}</td>
                </tr>
            </table>
            <p style="margin-top: 20px;"><strong>Contact this lead immediately!</strong></p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email notification sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't fail the submission if email fails
    }
}

// Initialize Google Sheet with headers
async function initializeGoogleSheet() {
    if (!sheets) return;

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId || spreadsheetId === 'your-sheet-id-here') {
        console.log('Google Sheet ID not configured, skipping initialization...');
        return;
    }

    try {
        const headers = [['Timestamp', 'Phone', 'Gender', 'Smoking Status', 'Occupation', 'Age Range']];
        
        const resource = {
            values: headers,
        };

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Sheet1!A1:F1',
            valueInputOption: 'USER_ENTERED',
            resource,
        });

        console.log('Google Sheet headers initialized successfully');
    } catch (error) {
        console.error('Error initializing Google Sheet:', error);
    }
}

// Append to Google Sheets
async function appendToGoogleSheet(lead) {
    if (!sheets) {
        console.log('Google Sheets not configured, skipping...');
        return;
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId || spreadsheetId === 'your-sheet-id-here') {
        console.log('Google Sheet ID not configured, skipping...');
        return;
    }

    try {
        const values = [
            [
                new Date(lead.timestamp).toLocaleString(),
                lead.phone,
                lead.gender,
                lead.smoking,
                lead.occupation,
                lead.age
            ]
        ];

        const resource = {
            values,
        };

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:F',
            valueInputOption: 'USER_ENTERED',
            resource,
        });

        console.log('Data appended to Google Sheets successfully');
    } catch (error) {
        console.error('Error appending to Google Sheets:', error);
        // Don't fail the submission if Google Sheets fails
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Frontend: http://localhost:${PORT}`);
    console.log(`Download CSV: http://localhost:${PORT}/api/download/csv`);
});
