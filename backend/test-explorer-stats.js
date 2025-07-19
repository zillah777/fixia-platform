const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const API_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Database config matching the actual config
const pool = new Pool({
  host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
  port: process.env.DB_PORT || process.env.PGPORT || 5432,
  user: process.env.DB_USER || process.env.PGUSER || 'postgres',
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
  database: process.env.DB_NAME || process.env.PGDATABASE || 'fixia_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function testExplorerStatsEndpoint() {
  try {
    console.log('🔍 Testing /api/dashboard/explorer-stats endpoint...\n');
    
    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'mmata@chubut.gov.ar',
      password: 'Lunitamia123'
    });
    
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    
    console.log('✅ Login successful');
    console.log('   User:', user.first_name, user.last_name, `(ID: ${user.id})`);
    console.log('   Type:', user.user_type);
    console.log('   Token length:', token?.length || 'Missing');
    
    // Step 2: Test the problematic endpoint
    console.log('\n2. Testing explorer-stats endpoint...');
    
    try {
      const response = await axios.get(`${API_URL}/api/dashboard/explorer-stats`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ SUCCESS: explorer-stats endpoint worked!');
      console.log('   Response data:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.log('❌ FAILED: explorer-stats endpoint error');
      console.log('   Status:', error.response?.status || 'No status');
      console.log('   Error message:', error.response?.data?.error || error.message);
      console.log('   Full error response:', JSON.stringify(error.response?.data, null, 2));
      
      // Log the raw axios error for debugging
      if (error.code) {
        console.log('   Error code:', error.code);
      }
    }
    
    // Step 3: Check database structure to identify issues
    console.log('\n3. Checking database structure...');
    
    try {
      // Check if the tables mentioned in the query exist
      const tableCheck = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'explorer_service_requests', 'explorer_as_connections', 'chat_messages', 'categories', 'as_service_interests')
        ORDER BY table_name
      `);
      
      console.log('   Existing tables:', tableCheck.rows.map(r => r.table_name).join(', '));
      
      // Check user exists
      const userCheck = await pool.query('SELECT id, first_name, last_name, user_type FROM users WHERE id = $1', [user.id]);
      if (userCheck.rows.length > 0) {
        console.log('   User found in database:', userCheck.rows[0]);
      } else {
        console.log('   ⚠️  User not found in database!');
      }
      
    } catch (dbError) {
      console.log('   ❌ Database check failed:', dbError.message);
    }
    
    console.log('\n4. Analyzing the code issues...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 IDENTIFIED ISSUES:');
    console.log('   1. DATABASE MISMATCH:');
    console.log('      - Code uses: pool.execute() (MySQL syntax)');
    console.log('      - Database is: PostgreSQL with pool.connect() + client.query()');
    console.log('   2. PARAMETER BINDING:');
    console.log('      - MySQL uses: ? placeholders');
    console.log('      - PostgreSQL uses: $1, $2, $3 placeholders');
    console.log('   3. SQL SYNTAX DIFFERENCES:');
    console.log('      - MySQL COALESCE vs PostgreSQL COALESCE (same)');
    console.log('      - MySQL CASE vs PostgreSQL CASE (same)');
    console.log('      - UNION ALL should work the same');
    
  } catch (error) {
    console.error('🚨 Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  } finally {
    await pool.end();
  }
}

// Run the test
testExplorerStatsEndpoint();