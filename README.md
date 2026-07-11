# Landing Page - Lead Capture System

A modern, responsive landing page with gamified button-based inputs for lead capture, featuring dark/light mode, English/Malay language switcher, and FOMO elements.

## Features

- **Button-Based Inputs**: All form fields use clickable buttons (except phone number)
- **Dark/Light Mode Toggle**: Switch between themes
- **Language Switcher**: Toggle between English and Malay
- **FOMO Elements**: Countdown timer and limited spots counter
- **Data Storage**: Leads saved to JSON and automatically exported to CSV
- **Email Notifications**: Instant email alerts for new leads
- **Responsive Design**: Works on all devices

## Setup

### Prerequisites
- Node.js installed on your system

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure email settings:
   - Copy `.env.example` to `.env`
   - Update with your Gmail credentials
   - Note: For Gmail, use an App Password (not your regular password)

3. Start the server:
```bash
npm start
```

4. Open your browser to:
   - Frontend: `http://localhost:3000`
   - Download CSV: `http://localhost:3000/api/download/csv`

## Email Configuration

To enable email notifications:

1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password
4. Update `.env` file with:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

## Data Export

Leads are automatically saved in two formats:
- `leads.json` - Raw JSON data
- `leads.csv` - CSV format for Excel/Google Sheets

Download CSV at: `http://localhost:3000/api/download/csv`

## Customization

### Update Contact Information
Edit `index.html` - look for the `.contact-section` div and update:
- WhatsApp number
- Email address
- Office location

### Update Email Recipient
Edit `server.js` - change the `to` field in the `mailOptions` object:
```javascript
to: 'abang@example.com', // Update with Abang's email
```

### Adjust FOMO Elements
Edit `script.js`:
- Countdown duration: Modify the `24 * 60 * 60 * 1000` value
- Initial spots: Change `47` in the `initSpotsCounter` function
- Spot decrease frequency: Adjust `30000` (30 seconds) in the interval

## File Structure

```
landing-page/
├── index.html          # Frontend HTML
├── styles.css          # Styling
├── script.js           # Frontend JavaScript
├── server.js           # Backend server
├── package.json        # Dependencies
├── .env.example        # Environment variables template
├── leads.json          # Stored leads (auto-generated)
├── leads.csv           # CSV export (auto-generated)
└── README.md           # This file
```

## API Endpoints

- `POST /api/submit` - Submit a new lead
- `GET /api/leads` - Get all leads (admin)
- `GET /api/download/csv` - Download leads as CSV

## Form Fields

- Phone Number (text input)
- Gender (Male/Female buttons)
- Smoking Status (Yes/No buttons)
- Occupation Type (Safe/At Risk/Hazardous buttons)
- Age Range (0-5, 6-10, 11-15, etc. buttons)

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers
