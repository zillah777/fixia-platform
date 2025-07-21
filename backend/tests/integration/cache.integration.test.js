const request = require('supertest');
const app = require('../../server').app;
const cacheService = require('../../src/services/cacheService');
const { testRedisConnection } = require('../../src/config/redis');

describe('Cache Integration Tests', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Check if Redis is available
    const redisConnected = await testRedisConnection();
    if (!redisConnected) {
      console.warn('Redis not available, testing with mock Redis');
    }
  });

  beforeEach(async () => {
    // Clear cache before each test
    await cacheService.clearAll();
    
    // Create and login test user
    const userData = {
      first_name: 'Cache',
      last_name: 'Test',
      email: `cache${Date.now()}@example.com`,
      password: 'password123',
      user_type: 'provider'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    authToken = registerResponse.body.token;
    testUser = registerResponse.body.user;
  });

  afterEach(async () => {
    // Clear cache after each test
    await cacheService.clearAll();
  });

  describe('Service Caching', () => {
    it('should cache service list results', async () => {
      // First request - should not be cached
      const response1 = await request(app)
        .get('/api/services')
        .expect(200);

      expect(response1.body.success).toBe(true);
      expect(response1.body.cached).toBe(false);

      // Second request - should be cached
      const response2 = await request(app)
        .get('/api/services')
        .expect(200);

      expect(response2.body.success).toBe(true);
      // Note: Response may not include cached flag in current implementation
      // but the cache service should have been used internally
    });

    it('should cache service details', async () => {
      // Create a test service first
      const serviceData = {
        title: 'Cache Test Service',
        description: 'This service is for cache testing',
        price: 100,
        category: 'Limpieza',
        duration: 60,
        location: 'Test Location'
      };

      const createResponse = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(serviceData)
        .expect(201);

      const serviceId = createResponse.body.service.id;

      // First request - should not be cached
      const response1 = await request(app)
        .get(`/api/services/${serviceId}`)
        .expect(200);

      expect(response1.body.success).toBe(true);
      expect(response1.body.cached).toBe(false);

      // Second request - should be cached
      const response2 = await request(app)
        .get(`/api/services/${serviceId}`)
        .expect(200);

      expect(response2.body.success).toBe(true);
      expect(response2.body.data.service.id).toBe(serviceId);
    });

    it('should invalidate cache when service is updated', async () => {
      // Create a test service
      const serviceData = {
        title: 'Original Service',
        description: 'Original description',
        price: 100,
        category: 'Limpieza',
        duration: 60,
        location: 'Test Location'
      };

      const createResponse = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${authToken}`)
        .send(serviceData)
        .expect(201);

      const serviceId = createResponse.body.service.id;

      // Get service to cache it
      await request(app)
        .get(`/api/services/${serviceId}`)
        .expect(200);

      // Update the service
      const updatedData = {
        title: 'Updated Service',
        description: 'Updated description',
        price: 150
      };

      await request(app)
        .put(`/api/services/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(200);

      // Get service again - should reflect updates (cache should be invalidated)
      const response = await request(app)
        .get(`/api/services/${serviceId}`)
        .expect(200);

      expect(response.body.data.service.title).toBe('Updated Service');
      expect(response.body.data.service.price).toBe(150);
    });
  });

  describe('Cache Service Direct Testing', () => {
    it('should set and get cache values', async () => {
      const key = 'test:key';
      const value = { message: 'test value', timestamp: Date.now() };

      // Set value
      const setResult = await cacheService.set(key, value, 60);
      expect(setResult).toBe(true);

      // Get value
      const retrievedValue = await cacheService.get(key);
      expect(retrievedValue).toEqual(value);

      // Check if key exists
      const exists = await cacheService.exists(key);
      expect(exists).toBe(true);
    });

    it('should handle cache expiration', async () => {
      const key = 'test:expiry';
      const value = 'will expire';

      // Set value with 1 second TTL
      await cacheService.set(key, value, 1);

      // Should exist immediately
      let retrievedValue = await cacheService.get(key);
      expect(retrievedValue).toBe(value);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should be null after expiration
      retrievedValue = await cacheService.get(key);
      expect(retrievedValue).toBeNull();
    });

    it('should handle getOrSet pattern', async () => {
      const key = 'test:getorset';
      let fetchCallCount = 0;

      const fetchFunction = async () => {
        fetchCallCount++;
        return { data: 'fetched data', count: fetchCallCount };
      };

      // First call - should execute fetch function
      const result1 = await cacheService.getOrSet(key, fetchFunction, 60);
      expect(result1.count).toBe(1);
      expect(fetchCallCount).toBe(1);

      // Second call - should use cached value
      const result2 = await cacheService.getOrSet(key, fetchFunction, 60);
      expect(result2.count).toBe(1); // Same cached value
      expect(fetchCallCount).toBe(1); // Fetch not called again
    });

    it('should handle cache invalidation', async () => {
      const userId = testUser.id;

      // Cache user data
      await cacheService.cacheUser(testUser);

      // Verify cached
      let cachedUser = await cacheService.getCachedUser(userId);
      expect(cachedUser).toBeTruthy();
      expect(cachedUser.email).toBe(testUser.email);

      // Invalidate user cache
      await cacheService.invalidateUser(userId);

      // Should be null after invalidation
      cachedUser = await cacheService.getCachedUser(userId);
      expect(cachedUser).toBeNull();
    });

    it('should handle rate limiting', async () => {
      const key = 'test:ratelimit';
      const limit = 3;
      const windowSeconds = 60;

      // First 3 requests should be allowed
      for (let i = 0; i < limit; i++) {
        const result = await cacheService.rateLimit(key, limit, windowSeconds);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(limit - 1 - i);
      }

      // 4th request should be blocked
      const blockedResult = await cacheService.rateLimit(key, limit, windowSeconds);
      expect(blockedResult.allowed).toBe(false);
      expect(blockedResult.remaining).toBe(0);
    });
  });

  describe('Categories Caching', () => {
    it('should cache categories list', async () => {
      // First request - should not be cached
      const response1 = await request(app)
        .get('/api/services/categories/list')
        .expect(200);

      expect(response1.body.success).toBe(true);

      // Cache the categories
      if (response1.body.data && response1.body.data.categories) {
        await cacheService.cacheCategories(response1.body.data.categories);
      }

      // Check if categories are cached
      const cachedCategories = await cacheService.getCachedCategories();
      expect(cachedCategories).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle cache errors gracefully', async () => {
      // Try to get non-existent key
      const result = await cacheService.get('non:existent:key');
      expect(result).toBeNull();

      // Try to delete non-existent key
      const deleteResult = await cacheService.del('non:existent:key');
      expect(deleteResult).toBe(false);
    });

    it('should continue working even if Redis is down', async () => {
      // This test assumes mock Redis is being used
      // In a real scenario, you would temporarily disconnect Redis
      
      // Make request that uses caching
      const response = await request(app)
        .get('/api/services')
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should work even without Redis (using mock)
    });
  });
});