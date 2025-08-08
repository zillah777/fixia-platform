/**
 * FIXIA SUBSCRIPTION MANAGEMENT ROUTES - ENHANCED
 * ================================================
 * 
 * Complete subscription system with MercadoPago integration
 * Strategic limitations to drive conversions: "Plan Básico limitations = Upgrade motivation"
 * 
 * Philosophy: "Si la aplicación la entiende un analfabeto tecnológico, y un informático, será un éxito"
 */

const express = require('express');
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { requireProvider } = require('../middleware/auth');
const { formatResponse, formatError } = require('../utils/helpers');
const { 
  getUserSubscription, 
  getSubscriptionSummary,
  PLAN_LIMITS 
} = require('../middleware/subscription');

const router = express.Router();

// MercadoPago configuration
const mercadopago = require('mercadopago');
if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
  mercadopago.configurations.setAccessToken(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

// ============================================================================
// SUBSCRIPTION PLANS ROUTES - ENHANCED WITH STRATEGIC CONVERSION FEATURES
// ============================================================================

/**
 * GET /api/subscriptions/plans
 * Get all available subscription plans with conversion psychology
 */
router.get('/plans', async (req, res) => {
  try {
    const [plans] = await pool.execute(`
      SELECT 
        id, name, display_name, description, price_monthly, price_currency,
        max_active_services, max_portfolio_images, enhanced_profile_visibility,
        priority_customer_support, advanced_analytics, promotional_tools,
        top_search_placement, vip_support, marketing_automation,
        is_featured, sort_order
      FROM subscription_plans 
      WHERE is_active = TRUE 
      ORDER BY sort_order ASC
    `);

    // Add conversion psychology features to each plan
    const plansWithDetails = plans.map(plan => ({
      ...plan,
      limits: PLAN_LIMITS[plan.name] || PLAN_LIMITS.basico,
      features: getDetailedFeatures(plan.name),
      is_recommended: plan.name === 'profesional', // Strategic recommendation
      conversion_messaging: getConversionMessaging(plan.name),
      roi_calculator: getROIProjection(plan.name)
    }));

    res.json(formatResponse(plansWithDetails, 'Planes de suscripción obtenidos exitosamente'));

  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json(formatError('Error al obtener planes de suscripción'));
  }
});

/**
 * GET /api/subscriptions/current
 * Get comprehensive subscription summary with usage analytics
 */
router.get('/current', authMiddleware, requireProvider, async (req, res) => {
  try {
    const summary = await getSubscriptionSummary(req.user.id);
    
    // Get billing history for transparency
    const [billingHistory] = await pool.execute(`
      SELECT 
        amount, currency, billing_period_start, billing_period_end,
        payment_status, payment_date, invoice_number
      FROM subscription_billing_history 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 12
    `, [req.user.id]);

    // Check for active promotions
    const [promotions] = await pool.execute(`
      SELECT 
        pc.name, pc.description, pc.free_months,
        pu.benefit_end_date, pu.status
      FROM promotional_usage pu
      JOIN promotional_campaigns pc ON pu.campaign_id = pc.id
      WHERE pu.user_id = ? AND pu.status = 'active'
    `, [req.user.id]);

    // Get conversion opportunities (strategic upselling)
    const conversionOpportunities = getConversionOpportunities(summary);

    res.json(formatResponse({
      subscription: summary,
      billing_history: billingHistory,
      active_promotions: promotions,
      conversion_opportunities: conversionOpportunities,
      upgrade_urgency: getUpgradeUrgency(summary)
    }, 'Suscripción actual obtenida exitosamente'));

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

// ============================================================================
// PROMOTIONAL CAMPAIGNS AND CONVERSION PSYCHOLOGY
// ============================================================================

/**
 * GET /api/subscriptions/promotions/check-first-200
 * Check if user qualifies for First 200 Professionals promotion
 */
router.get('/promotions/check-first-200', authMiddleware, requireProvider, async (req, res) => {
  try {
    const [campaign] = await pool.execute(`
      SELECT * FROM promotional_campaigns 
      WHERE campaign_type = 'first_200_accounts' 
      AND is_active = TRUE
      AND uses_count < max_uses
    `);

    if (campaign.length === 0) {
      return res.json(formatResponse({
        is_available: false,
        message: 'Promoción no disponible'
      }));
    }

    // Check if user already used this promotion
    const [userUsage] = await pool.execute(`
      SELECT * FROM promotional_usage 
      WHERE user_id = ? AND campaign_id = ?
    `, [req.user.id, campaign[0].id]);

    const isAvailable = userUsage.length === 0;
    const remainingSlots = campaign[0].max_uses - campaign[0].uses_count;

    res.json(formatResponse({
      is_available: isAvailable,
      remaining_slots: remainingSlots,
      free_months: campaign[0].free_months,
      urgency_message: remainingSlots <= 20 ? 
        `¡Solo quedan ${remainingSlots} lugares!` : 
        `${remainingSlots} lugares disponibles`,
      promotion: campaign[0]
    }, 'Estado de promoción verificado'));

  } catch (error) {
    console.error('Check first 200 promotion error:', error);
    res.status(500).json(formatError('Error al verificar promoción'));
  }
});

// ============================================================================
// ENHANCED MERCADOPAGO INTEGRATION
// ============================================================================

/**
 * Create MercadoPago subscription with promotional support
 */
async function createMercadoPagoSubscription({ userId, plan, promotional, userEmail, userName }) {
  try {
    const finalPrice = promotional && promotional.free_months > 0 ? 0 : plan.price_monthly;
    
    const preference = {
      items: [{
        title: `Fixia ${plan.display_name}${promotional ? ' - Promoción Especial' : ''}`,
        description: promotional ? 
          `${plan.description} - ${promotional.free_months} meses gratis` : 
          plan.description,
        quantity: 1,
        unit_price: finalPrice,
        currency_id: 'ARS'
      }],
      payer: {
        email: userEmail,
        name: userName
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/as/configuracion/suscripcion?status=success&plan=${plan.name}`,
        failure: `${process.env.FRONTEND_URL}/as/configuracion/suscripcion?status=failure`,
        pending: `${process.env.FRONTEND_URL}/as/configuracion/suscripcion?status=pending`
      },
      auto_return: 'approved',
      external_reference: `user_${userId}_plan_${plan.id}_${Date.now()}`,
      notification_url: `${process.env.API_URL}/api/subscriptions/webhooks/mercadopago`,
      metadata: {
        user_id: userId,
        plan_id: plan.id,
        is_promotional: promotional ? true : false,
        free_months: promotional ? promotional.free_months : 0
      }
    };

    const response = await mercadopago.preferences.create(preference);
    return response.body;
  } catch (error) {
    console.error('Create MercadoPago subscription error:', error);
    throw error;
  }
}

// ============================================================================
// CONVERSION PSYCHOLOGY FUNCTIONS
// ============================================================================

/**
 * Get detailed features with conversion messaging
 */
function getDetailedFeatures(planName) {
  const features = {
    basico: [
      { name: 'Máximo 3 servicios activos', included: true, limitation: true },
      { name: 'Máximo 5 imágenes de portfolio', included: true, limitation: true },
      { name: 'Perfil básico', included: true },
      { name: 'Chat con clientes', included: true },
      { name: 'Soporte por email (48hs)', included: true, slow: true },
      { name: 'Servicios ilimitados', included: false, upgrade_feature: true },
      { name: 'Posicionamiento mejorado', included: false, upgrade_feature: true },
      { name: 'Analytics avanzados', included: false, upgrade_feature: true },
      { name: 'Soporte prioritario', included: false, upgrade_feature: true }
    ],
    profesional: [
      { name: 'Servicios ilimitados', included: true, highlight: true },
      { name: 'Imágenes de portfolio ilimitadas', included: true, highlight: true },
      { name: 'Posicionamiento mejorado en búsquedas', included: true, highlight: true },
      { name: 'Analytics avanzados con insights', included: true },
      { name: 'Soporte prioritario (24hs)', included: true },
      { name: 'Herramientas promocionales', included: true },
      { name: 'Badge "Profesional" verificado', included: true },
      { name: 'TOP posición en búsquedas', included: false, plus_feature: true },
      { name: 'Soporte VIP (2hs)', included: false, plus_feature: true }
    ],
    plus: [
      { name: 'Todo lo del Plan Profesional', included: true, highlight: true },
      { name: 'TOP posición garantizada en búsquedas', included: true, premium: true },
      { name: 'Soporte VIP (WhatsApp directo, 2hs)', included: true, premium: true },
      { name: 'Marketing automático con IA', included: true, premium: true },
      { name: 'Insights de competencia exclusivos', included: true, premium: true },
      { name: 'Email marketing automático', included: true },
      { name: 'Badge "Plus Premium" dorado', included: true, premium: true },
      { name: 'Ubicaciones de trabajo ilimitadas', included: true }
    ]
  };

  return features[planName] || features.basico;
}

/**
 * Get conversion messaging for each plan
 */
function getConversionMessaging(planName) {
  const messaging = {
    basico: {
      pain_points: [
        "¿Te quedaste sin servicios disponibles?",
        "¿Necesitas más imágenes para mostrar tu trabajo?",
        "¿Quieres aparecer antes que tu competencia?"
      ],
      call_to_action: "Upgrade a Profesional y libera tu potencial",
      urgency: "Los primeros 200 profesionales obtienen 2 meses gratis"
    },
    profesional: {
      benefits: [
        "3x más visibilidad en búsquedas",
        "Servicios y portfolio ilimitados",
        "Analytics que muestran tu ROI real"
      ],
      call_to_action: "Upgrade a Plus y domina tu mercado",
      value_prop: "Inversión que se paga sola con 1-2 clientes extra/mes"
    },
    plus: {
      exclusivity: [
        "TOP posición garantizada",
        "Soporte VIP exclusivo",
        "IA que te consigue clientes automáticamente"
      ],
      status: "El plan de los profesionales que lideran"
    }
  };

  return messaging[planName] || messaging.basico;
}

/**
 * Get ROI projection for business case
 */
function getROIProjection(planName) {
  const projections = {
    basico: {
      current_potential: "Con limitaciones actuales",
      missed_opportunities: "Posibles clientes perdidos por visibilidad limitada"
    },
    profesional: {
      monthly_cost: 4000,
      break_even_clients: 1,
      projected_extra_clients: "2-4 clientes adicionales/mes",
      roi_percentage: "200-400%",
      annual_savings: "Ahorro de $24,000 con promoción de 2 meses gratis"
    },
    plus: {
      monthly_cost: 7000,
      break_even_clients: 2,
      projected_extra_clients: "5-8 clientes adicionales/mes", 
      roi_percentage: "300-600%",
      premium_benefits: "Automatización que te ahorra 10+ horas/semana"
    }
  };

  return projections[planName] || projections.basico;
}

/**
 * Get conversion opportunities based on user behavior
 */
function getConversionOpportunities(summary) {
  const opportunities = [];
  
  // Service limit reached
  if (summary.usage.services.percentage >= 90) {
    opportunities.push({
      type: 'service_limit',
      urgency: 'high',
      message: '¡Te quedas sin servicios! Upgrade para servicios ilimitados',
      cta: 'Upgrade ahora'
    });
  }

  // Portfolio limit reached  
  if (summary.usage.portfolio.percentage >= 80) {
    opportunities.push({
      type: 'portfolio_limit',
      urgency: 'medium',
      message: 'Más imágenes = más clientes. Upgrade para portfolio ilimitado',
      cta: 'Ver planes'
    });
  }

  // Basic plan with good engagement
  if (summary.plan.name === 'basico') {
    opportunities.push({
      type: 'engagement_upgrade',
      urgency: 'low',
      message: 'Tu perfil está funcionando bien. ¿Imagina con mejor visibilidad?',
      cta: 'Potenciar perfil'
    });
  }

  return opportunities;
}

/**
 * Get upgrade urgency indicators
 */
function getUpgradeUrgency(summary) {
  const urgency = {
    level: 'low',
    factors: [],
    discount_available: false
  };

  // Check first 200 promotion availability
  // This would need to be checked against the database in real implementation
  urgency.discount_available = true;
  urgency.factors.push('Promoción: 2 meses gratis para primeros 200 profesionales');

  // High usage indicates urgent need
  if (summary.usage.services.percentage >= 90 || summary.usage.portfolio.percentage >= 90) {
    urgency.level = 'high';
    urgency.factors.push('Límites de plan alcanzados');
  }

  return urgency;
}

module.exports = router;