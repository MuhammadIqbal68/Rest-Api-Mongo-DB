/**
 * Main Express Application Server Entry Point
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const noteRoutes = require('./routes/noteRoutes');
const authRoutes = require('./routes/authRoutes');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for cross-origin requests
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.url}`);
  next();
});

// Serve static dashboard files from public folder
app.use(express.static(path.join(__dirname, '../public')));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'Notes REST API',
    database: 'MongoDB Atlas'
  });
});

// Auth Routes (register, login, me)
app.use('/api/auth', authRoutes);

// API Routes
app.use('/api/notes', noteRoutes);

// 404 Handler for undefined routes
app.use(notFoundHandler);

// Global Error Handler
app.use(globalErrorHandler);

// Connect to MongoDB and start server if run directly
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 Notes REST API running on http://localhost:${PORT}`);
      console.log(`📝 Interactive Dashboard: http://localhost:${PORT}`);
      console.log(`🔌 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth Endpoints: http://localhost:${PORT}/api/auth`);
      console.log(`💾 Database: MongoDB Atlas (Mongoose)`);
      console.log(`=================================================`);
    });
  });
}

module.exports = app;
