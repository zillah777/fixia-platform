const express = require('express');
const webhooksController = require('../controllers/webhooksController');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');
const { sensitiveLimiter, strictLimiter } = require('../middleware/security');

const router = express.Router();

/**
 * MercadoPago Webhook Routes
 * 
 * Security considerations:
 * - Public endpoints for MercadoPago notifications (no auth required)
 * - Rate limiting to prevent abuse
 * - Webhook signature validation (implement in controller)
 * - Comprehensive logging for audit trail
 */

// MercadoPago payment webhook - PUBLIC endpoint
// POST /api/webhooks/mercadopago
router.post('/mercadopago', 
  strictLimiter, // Allow more requests for webhooks but still limit abuse
  webhooksController.handleMercadoPagoWebhook
);

// Payment completion webhook - AUTHENTICATED endpoint
// POST /api/webhooks/payment-completion
router.post('/payment-completion', 
  authMiddleware,
  sensitiveLimiter,
  webhooksController.handlePaymentCompletion
);

// Refund request webhook - AUTHENTICATED endpoint  
// POST /api/webhooks/refund-request
router.post('/refund-request',
  authMiddleware,
  sensitiveLimiter,
  webhooksController.handleRefundRequest
);

// Get webhook status - AUTHENTICATED endpoint
// GET /api/webhooks/status/:webhook_id
router.get('/status/:webhook_id',
  authMiddleware,
  webhooksController.getWebhookStatus
);

// Test webhook endpoint - DEVELOPMENT ONLY
// POST /api/webhooks/test
router.post('/test',
  optionalAuthMiddleware,
  webhooksController.testWebhook
);

// Health check for webhook endpoint
// GET /api/webhooks/health
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Webhook service is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;