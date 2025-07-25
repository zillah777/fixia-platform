const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
  port: process.env.DB_PORT || process.env.PGPORT || 5432,
  user: process.env.DB_USER || process.env.PGUSER || 'postgres',
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
  database: process.env.DB_NAME || process.env.PGDATABASE || 'fixia_db',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // Return an error after timeout if connection could not be established
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Performance optimizations
  statement_timeout: 30000, // 30 seconds
  query_timeout: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
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

// Helper function for queries with proper error handling and retry logic
const query = async (text, params = [], retries = 3) => {
  const start = Date.now();
  let client;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
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
      // If it's a connection error and we have retries left, try again
      if ((error.code === 'ECONNRESET' || error.message.includes('Connection terminated') || error.message.includes('timeout')) && attempt < retries) {
        console.warn(`⚠️ Query attempt ${attempt} failed, retrying... (${error.message})`);
        
        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        continue;
      }
      
      console.error('❌ Query failed:', { 
        text: text.substring(0, 50) + '...', 
        params: params?.length || 0,
        error: error.message,
        attempt: attempt
      });
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }
  
  // If we get here, all retries failed
  throw new Error('Database query failed after all retries')
};

module.exports = {
  pool,
  query,
  testConnection
};