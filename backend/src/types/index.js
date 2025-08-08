/**
 * COMPREHENSIVE DATABASE TYPE DEFINITIONS
 * Centralized type definitions for Fixia marketplace platform
 * Ensures consistency between frontend/backend and database operations
 */

// =====================================
// USER TYPES - CENTRALIZED DEFINITIONS  
// =====================================

/**
 * User Type Mapping - Single Source of Truth
 * Frontend uses 'customer', Database uses 'client'
 * This mapping ensures consistency across all operations
 */
const USER_TYPES = {
  FRONTEND: {
    CUSTOMER: 'customer',
    PROVIDER: 'provider', 
    AS: 'provider', // Alias for AS (service providers)
    ADMIN: 'admin'
  },
  DATABASE: {
    CLIENT: 'client',
    PROVIDER: 'provider',
    ADMIN: 'admin'
  },
  // Mapping functions
  toDatabase: (frontendType) => {
    const mapping = {
      'customer': 'client',
      'provider': 'provider',
      'admin': 'admin',
      'AS': 'provider' // Handle AS alias
    };
    return mapping[frontendType] || frontendType;
  },
  toFrontend: (dbType) => {
    const mapping = {
      'client': 'customer',
      'provider': 'provider', 
      'admin': 'admin'
    };
    return mapping[dbType] || dbType;
  }
};

// =====================================
// MESSAGE TYPES - STANDARDIZED
// =====================================

const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image', 
  DOCUMENT: 'document',
  FILE: 'file',
  SYSTEM: 'system'
};

// =====================================
// BOOKING STATUS TYPES
// =====================================

const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected'
};

// =====================================
// PAYMENT STATUS TYPES
// =====================================

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
};

// =====================================
// SUBSCRIPTION PLAN TYPES
// =====================================

const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  BASIC: 'basic',
  PROFESSIONAL: 'professional',
  PREMIUM: 'premium',
  PLUS: 'plus'
};

// =====================================
// VERIFICATION STATUS TYPES
// =====================================

const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
};

// =====================================
// NOTIFICATION TYPES
// =====================================

const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning', 
  ERROR: 'error',
  BOOKING: 'booking',
  PAYMENT: 'payment',
  MESSAGE: 'message',
  REVIEW: 'review',
  SYSTEM: 'system'
};

// =====================================
// DATABASE QUERY RETURN TYPES
// =====================================

/**
 * Standard User Query Result Structure
 * Based on actual PostgreSQL users table schema
 */
const USER_DB_SCHEMA = {
  id: 'INTEGER PRIMARY KEY',
  first_name: 'VARCHAR(100) NOT NULL',
  last_name: 'VARCHAR(100) NOT NULL',
  email: 'VARCHAR(255) UNIQUE NOT NULL',
  password_hash: 'VARCHAR(255) NOT NULL',
  phone: 'VARCHAR(20)',
  user_type: 'VARCHAR(20) NOT NULL', // 'client' | 'provider' | 'admin'
  profile_image: 'TEXT',
  date_of_birth: 'DATE',
  gender: 'VARCHAR(10)',
  locality: 'VARCHAR(100)',
  address: 'TEXT',
  bio: 'TEXT',
  verification_status: 'VARCHAR(20) DEFAULT pending',
  email_verified: 'BOOLEAN DEFAULT false',
  email_verified_at: 'TIMESTAMP',
  is_active: 'BOOLEAN DEFAULT true',
  last_login: 'TIMESTAMP',
  subscription_plan: 'VARCHAR(20)',
  created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
};

/**
 * Service Query Result Structure
 */
const SERVICE_DB_SCHEMA = {
  id: 'INTEGER PRIMARY KEY',
  user_id: 'INTEGER REFERENCES users(id)',
  category_id: 'INTEGER REFERENCES categories(id)', 
  title: 'VARCHAR(200) NOT NULL',
  description: 'TEXT NOT NULL',
  price: 'DECIMAL(10,2)',
  currency: 'VARCHAR(3) DEFAULT ARS',
  duration_hours: 'INTEGER',
  location: 'VARCHAR(200)',
  is_active: 'BOOLEAN DEFAULT true',
  created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
};

/**
 * Booking Query Result Structure  
 */
const BOOKING_DB_SCHEMA = {
  id: 'INTEGER PRIMARY KEY',
  client_id: 'INTEGER REFERENCES users(id)', // Maps to customer_id in frontend
  provider_id: 'INTEGER REFERENCES users(id)',
  service_id: 'INTEGER REFERENCES services(id)',
  booking_date: 'DATE NOT NULL',
  booking_time: 'TIME NOT NULL', 
  status: 'VARCHAR(20) DEFAULT pending',
  total_amount: 'DECIMAL(10,2)',
  currency: 'VARCHAR(3) DEFAULT ARS',
  notes: 'TEXT',
  created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
};

/**
 * Message Query Result Structure
 */
const MESSAGE_DB_SCHEMA = {
  id: 'INTEGER PRIMARY KEY',
  chat_id: 'INTEGER REFERENCES chats(id)',
  sender_id: 'INTEGER REFERENCES users(id)',
  content: 'TEXT NOT NULL',
  message_type: 'VARCHAR(20) DEFAULT text',
  attachment_url: 'TEXT',
  is_read: 'BOOLEAN DEFAULT false',
  created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
};

/**
 * Payment Query Result Structure
 */
const PAYMENT_DB_SCHEMA = {
  id: 'INTEGER PRIMARY KEY',
  booking_id: 'INTEGER REFERENCES bookings(id)',
  amount: 'DECIMAL(10,2) NOT NULL',
  currency: 'VARCHAR(3) DEFAULT ARS',
  payment_method: 'VARCHAR(50)',
  payment_status: 'VARCHAR(20) DEFAULT pending',
  transaction_id: 'VARCHAR(100)',
  mercadopago_id: 'VARCHAR(100)',
  processed_at: 'TIMESTAMP',
  created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
};

// =====================================
// TYPE TRANSFORMATION UTILITIES
// =====================================

/**
 * Transform database user to frontend format
 */
function transformUserToFrontend(dbUser) {
  if (!dbUser) return null;
  
  return {
    ...dbUser,
    user_type: USER_TYPES.toFrontend(dbUser.user_type),
    profile_photo_url: dbUser.profile_image, // Backward compatibility
    customer_id: dbUser.user_type === 'client' ? dbUser.id : undefined,
    provider_id: dbUser.user_type === 'provider' ? dbUser.id : undefined
  };
}

/**
 * Transform frontend user data to database format
 */
function transformUserToDatabase(frontendUser) {
  if (!frontendUser) return null;
  
  const dbUser = { ...frontendUser };
  dbUser.user_type = USER_TYPES.toDatabase(frontendUser.user_type);
  
  // Handle profile image mapping
  if (frontendUser.profile_photo_url && !dbUser.profile_image) {
    dbUser.profile_image = frontendUser.profile_photo_url;
  }
  
  // Remove frontend-specific fields
  delete dbUser.profile_photo_url;
  delete dbUser.customer_id;
  delete dbUser.provider_id;
  
  return dbUser;
}

/**
 * Transform booking data between frontend and database
 */
function transformBookingToFrontend(dbBooking) {
  if (!dbBooking) return null;
  
  return {
    ...dbBooking,
    customer_id: dbBooking.client_id, // Map client_id to customer_id for frontend
    scheduled_date: dbBooking.booking_date, // Backward compatibility  
    scheduled_time: dbBooking.booking_time // Backward compatibility
  };
}

function transformBookingToDatabase(frontendBooking) {
  if (!frontendBooking) return null;
  
  const dbBooking = { ...frontendBooking };
  
  // Map frontend fields to database fields
  if (frontendBooking.customer_id) {
    dbBooking.client_id = frontendBooking.customer_id;
    delete dbBooking.customer_id;
  }
  
  if (frontendBooking.scheduled_date) {
    dbBooking.booking_date = frontendBooking.scheduled_date;
    delete dbBooking.scheduled_date;
  }
  
  if (frontendBooking.scheduled_time) {
    dbBooking.booking_time = frontendBooking.scheduled_time;
    delete dbBooking.scheduled_time;
  }
  
  return dbBooking;
}

/**
 * Transform service data between frontend and database
 */
function transformServiceToFrontend(dbService) {
  if (!dbService) return null;
  
  return {
    ...dbService,
    provider_id: dbService.user_id, // Map user_id to provider_id for frontend
    address: dbService.location, // Backward compatibility
    duration_minutes: dbService.duration_hours ? dbService.duration_hours * 60 : undefined // Convert hours to minutes
  };
}

function transformServiceToDatabase(frontendService) {
  if (!frontendService) return null;
  
  const dbService = { ...frontendService };
  
  // Map frontend fields to database fields
  if (frontendService.provider_id) {
    dbService.user_id = frontendService.provider_id;
    delete dbService.provider_id;
  }
  
  if (frontendService.address) {
    dbService.location = frontendService.address;
    delete dbService.address;
  }
  
  if (frontendService.duration_minutes && !dbService.duration_hours) {
    dbService.duration_hours = Math.ceil(frontendService.duration_minutes / 60);
    delete dbService.duration_minutes;
  }
  
  return dbService;
}

// =====================================
// VALIDATION SCHEMAS
// =====================================

const VALIDATION_RULES = {
  user: {
    first_name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
    last_name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
    email: { required: true, type: 'email', maxLength: 255 },
    password: { required: true, type: 'string', minLength: 6 },
    phone: { type: 'string', maxLength: 20, pattern: /^\+?[1-9]\d{1,14}$/ },
    user_type: { required: true, enum: ['customer', 'provider', 'admin'] },
    locality: { type: 'string', maxLength: 100 },
    address: { type: 'string', maxLength: 1000 },
    bio: { type: 'string', maxLength: 500 }
  },
  service: {
    title: { required: true, type: 'string', minLength: 5, maxLength: 200 },
    description: { required: true, type: 'string', minLength: 20 },
    price: { type: 'number', min: 0, max: 999999.99 },
    currency: { type: 'string', maxLength: 3, default: 'ARS' },
    duration_hours: { type: 'number', min: 0.5, max: 24 },
    location: { type: 'string', maxLength: 200 }
  },
  booking: {
    provider_id: { required: true, type: 'number' },
    service_id: { required: true, type: 'number' },
    booking_date: { required: true, type: 'date' },
    booking_time: { required: true, type: 'time' },
    total_amount: { type: 'number', min: 0 },
    notes: { type: 'string', maxLength: 1000 }
  },
  message: {
    chat_id: { required: true, type: 'number' },
    content: { required: true, type: 'string', minLength: 1, maxLength: 1000 },
    message_type: { type: 'string', enum: Object.values(MESSAGE_TYPES), default: 'text' }
  },
  review: {
    booking_id: { required: true, type: 'number' },
    reviewed_id: { required: true, type: 'number' },
    rating: { required: true, type: 'number', min: 1, max: 5 },
    comment: { type: 'string', maxLength: 1000 }
  }
};

// =====================================
// API RESPONSE FORMATS
// =====================================

/**
 * Standard API Response Format
 */
function createApiResponse(success, message, data = null, error = null) {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  if (error !== null) {
    response.error = error;
  }
  
  return response;
}

/**
 * Paginated Response Format
 */
function createPaginatedResponse(items, page, limit, total, message = 'Success') {
  return createApiResponse(true, message, {
    items,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(total),
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  });
}

// =====================================
// EXPORTS
// =====================================

module.exports = {
  // Type constants
  USER_TYPES,
  MESSAGE_TYPES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  SUBSCRIPTION_PLANS,
  VERIFICATION_STATUS,
  NOTIFICATION_TYPES,
  
  // Database schemas
  USER_DB_SCHEMA,
  SERVICE_DB_SCHEMA,
  BOOKING_DB_SCHEMA,
  MESSAGE_DB_SCHEMA,
  PAYMENT_DB_SCHEMA,
  
  // Transformation functions
  transformUserToFrontend,
  transformUserToDatabase,
  transformBookingToFrontend,
  transformBookingToDatabase,
  transformServiceToFrontend,
  transformServiceToDatabase,
  
  // Validation
  VALIDATION_RULES,
  
  // API helpers
  createApiResponse,
  createPaginatedResponse
};