/**
 * User Type Transformer
 * Handles the mapping between frontend ('customer') and database ('client') user types
 * This maintains compatibility without breaking existing functionality
 */

// Frontend to Database mapping
const FRONTEND_TO_DB = {
  'customer': 'client',
  'provider': 'provider',
  'admin': 'admin'
};

// Database to Frontend mapping
const DB_TO_FRONTEND = {
  'client': 'customer',
  'provider': 'provider', 
  'admin': 'admin'
};

/**
 * Transform user type from frontend format to database format
 * @param {string} frontendUserType - User type from frontend ('customer', 'provider', 'admin')
 * @returns {string} Database user type ('client', 'provider', 'admin')
 */
function transformToDatabase(frontendUserType) {
  return FRONTEND_TO_DB[frontendUserType] || frontendUserType;
}

/**
 * Transform user type from database format to frontend format
 * @param {string} dbUserType - User type from database ('client', 'provider', 'admin')
 * @returns {string} Frontend user type ('customer', 'provider', 'admin')
 */
function transformToFrontend(dbUserType) {
  return DB_TO_FRONTEND[dbUserType] || dbUserType;
}

/**
 * Transform user object for database insertion/update
 * @param {Object} userData - User data from frontend
 * @returns {Object} User data formatted for database
 */
function transformUserForDatabase(userData) {
  if (!userData) return userData;
  
  const transformed = { ...userData };
  
  if (transformed.user_type) {
    transformed.user_type = transformToDatabase(transformed.user_type);
  }
  
  return transformed;
}

/**
 * Transform user object for frontend response
 * @param {Object} userData - User data from database
 * @returns {Object} User data formatted for frontend
 */
function transformUserForFrontend(userData) {
  if (!userData) return userData;
  
  const transformed = { ...userData };
  
  if (transformed.user_type) {
    transformed.user_type = transformToFrontend(transformed.user_type);
  }
  
  return transformed;
}

/**
 * Transform array of users for frontend response
 * @param {Array} users - Array of user objects from database
 * @returns {Array} Array of user objects formatted for frontend
 */
function transformUsersArrayForFrontend(users) {
  if (!Array.isArray(users)) return users;
  
  return users.map(user => transformUserForFrontend(user));
}

/**
 * Middleware to transform user_type in request body from frontend to database format
 */
function transformRequestMiddleware(req, res, next) {
  if (req.body && req.body.user_type) {
    req.body.user_type = transformToDatabase(req.body.user_type);
  }
  
  // Also handle nested user objects
  if (req.body && req.body.user && req.body.user.user_type) {
    req.body.user.user_type = transformToDatabase(req.body.user.user_type);
  }
  
  next();
}

/**
 * Transform response data to use frontend user types
 */
function transformResponse(data) {
  if (!data) return data;
  
  // Handle API response format with data.data (most common)
  if (data.data && typeof data.data === 'object') {
    // If data.data is a user object with user_type
    if (data.data.user_type) {
      data.data = transformUserForFrontend(data.data);
    }
    // If data.data has nested user objects
    if (data.data.user) {
      data.data.user = transformUserForFrontend(data.data.user);
    }
    if (data.data.users) {
      data.data.users = transformUsersArrayForFrontend(data.data.users);
    }
    // If data.data is an array of users
    if (Array.isArray(data.data)) {
      data.data = transformUsersArrayForFrontend(data.data);
    }
  }
  
  // Handle single user object
  if (data.user) {
    data.user = transformUserForFrontend(data.user);
  }
  
  // Handle array of users
  if (data.users) {
    data.users = transformUsersArrayForFrontend(data.users);
  }
  
  // Handle direct user object
  if (data.user_type) {
    data = transformUserForFrontend(data);
  }
  
  // Handle array at root level
  if (Array.isArray(data)) {
    data = transformUsersArrayForFrontend(data);
  }
  
  return data;
}

module.exports = {
  transformToDatabase,
  transformToFrontend,
  transformUserForDatabase,
  transformUserForFrontend,
  transformUsersArrayForFrontend,
  transformRequestMiddleware,
  transformResponse,
  FRONTEND_TO_DB,
  DB_TO_FRONTEND
};