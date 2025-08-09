#!/usr/bin/env node

/**
 * EMAIL SERVICE DIAGNOSTIC SCRIPT
 * Identifies why verification emails are not being sent during registration
 */

const EmailService = require('../src/services/emailService');

async function runEmailDiagnostics() {
  console.log('📧 Starting Email Service Diagnostics...\n');

  try {
    // Test 1: Check environment variables
    console.log('📋 TEST 1: Checking email configuration...');
    
    const requiredEnvVars = [
      'SENDGRID_API_KEY',
      'SENDGRID_FROM_EMAIL',
      'FRONTEND_URL',
      'NODE_ENV'
    ];
    
    const missingVars = [];
    const presentVars = [];
    
    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar];
      if (!value || value === 'undefined' || value === 'your-sendgrid-api-key') {
        missingVars.push(envVar);
      } else {
        presentVars.push({ var: envVar, value: envVar === 'SENDGRID_API_KEY' ? `${value.substring(0, 10)}...` : value });
      }
    }
    
    console.log('✅ Present environment variables:');
    console.table(presentVars);
    
    if (missingVars.length > 0) {
      console.log('❌ Missing or invalid environment variables:');
      missingVars.forEach(v => console.log(`  - ${v}`));
      console.log('\n💡 To fix this:');
      console.log('  1. Check your .env file');
      console.log('  2. Make sure SENDGRID_API_KEY is valid (not placeholder)');
      console.log('  3. Set SENDGRID_FROM_EMAIL to a verified sender');
      return;
    }

    // Test 2: Check SendGrid configuration
    console.log('\n📋 TEST 2: Checking SendGrid service status...');
    
    const isConfigured = EmailService.isConfigured();
    const isTestMode = EmailService.isTestMode();
    
    console.log(`  SendGrid configured: ${isConfigured ? '✅' : '❌'}`);
    console.log(`  Test mode: ${isTestMode ? '🧪 YES' : '🚀 Production'}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'undefined'}`);
    
    if (!isConfigured) {
      console.log('\n❌ SendGrid is not properly configured');
      console.log('💡 Check that:');
      console.log('  - SENDGRID_API_KEY is a valid SendGrid API key');
      console.log('  - SENDGRID_FROM_EMAIL is a verified sender email');
      console.log('  - API key has "Mail Send" permissions');
      return;
    }

    // Test 3: Test email token generation
    console.log('\n📋 TEST 3: Testing email verification token generation...');
    
    try {
      // Create a test user ID and email
      const testUserId = 9999;
      const testEmail = 'test@fixia.com.ar';
      
      console.log(`  Creating token for user ${testUserId}, email: ${testEmail}`);
      
      const tokenResult = await EmailService.generateVerificationToken(testUserId, testEmail);
      const token = tokenResult.token || tokenResult;
      console.log(`  ✅ Token generated successfully: ${token.substring(0, 10)}...`);
      if (tokenResult.fallback) {
        console.log(`  ⚠️ Using fallback mode (database unavailable)`);
      }
      
      // Clean up test token
      const { query } = require('../src/config/database');
      await query('DELETE FROM email_verification_tokens WHERE user_id = $1', [testUserId]);
      console.log('  🧹 Test token cleaned up');
      
    } catch (tokenError) {
      console.log('  ❌ Token generation failed:', tokenError.message);
      console.log('  💡 This might be a database connectivity issue');
      console.log('  Check that the email_verification_tokens table exists');
    }

    // Test 4: Test actual email sending
    console.log('\n📋 TEST 4: Testing email sending...');
    
    const testUser = {
      id: 9999,
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com' // Use a safe test email
    };
    
    try {
      console.log('  Attempting to send verification email...');
      
      const emailResult = await EmailService.sendVerificationEmail(testUser, 'customer');
      
      if (emailResult.success) {
        console.log('  ✅ Email sending successful!');
        if (emailResult.simulated) {
          console.log(`  🧪 Simulated (${emailResult.reason})`);
        } else {
          console.log(`  📧 Real email sent with message ID: ${emailResult.messageId}`);
        }
      } else {
        console.log('  ❌ Email sending failed:', emailResult.error);
        console.log('  💡 Possible issues:');
        console.log('    - Invalid SendGrid API key');
        console.log('    - Sender email not verified');
        console.log('    - API key lacks permissions');
        console.log('    - SendGrid account issue');
      }
      
    } catch (emailError) {
      console.log('  ❌ Email sending threw an exception:', emailError.message);
      console.log('  💡 This is likely a configuration or API issue');
    }

    // Test 5: Check registration flow integration
    console.log('\n📋 TEST 5: Checking registration flow integration...');
    
    // Check authController registration method
    const fs = require('fs');
    const path = require('path');
    
    try {
      const authControllerPath = path.join(__dirname, '../src/controllers/authController.js');
      const authContent = fs.readFileSync(authControllerPath, 'utf8');
      
      const hasEmailSending = authContent.includes('sendVerificationEmail');
      const hasProductionCheck = authContent.includes('NODE_ENV === \'production\'');
      const hasEmailService = authContent.includes('EmailService');
      
      console.log(`  Registration calls sendVerificationEmail: ${hasEmailSending ? '✅' : '❌'}`);
      console.log(`  Has production environment check: ${hasProductionCheck ? '✅' : '❌'}`);
      console.log(`  Imports EmailService: ${hasEmailService ? '✅' : '❌'}`);
      
      if (!hasEmailSending) {
        console.log('  ❌ Registration is not calling email verification!');
        console.log('  💡 Check the authController.register method');
      }
      
    } catch (fileError) {
      console.log('  ⚠️ Could not analyze authController file');
    }

    // Test 6: Environment-specific behavior
    console.log('\n📋 TEST 6: Checking environment-specific email behavior...');
    
    const nodeEnv = process.env.NODE_ENV;
    console.log(`  Current NODE_ENV: ${nodeEnv || 'undefined'}`);
    
    if (nodeEnv === 'production') {
      console.log('  🚀 Production mode: Real emails should be sent');
      console.log('  💡 If emails are not arriving:');
      console.log('    - Check spam/junk folders');
      console.log('    - Verify recipient email is valid');
      console.log('    - Check SendGrid delivery logs');
    } else if (nodeEnv === 'development') {
      console.log('  🔧 Development mode: Check registration logic');
      console.log('  💡 In development, registration may:');
      console.log('    - Skip email verification');
      console.log('    - Auto-login users');
      console.log('    - Simulate email sending');
    } else {
      console.log('  ⚠️ NODE_ENV not set or invalid');
      console.log('  💡 Set NODE_ENV to "production" or "development"');
    }

    console.log('\n🎉 Email Service Diagnostics completed!');
    console.log('\n📊 SUMMARY:');
    
    if (isConfigured) {
      console.log('  ✅ SendGrid is properly configured');
      if (isTestMode) {
        console.log('  🧪 Running in test mode - emails are simulated');
      } else {
        console.log('  📧 Ready to send real emails');
      }
    } else {
      console.log('  ❌ SendGrid configuration issues detected');
    }
    
    console.log('\n💡 Next steps if emails are still not working:');
    console.log('  1. Check server logs during registration');
    console.log('  2. Verify SENDGRID_API_KEY is correct');
    console.log('  3. Check SendGrid dashboard for delivery logs');
    console.log('  4. Test with npm run test-email');

  } catch (error) {
    console.error('\n❌ Diagnostics failed:', error.message);
    console.error('Stack:', error.stack);
  }

  process.exit(0);
}

// Run diagnostics
if (require.main === module) {
  runEmailDiagnostics();
}

module.exports = { runEmailDiagnostics };