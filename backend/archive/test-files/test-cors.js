#!/usr/bin/env node

/**
 * CORS Testing Script for Fixia Backend
 * Tests CORS headers and preflight responses
 */

const http = require('http');

// Test CORS preflight request
function testCORSPreflight() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'fixia-platform-production.up.railway.app',
      port: 443,
      path: '/api/auth/login',
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://fixia-platform.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization, Cache-Control'
      }
    };

    const req = http.request(options, (res) => {
      console.log('\n🔍 CORS Preflight Test Results:');
      console.log(`Status: ${res.statusCode}`);
      console.log('\n📋 Response Headers:');
      
      Object.keys(res.headers).forEach(key => {
        if (key.toLowerCase().includes('access-control') || key.toLowerCase().includes('vary')) {
          console.log(`  ${key}: ${res.headers[key]}`);
        }
      });

      // Check for critical CORS headers
      const hasOrigin = res.headers['access-control-allow-origin'];
      const hasMethods = res.headers['access-control-allow-methods'];
      const hasHeaders = res.headers['access-control-allow-headers'];
      const hasCredentials = res.headers['access-control-allow-credentials'];

      console.log('\n✅ CORS Header Analysis:');
      console.log(`  Origin allowed: ${hasOrigin ? '✅' : '❌'} (${hasOrigin})`);
      console.log(`  Methods allowed: ${hasMethods ? '✅' : '❌'} (${hasMethods})`);
      console.log(`  Headers allowed: ${hasHeaders ? '✅' : '❌'} (${hasHeaders})`);
      console.log(`  Credentials allowed: ${hasCredentials ? '✅' : '❌'} (${hasCredentials})`);
      
      // Check if cache-control is included
      const cacheControlAllowed = hasHeaders && hasHeaders.toLowerCase().includes('cache-control');
      console.log(`  Cache-Control header: ${cacheControlAllowed ? '✅' : '❌'}`);

      if (res.statusCode === 200 && hasOrigin && hasMethods && hasHeaders && cacheControlAllowed) {
        console.log('\n🎉 CORS Configuration: SUCCESS');
        resolve(true);
      } else {
        console.log('\n❌ CORS Configuration: NEEDS FIXES');
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.error('❌ Request failed:', err.message);
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Test actual login request
function testLoginRequest() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'test@example.com',
      password: 'testpassword'
    });

    const options = {
      hostname: 'fixia-platform-production.up.railway.app',
      port: 443,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Origin': 'https://fixia-platform.vercel.app',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      console.log('\n🔍 Actual Login Request Test:');
      console.log(`Status: ${res.statusCode}`);
      
      const corsHeaders = {};
      Object.keys(res.headers).forEach(key => {
        if (key.toLowerCase().includes('access-control')) {
          corsHeaders[key] = res.headers[key];
        }
      });

      if (Object.keys(corsHeaders).length > 0) {
        console.log('\n📋 CORS Headers in Response:');
        Object.keys(corsHeaders).forEach(key => {
          console.log(`  ${key}: ${corsHeaders[key]}`);
        });
        console.log('\n✅ Login request: CORS headers present');
        resolve(true);
      } else {
        console.log('\n❌ Login request: No CORS headers found');
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.error('❌ Login request failed:', err.message);
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

// Run tests
async function runCORSTests() {
  console.log('🚀 Testing CORS Configuration for Fixia Backend');
  console.log('🔗 Backend: https://fixia-platform-production.up.railway.app');
  console.log('🔗 Frontend: https://fixia-platform.vercel.app');
  
  try {
    console.log('\n=== TEST 1: CORS Preflight (OPTIONS) ===');
    const preflightPassed = await testCORSPreflight();
    
    console.log('\n=== TEST 2: Actual Login Request ===');
    const loginPassed = await testLoginRequest();
    
    console.log('\n=== FINAL RESULTS ===');
    console.log(`Preflight test: ${preflightPassed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Login request test: ${loginPassed ? '✅ PASS' : '❌ FAIL'}`);
    
    if (preflightPassed && loginPassed) {
      console.log('\n🎉 ALL TESTS PASSED - CORS is properly configured!');
      process.exit(0);
    } else {
      console.log('\n❌ SOME TESTS FAILED - CORS needs attention');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

runCORSTests();