require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser');
const { initializeDatabase } = require('./src/config/database');
const { getAuthPayload } = require('./src/middleware/auth');
const authRoutes = require('./src/routes/auth');
const complaintRoutes = require('./src/routes/complaints');

// Initialize database
initializeDatabase();

const app = express();
const PORT = process.env.PORT || 3001;
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.disable('x-powered-by');
app.use(express.json());
app.use(cookieParser());
app.use(express.static(PUBLIC_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// Page routes
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.get('/login', (req, res) => {
  if (getAuthPayload(req)) return res.redirect('/dashboard');
  res.sendFile(path.join(PUBLIC_DIR, 'login.html'));
});

app.get('/register', (req, res) => {
  if (getAuthPayload(req)) return res.redirect('/dashboard');
  res.sendFile(path.join(PUBLIC_DIR, 'register.html'));
});

app.get('/dashboard', (req, res) => {
  if (!getAuthPayload(req)) return res.redirect('/login');
  res.sendFile(path.join(PUBLIC_DIR, 'dashboard.html'));
});

app.get('/new-complaint', (req, res) => {
  if (!getAuthPayload(req)) return res.redirect('/login');
  res.sendFile(path.join(PUBLIC_DIR, 'new-complaint.html'));
});

app.get('/my-complaints', (req, res) => {
  if (!getAuthPayload(req)) return res.redirect('/login');
  res.sendFile(path.join(PUBLIC_DIR, 'my-complaints.html'));
});

app.get('/profile', (req, res) => {
  if (!getAuthPayload(req)) return res.redirect('/login');
  res.sendFile(path.join(PUBLIC_DIR, 'profile.html'));
});

app.use((req, res) => res.status(404).json({ error: 'Not found.' }));

app.listen(PORT, () => {
  console.log(`SatyaDrishti server running on http://localhost:${PORT}`);
});
