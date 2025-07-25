const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🚀 Starting Fixia Production Server...');
console.log('📍 Environment:', process.env.NODE_ENV);
console.log('📍 Port:', process.env.PORT || 8080);

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
};

ensureDirectoryExists('uploads');
ensureDirectoryExists('uploads/profiles');
ensureDirectoryExists('uploads/services');
ensureDirectoryExists('uploads/documents');

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

// Static file serving moved to AFTER API routes but BEFORE 404 handler

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: 'production-v1.0'
  });
});

// Debug endpoint to check user status
app.get('/debug/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { query } = require('./src/config/database');
    
    const result = await query(`
      SELECT * FROM users WHERE email = $1
    `, [email]);
    
    if (result.rows.length === 0) {
      return res.json({ found: false, message: 'User not found' });
    }
    
    const user = result.rows[0];
    res.json({
      found: true,
      user: user,
      columns: Object.keys(user)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to check database tables
app.get('/debug/tables', async (req, res) => {
  try {
    const { query } = require('./src/config/database');
    
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tables = result.rows.map(row => row.table_name);
    
    res.json({
      tables: tables,
      count: tables.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to check service requests and interests
app.get('/debug/service-data', async (req, res) => {
  try {
    const { query } = require('./src/config/database');
    
    console.log('🔍 Checking service requests...');
    const requests = await query('SELECT id, title, explorer_id, status FROM explorer_service_requests LIMIT 5');
    console.log('✅ Service requests found:', requests.rows.length);
    
    console.log('🔍 Checking service interests...');
    const interests = await query('SELECT id, request_id, as_id, status FROM as_service_interests LIMIT 5');
    console.log('✅ Service interests found:', interests.rows.length);
    
    console.log('🔍 Checking for request ID 1...');
    const request1 = await query('SELECT * FROM explorer_service_requests WHERE id = 1');
    console.log('✅ Request 1 found:', request1.rows.length > 0);
    
    let interests1 = { rows: [] };
    if (request1.rows.length > 0) {
      console.log('🔍 Checking interests for request 1...');
      interests1 = await query('SELECT * FROM as_service_interests WHERE request_id = 1');
      console.log('✅ Interests for request 1:', interests1.rows.length);
    }
    
    res.json({
      service_requests: requests.rows,
      service_interests: interests.rows,
      request_1: request1.rows,
      request_1_interests: interests1.rows
    });
  } catch (error) {
    console.error('❌ Debug service data error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Debug login endpoint to see detailed errors
app.post('/debug/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔍 Debug login attempt:', { email, hasPassword: !!password });
    
    if (!email || !password) {
      return res.json({ error: 'Email and password required', step: 'validation' });
    }

    const { query } = require('./src/config/database');
    const { comparePassword } = require('./src/utils/helpers');
    
    // Find user
    const result = await query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
    console.log('🔍 User found:', result.rows.length > 0);
    
    if (result.rows.length === 0) {
      return res.json({ error: 'User not found', step: 'user_lookup' });
    }

    const user = result.rows[0];
    console.log('🔍 User details:', { 
      id: user.id, 
      email: user.email, 
      email_verified: user.email_verified,
      user_type: user.user_type 
    });

    // Check password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    console.log('🔍 Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.json({ error: 'Invalid password', step: 'password_check' });
    }

    // Check email verification
    if (!user.email_verified && process.env.NODE_ENV === 'production') {
      return res.json({ error: 'Email not verified', step: 'email_verification' });
    }

    res.json({ 
      success: true, 
      message: 'Login would succeed',
      user: {
        id: user.id,
        email: user.email,
        user_type: user.user_type
      }
    });

  } catch (error) {
    console.error('🔍 Debug login error:', error);
    res.status(500).json({ error: error.message, step: 'server_error' });
  }
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

// MISSING ROUTES - Adding all the routes from server.js
try {
  app.use('/api/test-email', require('./src/routes/test-email'));
  console.log('✅ Test email routes loaded');
} catch (e) {
  console.error('❌ Test email routes failed:', e.message);
}

try {
  app.use('/api/localities', require('./src/routes/localities'));
  console.log('✅ Localities routes loaded');
} catch (e) {
  console.error('❌ Localities routes failed:', e.message);
}

try {
  app.use('/api/bookings', authMiddleware, require('./src/routes/bookings'));
  console.log('✅ Bookings routes loaded');
} catch (e) {
  console.error('❌ Bookings routes failed:', e.message);
}

try {
  app.use('/api/reviews', authMiddleware, require('./src/routes/reviews'));
  console.log('✅ Reviews routes loaded');
} catch (e) {
  console.error('❌ Reviews routes failed:', e.message);
}

try {
  app.use('/api/chat', authMiddleware, require('./src/routes/chat'));
  console.log('✅ Chat routes loaded');
} catch (e) {
  console.error('❌ Chat routes failed:', e.message);
}

try {
  app.use('/api/payments', authMiddleware, require('./src/routes/payments'));
  console.log('✅ Payments routes loaded');
} catch (e) {
  console.error('❌ Payments routes failed:', e.message);
}

try {
  app.use('/api/notifications', authMiddleware, require('./src/routes/notifications'));
  console.log('✅ Notifications routes loaded');
} catch (e) {
  console.error('❌ Notifications routes failed:', e.message);
}

try {
  app.use('/api/professionals', require('./src/routes/professionals'));
  console.log('✅ Professionals routes loaded');
} catch (e) {
  console.error('❌ Professionals routes failed:', e.message);
}

try {
  app.use('/api/subscriptions', require('./src/routes/subscriptions'));
  console.log('✅ Subscriptions routes loaded');
} catch (e) {
  console.error('❌ Subscriptions routes failed:', e.message);
}

try {
  app.use('/api/reports', require('./src/routes/reports'));
  console.log('✅ Reports routes loaded');
} catch (e) {
  console.error('❌ Reports routes failed:', e.message);
}

try {
  app.use('/api/ranking', require('./src/routes/ranking'));
  console.log('✅ Ranking routes loaded');
} catch (e) {
  console.error('❌ Ranking routes failed:', e.message);
}

try {
  app.use('/api/badges', require('./src/routes/badges'));
  console.log('✅ Badges routes loaded');
} catch (e) {
  console.error('❌ Badges routes failed:', e.message);
}

try {
  app.use('/api/as-premium', require('./src/routes/as-premium'));
  console.log('✅ AS Premium routes loaded');
} catch (e) {
  console.error('❌ AS Premium routes failed:', e.message);
}

try {
  app.use('/api/as-settings', require('./src/routes/as-settings'));
  console.log('✅ AS Settings routes loaded');
} catch (e) {
  console.error('❌ AS Settings routes failed:', e.message);
}

try {
  app.use('/api/service-management', require('./src/routes/service-management'));
  console.log('✅ Service Management routes loaded');
} catch (e) {
  console.error('❌ Service Management routes failed:', e.message);
}

try {
  app.use('/api/smart-search', require('./src/routes/smart-search'));
  console.log('✅ Smart Search routes loaded');
} catch (e) {
  console.error('❌ Smart Search routes failed:', e.message);
}

try {
  app.use('/api/promotional-subscriptions', require('./src/routes/promotional-subscriptions'));
  console.log('✅ Promotional Subscriptions routes loaded');
} catch (e) {
  console.error('❌ Promotional Subscriptions routes failed:', e.message);
}

try {
  app.use('/api/availability-status', require('./src/routes/availability-status'));
  console.log('✅ Availability Status routes loaded');
} catch (e) {
  console.error('❌ Availability Status routes failed:', e.message);
}

try {
  app.use('/api/explorer', require('./src/routes/explorer'));
  console.log('✅ Explorer routes loaded');
} catch (e) {
  console.error('❌ Explorer routes failed:', e.message);
}

try {
  app.use('/api/as-interests', require('./src/routes/as-interests'));
  console.log('✅ AS Interests routes loaded');
} catch (e) {
  console.error('❌ AS Interests routes failed:', e.message);
}

try {
  app.use('/api/explorer-chat', require('./src/routes/explorer-chat'));
  console.log('✅ Explorer Chat routes loaded');
} catch (e) {
  console.error('❌ Explorer Chat routes failed:', e.message);
}

try {
  app.use('/api/explorer-reviews', require('./src/routes/explorer-reviews'));
  console.log('✅ Explorer Reviews routes loaded');
} catch (e) {
  console.error('❌ Explorer Reviews routes failed:', e.message);
}

try {
  app.use('/api/as-reviews', require('./src/routes/as-reviews'));
  console.log('✅ AS Reviews routes loaded');
} catch (e) {
  console.error('❌ AS Reviews routes failed:', e.message);
}

try {
  app.use('/api/mutual-confirmation', require('./src/routes/mutual-confirmation'));
  console.log('✅ Mutual Confirmation routes loaded');
} catch (e) {
  console.error('❌ Mutual Confirmation routes failed:', e.message);
}

try {
  app.use('/api/role-switching', require('./src/routes/role-switching'));
  console.log('✅ Role Switching routes loaded');
} catch (e) {
  console.error('❌ Role Switching routes failed:', e.message);
}

try {
  app.use('/api/verification', require('./src/routes/verification'));
  console.log('✅ Verification routes loaded');
} catch (e) {
  console.error('❌ Verification routes failed:', e.message);
}

try {
  app.use('/api/system', require('./src/routes/system-status'));
  console.log('✅ System Status routes loaded');
} catch (e) {
  console.error('❌ System Status routes failed:', e.message);
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

// Password reset endpoint (for direct links) - redirect to frontend
app.get('/recuperar-password', async (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.redirect('https://fixia-platform.vercel.app/auth/login?error=token-missing');
  }
  
  // Redirect to the frontend password reset page
  res.redirect(`https://fixia-platform.vercel.app/recuperar-password?token=${token}`);
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

// Static files MUST be before 404 handler
console.log('📁 Setting up static file serving for uploads...');

// MOVED: Static file serving for uploads with CORS (moved here to be before 404)
app.use('/uploads', (req, res, next) => {
  const origin = req.headers.origin || req.headers.referer;
  
  console.log('📁 Static file request:', {
    url: req.url,
    originalUrl: req.originalUrl,
    origin: origin,
    referer: req.headers.referer,
    userAgent: req.headers['user-agent']?.substring(0, 50)
  });
  
  // Always allow CORS for images (since origin might be undefined for direct requests)
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('📁 Static file OPTIONS handled');
    return res.status(200).end();
  }
  
  // Add cache control for images
  if (req.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    res.header('Cache-Control', 'public, max-age=31536000'); // 1 year
  }
  
  next();
}, express.static('uploads', {
  // Express.static options for security
  dotfiles: 'deny',
  index: false,
  redirect: false
}));

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