const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./src/config/database');
const { authMiddleware } = require('./src/middleware/auth');

const app = express();

// Trust proxy for Railway deployment
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  }
});

// Middleware to inject Socket.IO
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/email-verification', require('./src/routes/email-verification'));
app.use('/api/users', authMiddleware, require('./src/routes/users'));
app.use('/api/categories', require('./src/routes/categories'));
app.use('/api/services', require('./src/routes/services'));
app.use('/api/bookings', authMiddleware, require('./src/routes/bookings'));
app.use('/api/reviews', authMiddleware, require('./src/routes/reviews'));
app.use('/api/chat', authMiddleware, require('./src/routes/chat'));
app.use('/api/payments', authMiddleware, require('./src/routes/payments'));
app.use('/api/notifications', authMiddleware, require('./src/routes/notifications'));
app.use('/api/professionals', require('./src/routes/professionals'));
app.use('/api/subscriptions', require('./src/routes/subscriptions'));
app.use('/api/reports', require('./src/routes/reports'));
app.use('/api/ranking', require('./src/routes/ranking'));
app.use('/api/badges', require('./src/routes/badges'));
app.use('/api/as-premium', require('./src/routes/as-premium'));
app.use('/api/as-settings', require('./src/routes/as-settings'));
app.use('/api/service-management', require('./src/routes/service-management'));
app.use('/api/smart-search', require('./src/routes/smart-search'));
app.use('/api/promotional-subscriptions', require('./src/routes/promotional-subscriptions'));
app.use('/api/availability-status', require('./src/routes/availability-status'));
app.use('/api/explorer', require('./src/routes/explorer'));
app.use('/api/as-interests', require('./src/routes/as-interests'));
app.use('/api/explorer-chat', require('./src/routes/explorer-chat'));
app.use('/api/explorer-reviews', require('./src/routes/explorer-reviews'));
app.use('/api/as-reviews', require('./src/routes/as-reviews'));
app.use('/api/mutual-confirmation', require('./src/routes/mutual-confirmation'));
app.use('/api/role-switching', require('./src/routes/role-switching'));
app.use('/api/dashboard', authMiddleware, require('./src/routes/dashboard'));
app.use('/api/verification', require('./src/routes/verification'));

// Socket.IO connection handling
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  } else {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);
  
  socket.join(`user_${socket.userId}`);
  
  socket.on('join_chat', (chatId) => {
    socket.join(`chat_${chatId}`);
  });
  
  socket.on('send_message', (data) => {
    socket.to(`chat_${data.chatId}`).emit('new_message', data);
  });
  
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Algo salió mal en el servidor',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado'
  });
});

// Start server
const startServer = async () => {
  try {
    await testConnection();
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, io };