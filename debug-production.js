const axios = require('./backend/node_modules/axios').default;

async function testProductionAuth() {
  console.log('🧪 Testing Production Authentication...\n');
  
  const PRODUCTION_API = 'https://fixia-platform-production.up.railway.app';
  
  try {
    // Step 1: Test login
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${PRODUCTION_API}/api/auth/login`, {
      email: 'mmata@chubut.gov.ar',
      password: 'Lunitamia123'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      const token = loginResponse.data.data.token;
      const user = loginResponse.data.data.user;
      
      console.log('   User type:', user.user_type);
      console.log('   Token length:', token.length);
      
      // Step 2: Test dashboard endpoint
      console.log('\n2. Testing dashboard endpoint...');
      
      try {
        const dashboardResponse = await axios.get(`${PRODUCTION_API}/api/dashboard/explorer-stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('✅ Dashboard API successful');
        console.log('   Stats:', dashboardResponse.data.data.stats);
        
      } catch (dashError) {
        console.log('❌ Dashboard API failed');
        console.log('   Status:', dashError.response?.status);
        console.log('   Error:', dashError.response?.data?.error);
        console.log('   Headers sent:', dashError.config?.headers);
      }
      
    } else {
      console.log('❌ Login failed:', loginResponse.data.error);
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }
}

testProductionAuth();