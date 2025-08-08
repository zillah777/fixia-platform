/**
 * FIXIA SUBSCRIPTION MIDDLEWARE
 * ============================
 * 
 * Feature gating and subscription management middleware
 * Implements strategic limitations to drive conversions
 * 
 * Philosophy: "Si la aplicación la entiende un analfabeto tecnológico, y un informático, será un éxito"
 */

const { pool } = require('../config/database');
const { formatError } = require('../utils/helpers');

// ============================================================================
// PLAN CONFIGURATION
// ============================================================================

const PLAN_LIMITS = {
  basico: {
    maxActiveServices: 3,
    maxPortfolioImages: 5,
    maxWorkCategories: 2,
    maxWorkLocations: 1,
    enhancedVisibility: false,
    prioritySupport: false,
    advancedAnalytics: false,
    promotionalTools: false,
    topSearchPlacement: false,
    vipSupport: false,
    marketingAutomation: false,
    searchBoost: 0, // No boost for basic users
    supportResponseTime: 48 // hours
  },
  profesional: {
    maxActiveServices: 999,
    maxPortfolioImages: 999,
    maxWorkCategories: 999,
    maxWorkLocations: 5,
    enhancedVisibility: true,
    prioritySupport: true,
    advancedAnalytics: true,
    promotionalTools: true,
    topSearchPlacement: false,
    vipSupport: false,
    marketingAutomation: false,
    searchBoost: 10, // 10 point boost in search
    supportResponseTime: 24 // hours
  },
  plus: {
    maxActiveServices: 999,
    maxPortfolioImages: 999,
    maxWorkCategories: 999,
    maxWorkLocations: 999,
    enhancedVisibility: true,
    prioritySupport: true,
    advancedAnalytics: true,
    promotionalTools: true,
    topSearchPlacement: true,
    vipSupport: true,
    marketingAutomation: true,
    searchBoost: 25, // 25 point boost in search
    supportResponseTime: 2 // hours
  }
};

// ============================================================================
// CORE MIDDLEWARE FUNCTIONS
// ============================================================================

/**
 * Get user's current subscription and plan details
 */
async function getUserSubscription(userId) {
  try {
    const [subscription] = await pool.execute(`
      SELECT 
        us.id as subscription_id,
        us.status,
        us.current_period_end,
        us.is_promotional,
        us.promotional_end_date,
        sp.name as plan_name,
        sp.display_name,
        sp.price_monthly,
        sp.max_active_services,
        sp.max_portfolio_images,
        sp.enhanced_profile_visibility,
        sp.priority_customer_support,
        sp.advanced_analytics,
        sp.promotional_tools,
        sp.top_search_placement,
        sp.vip_support,
        sp.marketing_automation
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = ? AND us.status = 'active'
      LIMIT 1
    `, [userId]);

    if (subscription.length === 0) {
      // Return default basic plan for users without subscription
      return {
        plan_name: 'basico',
        display_name: 'Plan Básico',
        price_monthly: 0,
        status: 'active',
        ...PLAN_LIMITS.basico
      };
    }

    const userPlan = subscription[0];
    const planLimits = PLAN_LIMITS[userPlan.plan_name] || PLAN_LIMITS.basico;

    return {
      ...userPlan,
      ...planLimits
    };
  } catch (error) {
    console.error('Get user subscription error:', error);
    // Return basic plan on error
    return {
      plan_name: 'basico',
      display_name: 'Plan Básico',
      price_monthly: 0,
      status: 'active',
      ...PLAN_LIMITS.basico
    };
  }
}

/**
 * Get current feature usage for user
 */
async function getFeatureUsage(userId) {
  try {
    const [usage] = await pool.execute(`
      SELECT 
        active_services_count,
        portfolio_images_count,
        monthly_leads_received,
        monthly_profile_views,
        last_reset_date
      FROM feature_usage_tracking
      WHERE user_id = ?
    `, [userId]);

    if (usage.length === 0) {
      // Create initial tracking record
      await pool.execute(`
        INSERT INTO feature_usage_tracking (user_id, active_services_count, portfolio_images_count)
        VALUES (?, 0, 0)
      `, [userId]);
      
      return {
        active_services_count: 0,
        portfolio_images_count: 0,
        monthly_leads_received: 0,
        monthly_profile_views: 0,
        last_reset_date: new Date()
      };
    }

    return usage[0];
  } catch (error) {
    console.error('Get feature usage error:', error);
    return {
      active_services_count: 0,
      portfolio_images_count: 0,
      monthly_leads_received: 0,
      monthly_profile_views: 0,
      last_reset_date: new Date()
    };
  }
}

/**
 * Update feature usage counter
 */
async function updateFeatureUsage(userId, feature, increment = 1) {
  try {
    const validFeatures = ['active_services_count', 'portfolio_images_count', 'monthly_leads_received', 'monthly_profile_views'];
    
    if (!validFeatures.includes(feature)) {
      throw new Error(`Invalid feature: ${feature}`);
    }

    await pool.execute(`
      UPDATE feature_usage_tracking 
      SET ${feature} = ${feature} + ?, last_updated = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `, [increment, userId]);
  } catch (error) {
    console.error('Update feature usage error:', error);
  }
}

// ============================================================================
// FEATURE GATING MIDDLEWARE
// ============================================================================

/**
 * Check if user can add more services
 */
const canAddService = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const subscription = await getUserSubscription(userId);
    const usage = await getFeatureUsage(userId);

    if (usage.active_services_count >= subscription.maxActiveServices) {
      return res.status(403).json({
        success: false,
        error: 'LIMIT_EXCEEDED',
        message: `Has alcanzado el límite de ${subscription.maxActiveServices} servicios activos`,
        current_usage: usage.active_services_count,
        limit: subscription.maxActiveServices,
        current_plan: subscription.plan_name,
        upgrade_suggestion: subscription.plan_name === 'basico' ? 'profesional' : 'plus',
        upgrade_benefits: getUpgradeBenefits(subscription.plan_name)
      });
    }

    req.subscription = subscription;
    req.usage = usage;
    next();
  } catch (error) {
    console.error('Can add service check error:', error);
    res.status(500).json(formatError('Error al verificar límites de suscripción'));
  }
};

/**
 * Check if user can add more portfolio images
 */
const canAddPortfolioImage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const subscription = await getUserSubscription(userId);
    const usage = await getFeatureUsage(userId);

    if (usage.portfolio_images_count >= subscription.maxPortfolioImages) {
      return res.status(403).json({
        success: false,
        error: 'LIMIT_EXCEEDED',
        message: `Has alcanzado el límite de ${subscription.maxPortfolioImages} imágenes de portfolio`,
        current_usage: usage.portfolio_images_count,
        limit: subscription.maxPortfolioImages,
        current_plan: subscription.plan_name,
        upgrade_suggestion: subscription.plan_name === 'basico' ? 'profesional' : 'plus',
        upgrade_benefits: getUpgradeBenefits(subscription.plan_name)
      });
    }

    req.subscription = subscription;
    req.usage = usage;
    next();
  } catch (error) {
    console.error('Can add portfolio image check error:', error);
    res.status(500).json(formatError('Error al verificar límites de suscripción'));
  }
};

/**
 * Check if user can access advanced analytics
 */
const requireAdvancedAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const subscription = await getUserSubscription(userId);

    if (!subscription.advancedAnalytics) {
      return res.status(403).json({
        success: false,
        error: 'FEATURE_NOT_AVAILABLE',
        message: 'Analytics avanzados no disponibles en tu plan actual',
        current_plan: subscription.plan_name,
        required_plan: 'profesional',
        upgrade_benefits: getUpgradeBenefits(subscription.plan_name)
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Advanced analytics check error:', error);
    res.status(500).json(formatError('Error al verificar acceso a analytics'));
  }
};

/**
 * Check if user can access promotional tools
 */
const requirePromotionalTools = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const subscription = await getUserSubscription(userId);

    if (!subscription.promotionalTools) {
      return res.status(403).json({
        success: false,
        error: 'FEATURE_NOT_AVAILABLE',
        message: 'Herramientas promocionales no disponibles en tu plan actual',
        current_plan: subscription.plan_name,
        required_plan: 'profesional',
        upgrade_benefits: getUpgradeBenefits(subscription.plan_name)
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Promotional tools check error:', error);
    res.status(500).json(formatError('Error al verificar acceso a herramientas promocionales'));
  }
};

/**
 * Require VIP support access
 */
const requireVipSupport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const subscription = await getUserSubscription(userId);

    if (!subscription.vipSupport) {
      return res.status(403).json({
        success: false,
        error: 'FEATURE_NOT_AVAILABLE',
        message: 'Soporte VIP no disponible en tu plan actual',
        current_plan: subscription.plan_name,
        required_plan: 'plus',
        upgrade_benefits: getUpgradeBenefits(subscription.plan_name)
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('VIP support check error:', error);
    res.status(500).json(formatError('Error al verificar acceso a soporte VIP'));
  }
};

// ============================================================================
// SEARCH BOOST MIDDLEWARE
// ============================================================================

/**
 * Apply search boost based on subscription plan
 */
const applySearchBoost = async (req, res, next) => {
  try {
    if (req.user) {
      const subscription = await getUserSubscription(req.user.id);
      req.searchBoost = subscription.searchBoost || 0;
      req.topSearchPlacement = subscription.topSearchPlacement || false;
    } else {
      req.searchBoost = 0;
      req.topSearchPlacement = false;
    }
    
    next();
  } catch (error) {
    console.error('Search boost error:', error);
    req.searchBoost = 0;
    req.topSearchPlacement = false;
    next();
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get upgrade benefits based on current plan
 */
function getUpgradeBenefits(currentPlan) {
  const benefits = {
    basico: {
      target_plan: 'profesional',
      price: '4.000 ARS/mes',
      benefits: [
        'Servicios ilimitados',
        'Imágenes de portfolio ilimitadas',
        'Mejor posicionamiento en búsquedas',
        'Analytics avanzados',
        'Soporte prioritario (24hs)',
        'Herramientas promocionales'
      ]
    },
    profesional: {
      target_plan: 'plus',
      price: '7.000 ARS/mes',
      benefits: [
        'TOP posición en búsquedas',
        'Soporte VIP (WhatsApp directo, 2hs)',
        'Marketing automático con IA',
        'Insights de competencia',
        'Email marketing automático',
        'Ubicaciones de trabajo ilimitadas'
      ]
    }
  };

  return benefits[currentPlan] || benefits.basico;
}

/**
 * Track feature usage for analytics
 */
async function trackFeatureUsage(userId, action, metadata = {}) {
  try {
    // This could be sent to analytics service
    console.log(`Feature usage: User ${userId} performed ${action}`, metadata);
    
    // Update monthly counters if needed
    if (action === 'service_added') {
      await updateFeatureUsage(userId, 'active_services_count', 1);
    } else if (action === 'portfolio_image_added') {
      await updateFeatureUsage(userId, 'portfolio_images_count', 1);
    } else if (action === 'lead_received') {
      await updateFeatureUsage(userId, 'monthly_leads_received', 1);
    } else if (action === 'profile_viewed') {
      await updateFeatureUsage(userId, 'monthly_profile_views', 1);
    }
  } catch (error) {
    console.error('Track feature usage error:', error);
  }
}

/**
 * Get subscription summary for user dashboard
 */
async function getSubscriptionSummary(userId) {
  try {
    const subscription = await getUserSubscription(userId);
    const usage = await getFeatureUsage(userId);

    return {
      plan: {
        name: subscription.plan_name,
        display_name: subscription.display_name,
        price: subscription.price_monthly,
        status: subscription.status
      },
      usage: {
        services: {
          current: usage.active_services_count,
          limit: subscription.maxActiveServices,
          percentage: Math.round((usage.active_services_count / subscription.maxActiveServices) * 100)
        },
        portfolio: {
          current: usage.portfolio_images_count,
          limit: subscription.maxPortfolioImages,
          percentage: Math.round((usage.portfolio_images_count / subscription.maxPortfolioImages) * 100)
        }
      },
      features: {
        enhancedVisibility: subscription.enhancedVisibility,
        advancedAnalytics: subscription.advancedAnalytics,
        promotionalTools: subscription.promotionalTools,
        vipSupport: subscription.vipSupport,
        topSearchPlacement: subscription.topSearchPlacement
      },
      upgrade_suggestion: subscription.plan_name !== 'plus' ? getUpgradeBenefits(subscription.plan_name) : null
    };
  } catch (error) {
    console.error('Get subscription summary error:', error);
    throw error;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Core functions
  getUserSubscription,
  getFeatureUsage,
  updateFeatureUsage,
  
  // Feature gating middleware
  canAddService,
  canAddPortfolioImage,
  requireAdvancedAnalytics,
  requirePromotionalTools,
  requireVipSupport,
  
  // Search enhancement
  applySearchBoost,
  
  // Utility functions
  getUpgradeBenefits,
  trackFeatureUsage,
  getSubscriptionSummary,
  
  // Constants
  PLAN_LIMITS
};