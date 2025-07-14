const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'fixia_db',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // Return an error after timeout if connection could not be established
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ PostgreSQL Database connected successfully');
    console.log('📅 Server time:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL Database connection failed:', error.message);
    return false;
  }
};

// Helper function for queries with proper error handling
const query = async (text, params = []) => {
  const start = Date.now();
  let client;
  try {
    client = await pool.connect();
    const res = await client.query(text, params);
    const duration = Date.now() - start;
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Query executed:', { 
        text: text.substring(0, 50) + '...', 
        duration, 
        rows: res.rowCount 
      });
    }
    
    return res;
  } catch (error) {
    console.error('❌ Query failed:', { 
      text: text.substring(0, 50) + '...', 
      params: params?.length || 0,
      error: error.message 
    });
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
};

module.exports = {
  pool,
  query,
  testConnection
};