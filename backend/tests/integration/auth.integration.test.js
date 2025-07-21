const request = require('supertest');
const app = require('../../server'); // Your main Express app
const TestDatabase = require('../helpers/testDatabase');

describe('Auth Integration Tests', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Clean up any existing test data
    await TestDatabase.cleanupTestData();
  });

  afterAll(async () => {
    // Clean up test data after all tests
    await TestDatabase.cleanupTestData();
  });

  beforeEach(async () => {
    // Clean up before each test
    await TestDatabase.cleanupTestData();
  });

  describe('User Registration Flow', () => {
    it('should complete full registration flow', async () => {
      const userData = {
        first_name: 'Integration',
        last_name: 'Test',
        email: `integration${Date.now()}@example.com`,
        password: 'securePassword123',
        user_type: 'provider',
        phone: '+1234567890'
      };

      // Step 1: Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.user).toBeDefined();
      expect(registerResponse.body.token).toBeDefined();
      expect(registerResponse.body.user.email).toBe(userData.email);
      expect(registerResponse.body.user.is_verified).toBe(false);

      testUser = registerResponse.body.user;
      authToken = registerResponse.body.token;

      // Step 2: Verify user exists in database
      const dbUser = await TestDatabase.getTestUserByEmail(userData.email);
      expect(dbUser).toBeDefined();
      expect(dbUser.email).toBe(userData.email);
      expect(dbUser.first_name).toBe(userData.first_name);
      expect(dbUser.last_name).toBe(userData.last_name);
    });

    it('should prevent duplicate email registration', async () => {
      const userData = {
        first_name: 'Duplicate',
        last_name: 'Test',
        email: `duplicate${Date.now()}@example.com`,
        password: 'securePassword123',
        user_type: 'provider'
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Second registration with same email
      const duplicateResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(duplicateResponse.body.success).toBe(false);
      expect(duplicateResponse.body.error).toContain('correo electrónico ya está registrado');
    });
  });

  describe('User Login Flow', () => {
    beforeEach(async () => {
      // Create a verified test user for login tests
      testUser = await TestDatabase.createTestUser({
        email: `login${Date.now()}@example.com`,
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiCV/u2qAu.K', // 'password123'
        first_name: 'Login',
        last_name: 'Test',
        user_type: 'provider',
        is_verified: true,
        is_active: true
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);

      authToken = response.body.token;
    });

    it('should reject login with invalid password', async () => {
      const loginData = {
        email: testUser.email,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Credenciales inválidas');
    });

    it('should reject login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Credenciales inválidas');
    });
  });

  describe('Protected Routes Access', () => {
    beforeEach(async () => {
      // Create verified user and get auth token
      testUser = await TestDatabase.createTestUser({
        email: `protected${Date.now()}@example.com`,
        is_verified: true,
        is_active: true
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123'
        });

      authToken = loginResponse.body.token;
    });

    it('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should reject access without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Token de acceso requerido');
    });

    it('should reject access with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Token inválido');
    });
  });

  describe('Password Reset Flow', () => {
    beforeEach(async () => {
      testUser = await TestDatabase.createTestUser({
        email: `reset${Date.now()}@example.com`,
        is_verified: true,
        is_active: true
      });
    });

    it('should initiate password reset for existing user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Correo de recuperación enviado');
    });

    it('should handle password reset for non-existent email gracefully', async () => {
      // For security, should return success even for non-existent email
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Correo de recuperación enviado');
    });
  });

  describe('Token Validation', () => {
    beforeEach(async () => {
      testUser = await TestDatabase.createTestUser({
        email: `token${Date.now()}@example.com`,
        is_verified: true,
        is_active: true
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123'
        });

      authToken = loginResponse.body.token;
    });

    it('should validate token and return user info', async () => {
      const response = await request(app)
        .post('/api/auth/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.valid).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should return invalid for expired/malformed token', async () => {
      const response = await request(app)
        .post('/api/auth/validate')
        .set('Authorization', 'Bearer expired-or-invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.valid).toBe(false);
    });
  });
});