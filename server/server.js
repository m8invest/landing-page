const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./db');
const WaitlistEntry = require('./models/WaitlistEntry');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connecting to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// API for the form from the previous task
app.post('/api/submit-form', async (req, res) => {
    try {
        // Code for processing the main form
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error submitting form:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// API for the waitlist form
app.post('/api/submit-waitlist', async (req, res) => {
    try {
        const { email, telegram, questions } = req.body;
        
        // Checking required fields
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }

        if (!telegram) {
            return res.status(400).json({ success: false, error: 'Telegram username is required' });
        }
        
        // Creating a database record
        const waitlistEntry = new WaitlistEntry({
            email,
            telegram,
            questions,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        
        await waitlistEntry.save();
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error submitting waitlist form:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Serving the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Server error' });
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});