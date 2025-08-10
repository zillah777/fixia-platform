/**
 * Simple test script to verify user type transformation
 * Run this with: node test-user-transform.js
 */

const { 
  transformToDatabase, 
  transformToFrontend,
  transformUserForDatabase,
  transformUserForFrontend,
  transformResponse
} = require('./src/utils/userTypeTransformer');

console.log('🧪 Testing User Type Transformer...\n');

// Test 1: Basic transformations
console.log('1️⃣ Basic transformations:');
console.log('customer -> database:', transformToDatabase('customer')); // Should be 'client'
console.log('provider -> database:', transformToDatabase('provider')); // Should be 'provider'
console.log('client -> frontend:', transformToFrontend('client')); // Should be 'customer'
console.log('provider -> frontend:', transformToFrontend('provider')); // Should be 'provider'
console.log('');

// Test 2: User object transformation for database
console.log('2️⃣ User object for database:');
const frontendUser = {
  first_name: 'Juan',
  last_name: 'Pérez',
  email: 'juan@example.com',
  user_type: 'customer',
  phone: '+54123456789'
};
const dbUser = transformUserForDatabase(frontendUser);
console.log('Frontend user:', frontendUser);
console.log('Database user:', dbUser);
console.log('');

// Test 3: User object transformation for frontend
console.log('3️⃣ User object for frontend:');
const databaseUser = {
  id: 1,
  first_name: 'Juan',
  last_name: 'Pérez',
  email: 'juan@example.com',
  user_type: 'client',
  phone: '+54123456789',
  created_at: '2024-01-01T00:00:00.000Z'
};
const frontUser = transformUserForFrontend(databaseUser);
console.log('Database user:', databaseUser);
console.log('Frontend user:', frontUser);
console.log('');

// Test 4: API Response transformation
console.log('4️⃣ API Response transformation:');
const apiResponse = {
  success: true,
  message: 'User created successfully',
  data: {
    user: {
      id: 1,
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan@example.com',
      user_type: 'client'
    },
    token: 'fake-jwt-token'
  }
};
const transformedResponse = transformResponse(apiResponse.data);
console.log('Original API response data:', apiResponse.data);
console.log('Transformed response data:', transformedResponse);
console.log('');

// Test 5: Array of users transformation
console.log('5️⃣ Array of users transformation:');
const usersArray = [
  { id: 1, first_name: 'Juan', user_type: 'client' },
  { id: 2, first_name: 'Ana', user_type: 'provider' },
  { id: 3, first_name: 'Carlos', user_type: 'client' }
];
const transformedArray = transformResponse(usersArray);
console.log('Original users array:', usersArray);
console.log('Transformed users array:', transformedArray);
console.log('');

console.log('✅ All tests completed!');
console.log('');
console.log('🔄 Summary:');
console.log('- Frontend sends "customer" → Backend receives "client"');
console.log('- Backend stores "client" in database');
console.log('- Backend sends "client" → Frontend receives "customer"');
console.log('- This maintains compatibility without breaking existing code!');