// Import necessary modules
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();

// Initialize express app
const app = express();
app.use(express.static(path.join(__dirname, 'public'))); // Set static folder for CSS, JS, and images
app.use(bodyParser.urlencoded({ extended: true }));

// SQLite Database Initialization
const db = new sqlite3.Database(':memory:'); // In-memory DB, replace with persistent if needed
db.serialize(() => {
    db.run("CREATE TABLE Info (section TEXT, content TEXT)");
    db.run("INSERT INTO Info (section, content) VALUES ('Mission', 'This is the mission statement...')");
    db.run("INSERT INTO Info (section, content) VALUES ('AboutUs', 'This is the about us section content...')");
});

// Contact form submission endpoint
app.post('/send-contact', async (req, res) => {
    const { name, email, message } = req.body;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your_email@gmail.com', // Your email
            pass: 'your_password'         // Your email password
        }
    });

    const mailOptions = {
        from: email,
        to: 'projectawareness_contact@gmail.com',
        subject: `New message from ${name}`,
        text: message
    };

    try {
        await transporter.sendMail(mailOptions);
        res.send('Message sent successfully!');
    } catch (error) {
        res.send('Error sending message.');
    }
});

// Route to handle form submissions from both 'Donate' and 'Volunteer' forms
app.post('/send-donation', (req, res) => {
    const formData = req.body;

    if (formData.amount) {
        // Donation form submission
        console.log('Donation Form Data:', {
            amount: formData.amount,
            method: formData.method,
        });
        res.send('Thank you for your donation!');
    } else if (formData.name) {
        // Volunteer form submission
        console.log('Volunteer Form Data:', {
            name: formData.name,
            email: formData.email,
            experience: formData.experience,
        });
        res.send('Thank you for volunteering!');
    } else {
        res.send('Invalid form submission');
    }
});

// Mock data for real-time tracking
app.get('/api/tracking-status', (req, res) => {
    const data = [
        { area: "Old City", needs: "Food, Clothing" },
        { area: "Secunderabad", needs: "Medical Aid" },
        { area: "Miyapur", needs: "Shelter" },
    ];
    res.json(data);
});

// Fetch mission or about us content
app.get('/api/content/:section', (req, res) => {
    const section = req.params.section;
    db.get("SELECT content FROM Info WHERE section = ?", [section], (err, row) => {
        if (err) {
            res.status(500).send('Error fetching content');
        } else {
            res.json(row);
        }
    });
});

// Define the port and start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
const cors = require('cors');
app.use(cors());  // Enable CORS for all routes
