const express = require('express');
const cors = require('cors');

// Create a minimal test server without heavy dependencies
const app = express();

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Enable CORS for testing
app.use(cors({
  origin: true,
  credentials: true
}));

// Test health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: 'test' });
});

// Import only necessary routes for testing
try {
  // Import routes that are properly mocked
  const authRoutes = require('../src/routes/auth');
  const servicesRoutes = require('../src/routes/services');
  
  // Mount routes
  app.use('/api/auth', authRoutes);
  app.use('/api/services', servicesRoutes);
  
} catch (error) {
  console.log('⚠️ Some routes not available in test mode:', error.message);
}

// Basic error handler for tests
app.use((err, req, res, next) => {
  console.error('Test server error:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'test' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado'
  });
});

module.exports = app;