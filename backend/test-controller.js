/**
 * TEMPORARY TEST CONTROLLER - FOR DEPLOYMENT COMPATIBILITY ONLY
 * This file exists only to prevent import errors during Railway deployment
 * It should NOT be used in production and will be removed once deployment cache clears
 */

const { logger } = require('./src/utils/smartLogger');

// Empty test controller for deployment compatibility
const testController = {
  test: (req, res) => {
    logger.warn('Test controller accessed - this should not happen in production');
    return res.status(404).json({
      success: false,
      error: 'Test endpoint not available',
      message: 'This is a temporary compatibility file'
    });
  }
};

module.exports = testController;