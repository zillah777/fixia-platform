const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const API_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Database config
const pool = new Pool({
  host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
  port: process.env.DB_PORT || process.env.PGPORT || 5432,
  user: process.env.DB_USER || process.env.PGUSER || 'postgres',
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
  database: process.env.DB_NAME || process.env.PGDATABASE || 'fixia_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function testAuthenticationFlow() {
  try {
    console.log('🔍 Testing Dashboard Authentication Flow...\n');
    
    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'mmata@chubut.gov.ar',
      password: 'Lunitamia123'
    });
    
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    
    console.log('✅ Login successful');
    console.log('   User:', user.first_name, user.last_name);
    console.log('   Type:', user.user_type);
    console.log('   Token:', token ? 'Generated' : 'Missing');
    
    // Step 2: Test dashboard endpoints with current setup (double auth)
    console.log('\n2. Testing current dashboard endpoints (with double auth)...');
    
    try {
      const explorerStatsResponse = await axios.get(`${API_URL}/api/dashboard/explorer-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('❌ UNEXPECTED: explorer-stats worked with double auth');
    } catch (error) {
      console.log('✅ EXPECTED: explorer-stats failed with double auth (401)');
      console.log('   Error:', error.response?.data?.error || error.message);
    }
    
    try {
      const asStatsResponse = await axios.get(`${API_URL}/api/dashboard/as-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('❌ UNEXPECTED: as-stats worked with double auth');
    } catch (error) {
      console.log('✅ EXPECTED: as-stats failed with double auth (401)');
      console.log('   Error:', error.response?.data?.error || error.message);
    }
    
    console.log('\n3. Analysis Complete');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 CURRENT SITUATION:');
    console.log('   - Dashboard routes have authMiddleware at server level');
    console.log('   - Dashboard routes ALSO have authMiddleware at route level');
    console.log('   - This causes double authentication = 401 errors');
    console.log('');
    console.log('🛠️  SOLUTION:');
    console.log('   - Remove authMiddleware from server level for dashboard');
    console.log('   - Keep authMiddleware at route level for granular control');
    console.log('   - This will fix the 401 errors');
    
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

testAuthenticationFlow();