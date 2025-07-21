const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for structured logging
const structuredFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += '\n' + JSON.stringify(meta, null, 2);
    }
    
    return log;
  })
);

// Create transports
const transports = [];

// Console transport for development
if (process.env.NODE_ENV === 'development') {
  transports.push(
    new winston.transports.Console({
      level: 'debug',
      format: consoleFormat
    })
  );
}

// File transports for all environments
// Error logs
transports.push(
  new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: structuredFormat,
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true
  })
);

// Combined logs
transports.push(
  new DailyRotateFile({
    filename: path.join(logsDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    format: structuredFormat,
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true
  })
);

// Audit logs for security and compliance
transports.push(
  new DailyRotateFile({
    filename: path.join(logsDir, 'audit-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
      winston.format((info) => {
        // Only log audit-related messages
        return info.category === 'audit' ? info : false;
      })()
    ),
    maxSize: '20m',
    maxFiles: '30d',
    zippedArchive: true
  })
);

// Performance logs
transports.push(
  new DailyRotateFile({
    filename: path.join(logsDir, 'performance-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
      winston.format((info) => {
        // Only log performance-related messages
        return info.category === 'performance' ? info : false;
      })()
    ),
    maxSize: '20m',
    maxFiles: '7d',
    zippedArchive: true
  })
);

// Business logs for analytics
transports.push(
  new DailyRotateFile({
    filename: path.join(logsDir, 'business-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
      winston.format((info) => {
        // Only log business-related messages
        return info.category === 'business' ? info : false;
      })()
    ),
    maxSize: '20m',
    maxFiles: '30d',
    zippedArchive: true
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: structuredFormat,
  defaultMeta: {
    service: 'fixia-backend',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    hostname: require('os').hostname(),
    pid: process.pid
  },
  transports,
  exitOnError: false
});

// Handle uncaught exceptions and rejections
logger.exceptions.handle(
  new DailyRotateFile({
    filename: path.join(logsDir, 'exceptions-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    format: structuredFormat,
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true
  })
);

logger.rejections.handle(
  new DailyRotateFile({
    filename: path.join(logsDir, 'rejections-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    format: structuredFormat,
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true
  })
);

// Add stream for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.info(message.trim(), { category: 'http' });
  }
};

module.exports = logger;