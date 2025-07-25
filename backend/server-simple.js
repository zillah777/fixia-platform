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
  console.log('📝 Registration attempt:', req.body?.email);
  res.json({
    success: true,
    message: 'Servidor funcionando - endpoint de prueba',
    data: { 
      test: true,
      received: req.body 
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login attempt:', req.body?.email);
  res.json({
    success: true,
    message: 'Servidor funcionando - login de prueba',
    data: { 
      test: true,
      received: req.body 
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