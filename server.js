const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const Event = require('./models/event');
const Registration = require('./models/registration');

const app = express();

// Admin username + password
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "12345";

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const MONGO_URI = 'mongodb://127.0.0.1:27017/eventDB';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB Connected'))
  .then(async () => {
    const count = await Event.countDocuments();
    if (count === 0) {
      await Event.insertMany([
        { name: "Tech Talk", date: "2025-11-20", location: "Online", seats: 50 },
        { name: "Workshop", date: "2025-11-22", location: "Noida", seats: 30 },
        { name: "Coding Contest", date: "2025-11-25", location: "BIT Gorakhpur", seats: 100 },
        { name: "Webinar on AI", date: "2025-11-28", location: "Zoom", seats: 70 },
        { name: "Cyber Security Bootcamp", date: "2025-12-02", location: "Delhi", seats: 60 },
        { name: "Hackathon 2025", date: "2025-12-05", location: "Online", seats: 150 },
        { name: "Cloud Workshop", date: "2025-12-08", location: "Gorakhpur", seats: 80 },
        { name: "Blockchain Summit", date: "2025-12-10", location: "Lucknow", seats: 120 },
        { name: "ML for Beginners", date: "2025-12-12", location: "Online", seats: 75 },
        { name: "Startup Pitch Day", date: "2025-12-15", location: "BIT Gorakhpur", seats: 40 }
      ]);
      console.log('🌱 Default events inserted');
    }
  })
  .catch(err => console.error('❌ MongoDB Error:', err));

// ----------------------
// Page Routes
// ----------------------
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// Admin Pages
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-login.html')));
app.get('/admin-dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html')));

// User Pages
app.get('/user-login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'user-login.html')));
app.get('/event-registration', (req, res) => res.sendFile(path.join(__dirname, 'public', 'event-registration.html')));

// ----------------------
// Admin Login API
// ----------------------
app.post('/admin-login', (req, res) => {
  const { username, password } = req.body;
  if(username === ADMIN_USERNAME && password === ADMIN_PASSWORD) return res.json({ success: true });
  return res.json({ success: false });
});

// ----------------------
// API Endpoints
// ----------------------

// Get all events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch {
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// User register for event
app.post('/api/register', async (req, res) => {
  try {
    const { userName, email, eventId } = req.body;
    if(!userName || !email || !eventId) return res.status(400).json({ message: 'All fields are required' });

    const ev = await Event.findById(eventId);
    if(!ev) return res.status(404).json({ message: 'Event not found' });

    const reg = new Registration({ userName, email, eventId });
    await reg.save();

    res.json({ message: `✅ Registered successfully for ${ev.name}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get registrations by user email
app.get('/api/registrations/:email', async (req, res) => {
  try {
    const regs = await Registration.find({ email: req.params.email }).populate('eventId');
    res.json(regs);
  } catch {
    res.status(500).json({ message: 'Error fetching registrations' });
  }
});

// Delete registration
app.delete('/api/registrations/:id', async (req, res) => {
  try {
    await Registration.findByIdAndDelete(req.params.id);
    res.json({ message: '❌ Registration cancelled' });
  } catch {
    res.status(500).json({ message: 'Error cancelling registration' });
  }
});

// Admin: Get all registrations
app.get('/api/all-registrations', async (req, res) => {
  try {
    const regs = await Registration.find().populate('eventId');
    res.json(regs);
  } catch {
    res.status(500).json({ message: 'Error fetching all registrations' });
  }
});

// Admin: Add Event
app.post('/api/admin/add-event', async (req, res) => {
  try {
    const { name, date, location, seats } = req.body;
    if(!name || !date || !location || !seats) return res.status(400).json({ message: 'All fields are required' });

    const ev = new Event({ name, date, location, seats });
    await ev.save();

    res.json({ message: `📌 Event "${name}" added successfully` });
  } catch {
    res.status(500).json({ message: 'Error adding event' });
  }
});

// Admin: Delete Event
app.delete('/api/admin/delete-event/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: '🗑️ Event deleted successfully' });
  } catch {
    res.status(500).json({ message: 'Error deleting event' });
  }
});

// ----------------------
// Start Server
// ----------------------
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
