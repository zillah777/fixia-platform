/**
 * Debug middleware for authentication issues
 */

const jwt = require('jsonwebtoken');
const { logger } = require('../utils/smartLogger');

const debugAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  logger.info('🔐 Debug Auth Middleware', {
    url: req.originalUrl,
    method: req.method,
    hasAuthHeader: !!authHeader,
    authHeaderType: authHeader ? authHeader.split(' ')[0] : 'none',
    tokenLength: token ? token.length : 0,
    tokenPrefix: token ? token.substring(0, 20) + '...' : 'none',
    contentType: req.headers['content-type'],
    userAgent: req.headers['user-agent']?.substring(0, 50)
  });

  if (token) {
    try {
      // Try to decode without verifying to see the payload
      const decoded = jwt.decode(token);
      logger.info('🔍 Token decoded (no verification)', {
        userId: decoded?.id,
        email: decoded?.email,
        userType: decoded?.user_type,
        iat: decoded?.iat,
        exp: decoded?.exp,
        isExpired: decoded?.exp ? Date.now() >= decoded.exp * 1000 : 'unknown',
        timeToExpiry: decoded?.exp ? Math.round((decoded.exp * 1000 - Date.now()) / 1000) : 'unknown'
      });
    } catch (decodeError) {
      logger.error('❌ Token decode error', {
        error: decodeError.message,
        tokenStart: token.substring(0, 20)
      });
    }
  }
  
  next();
};

module.exports = { debugAuthMiddleware };