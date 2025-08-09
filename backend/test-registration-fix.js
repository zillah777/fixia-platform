#!/usr/bin/env node

/**
 * Test script to verify registration fix
 * Tests the user_type validation and transformation flow
 */

const axios = require('axios');

async function testRegistration() {
  console.log('🧪 Testing Registration Fix...\n');
  
  const testData = {
    first_name: 'Test',
    last_name: 'User',
    email: `test${Date.now()}@test.com`,
    password: 'password123',
    user_type: 'customer',  // This should work now
    phone: '+54123456789',
    locality: 'Puerto Madryn'
  };

  console.log('📤 Sending registration request with data:');
  console.log(JSON.stringify(testData, null, 2));
  console.log();

  try {
    const response = await axios.post('http://localhost:3000/api/auth/register', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Registration SUCCESS!');
    console.log('Response:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Registration FAILED:');
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('❌ Network Error:', error.message);
      console.log('Make sure the backend server is running on http://localhost:3000');
    }
  }
}

// Test different user types
async function testAllUserTypes() {
  const userTypes = ['customer', 'provider', 'admin'];
  
  for (const userType of userTypes) {
    console.log(`\n🔄 Testing user_type: "${userType}"`);
    
    const testData = {
      first_name: 'Test',
      last_name: userType.charAt(0).toUpperCase() + userType.slice(1),
      email: `test-${userType}-${Date.now()}@test.com`,
      password: 'password123',
      user_type: userType,
      phone: '+54123456789',
      locality: 'Puerto Madryn'
    };

    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', testData);
      console.log(`✅ ${userType} registration: SUCCESS`);
      
      // Check that response transforms user_type back to frontend format
      if (response.data.user && response.data.user.user_type) {
        console.log(`   Response user_type: "${response.data.user.user_type}" (should be frontend format)`);
      }
      
    } catch (error) {
      console.log(`❌ ${userType} registration: FAILED`);
      if (error.response) {
        console.log('   Error:', error.response.data.error);
        if (error.response.data.details) {
          console.log('   Details:', error.response.data.details);
        }
      }
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Run the test
if (require.main === module) {
  console.log('🚀 Registration Fix Test Started\n');
  testRegistration()
    .then(() => {
      console.log('\n📋 Testing all user types...');
      return testAllUserTypes();
    })
    .then(() => {
      console.log('\n✅ Test completed!');
    })
    .catch(error => {
      console.error('💥 Test failed:', error.message);
    });
}

module.exports = { testRegistration, testAllUserTypes };