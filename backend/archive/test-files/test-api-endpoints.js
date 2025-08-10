const axios = require('axios');

// Use the same API URL as the frontend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function testEndpoints() {
  console.log('🔍 Testing API endpoints...');
  console.log('📡 API_URL:', API_URL);
  
  const endpoints = [
    '/api/categories',
    '/api/localities/chubut',
    '/api/categories?grouped=true',
    '/api/categories/parent-groups'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n📞 Testing: ${API_URL}${endpoint}`);
    
    try {
      const response = await axios.get(`${API_URL}${endpoint}`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Success (${response.status})`);
      console.log(`📊 Response data:`, {
        success: response.data.success,
        message: response.data.message,
        dataLength: Array.isArray(response.data.data) ? response.data.data.length : 'Not array',
        sampleData: Array.isArray(response.data.data) && response.data.data.length > 0 
          ? response.data.data[0] 
          : response.data.data
      });
      
    } catch (error) {
      console.log(`❌ Failed:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        data: error.response?.data,
        code: error.code
      });
    }
  }
}

// Test database connection directly
async function testDatabaseConnection() {
  console.log('\n🔌 Testing database connection...');
  
  try {
    const { testConnection } = require('./src/config/database');
    const connected = await testConnection();
    console.log(connected ? '✅ Database connected' : '❌ Database connection failed');
  } catch (error) {
    console.log('❌ Database test error:', error.message);
  }
}

async function main() {
  await testDatabaseConnection();
  await testEndpoints();
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🎉 Testing completed!');
      process.exit(0);
    })
    .catch(err => {
      console.error('💥 Test failed:', err);
      process.exit(1);
    });
}