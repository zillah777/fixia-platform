const express = require('express');
const paymentsController = require('../controllers/paymentsController');
const { authMiddleware } = require('../middleware/auth');
const { paymentValidation } = require('../utils/validation');
const { sensitiveLimiter } = require('../middleware/security');

const router = express.Router();

// GET /api/payments - Get user's payments
router.get('/', authMiddleware, paymentsController.getPayments);

// GET /api/payments/:id - Get payment details
router.get('/:id', authMiddleware, paymentsController.getPaymentById);

// POST /api/payments - Create new payment
router.post('/', authMiddleware, sensitiveLimiter, paymentValidation, paymentsController.createPayment);

// PUT /api/payments/:id/status - Update payment status
router.put('/:id/status', authMiddleware, paymentsController.updatePaymentStatus);

// POST /api/payments/:id/refund - Request refund
router.post('/:id/refund', authMiddleware, sensitiveLimiter, paymentsController.requestRefund);

// GET /api/payments/stats - Get payment statistics
router.get('/stats', authMiddleware, paymentsController.getPaymentStats);

// GET /api/payments/earnings - Get earnings data
router.get('/earnings', authMiddleware, paymentsController.getEarnings);

module.exports = router;