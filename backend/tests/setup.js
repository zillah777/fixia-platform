const { query } = require('../src/config/database');

// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  
  console.log('🧪 Setting up test environment...');
});

afterAll(async () => {
  // Cleanup test database connections
  try {
    // Close database connections if needed
    console.log('🧹 Cleaning up test environment...');
  } catch (error) {
    console.error('Error during test cleanup:', error);
  }
});

// Global test utilities
global.testUtils = {
  // Mock user for testing
  mockUser: {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    user_type: 'provider'
  },
  
  // Mock JWT token
  mockToken: 'mock-jwt-token',
  
  // Test database helpers
  async cleanupTestData() {
    // Add cleanup logic for test data
    console.log('Cleaning up test data...');
  }
};