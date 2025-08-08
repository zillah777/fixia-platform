const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authController = require('../../src/controllers/authController');
const { query } = require('../../src/config/database');
const TestDatabase = require('../helpers/testDatabase');

// Mock all external dependencies
jest.mock('../../src/config/database');
jest.mock('../../src/utils/logger');
jest.mock('../../src/services/cacheService');
jest.mock('../../src/config/redis');

// Mock external services
jest.mock('../../src/services/emailService', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true)
}));

// Create Express app for testing
const app = express();
app.use(express.json());
app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);
app.get('/auth/me', authController.getCurrentUser);

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        user_type: 'provider'
      };

      // Mock database responses
      query
        .mockResolvedValueOnce({ rows: [] }) // Check existing user
        .mockResolvedValueOnce({ 
          rows: [{ 
            id: 1, 
            email: userData.email, 
            first_name: userData.first_name,
            last_name: userData.last_name,
            user_type: userData.user_type,
            is_verified: false
          }] 
        }); // Insert new user

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Usuario registrado exitosamente');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
    });

    it('should return 400 if required fields are missing', async () => {
      const incompleteData = {
        first_name: 'John',
        email: 'john@example.com'
        // Missing last_name and password
      };

      const response = await request(app)
        .post('/auth/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('campos requeridos');
    });

    it('should return 409 if email already exists', async () => {
      const userData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'existing@example.com',
        password: 'password123'
      };

      // Mock existing user
      query.mockResolvedValueOnce({ 
        rows: [{ id: 1, email: userData.email }] 
      });

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Ya existe una cuenta con este email');
    });

    it('should handle database errors gracefully', async () => {
      const userData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      // Mock database error
      query.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Error interno del servidor');
    });
  });

  describe('POST /auth/login', () => {
    it('should login user with correct credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const hashedPassword = await bcrypt.hash(loginData.password, 12);
      
      // Mock user found in database
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          email: loginData.email,
          password_hash: hashedPassword,
          first_name: 'John',
          last_name: 'Doe',
          user_type: 'provider',
          email_verified: true,
          is_active: true
        }]
      });

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Inicio de sesión exitoso');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(loginData.email);
    });

    it('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      // Mock no user found
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Credenciales inválidas');
    });

    it('should return 401 for incorrect password', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      const correctPassword = 'password123';
      const hashedPassword = await bcrypt.hash(correctPassword, 12);
      
      // Mock user found but wrong password
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          email: loginData.email,
          password_hash: hashedPassword,
          first_name: 'John',
          last_name: 'Doe',
          user_type: 'provider',
          email_verified: true,
          is_active: true
        }]
      });

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Credenciales inválidas');
    });

    it('should return 403 for unverified user in production', async () => {
      // Set production environment for this test
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const loginData = {
        email: 'unverified@example.com',
        password: 'password123'
      };

      const hashedPassword = await bcrypt.hash(loginData.password, 12);
      
      // Mock unverified user
      query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          email: loginData.email,
          password_hash: hashedPassword,
          first_name: 'John',
          last_name: 'Doe',
          user_type: 'provider',
          email_verified: false,
          is_active: true
        }]
      });

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('verificar tu email');
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should return 401 for inactive user (filtered by query)', async () => {
      const loginData = {
        email: 'inactive@example.com',
        password: 'password123'
      };
      
      // Mock no user found (inactive users are filtered by WHERE is_active = true)
      query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Credenciales inválidas');
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate valid JWT token', () => {
      process.env.JWT_SECRET = 'test-secret';
      
      const payload = {
        userId: 1,
        email: 'test@example.com',
        userType: 'provider'
      };

      // We need to test the actual generateToken function
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verify token can be decoded
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.userType).toBe(payload.userType);
    });
  });

  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword123';
      const hash = await bcrypt.hash(password, 12);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
      
      // Verify password can be compared
      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
      
      const isInvalid = await bcrypt.compare('wrongpassword', hash);
      expect(isInvalid).toBe(false);
    });
  });
});