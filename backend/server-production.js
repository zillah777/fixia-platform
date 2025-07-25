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

try {
  app.use('/api/email-verification', require('./src/routes/email-verification'));
  console.log('✅ Email verification routes loaded');
} catch (e) {
  console.error('❌ Email verification routes failed:', e.message);
}

// Email verification endpoint (for direct links) - redirect to frontend
app.get('/verificar-email', async (req, res) => {
  const { token, type } = req.query;
  
  if (!token) {
    return res.redirect('https://fixia-platform.vercel.app/auth/login?error=token-missing');
  }
  
  // Redirect to the beautiful frontend verification page that already exists
  res.redirect(`https://fixia-platform.vercel.app/verificar-email?token=${token}&type=${type || 'customer'}`);
});

// Also handle the API endpoint with GET (BEFORE 404 handler)
app.get('/api/email-verification/verify', async (req, res) => {
  try {
    console.log('📧 API verification requested:', req.query);
    const { token, type } = req.query;
    
    if (!token) {
      return res.status(400).json({
        error: 'Token de verificación requerido'
      });
    }

    // Direct verification implementation (same as /verificar-email)
    const { query } = require('./src/config/database');
    
    // Verify token and update user
    const result = await query(`
      UPDATE users 
      SET email_verified = true, email_verified_at = CURRENT_TIMESTAMP 
      WHERE id = (
        SELECT user_id FROM email_verification_tokens 
        WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP
      )
      RETURNING id, email, first_name, last_name
    `, [token]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({
        error: 'Token inválido o expirado'
      });
    }
    
    const user = result.rows[0];
    
    // Delete used token
    await query('DELETE FROM email_verification_tokens WHERE token = $1', [token]);
    
    console.log('✅ Email verified for user:', user.email);
    
    // Return success response
    res.json({
      success: true,
      message: `¡Email verificado exitosamente! Bienvenido ${user.first_name}`,
      data: {
        email: user.email,
        verified: true,
        redirect_url: 'https://fixia-platform.vercel.app/auth/login'
      }
    });
    
  } catch (error) {
    console.error('❌ API Email verification error:', error);
    res.status(500).json({
      error: 'Error en la verificación de email',
      details: error.message
    });
  }
});

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