const express = require('express');
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { requireProvider } = require('../middleware/auth');
const { formatResponse, formatError } = require('../utils/helpers');

const router = express.Router();

// GET /api/subscriptions/plans - Get all subscription plans
router.get('/plans', async (req, res) => {
  try {
    const [plans] = await pool.execute(
      'SELECT * FROM subscriptions WHERE is_active = TRUE ORDER BY price_monthly ASC'
    );

    res.json(formatResponse(plans, 'Planes de suscripción obtenidos exitosamente'));

  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json(formatError('Error al obtener planes de suscripción'));
  }
});

// GET /api/subscriptions/current - Get current user subscription
router.get('/current', authMiddleware, requireProvider, async (req, res) => {
  try {
    const [user] = await pool.execute(
      `SELECT u.subscription_type, u.subscription_expires_at, s.*
       FROM users u
       LEFT JOIN subscriptions s ON u.subscription_type = s.type
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (user.length === 0) {
      return res.status(404).json(formatError('Usuario no encontrado'));
    }

    const currentSubscription = {
      ...user[0],
      is_active: user[0].subscription_expires_at ? new Date(user[0].subscription_expires_at) > new Date() : user[0].subscription_type === 'free',
      days_remaining: user[0].subscription_expires_at ? Math.max(0, Math.ceil((new Date(user[0].subscription_expires_at) - new Date()) / (1000 * 60 * 60 * 24))) : null
    };

    res.json(formatResponse(currentSubscription, 'Suscripción actual obtenida exitosamente'));

  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json(formatError('Error al obtener suscripción actual'));
  }
});

// POST /api/subscriptions/upgrade - Upgrade subscription
router.post('/upgrade', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { subscription_id } = req.body;

    if (!subscription_id) {
      return res.status(400).json(formatError('ID de suscripción es requerido'));
    }

    // Get subscription details
    const [subscriptions] = await pool.execute(
      'SELECT * FROM subscriptions WHERE id = ? AND is_active = TRUE',
      [subscription_id]
    );

    if (subscriptions.length === 0) {
      return res.status(404).json(formatError('Plan de suscripción no encontrado'));
    }

    const subscription = subscriptions[0];

    // Check if user already has this subscription type
    const [currentUser] = await pool.execute(
      'SELECT subscription_type, subscription_expires_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (currentUser[0].subscription_type === subscription.type) {
      return res.status(400).json(formatError('Ya tienes este plan de suscripción'));
    }

    // For free plan, just update user
    if (subscription.type === 'free') {
      await pool.execute(
        'UPDATE users SET subscription_type = "free", subscription_expires_at = NULL WHERE id = ?',
        [req.user.id]
      );

      return res.json(formatResponse({
        message: 'Cambiado a plan gratuito exitosamente'
      }, 'Suscripción actualizada'));
    }

    // For paid plans, create payment intent (simulate MercadoPago integration)
    const billingPeriodStart = new Date();
    const billingPeriodEnd = new Date();
    billingPeriodEnd.setMonth(billingPeriodEnd.getMonth() + 1);

    const paymentData = {
      external_payment_id: `mp_sub_${Date.now()}_${subscription_id}`,
      amount: subscription.price_monthly,
      description: `Suscripción ${subscription.name} - ${billingPeriodStart.toLocaleDateString('es-AR')}`,
      payment_url: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=fake_sub_${subscription_id}`
    };

    // Create subscription payment record
    const [paymentResult] = await pool.execute(
      `INSERT INTO subscription_payments 
       (user_id, subscription_id, amount, payment_method, external_payment_id, 
        billing_period_start, billing_period_end, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, 
        subscription_id, 
        subscription.price_monthly, 
        'mercadopago', 
        paymentData.external_payment_id,
        billingPeriodStart, 
        billingPeriodEnd, 
        'pending'
      ]
    );

    res.status(201).json(formatResponse({
      payment_id: paymentResult.insertId,
      payment_url: paymentData.payment_url,
      external_payment_id: paymentData.external_payment_id,
      amount: subscription.price_monthly,
      subscription: subscription
    }, 'Intención de pago de suscripción creada exitosamente'));

  } catch (error) {
    console.error('Upgrade subscription error:', error);
    res.status(500).json(formatError('Error al procesar actualización de suscripción'));
  }
});

// POST /api/subscriptions/confirm-payment - Confirm subscription payment
router.post('/confirm-payment', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { payment_id, external_payment_id } = req.body;

    // Get payment details
    const [payments] = await pool.execute(
      `SELECT sp.*, s.type as subscription_type, s.name as subscription_name
       FROM subscription_payments sp
       INNER JOIN subscriptions s ON sp.subscription_id = s.id
       WHERE sp.id = ? AND sp.user_id = ? AND sp.external_payment_id = ?`,
      [payment_id, req.user.id, external_payment_id]
    );

    if (payments.length === 0) {
      return res.status(404).json(formatError('Pago no encontrado'));
    }

    const payment = payments[0];

    // Simulate payment verification (in real app, verify with MercadoPago)
    const isPaymentApproved = Math.random() > 0.1; // 90% success rate for demo

    if (isPaymentApproved) {
      // Update payment status
      await pool.execute(
        'UPDATE subscription_payments SET status = "paid", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [payment_id]
      );

      // Update user subscription
      await pool.execute(
        'UPDATE users SET subscription_type = ?, subscription_expires_at = ? WHERE id = ?',
        [payment.subscription_type, payment.billing_period_end, req.user.id]
      );

      // Create notification
      await pool.execute(
        `INSERT INTO notifications (user_id, title, message, type, related_id)
         VALUES (?, ?, ?, ?, ?)`,
        [
          req.user.id,
          'Suscripción Activada',
          `Tu suscripción ${payment.subscription_name} ha sido activada exitosamente.`,
          'system',
          payment_id
        ]
      );

      res.json(formatResponse({
        status: 'approved',
        subscription_type: payment.subscription_type,
        expires_at: payment.billing_period_end
      }, 'Pago confirmado y suscripción activada exitosamente'));

    } else {
      // Update payment status to failed
      await pool.execute(
        'UPDATE subscription_payments SET status = "failed", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [payment_id]
      );

      res.status(400).json(formatError('El pago fue rechazado. Intenta con otro método de pago.'));
    }

  } catch (error) {
    console.error('Confirm subscription payment error:', error);
    res.status(500).json(formatError('Error al confirmar pago de suscripción'));
  }
});

// GET /api/subscriptions/payment-history - Get subscription payment history
router.get('/payment-history', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const [payments] = await pool.execute(
      `SELECT sp.*, s.name as subscription_name, s.type as subscription_type
       FROM subscription_payments sp
       INNER JOIN subscriptions s ON sp.subscription_id = s.id
       WHERE sp.user_id = ?
       ORDER BY sp.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, parseInt(limit), offset]
    );

    // Get total count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM subscription_payments WHERE user_id = ?',
      [req.user.id]
    );
    const total = countResult[0].total;

    res.json(formatResponse({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Historial de pagos obtenido exitosamente'));

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json(formatError('Error al obtener historial de pagos'));
  }
});

// POST /api/subscriptions/cancel - Cancel subscription
router.post('/cancel', authMiddleware, requireProvider, async (req, res) => {
  try {
    const { reason } = req.body;

    // Get current subscription
    const [user] = await pool.execute(
      'SELECT subscription_type, subscription_expires_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (user[0].subscription_type === 'free') {
      return res.status(400).json(formatError('No tienes una suscripción activa para cancelar'));
    }

    // Set subscription to expire at the end of current billing period
    // In a real app, you would also cancel the recurring payment in MercadoPago
    
    // For immediate cancellation, set to free plan
    await pool.execute(
      'UPDATE users SET subscription_type = "free", subscription_expires_at = NULL WHERE id = ?',
      [req.user.id]
    );

    // Log cancellation reason
    await pool.execute(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES (?, ?, ?, ?)`,
      [
        req.user.id,
        'Suscripción Cancelada',
        `Tu suscripción ha sido cancelada. Razón: ${reason || 'No especificada'}`,
        'system'
      ]
    );

    res.json(formatResponse({
      message: 'Suscripción cancelada exitosamente'
    }, 'Suscripción cancelada'));

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json(formatError('Error al cancelar suscripción'));
  }
});

// GET /api/subscriptions/benefits - Get subscription benefits for current user
router.get('/benefits', authMiddleware, requireProvider, async (req, res) => {
  try {
    const [user] = await pool.execute(
      `SELECT u.subscription_type, u.subscription_expires_at, s.features, s.*
       FROM users u
       LEFT JOIN subscriptions s ON u.subscription_type = s.type
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (user.length === 0) {
      return res.status(404).json(formatError('Usuario no encontrado'));
    }

    const userData = user[0];
    const isActive = userData.subscription_expires_at ? 
      new Date(userData.subscription_expires_at) > new Date() : 
      userData.subscription_type === 'free';

    // Get usage stats
    const [serviceCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM services WHERE provider_id = ? AND is_active = TRUE',
      [req.user.id]
    );

    const benefits = {
      subscription_type: userData.subscription_type,
      is_active: isActive,
      expires_at: userData.subscription_expires_at,
      features: userData.features ? JSON.parse(userData.features) : {},
      limits: {
        max_services: userData.max_services,
        current_services: serviceCount[0].count,
        can_create_service: userData.max_services === -1 || serviceCount[0].count < userData.max_services
      },
      benefits: {
        featured_listings: userData.featured_listings,
        priority_support: userData.priority_support,
        advanced_analytics: userData.advanced_analytics,
        custom_portfolio: userData.custom_portfolio,
        unlimited_photos: userData.unlimited_photos,
        verified_badge: userData.verified_badge
      }
    };

    res.json(formatResponse(benefits, 'Beneficios de suscripción obtenidos exitosamente'));

  } catch (error) {
    console.error('Get subscription benefits error:', error);
    res.status(500).json(formatError('Error al obtener beneficios de suscripción'));
  }
});

module.exports = router;