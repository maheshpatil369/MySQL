require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const { testConnection, createEventsTable, createCalendarMarksTable } = require('./config/db'); // Removed chat-related imports
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const eventRoutes = require('./routes/eventRoutes'); // Import event routes
const calendarMarkRoutes = require('./routes/calendarMarkRoutes'); // Import calendar mark routes

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// === Middleware ===
app.use(cors({
  origin: 'http://localhost:5173', // Explicitly set for debugging
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware to log headers before body parsing
app.use((req, res, next) => {
  if (req.path === '/api/events' && req.method === 'POST') {
    console.log('Backend: Incoming request to /api/events POST. Headers:', JSON.stringify(req.headers, null, 2));
  }
  next();
});

app.use(express.json());

// Middleware to log body after parsing
app.use((req, res, next) => {
  if (req.path === '/api/events' && req.method === 'POST') {
    console.log('Backend: req.body AFTER express.json():', JSON.stringify(req.body, null, 2));
  }
  next();
});

app.use(express.urlencoded({ extended: true }));

// === Database Setup ===
testConnection()
  // .then(() => createChatMessagesTable()) // Removed call
  .then(() => createEventsTable())
  .then(() => createCalendarMarksTable())
  .then(() => {
    console.log('✅ Database connected and tables (events, calendar_marks) are ready.'); // Updated log
  })
  .catch(err => {
    console.error('❌ Database setup failed:', err.message);
    process.exit(1);
  });

// === Routes ===
app.get('/', (req, res) => {
  res.send('🚀 Backend server is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/events', eventRoutes); // Add event routes
app.use('/api/calendar-marks', calendarMarkRoutes); // Add calendar mark routes

// === Global Error Handler ===
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ msg: 'Internal Server Error' });
});

// === Socket.IO === (Chat related handlers removed)
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Add other non-chat Socket.IO event handlers here if needed in the future

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
    // If there were other rooms/logic, handle disconnection from them here
  });
});

// === Start Server ===
httpServer.listen(PORT, () => {
  console.log(`✅ Server is running on: http://localhost:${PORT}`);
});
