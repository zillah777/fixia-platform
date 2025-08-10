/**
 * Database Helper Utilities
 * Patrones unificados de acceso a base de datos
 * Enterprise-grade database access patterns para Fixia.com.ar
 */

const { query } = require('../config/database');
const { logger } = require('./smartLogger');
const cacheService = require('../services/cacheService');
const { CACHE_TTL } = require('../config/redis');

/**
 * Generic CRUD Operations Helper Class
 */
class DatabaseHelper {
  constructor(tableName, primaryKey = 'id') {
    this.tableName = tableName;
    this.primaryKey = primaryKey;
  }

  /**
   * Find by ID con cache automático
   */
  async findById(id, useCache = true, cacheKey = null) {
    try {
      const key = cacheKey || `${this.tableName}:${id}`;
      
      if (useCache) {
        const cached = await cacheService.get(key);
        if (cached) {
          logger.debug(`Database cache hit: ${key}`);
          return cached;
        }
      }

      const result = await query(
        `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = $1`,
        [id]
      );

      const record = result.rows[0] || null;
      
      if (record && useCache) {
        await cacheService.set(key, record, CACHE_TTL.MEDIUM);
        logger.debug(`Database cached: ${key}`);
      }

      return record;
    } catch (error) {
      logger.error(`Error finding ${this.tableName} by ID`, {
        id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Find by field con soporte para múltiples valores
   */
  async findBy(field, value, options = {}) {
    const {
      limit = null,
      orderBy = null,
      orderDirection = 'DESC',
      useCache = false,
      cacheKey = null
    } = options;

    try {
      const key = cacheKey || `${this.tableName}:${field}:${value}`;
      
      if (useCache) {
        const cached = await cacheService.get(key);
        if (cached) {
          logger.debug(`Database cache hit: ${key}`);
          return cached;
        }
      }

      let sql = `SELECT * FROM ${this.tableName} WHERE ${field} = $1`;
      const params = [value];

      if (orderBy) {
        sql += ` ORDER BY ${orderBy} ${orderDirection}`;
      }

      if (limit) {
        sql += ` LIMIT ${parseInt(limit)}`;
      }

      const result = await query(sql, params);
      
      if (useCache && result.rows.length > 0) {
        await cacheService.set(key, result.rows, CACHE_TTL.SHORT);
      }

      return result.rows;
    } catch (error) {
      logger.error(`Error finding ${this.tableName} by ${field}`, {
        field,
        value,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Create record con validación automática
   */
  async create(data, returningFields = '*') {
    try {
      const fields = Object.keys(data);
      const values = Object.values(data);
      const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');

      const sql = `
        INSERT INTO ${this.tableName} (${fields.join(', ')}) 
        VALUES (${placeholders}) 
        RETURNING ${returningFields}
      `;

      logger.debug(`Creating ${this.tableName}`, {
        fields,
        dataTypes: values.map(v => typeof v)
      });

      const result = await query(sql, values);
      
      // Invalidar cache relacionado
      await this.invalidateRelatedCache(result.rows[0]);
      
      return result.rows[0];
    } catch (error) {
      logger.error(`Error creating ${this.tableName}`, {
        data,
        error: error.message,
        code: error.code
      });
      throw error;
    }
  }

  /**
   * Update record con dirty checking
   */
  async update(id, data, returningFields = '*') {
    try {
      const updates = Object.keys(data);
      const values = Object.values(data);
      
      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      const setClause = updates.map((field, index) => 
        `${field} = $${index + 1}`
      ).join(', ');

      const sql = `
        UPDATE ${this.tableName} 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE ${this.primaryKey} = $${values.length + 1}
        RETURNING ${returningFields}
      `;

      values.push(id);

      logger.debug(`Updating ${this.tableName}`, {
        id,
        fields: updates,
        dataTypes: values.map(v => typeof v)
      });

      const result = await query(sql, values);
      
      if (result.rows.length === 0) {
        return null; // Record not found
      }

      // Invalidar cache relacionado
      await this.invalidateRelatedCache(result.rows[0]);
      
      return result.rows[0];
    } catch (error) {
      logger.error(`Error updating ${this.tableName}`, {
        id,
        data,
        error: error.message,
        code: error.code
      });
      throw error;
    }
  }

  /**
   * Delete record con validaciones de integridad
   */
  async delete(id, softDelete = false) {
    try {
      let sql, params;

      if (softDelete) {
        sql = `
          UPDATE ${this.tableName} 
          SET is_active = false, deleted_at = CURRENT_TIMESTAMP
          WHERE ${this.primaryKey} = $1
          RETURNING ${this.primaryKey}
        `;
        params = [id];
      } else {
        sql = `
          DELETE FROM ${this.tableName} 
          WHERE ${this.primaryKey} = $1
          RETURNING ${this.primaryKey}
        `;
        params = [id];
      }

      logger.debug(`Deleting ${this.tableName}`, {
        id,
        softDelete
      });

      const result = await query(sql, params);
      
      if (result.rows.length === 0) {
        return false; // Record not found
      }

      // Invalidar cache relacionado
      await this.invalidateRelatedCache({ [this.primaryKey]: id });
      
      return true;
    } catch (error) {
      logger.error(`Error deleting ${this.tableName}`, {
        id,
        error: error.message,
        code: error.code
      });
      throw error;
    }
  }

  /**
   * Paginated query con cache inteligente
   */
  async paginate(options = {}) {
    const {
      page = 1,
      limit = 10,
      where = null,
      orderBy = 'created_at',
      orderDirection = 'DESC',
      useCache = false,
      cacheKey = null
    } = options;

    try {
      const offset = (page - 1) * limit;
      const key = cacheKey || `${this.tableName}:page:${page}:${limit}:${where || 'all'}`;
      
      if (useCache) {
        const cached = await cacheService.get(key);
        if (cached) {
          logger.debug(`Paginated cache hit: ${key}`);
          return cached;
        }
      }

      let whereClause = '';
      let params = [];

      if (where) {
        whereClause = `WHERE ${where.condition}`;
        params = where.values || [];
      }

      // Query para los datos
      const dataQuery = `
        SELECT * FROM ${this.tableName}
        ${whereClause}
        ORDER BY ${orderBy} ${orderDirection}
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;

      // Query para el conteo total
      const countQuery = `
        SELECT COUNT(*) as total FROM ${this.tableName}
        ${whereClause}
      `;

      const [dataResult, countResult] = await Promise.all([
        query(dataQuery, [...params, limit, offset]),
        query(countQuery, params)
      ]);

      const total = parseInt(countResult.rows[0].total);
      const result = {
        data: dataResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };

      if (useCache) {
        await cacheService.set(key, result, CACHE_TTL.SHORT);
      }

      return result;
    } catch (error) {
      logger.error(`Error paginating ${this.tableName}`, {
        options,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Invalidar cache relacionado al record
   */
  async invalidateRelatedCache(record) {
    try {
      const patterns = [
        `${this.tableName}:${record[this.primaryKey]}`,
        `${this.tableName}:*`,
        `${this.tableName}:page:*`
      ];

      await Promise.all(
        patterns.map(pattern => cacheService.invalidatePattern(pattern))
      );

      logger.debug(`Cache invalidated for ${this.tableName}`, {
        recordId: record[this.primaryKey]
      });
    } catch (error) {
      logger.error(`Error invalidating cache for ${this.tableName}`, {
        record,
        error: error.message
      });
      // No throwear error aquí - cache invalidation no debe bloquear operaciones
    }
  }
}

/**
 * Specialized Database Helpers para entidades específicas
 */

// Helper para Users
class UsersHelper extends DatabaseHelper {
  constructor() {
    super('users');
  }

  async findByEmail(email) {
    return this.findBy('email', email, { limit: 1 })
      .then(results => results[0] || null);
  }

  async findActiveById(id) {
    const result = await query(
      'SELECT * FROM users WHERE id = $1 AND is_active = true',
      [id]
    );
    return result.rows[0] || null;
  }

  async updateLastLogin(id) {
    return query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }

  async getUserStats(id) {
    const cacheKey = `user_stats:${id}`;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const result = await query(`
      SELECT 
        COUNT(DISTINCT s.id) as total_services,
        COUNT(DISTINCT r.id) as total_reviews,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'completed') as completed_bookings
      FROM users u
      LEFT JOIN services s ON u.id = s.provider_id AND s.is_active = true
      LEFT JOIN reviews r ON u.id = r.provider_id
      LEFT JOIN bookings b ON u.id = b.provider_id
      WHERE u.id = $1
      GROUP BY u.id
    `, [id]);

    const stats = result.rows[0] || {
      total_services: 0,
      total_reviews: 0,
      average_rating: 0,
      completed_bookings: 0
    };

    // Normalizar tipos de datos
    Object.keys(stats).forEach(key => {
      if (key === 'average_rating') {
        stats[key] = parseFloat(stats[key]);
      } else {
        stats[key] = parseInt(stats[key]);
      }
    });

    await cacheService.set(cacheKey, stats, CACHE_TTL.MEDIUM);
    return stats;
  }
}

// Helper para Services
class ServicesHelper extends DatabaseHelper {
  constructor() {
    super('services');
  }

  async findActiveById(id) {
    const result = await query(
      'SELECT * FROM services WHERE id = $1 AND is_active = true',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByProvider(providerId, includeInactive = false) {
    const condition = includeInactive 
      ? 'provider_id = $1' 
      : 'provider_id = $1 AND is_active = true';
    
    return this.findBy('provider_id', providerId, {
      useCache: true,
      cacheKey: `services:provider:${providerId}:${includeInactive}`,
      orderBy: 'created_at'
    });
  }

  async incrementViews(id) {
    return query(
      'UPDATE services SET views_count = views_count + 1 WHERE id = $1',
      [id]
    );
  }
}

// Helper para Bookings
class BookingsHelper extends DatabaseHelper {
  constructor() {
    super('bookings');
  }

  async findByUser(userId, userType = 'all', options = {}) {
    let condition = '';
    
    switch (userType) {
      case 'customer':
        condition = 'customer_id = $1';
        break;
      case 'provider':
        condition = 'provider_id = $1';
        break;
      default:
        condition = '(customer_id = $1 OR provider_id = $1)';
    }

    const where = { condition, values: [userId] };
    
    return this.paginate({
      where,
      orderBy: 'scheduled_date',
      orderDirection: 'DESC',
      ...options
    });
  }

  async findActiveByService(serviceId) {
    const result = await query(`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE service_id = $1 AND status IN ('pending', 'confirmed', 'in_progress')
    `, [serviceId]);
    
    return parseInt(result.rows[0].count);
  }
}

// Factory function para crear helpers
const createHelper = (tableName, primaryKey = 'id') => {
  return new DatabaseHelper(tableName, primaryKey);
};

// Instancias pre-configuradas
const users = new UsersHelper();
const services = new ServicesHelper();
const bookings = new BookingsHelper();

// Generic helpers para otras tablas
const reviews = createHelper('reviews');
const categories = createHelper('categories');
const notifications = createHelper('notifications');

module.exports = {
  DatabaseHelper,
  UsersHelper,
  ServicesHelper,
  BookingsHelper,
  createHelper,
  // Pre-configured instances
  users,
  services,
  bookings,
  reviews,
  categories,
  notifications
};