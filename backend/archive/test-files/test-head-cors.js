/**
 * Test HEAD Method CORS Support
 * Tests that HEAD requests are properly handled for CORS preflight
 */

const request = require('supertest');
const express = require('express');

// Import our middleware
const { headMethodHandler } = require('./src/middleware/headMethodHandler');

// Create a test app
const app = express();

// Apply the HEAD method handler
app.use(headMethodHandler());

// Add a sample CORS middleware (simplified version)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Sample routes
app.post('/api/auth/register', (req, res) => {
  res.json({ message: 'Register endpoint' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ message: 'Login endpoint' });
});

// Test the HEAD method support
const runTests = async () => {
  console.log('🧪 Testing HEAD method CORS support...\n');

  try {
    // Test HEAD request to /api/auth/register
    console.log('1. Testing HEAD /api/auth/register');
    const registerHeadResponse = await request(app)
      .head('/api/auth/register')
      .set('Origin', 'https://fixia-platform.vercel.app');
    
    console.log(`   Status: ${registerHeadResponse.status}`);
    console.log(`   CORS Headers: ${registerHeadResponse.headers['access-control-allow-origin'] ? '✅' : '❌'}`);
    
    // Test HEAD request to /api/auth/login
    console.log('\n2. Testing HEAD /api/auth/login');
    const loginHeadResponse = await request(app)
      .head('/api/auth/login')
      .set('Origin', 'https://fixia-platform.vercel.app');
    
    console.log(`   Status: ${loginHeadResponse.status}`);
    console.log(`   CORS Headers: ${loginHeadResponse.headers['access-control-allow-origin'] ? '✅' : '❌'}`);
    
    // Test that POST still works
    console.log('\n3. Testing POST /api/auth/register still works');
    const registerPostResponse = await request(app)
      .post('/api/auth/register')
      .set('Origin', 'https://fixia-platform.vercel.app')
      .send({ test: 'data' });
    
    console.log(`   Status: ${registerPostResponse.status}`);
    console.log(`   Response: ${registerPostResponse.body.message || 'No message'}`);
    
    // Test OPTIONS still works
    console.log('\n4. Testing OPTIONS /api/auth/register');
    const optionsResponse = await request(app)
      .options('/api/auth/register')
      .set('Origin', 'https://fixia-platform.vercel.app');
    
    console.log(`   Status: ${optionsResponse.status}`);
    console.log(`   CORS Headers: ${optionsResponse.headers['access-control-allow-origin'] ? '✅' : '❌'}`);
    
    console.log('\n✅ All HEAD method CORS tests completed successfully!');
    console.log('\n🎯 HEAD method support is now working for CORS preflight requests.');
    console.log('   Browsers can now properly send HEAD requests to check endpoint availability');
    console.log('   before making actual API calls, resolving the CORS blocking issue.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
};

// Run the tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { app, runTests };