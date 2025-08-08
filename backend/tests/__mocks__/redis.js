// Mock Redis client for testing
const mockRedisClient = {
  // Connection state
  isConnected: false,
  isMock: true,
  
  // Basic Redis commands
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  exists: jest.fn().mockResolvedValue(0),
  expire: jest.fn().mockResolvedValue(1),
  ttl: jest.fn().mockResolvedValue(-1),
  
  // Hash commands
  hget: jest.fn().mockResolvedValue(null),
  hset: jest.fn().mockResolvedValue(1),
  hdel: jest.fn().mockResolvedValue(1),
  
  // Set commands
  sadd: jest.fn().mockResolvedValue(1),
  smembers: jest.fn().mockResolvedValue([]),
  srem: jest.fn().mockResolvedValue(1),
  
  // Utility commands
  ping: jest.fn().mockResolvedValue('PONG'),
  flushdb: jest.fn().mockResolvedValue('OK'),
  quit: jest.fn().mockResolvedValue('OK'),
  disconnect: jest.fn().mockResolvedValue('OK'),
  
  // Event handlers
  on: jest.fn(),
  off: jest.fn()
};

// Mock functions
const getRedisClient = jest.fn(() => mockRedisClient);
const isRedisConnected = jest.fn(() => false);
const testRedisConnection = jest.fn().mockResolvedValue(false);
const disconnectRedis = jest.fn().mockResolvedValue(true);
const generateCacheKey = jest.fn((prefix, ...parts) => `fixia:${prefix}:${parts.join(':')}`);

// Mock cache keys
const CACHE_KEYS = {
  USER: jest.fn((userId) => `fixia:user:${userId}`),
  SERVICE: jest.fn((serviceId) => `fixia:service:${serviceId}`),
  SERVICES_LIST: jest.fn((filters) => `fixia:services:list:${JSON.stringify(filters)}`),
  USER_SERVICES: jest.fn((userId) => `fixia:user:${userId}:services`),
  CATEGORIES: jest.fn(() => 'fixia:categories'),
  USER_SESSION: jest.fn((userId) => `fixia:session:${userId}`),
  RATE_LIMIT: jest.fn((ip, endpoint) => `fixia:rate_limit:${ip}:${endpoint}`),
  EMAIL_VERIFICATION: jest.fn((token) => `fixia:email_verification:${token}`),
  PASSWORD_RESET: jest.fn((token) => `fixia:password_reset:${token}`),
  SEARCH_RESULTS: jest.fn((query, filters) => `fixia:search:${query}:${JSON.stringify(filters)}`)
};

// Cache TTL values
const CACHE_TTL = {
  SHORT: 300,
  MEDIUM: 1800,
  LONG: 3600,
  VERY_LONG: 86400
};

module.exports = {
  getRedisClient,
  isRedisConnected,
  testRedisConnection,
  disconnectRedis,
  generateCacheKey,
  CACHE_KEYS,
  CACHE_TTL,
  createRedisClient: getRedisClient
};