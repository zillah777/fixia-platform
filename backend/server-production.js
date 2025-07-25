const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

console.log('🚀 Starting Fixia Production Server...');
console.log('📍 Environment:', process.env.NODE_ENV);
console.log('📍 Port:', process.env.PORT || 8080);

const { testConnection } = require('./src/config/database');
const { authMiddleware } = require('./src/middleware/auth');

const app = express();
const PORT = process.env.PORT || 8080;

// Trust proxy for Railway
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Basic security
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Demasiadas solicitudes desde esta IP' }
});
app.use(limiter);

// CORS middleware - working configuration
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('🌐 Request from:', origin, req.method, req.url);
  
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

// Body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: 'production-v1.0'
  });
});

// API Routes - only the working ones
try {
  app.use('/api/auth', require('./src/routes/auth'));
  console.log('✅ Auth routes loaded');
} catch (e) {
  console.error('❌ Auth routes failed:', e.message);
}

try {
  app.use('/api/users', authMiddleware, require('./src/routes/users'));
  console.log('✅ Users routes loaded');
} catch (e) {
  console.error('❌ Users routes failed:', e.message);
}

try {
  app.use('/api/categories', require('./src/routes/categories'));
  console.log('✅ Categories routes loaded');
} catch (e) {
  console.error('❌ Categories routes failed:', e.message);
}

try {
  app.use('/api/services', require('./src/routes/services'));
  console.log('✅ Services routes loaded');
} catch (e) {
  console.error('❌ Services routes failed:', e.message);
}

try {
  app.use('/api/dashboard', require('./src/routes/dashboard'));
  console.log('✅ Dashboard routes loaded');
} catch (e) {
  console.error('❌ Dashboard routes failed:', e.message);
}

// 404 handler
app.use('*', (req, res) => {
  console.log('❓ Unknown route:', req.method, req.originalUrl);
  res.status(404).json({
    error: 'Endpoint no encontrado',
    method: req.method,
    url: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err.message);
  res.status(500).json({
    error: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (dbConnected) {
      console.log('✅ Database connected');
    } else {
      console.warn('⚠️ Database not connected');
    }
    
    app.listen(PORT, () => {
      console.log(`✅ Production server running on port ${PORT}`);
      console.log(`🌐 Health: http://localhost:${PORT}/health`);
      console.log(`🔗 Ready for production traffic`);
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;