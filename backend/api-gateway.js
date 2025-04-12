// api-gateway.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');

// Initialize Express app
const app = express();

// Connect to PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'user_db',
  host: process.env.DB_HOST || '127.0.0.1',
  port: 5432,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('Connected to PostgreSQL at:', res.rows[0].now);
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined')); // Logging

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to all routes
app.use(apiLimiter);

// Auth middleware
const authenticate = (req, res, next) => {
  // Skip authentication for login and register routes
  if (req.path === '/api/users/login' || req.path === '/api/users/register') {
    return next();
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

// Apply authentication middleware
app.use(authenticate);

// Service endpoints
const FARM_SERVICE_URL = process.env.FARM_SERVICE_URL || 'http://localhost:8080';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:8081';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8082';
const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8083';

// Proxy middleware options
const proxyOptions = {
  changeOrigin: true,
  pathRewrite: {
    '^/api/farms': '/',
    '^/api/users': '/',
    '^/api/notifications': '/',
    '^/api/analytics': '/',
  },
  onProxyReq: (proxyReq, req, res) => {
    // Forward auth token to microservices
    if (req.userData) {
      proxyReq.setHeader('X-User-Data', JSON.stringify(req.userData));
    }

    // If the body is JSON and not empty, restream it
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      // Update content-length
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      // Write body to request
      proxyReq.write(bodyData);
      proxyReq.end();
    }
  },
  // Handle proxy errors
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({
      message: 'Service temporarily unavailable',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Define health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      gateway: 'UP',
      // These will be updated through actual health checks in a production system
      farm: 'UNKNOWN',
      user: 'UNKNOWN',
      notification: 'UNKNOWN',
      analytics: 'UNKNOWN'
    }
  });
});

// Routes
// Farm Service routes
app.use(
  '/api/farms',
  createProxyMiddleware({
    ...proxyOptions,
    target: FARM_SERVICE_URL,
  })
);

// User Service routes
app.use(
  '/api/users',
  createProxyMiddleware({
    ...proxyOptions,
    target: USER_SERVICE_URL,
  })
);

// Notification Service routes
app.use(
  '/api/notifications',
  createProxyMiddleware({
    ...proxyOptions,
    target: NOTIFICATION_SERVICE_URL,
  })
);

// Analytics Service routes
app.use(
  '/api/analytics',
  createProxyMiddleware({
    ...proxyOptions,
    target: ANALYTICS_SERVICE_URL,
  })
);

// Root API endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Agriculture App API Gateway',
    version: '1.0.0',
    endpoints: [
      '/api/farms',
      '/api/users',
      '/api/notifications',
      '/api/analytics',
    ],
  });
});

// Options for CORS preflight requests
app.options('*', cors());

// Error handling
app.use((err, req, res, next) => {
  console.error('API Gateway Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went wrong',
  });
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down API Gateway');
  pool.end(); // Close database connections
});

module.exports = app;