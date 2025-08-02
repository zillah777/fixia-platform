-- ============================================================================
-- FIXIA MARKETPLACE & PORTFOLIO SYSTEM MIGRATION
-- ============================================================================
-- Comprehensive database schema for Airbnb-style marketplace and portfolio system
-- Author: Senior Database Architect
-- Date: August 1, 2025
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. PORTFOLIO IMAGES TABLE
-- ============================================================================
-- Stores professional portfolio images with metadata and categorization
CREATE TABLE IF NOT EXISTS portfolio_images (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    image_filename VARCHAR(255) NOT NULL,
    image_size_bytes INT NOT NULL DEFAULT 0,
    image_width INT,
    image_height INT,
    image_format VARCHAR(10), -- jpg, png, webp, etc.
    
    -- Categorization
    category_id INT,
    subcategory VARCHAR(100),
    work_type VARCHAR(50), -- 'before_after', 'process', 'final_result', 'tools', 'materials'
    
    -- Featured and visibility controls
    is_featured BOOLEAN DEFAULT FALSE, -- Featured in portfolio
    is_profile_featured BOOLEAN DEFAULT FALSE, -- Main image for marketplace profile
    is_marketplace_visible BOOLEAN DEFAULT TRUE, -- Visible in marketplace search
    is_public BOOLEAN DEFAULT TRUE, -- Public visibility
    
    -- Project metadata
    project_date DATE,
    project_duration_hours DECIMAL(5,2),
    project_value DECIMAL(12,2),
    project_location VARCHAR(200),
    client_name VARCHAR(100), -- Optional, for testimonials
    
    -- Analytics
    views_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    download_count INT DEFAULT 0, -- For high-res downloads
    
    -- SEO and searchability
    alt_text VARCHAR(255),
    tags TEXT, -- Comma-separated tags for better searchability
    
    -- Content moderation
    moderation_status VARCHAR(20) DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
    moderation_notes TEXT,
    moderated_at TIMESTAMP,
    moderated_by_id INT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (moderated_by_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Constraints will be added as indexes
    CONSTRAINT portfolio_images_positive_metrics CHECK (
        views_count >= 0 AND likes_count >= 0 AND shares_count >= 0
    )
);

-- ============================================================================
-- 2. EXPLORER FAVORITES/WISHLIST SYSTEM
-- ============================================================================
-- Stores explorer's favorite professionals and services
CREATE TABLE IF NOT EXISTS explorer_favorites (
    id SERIAL PRIMARY KEY,
    explorer_id INT NOT NULL,
    favorited_user_id INT, -- Favorite professional
    favorited_service_id INT, -- Favorite service
    favorited_portfolio_image_id INT, -- Favorite portfolio image
    favorite_type VARCHAR(20) NOT NULL CHECK (favorite_type IN ('professional', 'service', 'portfolio_image')),
    
    -- Wishlist organization
    wishlist_category VARCHAR(50), -- 'urgent', 'future', 'inspiration', etc.
    notes TEXT, -- Private notes about why they liked it
    priority INT DEFAULT 0, -- 1-5 priority level
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (explorer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (favorited_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (favorited_service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (favorited_portfolio_image_id) REFERENCES portfolio_images(id) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT explorer_favorites_single_target CHECK (
        (favorited_user_id IS NOT NULL AND favorited_service_id IS NULL AND favorited_portfolio_image_id IS NULL) OR
        (favorited_user_id IS NULL AND favorited_service_id IS NOT NULL AND favorited_portfolio_image_id IS NULL) OR
        (favorited_user_id IS NULL AND favorited_service_id IS NULL AND favorited_portfolio_image_id IS NOT NULL)
    )
);

-- ============================================================================
-- 3. PORTFOLIO IMAGE ANALYTICS TRACKING
-- ============================================================================
-- Detailed tracking of portfolio image interactions
CREATE TABLE IF NOT EXISTS portfolio_image_views (
    id SERIAL PRIMARY KEY,
    portfolio_image_id INT NOT NULL,
    viewer_id INT, -- NULL for anonymous views
    viewer_ip INET,
    viewer_user_agent TEXT,
    
    -- Context
    view_source VARCHAR(50), -- 'marketplace', 'profile', 'search', 'direct'
    referrer_url VARCHAR(500),
    session_id VARCHAR(100),
    
    -- Engagement metrics
    view_duration_seconds INT DEFAULT 0,
    is_bounce BOOLEAN DEFAULT FALSE, -- Left quickly without interaction
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (portfolio_image_id) REFERENCES portfolio_images(id) ON DELETE CASCADE,
    FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- 4. PORTFOLIO IMAGE LIKES SYSTEM
-- ============================================================================
-- Track likes/reactions to portfolio images
CREATE TABLE IF NOT EXISTS portfolio_image_likes (
    id SERIAL PRIMARY KEY,
    portfolio_image_id INT NOT NULL,
    user_id INT NOT NULL,
    reaction_type VARCHAR(20) DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'wow', 'helpful')),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (portfolio_image_id) REFERENCES portfolio_images(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Constraints
    UNIQUE (portfolio_image_id, user_id)
);

-- ============================================================================
-- 5. PRIVACY SETTINGS FOR PORTFOLIO
-- ============================================================================
-- Create as_privacy_settings table if it doesn't exist, then add portfolio columns
CREATE TABLE IF NOT EXISTS as_privacy_settings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    show_phone BOOLEAN DEFAULT TRUE,
    show_email BOOLEAN DEFAULT TRUE,
    show_address BOOLEAN DEFAULT FALSE,
    show_last_active BOOLEAN DEFAULT TRUE,
    allow_direct_messages BOOLEAN DEFAULT TRUE,
    show_online_status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add portfolio-specific privacy controls
ALTER TABLE as_privacy_settings 
ADD COLUMN IF NOT EXISTS show_portfolio_in_marketplace BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_portfolio_before_after BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_portfolio_project_values BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS show_portfolio_client_names BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS allow_portfolio_downloads BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS portfolio_visibility VARCHAR(20) DEFAULT 'public',
ADD COLUMN IF NOT EXISTS require_contact_before_portfolio BOOLEAN DEFAULT FALSE;

-- Add check constraint separately to avoid conflicts
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'as_privacy_settings_portfolio_visibility_check'
    ) THEN
        ALTER TABLE as_privacy_settings 
        ADD CONSTRAINT as_privacy_settings_portfolio_visibility_check 
        CHECK (portfolio_visibility IN ('public', 'clients_only', 'private'));
    END IF;
END $$;

-- ============================================================================
-- 6. PORTFOLIO CATEGORIES SYSTEM
-- ============================================================================
-- Specific categories for portfolio organization (extends existing categories)
CREATE TABLE IF NOT EXISTS portfolio_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    parent_category_id INT, -- For subcategories
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (parent_category_id) REFERENCES portfolio_categories(id) ON DELETE SET NULL
);

-- ============================================================================
-- 7. MARKETPLACE SEARCH HISTORY
-- ============================================================================
-- Track search patterns for better recommendations
CREATE TABLE IF NOT EXISTS marketplace_searches (
    id SERIAL PRIMARY KEY,
    user_id INT, -- NULL for anonymous searches
    search_query VARCHAR(255),
    search_filters TEXT, -- Store filter parameters as JSON string
    search_location VARCHAR(100),
    results_count INT DEFAULT 0,
    
    -- Search context
    search_source VARCHAR(50), -- 'header', 'homepage', 'category', 'voice'
    device_type VARCHAR(20), -- 'mobile', 'desktop', 'tablet'
    
    -- Results interaction
    clicked_result_ids TEXT, -- Comma-separated clicked result IDs
    booking_resulted BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- 8. PROFESSIONAL MARKETPLACE METRICS
-- ============================================================================
-- Aggregate metrics for professionals in marketplace
CREATE TABLE IF NOT EXISTS professional_marketplace_metrics (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    
    -- Profile metrics
    profile_views_total INT DEFAULT 0,
    profile_views_week INT DEFAULT 0,
    profile_views_month INT DEFAULT 0,
    
    -- Portfolio metrics
    portfolio_views_total INT DEFAULT 0,
    portfolio_likes_total INT DEFAULT 0,
    portfolio_shares_total INT DEFAULT 0,
    
    -- Interaction metrics
    contact_requests_total INT DEFAULT 0,
    contact_requests_week INT DEFAULT 0,
    favorites_count INT DEFAULT 0,
    
    -- Conversion metrics
    inquiries_to_bookings_ratio DECIMAL(5,4) DEFAULT 0,
    average_response_time_hours DECIMAL(6,2) DEFAULT 0,
    
    -- Ranking factors
    marketplace_ranking_score DECIMAL(8,4) DEFAULT 0,
    trending_score DECIMAL(8,4) DEFAULT 0,
    
    -- Timestamps
    last_calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Constraints
    UNIQUE (user_id)
);

-- ============================================================================
-- 9. FEATURED PROFESSIONALS SYSTEM
-- ============================================================================
-- System for featuring professionals in marketplace
CREATE TABLE IF NOT EXISTS featured_professionals (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    featured_type VARCHAR(30) NOT NULL CHECK (featured_type IN ('homepage', 'category', 'location', 'premium', 'trending')),
    featured_position INT, -- For ordering
    
    -- Geographic targeting
    target_location VARCHAR(100),
    target_category_id INT,
    
    -- Scheduling
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Performance tracking
    impressions_count INT DEFAULT 0,
    clicks_count INT DEFAULT 0,
    conversion_count INT DEFAULT 0,
    
    -- Cost and billing (for premium features)
    cost_per_day DECIMAL(8,2) DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_category_id) REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Constraints
    UNIQUE (user_id, featured_type, target_location, target_category_id)
);

-- ============================================================================
-- INDEXES FOR OPTIMAL PERFORMANCE
-- ============================================================================

-- Portfolio Images Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_images_user_id ON portfolio_images(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_category_id ON portfolio_images(category_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_featured ON portfolio_images(is_featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_profile_featured ON portfolio_images(is_profile_featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_marketplace_visible ON portfolio_images(is_marketplace_visible);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_public ON portfolio_images(is_public);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_moderation ON portfolio_images(moderation_status);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_created_at ON portfolio_images(created_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_views_count ON portfolio_images(views_count);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_likes_count ON portfolio_images(likes_count);

-- Portfolio Images Full-Text Search (simplified for compatibility)
CREATE INDEX IF NOT EXISTS idx_portfolio_images_title ON portfolio_images(title);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_description ON portfolio_images(description);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_alt_text ON portfolio_images(alt_text);

-- Portfolio Images Tags Search
CREATE INDEX IF NOT EXISTS idx_portfolio_images_tags ON portfolio_images(tags);

-- Unique constraint for profile featured image (only one per user) - simplified
CREATE INDEX IF NOT EXISTS idx_portfolio_images_user_profile_featured_unique 
    ON portfolio_images(user_id, is_profile_featured);

-- Composite indexes for marketplace queries (simplified)
CREATE INDEX IF NOT EXISTS idx_portfolio_images_marketplace_browse ON portfolio_images(user_id, is_marketplace_visible, moderation_status, created_at);

CREATE INDEX IF NOT EXISTS idx_portfolio_images_category_featured ON portfolio_images(category_id, is_featured, views_count);

-- Explorer Favorites Indexes
CREATE INDEX IF NOT EXISTS idx_explorer_favorites_explorer_id ON explorer_favorites(explorer_id);
CREATE INDEX IF NOT EXISTS idx_explorer_favorites_favorited_user_id ON explorer_favorites(favorited_user_id);
CREATE INDEX IF NOT EXISTS idx_explorer_favorites_favorited_service_id ON explorer_favorites(favorited_service_id);
CREATE INDEX IF NOT EXISTS idx_explorer_favorites_favorited_portfolio_image_id ON explorer_favorites(favorited_portfolio_image_id);
CREATE INDEX IF NOT EXISTS idx_explorer_favorites_type ON explorer_favorites(favorite_type);
CREATE INDEX IF NOT EXISTS idx_explorer_favorites_created_at ON explorer_favorites(created_at);
CREATE INDEX IF NOT EXISTS idx_explorer_favorites_priority ON explorer_favorites(priority);

-- Composite index for user's favorites by type
CREATE INDEX IF NOT EXISTS idx_explorer_favorites_user_type ON explorer_favorites(explorer_id, favorite_type, created_at);

-- Unique indexes to prevent duplicate favorites (simplified)
CREATE INDEX IF NOT EXISTS idx_explorer_favorites_user_unique 
    ON explorer_favorites(explorer_id, favorited_user_id);

CREATE INDEX IF NOT EXISTS idx_explorer_favorites_service_unique 
    ON explorer_favorites(explorer_id, favorited_service_id);

CREATE INDEX IF NOT EXISTS idx_explorer_favorites_portfolio_unique 
    ON explorer_favorites(explorer_id, favorited_portfolio_image_id);

-- Portfolio Views Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_image_views_image_id ON portfolio_image_views(portfolio_image_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_image_views_viewer_id ON portfolio_image_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_image_views_created_at ON portfolio_image_views(created_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_image_views_source ON portfolio_image_views(view_source);

-- Composite index for analytics queries
CREATE INDEX IF NOT EXISTS idx_portfolio_image_views_analytics ON portfolio_image_views(portfolio_image_id, created_at, view_duration_seconds);

-- Portfolio Likes Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_image_likes_image_id ON portfolio_image_likes(portfolio_image_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_image_likes_user_id ON portfolio_image_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_image_likes_reaction_type ON portfolio_image_likes(reaction_type);
CREATE INDEX IF NOT EXISTS idx_portfolio_image_likes_created_at ON portfolio_image_likes(created_at);

-- Portfolio Categories Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_categories_parent_id ON portfolio_categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_categories_active ON portfolio_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_portfolio_categories_sort_order ON portfolio_categories(sort_order);

-- Marketplace Searches Indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_searches_user_id ON marketplace_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_searches_query ON marketplace_searches(search_query);
CREATE INDEX IF NOT EXISTS idx_marketplace_searches_location ON marketplace_searches(search_location);
CREATE INDEX IF NOT EXISTS idx_marketplace_searches_created_at ON marketplace_searches(created_at);

-- Professional Metrics Indexes
CREATE INDEX IF NOT EXISTS idx_professional_marketplace_metrics_user_id ON professional_marketplace_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_professional_marketplace_metrics_ranking ON professional_marketplace_metrics(marketplace_ranking_score);
CREATE INDEX IF NOT EXISTS idx_professional_marketplace_metrics_trending ON professional_marketplace_metrics(trending_score);

-- Featured Professionals Indexes
CREATE INDEX IF NOT EXISTS idx_featured_professionals_user_id ON featured_professionals(user_id);
CREATE INDEX IF NOT EXISTS idx_featured_professionals_type ON featured_professionals(featured_type);
CREATE INDEX IF NOT EXISTS idx_featured_professionals_active ON featured_professionals(is_active);
CREATE INDEX IF NOT EXISTS idx_featured_professionals_location ON featured_professionals(target_location);
CREATE INDEX IF NOT EXISTS idx_featured_professionals_category ON featured_professionals(target_category_id);
CREATE INDEX IF NOT EXISTS idx_featured_professionals_position ON featured_professionals(featured_position);
CREATE INDEX IF NOT EXISTS idx_featured_professionals_dates ON featured_professionals(start_date, end_date);

-- Composite index for active featured professionals (simplified)
CREATE INDEX IF NOT EXISTS idx_featured_professionals_active_browse ON featured_professionals(featured_type, target_location, target_category_id, featured_position, is_active, end_date);

-- ============================================================================
-- INSERT DEFAULT PORTFOLIO CATEGORIES
-- ============================================================================

INSERT INTO portfolio_categories (name, description, icon, sort_order) VALUES
('Trabajos Completados', 'Proyectos finalizados y entregados', '✅', 1),
('Antes y Después', 'Comparaciones del estado inicial vs final', '🔄', 2),
('Proceso de Trabajo', 'Imágenes del proceso durante la ejecución', '⚙️', 3),
('Herramientas y Equipos', 'Herramientas profesionales utilizadas', '🔧', 4),
('Materiales Utilizados', 'Materiales y productos empleados', '🧱', 5),
('Certificados y Credenciales', 'Certificaciones y acreditaciones', '🏆', 6),
('Testimonios Visuales', 'Fotos con clientes satisfechos', '💬', 7),
('Proyectos Destacados', 'Trabajos más importantes y complejos', '⭐', 8)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- TRIGGERS FOR AUTOMATED UPDATES
-- ============================================================================

-- Trigger to update portfolio image counts in likes
CREATE OR REPLACE FUNCTION update_portfolio_image_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE portfolio_images 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.portfolio_image_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE portfolio_images 
        SET likes_count = GREATEST(likes_count - 1, 0) 
        WHERE id = OLD.portfolio_image_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER portfolio_image_likes_count_trigger
    AFTER INSERT OR DELETE ON portfolio_image_likes
    FOR EACH ROW EXECUTE FUNCTION update_portfolio_image_likes_count();

-- Trigger to update portfolio image views count
CREATE OR REPLACE FUNCTION update_portfolio_image_views_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE portfolio_images 
    SET views_count = views_count + 1 
    WHERE id = NEW.portfolio_image_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER portfolio_image_views_count_trigger
    AFTER INSERT ON portfolio_image_views
    FOR EACH ROW EXECUTE FUNCTION update_portfolio_image_views_count();

-- Trigger to ensure only one profile featured image per user
CREATE OR REPLACE FUNCTION ensure_single_profile_featured()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_profile_featured = true THEN
        UPDATE portfolio_images 
        SET is_profile_featured = false 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER single_profile_featured_trigger
    BEFORE INSERT OR UPDATE ON portfolio_images
    FOR EACH ROW EXECUTE FUNCTION ensure_single_profile_featured();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER portfolio_images_updated_at_trigger
    BEFORE UPDATE ON portfolio_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER explorer_favorites_updated_at_trigger
    BEFORE UPDATE ON explorer_favorites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER portfolio_categories_updated_at_trigger
    BEFORE UPDATE ON portfolio_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER professional_marketplace_metrics_updated_at_trigger
    BEFORE UPDATE ON professional_marketplace_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER featured_professionals_updated_at_trigger
    BEFORE UPDATE ON featured_professionals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR COMMON MARKETPLACE QUERIES
-- ============================================================================

-- View for marketplace professionals with portfolio data
CREATE OR REPLACE VIEW marketplace_professionals AS
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    u.profile_image,
    u.locality,
    u.created_at as member_since,
    
    -- Portfolio summary
    COALESCE(pi_stats.total_images, 0) as portfolio_count,
    COALESCE(pi_stats.total_views, 0) as portfolio_views,
    COALESCE(pi_stats.total_likes, 0) as portfolio_likes,
    pi_featured.image_url as featured_image_url,
    pi_featured.title as featured_image_title,
    
    -- Professional metrics
    COALESCE(pm.marketplace_ranking_score, 0) as ranking_score,
    COALESCE(pm.profile_views_total, 0) as profile_views,
    COALESCE(pm.contact_requests_total, 0) as contact_requests,
    COALESCE(pm.favorites_count, 0) as favorites_count,
    
    -- Reviews data (simplified for compatibility)
    0 as avg_rating,
    0 as review_count,
    
    -- Featured status
    CASE WHEN fp.id IS NOT NULL THEN true ELSE false END as is_featured,
    fp.featured_type,
    
    -- Privacy settings
    COALESCE(ps.show_portfolio_in_marketplace, true) as show_portfolio_in_marketplace,
    COALESCE(ps.portfolio_visibility, 'public') as portfolio_visibility
    
FROM users u
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_images,
        SUM(views_count) as total_views,
        SUM(likes_count) as total_likes
    FROM portfolio_images 
    WHERE is_marketplace_visible = true AND moderation_status = 'approved'
    GROUP BY user_id
) pi_stats ON u.id = pi_stats.user_id

LEFT JOIN portfolio_images pi_featured ON u.id = pi_featured.user_id AND pi_featured.is_profile_featured = true

LEFT JOIN professional_marketplace_metrics pm ON u.id = pm.user_id

LEFT JOIN featured_professionals fp ON u.id = fp.user_id 
    AND fp.is_active = true 
    AND (fp.end_date IS NULL OR fp.end_date >= CURRENT_DATE)

LEFT JOIN as_privacy_settings ps ON u.id = ps.user_id

WHERE u.user_type = 'provider' 
    AND u.is_active = true;

-- View for explorer's favorite professionals with portfolio
CREATE OR REPLACE VIEW explorer_favorite_professionals AS
SELECT 
    ef.id as favorite_id,
    ef.explorer_id,
    ef.wishlist_category,
    ef.notes,
    ef.priority,
    ef.created_at as favorited_at,
    
    -- Professional data
    mp.*
    
FROM explorer_favorites ef
JOIN marketplace_professionals mp ON ef.favorited_user_id = mp.id
WHERE ef.favorite_type = 'professional'
ORDER BY ef.created_at DESC;

COMMIT;

-- ============================================================================
-- ANALYSIS AND SAMPLE QUERIES
-- ============================================================================

-- Sample query: Get marketplace professionals with portfolios for a specific category
/*
SELECT * FROM marketplace_professionals mp
JOIN as_work_categories awc ON mp.id = awc.user_id
WHERE awc.category_id = 1 -- Plomería
    AND mp.portfolio_count > 0
ORDER BY mp.ranking_score DESC, mp.portfolio_views DESC
LIMIT 20;
*/

-- Sample query: Get explorer's favorites with portfolio images
/*
SELECT 
    ef.*,
    pi.image_url,
    pi.title as image_title,
    pi.views_count,
    pi.likes_count
FROM explorer_favorites ef
JOIN portfolio_images pi ON ef.favorited_portfolio_image_id = pi.id
WHERE ef.explorer_id = $1 
    AND ef.favorite_type = 'portfolio_image'
ORDER BY ef.created_at DESC;
*/

-- Sample query: Get trending portfolio images
/*
SELECT 
    pi.*,
    u.first_name || ' ' || u.last_name as professional_name,
    u.locality,
    c.name as category_name
FROM portfolio_images pi
JOIN users u ON pi.user_id = u.id
LEFT JOIN categories c ON pi.category_id = c.id
WHERE pi.is_marketplace_visible = true
    AND pi.moderation_status = 'approved'
    AND pi.created_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY 
    (pi.views_count * 0.3 + pi.likes_count * 0.7) DESC,
    pi.created_at DESC
LIMIT 50;
*/