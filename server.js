require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Make io accessible to routes
app.set('socketio', io);

// Database connection
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/click-tracking';
const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

let MONGODB_URI = MONGO_URL;


if (MONGO_URL.includes('mongodb+srv://')) {
  MONGODB_URI = MONGO_URL;
} else if (MONGO_USERNAME && MONGO_PASSWORD) {
  // Local MongoDB with authentication
  MONGODB_URI = MONGO_URL.replace('mongodb://', `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@`);
} else if (MONGO_USERNAME) {
  // Local MongoDB with username only
  MONGODB_URI = MONGO_URL.replace('mongodb://', `mongodb://${MONGO_USERNAME}@`);
}

console.log('Connecting to MongoDB...');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB successfully');
}).catch((error) => {
  console.error('MongoDB connection error:', error.message);
  process.exit(1);
});


// Routes
app.use('/api', apiRoutes);

// Dashboard route
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected to dashboard:', socket.id);

  // Handle dashboard join
  socket.on('joinDashboard', () => {
    socket.join('dashboard');
    console.log('Client joined dashboard:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route Not Found' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Landing Page: http://localhost:${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}/dashboard`);
});
