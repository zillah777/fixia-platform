require('dotenv').config({ path: '.env.test' });

// Global test setup
beforeAll(async () => {
  // Ensure test environment
  process.env.NODE_ENV = 'test';
  
  // Override any remaining production values for safety
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  process.env.SENDGRID_API_KEY = 'SG.test-api-key-disabled-for-testing';
  process.env.DISABLE_CACHE = 'true';
  process.env.DISABLE_EMAILS = 'true';
  
  console.log('🧪 Setting up test environment...');
  console.log('📧 Email service disabled for tests');
  console.log('🗄️ Cache service disabled for tests');
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