#!/usr/bin/env node

/**
 * Test script to debug photo upload issues
 */

const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function testPhotoUpload() {
  console.log('🧪 Testing photo upload endpoint...\n');
  
  // You'll need to replace this with a valid token from your login
  const TEST_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token
  const API_URL = 'https://fixia-platform-production.up.railway.app';
  
  try {
    // Create a simple test image file (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
      0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
      0xE2, 0x21, 0xBC, 0x33, 0x00, 0x00, 0x00, 0x00,
      0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    const form = new FormData();
    form.append('photo', testImageBuffer, {
      filename: 'test.png',
      contentType: 'image/png'
    });
    
    console.log('📤 Sending photo upload request...');
    
    const response = await axios.post(`${API_URL}/api/users/profile/photo`, form, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        ...form.getHeaders()
      }
    });
    
    console.log('✅ Upload SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Upload FAILED:');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
      
      // Check for specific error types that might cause logout
      if (error.response.status === 401) {
        console.log('\n🚨 401 UNAUTHORIZED - This would trigger logout!');
        console.log('Error message:', error.response.data?.error || 'No error message');
      } else if (error.response.status === 500) {
        console.log('\n💥 500 SERVER ERROR - Check backend logs');
      }
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
}

// Helper function to test with mock token
async function testWithoutToken() {
  console.log('\n🧪 Testing without token (should get 401)...\n');
  
  const API_URL = 'https://fixia-platform-production.up.railway.app';
  
  try {
    const form = new FormData();
    const testBuffer = Buffer.from('fake image data');
    form.append('photo', testBuffer, { filename: 'test.png' });
    
    const response = await axios.post(`${API_URL}/api/users/profile/photo`, form, {
      headers: form.getHeaders()
    });
    
    console.log('❌ This should not succeed!');
    
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected with 401');
      console.log('Error message:', error.response.data?.error);
    } else {
      console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
    }
  }
}

if (require.main === module) {
  console.log('🚀 Photo Upload Test Started\n');
  console.log('⚠️ NOTE: You need to replace TEST_TOKEN with a real JWT token\n');
  
  testWithoutToken()
    .then(() => {
      console.log('\n📋 To test with real token:');
      console.log('1. Login to get a JWT token');
      console.log('2. Replace TEST_TOKEN in this file');
      console.log('3. Run again: node test-photo-upload.js');
      console.log('\n✅ Test completed!');
    })
    .catch(error => {
      console.error('💥 Test failed:', error.message);
    });
}

module.exports = { testPhotoUpload };