#!/usr/bin/env node

/**
 * Fixia Security Audit Script
 * Comprehensive security assessment for production readiness
 */

require('dotenv').config();
const CredentialManager = require('../src/utils/credentialSecurity');
const { logger } = require('../src/utils/smartLogger');

class SecurityAuditor {
  constructor() {
    this.credentialManager = new CredentialManager();
    this.findings = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      info: []
    };
  }

  /**
   * Run comprehensive security audit
   */
  async runAudit() {
    console.log('🔍 Starting Fixia Security Audit...\n');
    
    try {
      this.auditEnvironmentVariables();
      this.auditJWTConfiguration();
      this.auditDatabaseSecurity();
      this.auditAPISecrets();
      this.auditFilePermissions();
      this.auditDependencies();
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Security audit failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Audit environment variables
   */
  auditEnvironmentVariables() {
    console.log('📋 Auditing Environment Variables...');
    
    const requiredVars = [
      'NODE_ENV',
      'JWT_SECRET',
      'DB_HOST',
      'DB_PASSWORD',
      'FRONTEND_URL'
    ];

    const sensitiveVars = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'DB_PASSWORD',
      'SENDGRID_API_KEY',
      'MP_ACCESS_TOKEN',
      'WEBHOOK_SECRET'
    ];

    // Check required variables
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        this.addFinding('critical', `Missing required environment variable: ${varName}`);
      }
    }

    // Check for placeholder values
    const placeholderPatterns = [
      'your-secret',
      'change-this',
      'replace-me',
      'todo',
      'fixme',
      'test-secret',
      'CHANGE_THIS',
      'GENERATE_NEW'
    ];

    for (const varName of sensitiveVars) {
      const value = process.env[varName];
      if (value) {
        const hasPlaceholder = placeholderPatterns.some(pattern => 
          value.toUpperCase().includes(pattern.toUpperCase()));
        
        if (hasPlaceholder) {
          this.addFinding('critical', `${varName} contains placeholder value - MUST be changed for production`);
        }
      }
    }

    // Check NODE_ENV
    if (process.env.NODE_ENV === 'production') {
      this.addFinding('info', 'Running in production mode');
      
      // Production-specific checks
      if (!process.env.JWT_REFRESH_SECRET) {
        this.addFinding('high', 'JWT_REFRESH_SECRET not set for production');
      }
      
      if (process.env.SENDGRID_API_KEY === 'disabled') {
        this.addFinding('medium', 'Email service disabled in production');
      }
    }

    console.log('✅ Environment variables audit completed\n');
  }

  /**
   * Audit JWT configuration
   */
  auditJWTConfiguration() {
    console.log('🔐 Auditing JWT Configuration...');
    
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret) {
      const validation = this.credentialManager.validateJWTSecret(jwtSecret);
      
      if (!validation.isValid) {
        this.addFinding('critical', `JWT_SECRET is weak: ${JSON.stringify(validation.validations)}`);
      } else {
        this.addFinding('info', `JWT_SECRET strength: ${validation.strength}`);
      }
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (refreshSecret) {
      const validation = this.credentialManager.validateJWTSecret(refreshSecret);
      
      if (!validation.isValid) {
        this.addFinding('high', `JWT_REFRESH_SECRET is weak: ${JSON.stringify(validation.validations)}`);
      } else {
        this.addFinding('info', `JWT_REFRESH_SECRET strength: ${validation.strength}`);
      }
    }

    // Check JWT expiration settings
    const jwtExpire = process.env.JWT_EXPIRE || '7d';
    if (jwtExpire.includes('y') || parseInt(jwtExpire) > 365) {
      this.addFinding('medium', 'JWT expiration time is too long for security');
    }

    console.log('✅ JWT configuration audit completed\n');
  }

  /**
   * Audit database security
   */
  auditDatabaseSecurity() {
    console.log('🗄️ Auditing Database Security...');
    
    const dbPassword = process.env.DB_PASSWORD;
    if (!dbPassword) {
      this.addFinding('critical', 'Database password not set');
    } else if (dbPassword.length < 12) {
      this.addFinding('high', 'Database password is too short (minimum 12 characters)');
    }

    // Check for SSL configuration
    const dbSSL = process.env.DB_SSL;
    if (process.env.NODE_ENV === 'production' && dbSSL !== 'true') {
      this.addFinding('high', 'Database SSL not enabled for production');
    }

    // Check for default database names
    const dbName = process.env.DB_NAME;
    const defaultNames = ['postgres', 'test', 'development'];
    if (defaultNames.includes(dbName)) {
      this.addFinding('medium', `Using default database name: ${dbName}`);
    }

    console.log('✅ Database security audit completed\n');
  }

  /**
   * Audit API secrets and keys
   */
  auditAPISecrets() {
    console.log('🔑 Auditing API Secrets...');
    
    // MercadoPago keys
    const mpToken = process.env.MP_ACCESS_TOKEN;
    if (mpToken && mpToken.startsWith('tu_mercadopago')) {
      this.addFinding('high', 'MercadoPago access token is placeholder');
    }

    const mpPublicKey = process.env.MP_PUBLIC_KEY;
    if (mpPublicKey && mpPublicKey.startsWith('tu_mercadopago')) {
      this.addFinding('medium', 'MercadoPago public key is placeholder');
    }

    // SendGrid
    const sendgridKey = process.env.SENDGRID_API_KEY;
    if (sendgridKey && sendgridKey.startsWith('SG.') && sendgridKey.includes('test')) {
      this.addFinding('medium', 'SendGrid API key appears to be test key');
    }

    // Google Maps
    const googleMapsKey = process.env.GOOGLE_MAPS_API_KEY;
    if (googleMapsKey && googleMapsKey.includes('tu_google')) {
      this.addFinding('medium', 'Google Maps API key is placeholder');
    }

    // Webhook secret
    if (!process.env.WEBHOOK_SECRET && process.env.NODE_ENV === 'production') {
      this.addFinding('high', 'Webhook secret not configured for production');
    }

    console.log('✅ API secrets audit completed\n');
  }

  /**
   * Audit file permissions
   */
  auditFilePermissions() {
    console.log('📁 Auditing File Permissions...');
    
    // Check .env file permissions
    const fs = require('fs');
    const path = require('path');
    
    try {
      const envPath = path.join(process.cwd(), '.env');
      const stats = fs.statSync(envPath);
      const mode = (stats.mode & parseInt('777', 8)).toString(8);
      
      if (mode !== '600' && mode !== '644') {
        this.addFinding('medium', `.env file permissions (${mode}) should be 600 or 644`);
      } else {
        this.addFinding('info', `.env file permissions: ${mode} ✅`);
      }
    } catch (error) {
      this.addFinding('medium', '.env file not found or not accessible');
    }

    console.log('✅ File permissions audit completed\n');
  }

  /**
   * Audit dependencies for security vulnerabilities
   */
  auditDependencies() {
    console.log('📦 Auditing Dependencies...');
    
    // This would typically use npm audit or similar tools
    // For now, we'll check for common security packages
    
    const packageJson = require('../package.json');
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const securityPackages = [
      'helmet',
      'express-rate-limit',
      'validator',
      'bcrypt',
      'jsonwebtoken'
    ];

    const missingSecurity = securityPackages.filter(pkg => !dependencies[pkg]);
    if (missingSecurity.length > 0) {
      this.addFinding('medium', `Missing security packages: ${missingSecurity.join(', ')}`);
    }

    this.addFinding('info', 'Dependency audit completed - consider running npm audit for vulnerabilities');
    
    console.log('✅ Dependencies audit completed\n');
  }

  /**
   * Add finding to appropriate severity level
   */
  addFinding(severity, message) {
    this.findings[severity].push(message);
  }

  /**
   * Generate comprehensive security report
   */
  generateReport() {
    console.log('📊 Security Audit Report\n');
    console.log('=' .repeat(50));

    const severityIcons = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵',
      info: '🟢'
    };

    let totalIssues = 0;

    for (const [severity, findings] of Object.entries(this.findings)) {
      if (findings.length > 0) {
        console.log(`\n${severityIcons[severity]} ${severity.toUpperCase()} (${findings.length})`);
        console.log('-'.repeat(30));
        
        findings.forEach((finding, index) => {
          console.log(`${index + 1}. ${finding}`);
        });

        if (severity !== 'info') {
          totalIssues += findings.length;
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`\n📈 SUMMARY:`);
    console.log(`Total Security Issues: ${totalIssues}`);
    console.log(`Critical: ${this.findings.critical.length}`);
    console.log(`High: ${this.findings.high.length}`);
    console.log(`Medium: ${this.findings.medium.length}`);
    console.log(`Low: ${this.findings.low.length}`);

    // Security Score
    const maxScore = 100;
    let score = maxScore;
    score -= this.findings.critical.length * 25;
    score -= this.findings.high.length * 15;
    score -= this.findings.medium.length * 10;
    score -= this.findings.low.length * 5;
    score = Math.max(0, score);

    console.log(`\n🎯 Security Score: ${score}/100`);

    if (score >= 90) {
      console.log('🏆 Excellent security posture!');
    } else if (score >= 75) {
      console.log('✅ Good security posture with minor improvements needed');
    } else if (score >= 60) {
      console.log('⚠️ Moderate security - several issues need attention');
    } else {
      console.log('🚨 Poor security posture - immediate attention required');
    }

    // Recommendations
    console.log('\n🔧 RECOMMENDATIONS:');
    if (this.findings.critical.length > 0) {
      console.log('1. Address all CRITICAL issues immediately before production deployment');
    }
    if (this.findings.high.length > 0) {
      console.log('2. Resolve HIGH severity issues as soon as possible');
    }
    console.log('3. Run regular security audits');
    console.log('4. Implement automated security testing in CI/CD');
    console.log('5. Keep dependencies updated and monitor for vulnerabilities');

    console.log('\n' + '='.repeat(50));

    // Exit with error code if critical issues exist
    if (this.findings.critical.length > 0) {
      console.log('\n❌ AUDIT FAILED: Critical security issues must be resolved');
      process.exit(1);
    } else {
      console.log('\n✅ Security audit completed successfully');
      process.exit(0);
    }
  }
}

// Run audit if script is executed directly
if (require.main === module) {
  const auditor = new SecurityAuditor();
  auditor.runAudit();
}

module.exports = SecurityAuditor;