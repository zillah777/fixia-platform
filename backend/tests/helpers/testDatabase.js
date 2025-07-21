const { query } = require('../../src/config/database');

class TestDatabase {
  static async createTestUser(userData = {}) {
    const defaultUser = {
      email: `test${Date.now()}@example.com`,
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiCV/u2qAu.K', // 'password123'
      name: 'Test User',
      user_type: 'provider',
      phone: '+1234567890',
      is_verified: true,
      email_verified_at: new Date()
    };

    const user = { ...defaultUser, ...userData };
    
    const result = await query(`
      INSERT INTO users (email, password, name, user_type, phone, is_verified, email_verified_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [user.email, user.password, user.name, user.user_type, user.phone, user.is_verified, user.email_verified_at]);
    
    return result.rows[0];
  }

  static async createTestService(userId, serviceData = {}) {
    const defaultService = {
      title: 'Test Service',
      description: 'Test service description',
      price: 100.00,
      category_id: 1,
      duration: 60,
      location: 'Test Location',
      is_active: true
    };

    const service = { ...defaultService, ...serviceData };
    
    const result = await query(`
      INSERT INTO services (user_id, title, description, price, category_id, duration, location, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [userId, service.title, service.description, service.price, service.category_id, service.duration, service.location, service.is_active]);
    
    return result.rows[0];
  }

  static async createTestCategory(categoryData = {}) {
    const defaultCategory = {
      name: 'Test Category',
      description: 'Test category description',
      icon: 'test-icon',
      is_active: true
    };

    const category = { ...defaultCategory, ...categoryData };
    
    const result = await query(`
      INSERT INTO categories (name, description, icon, is_active)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [category.name, category.description, category.icon, category.is_active]);
    
    return result.rows[0];
  }

  static async cleanupTestData() {
    // Clean up in reverse order of dependencies
    await query('DELETE FROM bookings WHERE id > 0');
    await query('DELETE FROM services WHERE id > 0');
    await query('DELETE FROM users WHERE email LIKE \'test%@example.com\'');
    await query('DELETE FROM categories WHERE name LIKE \'Test%\'');
  }

  static async getTestUserByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async deleteTestUser(userId) {
    await query('DELETE FROM users WHERE id = $1', [userId]);
  }
}

module.exports = TestDatabase;