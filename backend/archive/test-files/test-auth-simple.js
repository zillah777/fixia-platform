#!/usr/bin/env node

/**
 * Simple auth test script
 * Tests if the auth middleware is working correctly
 */

const axios = require('axios');

async function testAuthRoutes() {
  console.log('🧪 Testing auth routes...\n');
  
  const API_URL = 'https://fixia-platform-production.up.railway.app';
  
  // Test 1: Test without token (should get 401)
  console.log('1️⃣ Testing /api/users/profile without token...');
  try {
    const response = await axios.get(`${API_URL}/api/users/profile`);
    console.log('❌ This should not succeed!', response.status);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected with 401');
      console.log('Error message:', error.response.data?.error || 'No error message');
    } else {
      console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
    }
  }
  
  // Test 2: Test with invalid token (should get 401)
  console.log('\n2️⃣ Testing /api/users/profile with invalid token...');
  try {
    const response = await axios.get(`${API_URL}/api/users/profile`, {
      headers: {
        'Authorization': 'Bearer invalid-token-here'
      }
    });
    console.log('❌ This should not succeed!', response.status);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected with 401');
      console.log('Error message:', error.response.data?.error || 'No error message');
    } else {
      console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
    }
  }
  
  // Test 3: Test multipart form data without auth
  console.log('\n3️⃣ Testing /api/users/profile/photo without token...');
  try {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('photo', Buffer.from('fake image'), { filename: 'test.png' });
    
    const response = await axios.post(`${API_URL}/api/users/profile/photo`, form, {
      headers: form.getHeaders()
    });
    console.log('❌ This should not succeed!', response.status);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected with 401');
      console.log('Error message:', error.response.data?.error || 'No error message');
    } else {
      console.log('❌ Unexpected error:', error.response?.status, error.response?.data?.error);
      console.log('Full response:', error.response?.data);
    }
  }
  
  console.log('\n✅ Auth tests completed!');
  console.log('\n💡 To test with real token:');
  console.log('1. Login to get JWT token from localStorage');
  console.log('2. Add real token test to this script');
}

if (require.main === module) {
  testAuthRoutes().catch(console.error);
}

module.exports = { testAuthRoutes };