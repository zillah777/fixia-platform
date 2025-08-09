#!/usr/bin/env node

/**
 * TEST REAL EMAIL SCRIPT
 * Test sending actual verification email to a real email address
 */

const EmailService = require('../src/services/emailService');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function testRealEmail() {
  console.log('📧 Test Email Sending Script\n');
  
  try {
    // Check if configured
    if (!EmailService.isConfigured()) {
      console.error('❌ SendGrid not configured');
      process.exit(1);
    }
    
    console.log('✅ SendGrid is configured and ready');
    
    // Get email from user
    const email = await new Promise((resolve) => {
      rl.question('📧 Enter your email address to receive a test verification email: ', (answer) => {
        resolve(answer.trim());
      });
    });
    
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address');
      process.exit(1);
    }
    
    console.log(`\n🚀 Sending test verification email to: ${email}`);
    
    // Create test user
    const testUser = {
      id: 9999,
      first_name: 'Test',
      last_name: 'User',
      email: email
    };
    
    // Send verification email
    const result = await EmailService.sendVerificationEmail(testUser, 'customer');
    
    if (result.success) {
      console.log('\n✅ Email sent successfully!');
      if (result.messageId) {
        console.log(`📧 SendGrid Message ID: ${result.messageId}`);
      }
      if (result.simulated) {
        console.log(`🧪 Simulated: ${result.reason}`);
      }
      
      console.log('\n📍 What to do next:');
      console.log('  1. Check your inbox (may take a few minutes)');
      console.log('  2. Check spam/junk folder');
      console.log('  3. Look for email from: permabaneatresh@gmail.com');
      console.log('  4. The email will have "Confianza Líquida" Fixia design');
      
    } else {
      console.log('\n❌ Email sending failed:');
      console.log(`Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
  
  rl.close();
  process.exit(0);
}

// Run test
testRealEmail();