-- ============================================================================
-- FIXIA SUBSCRIPTION SYSTEM - COMPLETE IMPLEMENTATION
-- ============================================================================
-- Author: Senior Product Owner & Scrum Master
-- Date: August 3, 2025
-- 
-- Business Model: Monthly subscriptions for AS Profesionales
-- Philosophy: "Si la aplicación la entiende un analfabeto tecnológico, y un informático, será un éxito"
-- 
-- SUBSCRIPTION PLANS:
-- 1. Plan Básico (Gratis): Limited features to motivate upgrades
-- 2. Plan Profesional: $4,000 ARS/month - Enhanced marketplace presence  
-- 3. Plan Plus: $7,000 ARS/month - Premium features and priority
-- 
-- PROMOTIONAL OFFER: First 200 accounts get 2 months free Professional plan
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. SUBSCRIPTION PLANS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_currency VARCHAR(3) DEFAULT 'ARS',
    
    -- Feature Limits (JSON for flexibility)
    feature_limits JSONB DEFAULT '{}',
    
    -- Plan Benefits
    max_active_services INTEGER DEFAULT 3,
    max_portfolio_images INTEGER DEFAULT 5,
    enhanced_profile_visibility BOOLEAN DEFAULT false,
    priority_customer_support BOOLEAN DEFAULT false,
    advanced_analytics BOOLEAN DEFAULT false,
    promotional_tools BOOLEAN DEFAULT false,
    top_search_placement BOOLEAN DEFAULT false,
    vip_support BOOLEAN DEFAULT false,
    marketing_automation BOOLEAN DEFAULT false,
    
    -- Plan Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Plans
INSERT INTO subscription_plans (
    name, display_name, description, price_monthly,
    max_active_services, max_portfolio_images, enhanced_profile_visibility,
    priority_customer_support, advanced_analytics, promotional_tools,
    top_search_placement, vip_support, marketing_automation, sort_order
) VALUES 
('basico', 'Plan Básico', 'Plan gratuito con funciones básicas para comenzar', 0,
 3, 5, false, false, false, false, false, false, false, 1),
 
('profesional', 'Plan Profesional', 'Ideal para profesionales que buscan más visibilidad y herramientas avanzadas', 4000,
 999, 999, true, true, true, true, false, false, false, 2),
 
('plus', 'Plan Plus', 'Máximo nivel para profesionales que buscan dominar el mercado', 7000,
 999, 999, true, true, true, true, true, true, true, 3)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    max_active_services = EXCLUDED.max_active_services,
    max_portfolio_images = EXCLUDED.max_portfolio_images,
    enhanced_profile_visibility = EXCLUDED.enhanced_profile_visibility,
    priority_customer_support = EXCLUDED.priority_customer_support,
    advanced_analytics = EXCLUDED.advanced_analytics,
    promotional_tools = EXCLUDED.promotional_tools,
    top_search_placement = EXCLUDED.top_search_placement,
    vip_support = EXCLUDED.vip_support,
    marketing_automation = EXCLUDED.marketing_automation,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- 2. USER SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
    
    -- Subscription Status
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, cancelled, expired, suspended
    
    -- Billing Information
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly
    current_period_start TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    current_period_end TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 month'),
    
    -- Payment Information
    mercadopago_subscription_id VARCHAR(100),
    last_payment_date TIMESTAMP,
    next_billing_date TIMESTAMP,
    payment_method VARCHAR(50) DEFAULT 'mercadopago',
    
    -- Promotional Tracking
    is_promotional BOOLEAN DEFAULT false,
    promotional_code VARCHAR(50),
    promotional_end_date TIMESTAMP,
    promotional_months_remaining INTEGER DEFAULT 0,
    
    -- Trial Period
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    is_trial BOOLEAN DEFAULT false,
    
    -- Cancellation
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    cancel_at_period_end BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id) -- One active subscription per user
);

-- ============================================================================
-- 3. SUBSCRIPTION BILLING HISTORY
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscription_billing_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id INTEGER NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
    
    -- Billing Details
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ARS',
    billing_period_start TIMESTAMP NOT NULL,
    billing_period_end TIMESTAMP NOT NULL,
    
    -- Payment Status
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, paid, failed, refunded
    payment_date TIMESTAMP,
    
    -- MercadoPago Integration
    mercadopago_payment_id VARCHAR(100),
    mercadopago_preference_id VARCHAR(100),
    payment_method VARCHAR(50),
    
    -- Invoice Information
    invoice_number VARCHAR(50),
    invoice_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. PROMOTIONAL CAMPAIGNS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS promotional_campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Campaign Configuration
    campaign_type VARCHAR(50) NOT NULL, -- first_200_accounts, referral, seasonal
    target_plan_id INTEGER REFERENCES subscription_plans(id),
    
    -- Benefits
    free_months INTEGER DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Campaign Limits
    max_uses INTEGER, -- NULL for unlimited
    uses_count INTEGER DEFAULT 0,
    per_user_limit INTEGER DEFAULT 1,
    
    -- Campaign Period
    start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    
    -- Campaign Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert First 200 Accounts Promotion
INSERT INTO promotional_campaigns (
    name, description, campaign_type, target_plan_id, free_months, max_uses
) VALUES (
    'Primeros 200 Profesionales',
    'Los primeros 200 AS Profesionales obtienen 2 meses gratis del Plan Profesional',
    'first_200_accounts',
    (SELECT id FROM subscription_plans WHERE name = 'profesional'),
    2,
    200
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. PROMOTIONAL USAGE TRACKING
-- ============================================================================
CREATE TABLE IF NOT EXISTS promotional_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id INTEGER NOT NULL REFERENCES promotional_campaigns(id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES user_subscriptions(id) ON DELETE SET NULL,
    
    -- Usage Details
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    benefit_start_date TIMESTAMP,
    benefit_end_date TIMESTAMP,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, expired, cancelled
    
    UNIQUE(user_id, campaign_id)
);

-- ============================================================================
-- 6. FEATURE USAGE TRACKING
-- ============================================================================
CREATE TABLE IF NOT EXISTS feature_usage_tracking (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Current Usage Counters
    active_services_count INTEGER DEFAULT 0,
    portfolio_images_count INTEGER DEFAULT 0,
    monthly_leads_received INTEGER DEFAULT 0,
    monthly_profile_views INTEGER DEFAULT 0,
    
    -- Monthly Reset Tracking
    last_reset_date DATE DEFAULT CURRENT_DATE,
    
    -- Real-time Tracking
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- ============================================================================
-- 7. SUBSCRIPTION ANALYTICS
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscription_analytics (
    id SERIAL PRIMARY KEY,
    
    -- Date Tracking
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Subscription Metrics
    new_subscriptions INTEGER DEFAULT 0,
    cancelled_subscriptions INTEGER DEFAULT 0,
    upgraded_subscriptions INTEGER DEFAULT 0,
    downgraded_subscriptions INTEGER DEFAULT 0,
    
    -- Revenue Metrics
    daily_revenue DECIMAL(12,2) DEFAULT 0,
    monthly_recurring_revenue DECIMAL(12,2) DEFAULT 0,
    
    -- User Metrics by Plan
    basico_users INTEGER DEFAULT 0,
    profesional_users INTEGER DEFAULT 0,
    plus_users INTEGER DEFAULT 0,
    
    -- Promotional Metrics
    promotional_users INTEGER DEFAULT 0,
    trial_users INTEGER DEFAULT 0,
    
    -- Churn Analysis
    churn_rate DECIMAL(5,2) DEFAULT 0,
    customer_lifetime_value DECIMAL(10,2) DEFAULT 0,
    
    UNIQUE(date)
);

-- ============================================================================
-- 8. UPDATE EXISTING USERS TABLE
-- ============================================================================

-- Update subscription_type constraint to match new plans
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_subscription_type;
ALTER TABLE users ADD CONSTRAINT chk_subscription_type 
    CHECK (subscription_type IN ('free', 'basico', 'profesional', 'plus'));

-- Add subscription-related columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_subscription_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_auto_renew BOOLEAN DEFAULT true;

-- ============================================================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Subscription Plans
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_sort ON subscription_plans(sort_order);

-- User Subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_billing_date ON user_subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end ON user_subscriptions(current_period_end);

-- Billing History
CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON subscription_billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_payment_status ON subscription_billing_history(payment_status);
CREATE INDEX IF NOT EXISTS idx_billing_history_date ON subscription_billing_history(payment_date);

-- Promotional Campaigns
CREATE INDEX IF NOT EXISTS idx_promotional_campaigns_active ON promotional_campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_promotional_campaigns_type ON promotional_campaigns(campaign_type);

-- Feature Usage
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_id ON feature_usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_reset_date ON feature_usage_tracking(last_reset_date);

-- Analytics
CREATE INDEX IF NOT EXISTS idx_subscription_analytics_date ON subscription_analytics(date DESC);

-- ============================================================================
-- 10. INITIALIZE DATA FOR EXISTING USERS
-- ============================================================================

-- Create feature usage tracking for all AS professionals
INSERT INTO feature_usage_tracking (user_id, active_services_count, portfolio_images_count)
SELECT 
    u.id,
    COALESCE(services.count, 0) as active_services_count,
    COALESCE(portfolio.count, 0) as portfolio_images_count
FROM users u
LEFT JOIN (
    SELECT user_id, COUNT(*) as count 
    FROM as_work_categories 
    WHERE is_active = true 
    GROUP BY user_id
) services ON u.id = services.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) as count 
    FROM as_portfolio 
    WHERE is_visible = true 
    GROUP BY user_id
) portfolio ON u.id = portfolio.user_id
WHERE u.user_type = 'provider'
AND NOT EXISTS (SELECT 1 FROM feature_usage_tracking WHERE user_id = u.id);

-- Create default subscriptions for existing AS professionals
INSERT INTO user_subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
SELECT 
    u.id,
    sp.id as plan_id,
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '1 month'
FROM users u
CROSS JOIN subscription_plans sp
WHERE u.user_type = 'provider'
AND sp.name = CASE 
    WHEN u.subscription_type IN ('premium', 'plus') THEN 'plus'
    WHEN u.subscription_type = 'basic' THEN 'profesional'
    ELSE 'basico'
END
AND NOT EXISTS (SELECT 1 FROM user_subscriptions WHERE user_id = u.id);

-- Update users table to match new subscription system
UPDATE users SET 
    subscription_type = CASE 
        WHEN subscription_type = 'premium' THEN 'plus'
        WHEN subscription_type = 'basic' THEN 'profesional'
        WHEN subscription_type = 'free' THEN 'basico'
        ELSE 'basico'
    END,
    is_subscription_active = true,
    subscription_auto_renew = true
WHERE user_type = 'provider';

-- Initialize today's analytics
INSERT INTO subscription_analytics (
    date, 
    basico_users, 
    profesional_users, 
    plus_users
) 
SELECT 
    CURRENT_DATE,
    COUNT(*) FILTER (WHERE sp.name = 'basico'),
    COUNT(*) FILTER (WHERE sp.name = 'profesional'),
    COUNT(*) FILTER (WHERE sp.name = 'plus')
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status = 'active'
ON CONFLICT (date) DO UPDATE SET
    basico_users = EXCLUDED.basico_users,
    profesional_users = EXCLUDED.profesional_users,
    plus_users = EXCLUDED.plus_users;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check subscription plans
SELECT name, display_name, price_monthly, max_active_services, max_portfolio_images 
FROM subscription_plans ORDER BY sort_order;

-- Check user subscriptions count
SELECT 
    sp.display_name,
    COUNT(*) as user_count
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status = 'active'
GROUP BY sp.id, sp.display_name
ORDER BY sp.sort_order;

-- Check promotional campaign
SELECT name, max_uses, uses_count, free_months, is_active 
FROM promotional_campaigns 
WHERE campaign_type = 'first_200_accounts';

-- Check feature usage
SELECT COUNT(*) as users_with_tracking 
FROM feature_usage_tracking;