const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

console.log('🚀 Starting Simple Fixia Server...');
console.log('📍 Port:', PORT);
console.log('📍 Environment:', process.env.NODE_ENV);

// Basic middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('📡 Request from:', origin, req.method, req.url);
  
  if (origin && origin.includes('fixia-platform.vercel.app')) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', 'https://fixia-platform.vercel.app');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight');
    return res.status(200).end();
  }
  
  next();
});

// Health check
app.get('/health', (req, res) => {
  console.log('✅ Health check requested');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: 'simple-v1.0'
  });
});

// Test auth routes  
app.post('/api/auth/register', (req, res) => {
  console.log('📝 Registration attempt:', {
    email: req.body?.email,
    hasPassword: !!req.body?.password,
    firstName: req.body?.first_name,
    lastName: req.body?.last_name,
    userType: req.body?.user_type,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']
  });
  
  // Simulate different responses based on input
  if (!req.body?.email || !req.body?.password) {
    return res.status(400).json({
      success: false,
      error: 'Email y contraseña son requeridos',
      missing: {
        email: !req.body?.email,
        password: !req.body?.password
      }
    });
  }
  
  res.json({
    success: true,
    message: 'Registro exitoso - servidor de prueba funcionando correctamente',
    data: { 
      test: true,
      user: {
        email: req.body.email,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        user_type: req.body.user_type || 'customer'
      },
      token: 'test-token-12345'
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login attempt:', req.body?.email);
  res.json({
    success: true,
    message: 'Login exitoso - servidor de prueba',
    data: { 
      user: {
        email: req.body.email,
        first_name: 'Test',
        last_name: 'User',
        user_type: 'customer'
      },
      token: 'test-token-12345'
    }
  });
});

// Dashboard endpoints
app.get('/api/dashboard/explorer-stats', (req, res) => {
  console.log('📊 Dashboard stats requested');
  res.json({
    success: true,
    data: {
      totalServices: 150,
      activeRequests: 3,
      completedRequests: 12,
      favoriteProviders: 5,
      recentActivity: []
    }
  });
});

app.get('/api/dashboard/as-stats', (req, res) => {
  console.log('📊 AS Dashboard stats requested');
  res.json({
    success: true,
    data: {
      totalServices: 8,
      activeBookings: 2,
      completedBookings: 25,
      totalEarnings: 15000,
      rating: 4.8,
      recentBookings: []
    }
  });
});

// Profile endpoint
app.get('/api/auth/me', (req, res) => {
  console.log('👤 Profile requested');
  res.json({
    success: true,
    data: {
      id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      user_type: 'customer',
      created_at: new Date().toISOString()
    }
  });
});

// Catch all
app.use('*', (req, res) => {
  console.log('❓ Unknown route:', req.method, req.originalUrl);
  res.status(404).json({
    error: 'Endpoint no encontrado',
    method: req.method,
    url: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Simple server running on port ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/health`);
  console.log(`🔗 Ready for frontend connections`);
});

module.exports = app;