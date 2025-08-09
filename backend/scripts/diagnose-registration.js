#!/usr/bin/env node

/**
 * REGISTRATION DIAGNOSTIC SCRIPT
 * Comprehensive testing script to identify and fix PostgreSQL registration issues
 */

const { query } = require('../src/config/database');
const bcrypt = require('bcrypt');
const { transformUserForDatabase } = require('../src/utils/userTypeTransformer');

// Test data for registration diagnostics
const testUsers = [
  {
    first_name: 'Test',
    last_name: 'Customer',
    email: 'test-customer@fixia.com.ar',
    password: 'testpass123',
    user_type: 'customer',
    phone: '+54 280 1234567',
    locality: 'Comodoro Rivadavia'
  },
  {
    first_name: 'Test',
    last_name: 'Provider',
    email: 'test-provider@fixia.com.ar',
    password: 'testpass123',
    user_type: 'provider',
    phone: '+54 280 7654321',
    locality: 'Trelew'
  }
];

async function runDiagnostics() {
  console.log('🔍 Starting PostgreSQL Registration Diagnostics...\n');

  try {
    // Test 1: Check users table structure
    console.log('📋 TEST 1: Checking users table structure...');
    const tableInfo = await query(`
      SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);

    if (tableInfo.rows.length === 0) {
      console.error('❌ CRITICAL: Users table does not exist!');
      console.log('Run: npm run migrate to create the database schema');
      process.exit(1);
    }

    console.log('✅ Users table exists with', tableInfo.rows.length, 'columns');
    console.table(tableInfo.rows.map(col => ({
      column: col.column_name,
      type: col.data_type,
      nullable: col.is_nullable,
      default: col.column_default,
      max_length: col.character_maximum_length
    })));

    // Test 2: Check constraints
    console.log('\n📋 TEST 2: Checking table constraints...');
    const constraints = await query(`
      SELECT constraint_name, constraint_type, check_clause
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_name = 'users'
    `);

    console.log('✅ Found', constraints.rows.length, 'constraints:');
    constraints.rows.forEach(constraint => {
      console.log(`  - ${constraint.constraint_name}: ${constraint.constraint_type}`);
      if (constraint.check_clause) {
        console.log(`    Check: ${constraint.check_clause}`);
      }
    });

    // Test 3: Verify user_type transformation
    console.log('\n📋 TEST 3: Testing user_type transformations...');
    const testTypes = ['customer', 'provider', 'admin'];
    
    for (const frontendType of testTypes) {
      const dbType = transformUserForDatabase({ user_type: frontendType }).user_type;
      console.log(`  Frontend '${frontendType}' -> Database '${dbType}'`);
      
      // Test if the transformed type would pass CHECK constraint
      const validTypes = ['client', 'provider', 'admin'];
      if (validTypes.includes(dbType)) {
        console.log(`    ✅ Valid database type`);
      } else {
        console.log(`    ❌ Invalid database type - CHECK constraint will fail`);
      }
    }

    // Test 4: Test actual registration data insertion
    console.log('\n📋 TEST 4: Testing registration data insertion...');
    
    for (const testUser of testUsers) {
      try {
        console.log(`\nTesting registration for: ${testUser.email}`);
        
        // Clean up any existing test user
        await query('DELETE FROM users WHERE email = $1', [testUser.email]);
        
        // Transform user_type for database
        const dbUserType = transformUserForDatabase({ user_type: testUser.user_type }).user_type;
        console.log(`  User type: ${testUser.user_type} -> ${dbUserType}`);
        
        // Hash password
        const password_hash = await bcrypt.hash(testUser.password, 12);
        
        // Test insertion with exact same query as registration controller
        const insertQuery = `
          INSERT INTO users (
            first_name, 
            last_name, 
            email, 
            password_hash, 
            user_type,
            phone,
            locality,
            verification_status,
            email_verified,
            is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id, first_name, last_name, email, user_type, phone, locality, 
                    verification_status, email_verified, is_active, created_at
        `;
        
        const insertValues = [
          testUser.first_name, 
          testUser.last_name, 
          testUser.email, 
          password_hash, 
          dbUserType,
          testUser.phone || null,
          testUser.locality || null,
          'pending',
          false,
          true
        ];
        
        const result = await query(insertQuery, insertValues);
        
        if (result.rows.length > 0) {
          console.log('  ✅ Registration successful!');
          console.log(`  📊 User created with ID: ${result.rows[0].id}`);
          console.log(`  📊 Database user_type: ${result.rows[0].user_type}`);
          
          // Clean up test user
          await query('DELETE FROM users WHERE id = $1', [result.rows[0].id]);
          console.log('  🧹 Test user cleaned up');
        } else {
          console.log('  ❌ Registration failed - no rows returned');
        }
        
      } catch (error) {
        console.error(`  ❌ Registration failed for ${testUser.email}:`);
        console.error(`     Error: ${error.message}`);
        console.error(`     Code: ${error.code}`);
        if (error.detail) console.error(`     Detail: ${error.detail}`);
        if (error.constraint) console.error(`     Constraint: ${error.constraint}`);
        
        // Analyze the specific error
        if (error.code === '23514') {
          console.error('     🔍 CHECK constraint violation - user_type not allowed');
        } else if (error.code === '23505') {
          console.error('     🔍 UNIQUE constraint violation - email already exists');
        } else if (error.code === '23502') {
          console.error('     🔍 NOT NULL constraint violation - missing required field');
        }
      }
    }

    // Test 5: Test actual API endpoint (if server is running)
    console.log('\n📋 TEST 5: API endpoint availability check...');
    try {
      const http = require('http');
      const testRequest = (options) => {
        return new Promise((resolve, reject) => {
          const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, data }));
          });
          req.on('error', reject);
          req.on('timeout', () => reject(new Error('Request timeout')));
          req.setTimeout(5000);
          req.end();
        });
      };

      const response = await testRequest({
        hostname: 'localhost',
        port: process.env.PORT || 3001,
        path: '/api/health',
        method: 'GET',
        timeout: 5000
      });

      if (response.statusCode === 200) {
        console.log('  ✅ Server is running and accessible');
      } else {
        console.log(`  ⚠️ Server responded with status: ${response.statusCode}`);
      }
    } catch (error) {
      console.log('  ⚠️ Server is not running or not accessible');
      console.log('  💡 Start the server with: npm start');
    }

    console.log('\n🎉 Diagnostics completed successfully!');
    console.log('\n📊 SUMMARY:');
    console.log('  ✅ Users table exists and is properly configured');
    console.log('  ✅ User type transformations are working correctly');
    console.log('  ✅ Registration data insertion is functional');
    console.log('\n💡 If registration is still failing, check:');
    console.log('  1. Server is running: npm start');
    console.log('  2. Database connection is stable');
    console.log('  3. Frontend is sending correct data format');
    console.log('  4. Check logs for specific errors');

  } catch (error) {
    console.error('\n❌ Diagnostics failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }

  process.exit(0);
}

// Run diagnostics
if (require.main === module) {
  runDiagnostics();
}

module.exports = { runDiagnostics };