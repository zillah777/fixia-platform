const express = require('express');
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { formatResponse, formatError } = require('../utils/helpers');

const router = express.Router();

// GET /api/promotional-subscriptions/check-eligibility - Check if user is eligible for promotional campaign
router.get('/check-eligibility', authMiddleware, async (req, res) => {
  try {
    const { user_type } = req.user;

    // Get active promotional campaigns for user type
    const [campaigns] = await pool.execute(`
      SELECT * FROM promotional_campaigns 
      WHERE (user_type = ? OR user_type = 'both') 
        AND is_active = TRUE 
        AND current_participants < max_participants
        AND (end_date IS NULL OR end_date > NOW())
      ORDER BY created_at ASC
    `, [user_type]);

    if (campaigns.length === 0) {
      return res.json(formatResponse({
        eligible: false,
        message: 'No hay promociones disponibles en este momento'
      }, 'Elegibilidad verificada'));
    }

    // Check if user already has a promotional subscription
    const [existingPromo] = await pool.execute(`
      SELECT ups.*, pc.name as campaign_name
      FROM user_promotional_subscriptions ups
      INNER JOIN promotional_campaigns pc ON ups.campaign_id = pc.id
      WHERE ups.user_id = ? AND ups.is_active = TRUE AND ups.expires_at > NOW()
    `, [req.user.id]);

    if (existingPromo.length > 0) {
      return res.json(formatResponse({
        eligible: false,
        current_promotion: existingPromo[0],
        message: 'Ya tienes una promoción activa'
      }, 'Elegibilidad verificada'));
    }

    const campaign = campaigns[0];
    const remainingSlots = campaign.max_participants - campaign.current_participants;

    res.json(formatResponse({
      eligible: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        duration_months: campaign.duration_months,
        remaining_slots: remainingSlots
      },
      message: `¡Felicitaciones! Eres elegible para: ${campaign.name}`
    }, 'Elegibilidad verificada'));

  } catch (error) {
    console.error('Check eligibility error:', error);
    res.status(500).json(formatError('Error al verificar elegibilidad'));
  }
});

// POST /api/promotional-subscriptions/claim - Claim promotional subscription
router.post('/claim', authMiddleware, async (req, res) => {
  try {
    const { campaign_id } = req.body;

    if (!campaign_id) {
      return res.status(400).json(formatError('ID de campaña es requerido'));
    }

    // Start transaction
    await pool.execute('START TRANSACTION');

    try {
      // Get campaign details with lock
      const [campaigns] = await pool.execute(`
        SELECT * FROM promotional_campaigns 
        WHERE id = ? AND is_active = TRUE 
          AND current_participants < max_participants
          AND (end_date IS NULL OR end_date > NOW())
        FOR UPDATE
      `, [campaign_id]);

      if (campaigns.length === 0) {
        await pool.execute('ROLLBACK');
        return res.status(404).json(formatError('Campaña no disponible o llena'));
      }

      const campaign = campaigns[0];

      // Check user type eligibility
      if (campaign.user_type !== 'both' && campaign.user_type !== req.user.user_type) {
        await pool.execute('ROLLBACK');
        return res.status(403).json(formatError('No eres elegible para esta campaña'));
      }

      // Check if user already claimed this campaign
      const [existing] = await pool.execute(`
        SELECT id FROM user_promotional_subscriptions 
        WHERE user_id = ? AND campaign_id = ?
      `, [req.user.id, campaign_id]);

      if (existing.length > 0) {
        await pool.execute('ROLLBACK');
        return res.status(400).json(formatError('Ya has reclamado esta promoción'));
      }

      // Calculate expiry date
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + campaign.duration_months);

      // Create promotional subscription
      await pool.execute(`
        INSERT INTO user_promotional_subscriptions (user_id, campaign_id, expires_at)
        VALUES (?, ?, ?)
      `, [req.user.id, campaign_id, expiryDate]);

      // Update campaign participants count
      await pool.execute(`
        UPDATE promotional_campaigns 
        SET current_participants = current_participants + 1 
        WHERE id = ?
      `, [campaign_id]);

      // Update user subscription type to basic (promotional)
      await pool.execute(`
        UPDATE users 
        SET subscription_type = 'basic', subscription_expires_at = ?
        WHERE id = ?
      `, [expiryDate, req.user.id]);

      await pool.execute('COMMIT');

      res.json(formatResponse({
        campaign_name: campaign.name,
        expires_at: expiryDate,
        duration_months: campaign.duration_months,
        remaining_slots: campaign.max_participants - campaign.current_participants - 1
      }, `¡Promoción activada! Tienes ${campaign.duration_months} meses gratis`));

    } catch (transactionError) {
      await pool.execute('ROLLBACK');
      throw transactionError;
    }

  } catch (error) {
    console.error('Claim promotion error:', error);
    res.status(500).json(formatError('Error al reclamar promoción'));
  }
});

// GET /api/promotional-subscriptions/my-promotion - Get current user's promotional subscription
router.get('/my-promotion', authMiddleware, async (req, res) => {
  try {
    const [promotions] = await pool.execute(`
      SELECT ups.*, pc.name as campaign_name, pc.description as campaign_description,
             pc.duration_months, pc.user_type as campaign_user_type
      FROM user_promotional_subscriptions ups
      INNER JOIN promotional_campaigns pc ON ups.campaign_id = pc.id
      WHERE ups.user_id = ? AND ups.is_active = TRUE
      ORDER BY ups.created_at DESC
      LIMIT 1
    `, [req.user.id]);

    if (promotions.length === 0) {
      return res.json(formatResponse({
        has_promotion: false,
        message: 'No tienes promociones activas'
      }, 'Promoción consultada'));
    }

    const promotion = promotions[0];
    const now = new Date();
    const isExpired = new Date(promotion.expires_at) <= now;

    if (isExpired) {
      // Mark as inactive
      await pool.execute(`
        UPDATE user_promotional_subscriptions 
        SET is_active = FALSE 
        WHERE id = ?
      `, [promotion.id]);

      // Revert user to free plan
      await pool.execute(`
        UPDATE users 
        SET subscription_type = 'free', subscription_expires_at = NULL
        WHERE id = ?
      `, [req.user.id]);

      return res.json(formatResponse({
        has_promotion: false,
        expired_promotion: promotion,
        message: 'Tu promoción ha expirado'
      }, 'Promoción consultada'));
    }

    const daysLeft = Math.ceil((new Date(promotion.expires_at) - now) / (1000 * 60 * 60 * 24));

    res.json(formatResponse({
      has_promotion: true,
      promotion: {
        ...promotion,
        days_left: daysLeft,
        expires_soon: daysLeft <= 7
      }
    }, 'Promoción activa'));

  } catch (error) {
    console.error('Get my promotion error:', error);
    res.status(500).json(formatError('Error al obtener promoción'));
  }
});

// GET /api/promotional-subscriptions/stats - Get promotional campaign statistics (admin)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // This endpoint could be restricted to admin users
    const [campaigns] = await pool.execute(`
      SELECT pc.*, 
             COUNT(ups.id) as total_claimed,
             COUNT(CASE WHEN ups.is_active = TRUE AND ups.expires_at > NOW() THEN 1 END) as active_subscriptions,
             COUNT(CASE WHEN ups.expires_at <= NOW() THEN 1 END) as expired_subscriptions
      FROM promotional_campaigns pc
      LEFT JOIN user_promotional_subscriptions ups ON pc.id = ups.campaign_id
      GROUP BY pc.id
      ORDER BY pc.created_at DESC
    `);

    res.json(formatResponse(campaigns, 'Estadísticas obtenidas exitosamente'));
  } catch (error) {
    console.error('Get promotion stats error:', error);
    res.status(500).json(formatError('Error al obtener estadísticas'));
  }
});

// GET /api/promotional-subscriptions/subscription-plans - Get available subscription plans
router.get('/subscription-plans', async (req, res) => {
  try {
    const [plans] = await pool.execute(`
      SELECT * FROM subscriptions 
      WHERE is_active = TRUE 
      ORDER BY price_monthly ASC
    `);

    const processedPlans = plans.map(plan => ({
      ...plan,
      features: plan.features ? JSON.parse(plan.features) : {},
      is_promotional: plan.price_monthly === 0 && plan.type === 'free'
    }));

    res.json(formatResponse(processedPlans, 'Planes de suscripción obtenidos exitosamente'));
  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json(formatError('Error al obtener planes de suscripción'));
  }
});

// POST /api/promotional-subscriptions/upgrade - Upgrade from promotional to paid subscription
router.post('/upgrade', authMiddleware, async (req, res) => {
  try {
    const { subscription_type } = req.body; // 'basic' or 'premium'

    if (!['basic'].includes(subscription_type)) {
      return res.status(400).json(formatError('Tipo de suscripción inválido'));
    }

    // Get subscription plan details
    const [plans] = await pool.execute(`
      SELECT * FROM subscriptions WHERE type = ? AND is_active = TRUE
    `, [subscription_type]);

    if (plans.length === 0) {
      return res.status(404).json(formatError('Plan de suscripción no encontrado'));
    }

    const plan = plans[0];

    // TODO: Integrate with payment processor (MercadoPago)
    // For now, just update the user's subscription

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1); // Monthly billing

    await pool.execute(`
      UPDATE users 
      SET subscription_type = ?, subscription_expires_at = ?
      WHERE id = ?
    `, [subscription_type, expiryDate, req.user.id]);

    // Deactivate promotional subscription
    await pool.execute(`
      UPDATE user_promotional_subscriptions 
      SET is_active = FALSE 
      WHERE user_id = ? AND is_active = TRUE
    `, [req.user.id]);

    res.json(formatResponse({
      subscription_type: subscription_type,
      expires_at: expiryDate,
      monthly_price: plan.price_monthly,
      message: 'Suscripción actualizada exitosamente'
    }, 'Upgrade realizado exitosamente'));

  } catch (error) {
    console.error('Upgrade subscription error:', error);
    res.status(500).json(formatError('Error al actualizar suscripción'));
  }
});

module.exports = router;