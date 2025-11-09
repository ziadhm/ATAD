const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');
const apiRoutes = require('./routes/api');
const redirectRoutes = require('./routes/redirect');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes with rate limiting
app.use('/api', apiLimiter, apiRoutes);

// Redirect routes (must be after API routes)
app.use('/', redirectRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║   🔗 URL Shortener with Analytics         ║
║                                           ║
║   Server running on port ${PORT}            ║
║   Environment: ${process.env.NODE_ENV || 'development'}              ║
║                                           ║
║   📊 Dashboard: http://localhost:${PORT}   ║
║   🔌 API: http://localhost:${PORT}/api      ║
║                                           ║
╚═══════════════════════════════════════════╝
  `);
});

module.exports = app;
