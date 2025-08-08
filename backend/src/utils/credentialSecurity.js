/**
 * Credential Security and Rotation Utilities
 * Enterprise-grade credential management for production security
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { logger } = require('./smartLogger');

class CredentialManager {
  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || this.generateEncryptionKey();
    this.algorithm = 'aes-256-gcm';
  }

  /**
   * Generate cryptographically secure secrets
   */
  generateSecureSecret(bytes = 64) {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Generate encryption key for sensitive data
   */
  generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate JWT secret with enhanced entropy
   */
  generateJWTSecret() {
    // Combine multiple entropy sources
    const timestamp = Date.now().toString();
    const randomBytes = crypto.randomBytes(64);
    const hostname = require('os').hostname();
    
    // Create a hash from multiple sources
    const hash = crypto.createHash('sha512');
    hash.update(randomBytes);
    hash.update(timestamp);
    hash.update(hostname);
    
    return hash.digest('hex');
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(text) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
      cipher.setAAD(Buffer.from('fixia-security', 'utf8'));
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
      };
    } catch (error) {
      logger.error('Encryption failed', { error: error.message });
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData) {
    try {
      const { encrypted, iv, authTag } = encryptedData;
      const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
      
      decipher.setAAD(Buffer.from('fixia-security', 'utf8'));
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.error('Decryption failed', { error: error.message });
      throw new Error('Decryption failed');
    }
  }

  /**
   * Validate JWT secret strength
   */
  validateJWTSecret(secret) {
    const entropy = this.calculateEntropy(secret);
    const isHexString = /^[a-fA-F0-9]+$/.test(secret);
    
    // Adjust entropy requirements for hex strings
    const entropyThreshold = isHexString ? 3.5 : 4.0;
    
    const validations = {
      length: secret.length >= 64, // Minimum 64 characters (256 bits)
      entropy: entropy >= entropyThreshold,
      notCommon: !this.isCommonSecret(secret),
      hasVariety: this.hasCharacterVariety(secret)
    };

    const isValid = Object.values(validations).every(Boolean);
    
    if (!isValid) {
      logger.warn('🚨 Weak JWT secret detected', { 
        validations, 
        entropy: entropy.toFixed(2),
        isHexString 
      });
    }

    return {
      isValid,
      validations,
      strength: this.calculateSecretStrength(secret),
      entropy: entropy
    };
  }

  /**
   * Calculate entropy of a string
   */
  calculateEntropy(str) {
    const charCounts = {};
    for (const char of str) {
      charCounts[char] = (charCounts[char] || 0) + 1;
    }

    let entropy = 0;
    const length = str.length;
    
    for (const count of Object.values(charCounts)) {
      const probability = count / length;
      entropy -= probability * Math.log2(probability);
    }

    return entropy;
  }

  /**
   * Check if secret is in common weak secrets list
   */
  isCommonSecret(secret) {
    const commonSecrets = [
      'your-secret-key',
      'your-super-secret-jwt-key',
      'secret',
      'password',
      'jwt-secret',
      'test-secret',
      'development-secret'
    ];

    return commonSecrets.some(common => 
      secret.toLowerCase().includes(common.toLowerCase())
    );
  }

  /**
   * Check character variety in secret
   */
  hasCharacterVariety(secret) {
    const hasLower = /[a-z]/.test(secret);
    const hasUpper = /[A-Z]/.test(secret);
    const hasDigits = /\d/.test(secret);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(secret);
    const hasHex = /^[a-fA-F0-9]+$/.test(secret);

    // Either has variety of characters OR is a proper hex string
    return (hasLower && hasUpper && hasDigits) || hasHex;
  }

  /**
   * Calculate overall secret strength
   */
  calculateSecretStrength(secret) {
    let score = 0;
    
    // Length scoring
    if (secret.length >= 128) score += 3;
    else if (secret.length >= 64) score += 2;
    else if (secret.length >= 32) score += 1;
    
    // Entropy scoring
    const entropy = this.calculateEntropy(secret);
    if (entropy >= 5.0) score += 3;
    else if (entropy >= 4.0) score += 2;
    else if (entropy >= 3.0) score += 1;
    
    // Character variety
    if (this.hasCharacterVariety(secret)) score += 2;
    
    // Not common
    if (!this.isCommonSecret(secret)) score += 2;
    
    // Convert to rating
    if (score >= 9) return 'EXCELLENT';
    if (score >= 7) return 'STRONG';
    if (score >= 5) return 'MODERATE';
    if (score >= 3) return 'WEAK';
    return 'VERY_WEAK';
  }

  /**
   * Generate secure environment configuration
   */
  generateSecureConfig() {
    const config = {
      JWT_SECRET: this.generateJWTSecret(),
      JWT_REFRESH_SECRET: this.generateJWTSecret(),
      WEBHOOK_SECRET: this.generateSecureSecret(32),
      SESSION_SECRET: this.generateSecureSecret(32),
      COOKIE_SECRET: this.generateSecureSecret(32),
      ENCRYPTION_KEY: this.generateEncryptionKey(),
      CSRF_SECRET: this.generateSecureSecret(32)
    };

    // Validate all generated secrets
    const validations = {};
    for (const [key, value] of Object.entries(config)) {
      if (key.includes('JWT')) {
        validations[key] = this.validateJWTSecret(value);
      }
    }

    return { config, validations };
  }

  /**
   * Rotate JWT secrets safely
   */
  async rotateJWTSecrets() {
    try {
      logger.info('🔄 Starting JWT secret rotation');
      
      const newSecrets = {
        JWT_SECRET: this.generateJWTSecret(),
        JWT_REFRESH_SECRET: this.generateJWTSecret()
      };

      // Validate new secrets
      const validations = {};
      for (const [key, secret] of Object.entries(newSecrets)) {
        validations[key] = this.validateJWTSecret(secret);
        if (!validations[key].isValid) {
          throw new Error(`Generated ${key} is not secure enough`);
        }
      }

      logger.info('✅ JWT secret rotation completed', {
        validations: Object.keys(validations).reduce((acc, key) => {
          acc[key] = validations[key].strength;
          return acc;
        }, {})
      });

      return { newSecrets, validations };
    } catch (error) {
      logger.error('🚨 JWT secret rotation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Audit current environment security
   */
  auditEnvironmentSecurity() {
    const audit = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      issues: [],
      warnings: [],
      recommendations: []
    };

    // Check JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      audit.issues.push('JWT_SECRET is not set');
    } else {
      const validation = this.validateJWTSecret(jwtSecret);
      if (!validation.isValid) {
        audit.issues.push(`JWT_SECRET is weak: ${JSON.stringify(validation.validations)}`);
      }
      audit.jwtSecretStrength = validation.strength;
    }

    // Check for placeholder values
    const placeholderPatterns = [
      'your-secret',
      'change-this',
      'replace-me',
      'todo',
      'fixme',
      'test-secret',
      'development'
    ];

    const envVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'SENDGRID_API_KEY', 'MP_ACCESS_TOKEN'];
    for (const envVar of envVars) {
      const value = process.env[envVar];
      if (value && placeholderPatterns.some(pattern => 
        value.toLowerCase().includes(pattern))) {
        audit.warnings.push(`${envVar} contains placeholder value`);
      }
    }

    // Security recommendations
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.JWT_REFRESH_SECRET) {
        audit.recommendations.push('Implement refresh token secret for enhanced security');
      }
      if (!process.env.WEBHOOK_SECRET) {
        audit.recommendations.push('Add webhook secret for payment security');
      }
    }

    return audit;
  }
}

module.exports = CredentialManager;