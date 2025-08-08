const { pool, query: dbQuery } = require('../config/database');

/**
 * PostgreSQL Database Utilities for Fixia
 * Provides compatibility layer for easy migration from MySQL to PostgreSQL
 */

/**
 * Execute a query with automatic parameter conversion and enhanced error handling
 * Converts MySQL-style ? placeholders to PostgreSQL $1, $2, etc.
 */
const execute = async (sql, params = [], options = {}) => {
  try {
    // Convert MySQL placeholders (?) to PostgreSQL placeholders ($1, $2, etc.)
    let convertedSQL = sql;
    let paramIndex = 1;
    
    convertedSQL = convertedSQL.replace(/\?/g, () => `$${paramIndex++}`);
    
    // Use enhanced query function with retry logic
    const result = await dbQuery(convertedSQL, params, options);
    
    // Return in MySQL-style format [rows, fields] for compatibility
    return [result.rows, result.fields];
  } catch (error) {
    console.error('Database query error:', {
      sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
      params: params?.length || 0,
      error: error.message,
      code: error.code
    });
    throw error;
  }
};

/**
 * Get a single row by ID
 */
const findById = async (table, id, columns = '*') => {
  const [rows] = await execute(`SELECT ${columns} FROM ${table} WHERE id = ?`, [id]);
  return rows[0] || null;
};

/**
 * Get multiple rows with WHERE conditions
 */
const findWhere = async (table, conditions = {}, columns = '*', orderBy = '', limit = '') => {
  const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
  const values = Object.values(conditions);
  
  let sql = `SELECT ${columns} FROM ${table}`;
  if (whereClause) sql += ` WHERE ${whereClause}`;
  if (orderBy) sql += ` ORDER BY ${orderBy}`;
  if (limit) sql += ` LIMIT ${limit}`;
  
  const [rows] = await execute(sql, values);
  return rows;
};

/**
 * Insert a new record
 */
const insert = async (table, data) => {
  const columns = Object.keys(data).join(', ');
  const placeholders = Object.keys(data).map(() => '?').join(', ');
  const values = Object.values(data);
  
  const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
  const [rows] = await execute(sql, values);
  return rows[0];
};

/**
 * Update a record by ID
 */
const updateById = async (table, id, data) => {
  const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), id];
  
  const sql = `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *`;
  const [rows] = await execute(sql, values);
  return rows[0];
};

/**
 * Delete a record by ID
 */
const deleteById = async (table, id) => {
  const [rows] = await execute(`DELETE FROM ${table} WHERE id = ? RETURNING *`, [id]);
  return rows[0];
};

/**
 * Count records with conditions
 */
const count = async (table, conditions = {}) => {
  const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
  const values = Object.values(conditions);
  
  let sql = `SELECT COUNT(*) as count FROM ${table}`;
  if (whereClause) sql += ` WHERE ${whereClause}`;
  
  const [rows] = await execute(sql, values);
  return parseInt(rows[0].count);
};

/**
 * Check if a record exists
 */
const exists = async (table, conditions) => {
  const countResult = await count(table, conditions);
  return countResult > 0;
};

/**
 * Execute a transaction with enhanced error handling and retry logic
 */
const transaction = async (callback, options = {}) => {
  const { retries = 2, retryDelay = 1000 } = options;
  let lastError;
  
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    let client;
    
    try {
      // Get current pool instance
      const currentPool = pool();
      if (!currentPool) {
        throw new Error('Database pool not available');
      }
      
      client = await currentPool.connect();
      
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      
      return result;
      
    } catch (error) {
      lastError = error;
      
      if (client) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          console.error('Transaction rollback failed:', rollbackError.message);
        }
      }
      
      // Check if error is retryable
      const isRetryable = (
        error.code === 'ECONNRESET' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ETIMEDOUT' ||
        error.message.includes('Connection terminated') ||
        error.message.includes('connection is closed')
      );
      
      if (isRetryable && attempt <= retries) {
        console.warn(`Transaction attempt ${attempt} failed, retrying in ${retryDelay}ms...`, {
          error: error.message,
          code: error.code
        });
        
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        continue;
      }
      
      throw error;
      
    } finally {
      if (client) {
        try {
          client.release();
        } catch (releaseError) {
          console.error('Client release failed:', releaseError.message);
        }
      }
    }
  }
  
  throw lastError;
};

/**
 * Get table schema information
 */
const getTableInfo = async (tableName) => {
  const [rows] = await execute(`
    SELECT 
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM information_schema.columns 
    WHERE table_name = ?
    ORDER BY ordinal_position
  `, [tableName]);
  
  return rows;
};

/**
 * Check if table exists
 */
const tableExists = async (tableName) => {
  const [rows] = await execute(`
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_name = ?
    )
  `, [tableName]);
  
  return rows[0].exists;
};

/**
 * Get all tables in database
 */
const getAllTables = async () => {
  const [rows] = await execute(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);
  
  return rows.map(row => row.table_name);
};

/**
 * Raw query execution (for complex queries) with enhanced error handling
 */
const raw = async (sql, params = [], options = {}) => {
  const result = await dbQuery(sql, params, options);
  return result.rows;
};

module.exports = {
  execute,
  findById,
  findWhere,
  insert,
  updateById,
  deleteById,
  count,
  exists,
  transaction,
  getTableInfo,
  tableExists,
  getAllTables,
  raw,
  pool: () => pool() // Return the pool function to get current instance
};