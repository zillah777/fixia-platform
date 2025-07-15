/**
 * User Type Transform Middleware
 * Automatically transforms user_type between frontend and database formats
 */

const { transformRequestMiddleware, transformResponse } = require('../utils/userTypeTransformer');

/**
 * Middleware to transform incoming request data
 * Converts 'customer' to 'client' in request body
 */
const transformRequest = transformRequestMiddleware;

/**
 * Middleware to transform outgoing response data
 * Converts 'client' to 'customer' in response body
 */
const transformResponseMiddleware = (req, res, next) => {
  // Store original json method
  const originalJson = res.json;
  
  // Override json method to transform response
  res.json = function(data) {
    if (data && typeof data === 'object') {
      // Transform the data before sending
      const transformedData = transformResponse(data);
      return originalJson.call(this, transformedData);
    }
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Combined middleware for both request and response transformation
 */
const userTypeTransformMiddleware = [transformRequest, transformResponseMiddleware];

module.exports = {
  transformRequest,
  transformResponseMiddleware,
  userTypeTransformMiddleware
};