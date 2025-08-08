// Mock cache service for testing
const mockCacheService = {
  // Services caching
  getCachedServicesList: jest.fn().mockResolvedValue(null),
  cacheServicesList: jest.fn().mockResolvedValue(true),
  getCachedServiceDetails: jest.fn().mockResolvedValue(null),
  cacheServiceDetails: jest.fn().mockResolvedValue(true),
  invalidateServiceCache: jest.fn().mockResolvedValue(true),
  
  // User caching
  getCachedUserData: jest.fn().mockResolvedValue(null),
  cacheUserData: jest.fn().mockResolvedValue(true),
  invalidateUserCache: jest.fn().mockResolvedValue(true),
  
  // Dashboard caching
  getCachedDashboardStats: jest.fn().mockResolvedValue(null),
  cacheDashboardStats: jest.fn().mockResolvedValue(true),
  invalidateDashboardCache: jest.fn().mockResolvedValue(true),
  
  // Generic caching
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(true),
  del: jest.fn().mockResolvedValue(true),
  flush: jest.fn().mockResolvedValue(true),
  
  // Cache status
  isConnected: jest.fn().mockReturnValue(false), // Disabled in tests
  getStats: jest.fn().mockResolvedValue({
    hits: 0,
    misses: 0,
    keys: 0
  })
};

module.exports = mockCacheService;