const { query } = require('../src/config/database');

const createExtendedTables = async () => {
  try {
    console.log('🔄 Creating extended database tables for AS professionals...');

    // Drop and recreate users table with extended fields
    await query('DROP TABLE IF EXISTS user_reports');
    await query('DROP TABLE IF EXISTS subscription_payments');
    await query('DROP TABLE IF EXISTS subscriptions');
    await query('DROP TABLE IF EXISTS user_references');
    await query('DROP TABLE IF EXISTS user_verifications');
    await query('DROP TABLE IF EXISTS user_availabilities');
    await query('DROP TABLE IF EXISTS user_work_locations');
    await query('DROP TABLE IF EXISTS user_portfolios');
    await query('DROP TABLE IF EXISTS user_notification_preferences');
    await query('DROP TABLE IF EXISTS user_professional_info');
    
    // Alter users table to add new fields (PostgreSQL)
    try {
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100)`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS locality VARCHAR(100)`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS dni VARCHAR(20)`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS dni_procedure_number VARCHAR(50)`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS about_me TEXT`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS has_mobility BOOLEAN DEFAULT FALSE`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending'`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_score INT DEFAULT 0`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) DEFAULT 'free'`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP NULL`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS total_rating_points INT DEFAULT 0`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS total_ratings_count INT DEFAULT 0`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completion_percentage INT DEFAULT 0`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_services_count INT DEFAULT 0`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS completed_bookings_count INT DEFAULT 0`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP NULL`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20)`);
      
      // Add CHECK constraints for enum-like fields
      await query(`ALTER TABLE users ADD CONSTRAINT check_verification_status CHECK (verification_status IN ('pending', 'in_review', 'verified', 'rejected'))`);
      await query(`ALTER TABLE users ADD CONSTRAINT check_subscription_type CHECK (subscription_type IN ('free', 'basic', 'premium'))`);
    } catch (err) {
      console.log('Some columns may already exist:', err.message);
    }

    // User professional info table
    await query(`
      CREATE TABLE IF NOT EXISTS user_professional_info (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        profession VARCHAR(100),
        license_number VARCHAR(100),
        specialization TEXT,
        years_experience INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_user_professional_info_user ON user_professional_info(user_id)`);

    // User notification preferences
    await query(`
      CREATE TABLE IF NOT EXISTS user_notification_preferences (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        push_notifications BOOLEAN DEFAULT TRUE,
        email_notifications BOOLEAN DEFAULT TRUE,
        sms_notifications BOOLEAN DEFAULT FALSE,
        booking_requests BOOLEAN DEFAULT TRUE,
        new_reviews BOOLEAN DEFAULT TRUE,
        payment_updates BOOLEAN DEFAULT TRUE,
        marketing_emails BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (user_id)
      )
    `);

    // User portfolios
    await query(`
      CREATE TABLE IF NOT EXISTS user_portfolios (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        work_date DATE,
        category VARCHAR(50),
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_user_portfolios_user ON user_portfolios(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_portfolios_category ON user_portfolios(category)`);

    // User work locations
    await query(`
      CREATE TABLE IF NOT EXISTS user_work_locations (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        city VARCHAR(100) NOT NULL,
        province VARCHAR(100) NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        travel_radius_km INT DEFAULT 10,
        additional_cost_per_km DECIMAL(8, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_user_work_locations_user ON user_work_locations(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_work_locations_location ON user_work_locations(latitude, longitude)`);

    // User availabilities
    await query(`
      CREATE TABLE IF NOT EXISTS user_availabilities (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        day_of_week SMALLINT NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_available BOOLEAN DEFAULT TRUE,
        break_start_time TIME NULL,
        break_end_time TIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_user_availabilities_user ON user_availabilities(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_availabilities_day ON user_availabilities(day_of_week)`);

    // User verifications
    await query(`
      CREATE TABLE IF NOT EXISTS user_verifications (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        dni_front_image VARCHAR(500),
        dni_back_image VARCHAR(500),
        selfie_with_dni_image VARCHAR(500),
        verification_notes TEXT,
        verified_by INT NULL,
        verified_at TIMESTAMP NULL,
        rejection_reason TEXT,
        verification_attempts INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_user_verifications_user ON user_verifications(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_verifications_status ON user_verifications(verified_at)`);

    // User references
    await query(`
      CREATE TABLE IF NOT EXISTS user_references (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        reference_name VARCHAR(200) NOT NULL,
        reference_phone VARCHAR(20) NOT NULL,
        reference_email VARCHAR(255),
        relationship VARCHAR(100),
        notes TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        verified_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_user_references_user ON user_references(user_id)`);

    // Subscriptions
    await query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('free', 'basic', 'premium')),
        price_monthly DECIMAL(10, 2) NOT NULL,
        max_services INT,
        featured_listings BOOLEAN DEFAULT FALSE,
        priority_support BOOLEAN DEFAULT FALSE,
        advanced_analytics BOOLEAN DEFAULT FALSE,
        custom_portfolio BOOLEAN DEFAULT FALSE,
        unlimited_photos BOOLEAN DEFAULT FALSE,
        verified_badge BOOLEAN DEFAULT FALSE,
        description TEXT,
        features JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_subscriptions_type ON subscriptions(type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(is_active)`);

    // Subscription payments
    await query(`
      CREATE TABLE IF NOT EXISTS subscription_payments (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        subscription_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        external_payment_id VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
        billing_period_start DATE NOT NULL,
        billing_period_end DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_subscription_payments_user ON subscription_payments(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription ON subscription_payments(subscription_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_subscription_payments_status ON subscription_payments(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_subscription_payments_billing_period ON subscription_payments(billing_period_start, billing_period_end)`);

    // User reports
    await query(`
      CREATE TABLE IF NOT EXISTS user_reports (
        id SERIAL PRIMARY KEY,
        reporter_id INT NOT NULL,
        reported_user_id INT NOT NULL,
        booking_id INT NULL,
        report_type VARCHAR(30) NOT NULL CHECK (report_type IN ('no_show', 'poor_service', 'inappropriate_behavior', 'fake_profile', 'pricing_issue', 'other')),
        description TEXT NOT NULL,
        evidence_urls JSONB,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
        admin_notes TEXT,
        resolved_by INT NULL,
        resolved_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
        FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_user_reports_reporter ON user_reports(reporter_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_reports_reported ON user_reports(reported_user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_reports_booking ON user_reports(booking_id)`);

    // Insert default subscription plans
    await query(`
      INSERT INTO subscriptions (name, type, price_monthly, max_services, featured_listings, priority_support, advanced_analytics, custom_portfolio, unlimited_photos, verified_badge, description, features) 
      VALUES 
      ('Plan Gratuito', 'free', 0, 2, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Plan básico gratuito con funcionalidades limitadas', '{"max_services": 2, "basic_support": true, "standard_photos": 3}'),
      ('Plan Básico', 'basic', 5000, 10, FALSE, TRUE, FALSE, TRUE, FALSE, TRUE, 'Plan básico para profesionales independientes', '{"max_services": 10, "priority_support": true, "portfolio": true, "photos": 10, "verified_badge": true}'),
      ('Plan Premium', 'premium', 10000, -1, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 'Plan completo para empresas y profesionales establecidos', '{"unlimited_services": true, "featured_listings": true, "priority_support": true, "advanced_analytics": true, "custom_portfolio": true, "unlimited_photos": true, "verified_badge": true}')
      ON CONFLICT (name) DO NOTHING
    `);

    console.log('✅ Extended tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating extended tables:', error);
    throw error;
  }
};

const runExtendedMigration = async () => {
  try {
    await createExtendedTables();
    console.log('🎉 Extended database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Extended migration failed:', error);
    process.exit(1);
  }
};

runExtendedMigration();