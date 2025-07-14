const { pool } = require('../src/config/database');

const createExtendedTables = async () => {
  try {
    console.log('🔄 Creating extended database tables for AS professionals...');

    // Drop and recreate users table with extended fields
    await pool.execute('DROP TABLE IF EXISTS user_reports');
    await pool.execute('DROP TABLE IF EXISTS subscription_payments');
    await pool.execute('DROP TABLE IF EXISTS subscriptions');
    await pool.execute('DROP TABLE IF EXISTS user_references');
    await pool.execute('DROP TABLE IF EXISTS user_verifications');
    await pool.execute('DROP TABLE IF EXISTS user_availabilities');
    await pool.execute('DROP TABLE IF EXISTS user_work_locations');
    await pool.execute('DROP TABLE IF EXISTS user_portfolios');
    await pool.execute('DROP TABLE IF EXISTS user_notification_preferences');
    await pool.execute('DROP TABLE IF EXISTS user_professional_info');
    
    // Alter users table to add new fields
    await pool.execute(`
      ALTER TABLE users 
      ADD COLUMN birth_date DATE,
      ADD COLUMN city VARCHAR(100),
      ADD COLUMN dni VARCHAR(20),
      ADD COLUMN dni_procedure_number VARCHAR(50),
      ADD COLUMN about_me TEXT,
      ADD COLUMN has_mobility BOOLEAN DEFAULT FALSE,
      ADD COLUMN verification_status ENUM('pending', 'in_review', 'verified', 'rejected') DEFAULT 'pending',
      ADD COLUMN verification_score INT DEFAULT 0,
      ADD COLUMN subscription_type ENUM('free', 'basic', 'premium') DEFAULT 'free',
      ADD COLUMN subscription_expires_at TIMESTAMP NULL,
      ADD COLUMN total_rating_points INT DEFAULT 0,
      ADD COLUMN total_ratings_count INT DEFAULT 0,
      ADD COLUMN profile_completion_percentage INT DEFAULT 0,
      ADD COLUMN created_services_count INT DEFAULT 0,
      ADD COLUMN completed_bookings_count INT DEFAULT 0
    `);

    // User professional info table
    await pool.execute(`
      CREATE TABLE user_professional_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        profession VARCHAR(100),
        license_number VARCHAR(100),
        specialization TEXT,
        years_experience INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // User notification preferences
    await pool.execute(`
      CREATE TABLE user_notification_preferences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        push_notifications BOOLEAN DEFAULT TRUE,
        email_notifications BOOLEAN DEFAULT TRUE,
        sms_notifications BOOLEAN DEFAULT FALSE,
        booking_requests BOOLEAN DEFAULT TRUE,
        new_reviews BOOLEAN DEFAULT TRUE,
        payment_updates BOOLEAN DEFAULT TRUE,
        marketing_emails BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_prefs (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // User portfolios
    await pool.execute(`
      CREATE TABLE user_portfolios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        work_date DATE,
        category VARCHAR(50),
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // User work locations
    await pool.execute(`
      CREATE TABLE user_work_locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        city VARCHAR(100) NOT NULL,
        province VARCHAR(100) NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        travel_radius_km INT DEFAULT 10,
        additional_cost_per_km DECIMAL(8, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_location (latitude, longitude)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // User availabilities
    await pool.execute(`
      CREATE TABLE user_availabilities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        day_of_week TINYINT NOT NULL COMMENT '0=Sunday, 1=Monday, ..., 6=Saturday',
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_available BOOLEAN DEFAULT TRUE,
        break_start_time TIME NULL,
        break_end_time TIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_day (day_of_week)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // User verifications
    await pool.execute(`
      CREATE TABLE user_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user (user_id),
        INDEX idx_status (verified_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // User references
    await pool.execute(`
      CREATE TABLE user_references (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        reference_name VARCHAR(200) NOT NULL,
        reference_phone VARCHAR(20) NOT NULL,
        reference_email VARCHAR(255),
        relationship VARCHAR(100),
        notes TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        verified_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Subscriptions
    await pool.execute(`
      CREATE TABLE subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type ENUM('free', 'basic', 'premium') NOT NULL,
        price_monthly DECIMAL(10, 2) NOT NULL,
        max_services INT,
        featured_listings BOOLEAN DEFAULT FALSE,
        priority_support BOOLEAN DEFAULT FALSE,
        advanced_analytics BOOLEAN DEFAULT FALSE,
        custom_portfolio BOOLEAN DEFAULT FALSE,
        unlimited_photos BOOLEAN DEFAULT FALSE,
        verified_badge BOOLEAN DEFAULT FALSE,
        description TEXT,
        features JSON,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_type (type),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Subscription payments
    await pool.execute(`
      CREATE TABLE subscription_payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        subscription_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        external_payment_id VARCHAR(255),
        status ENUM('pending', 'paid', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
        billing_period_start DATE NOT NULL,
        billing_period_end DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
        INDEX idx_user (user_id),
        INDEX idx_subscription (subscription_id),
        INDEX idx_status (status),
        INDEX idx_billing_period (billing_period_start, billing_period_end)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // User reports
    await pool.execute(`
      CREATE TABLE user_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reporter_id INT NOT NULL,
        reported_user_id INT NOT NULL,
        booking_id INT NULL,
        report_type ENUM('no_show', 'poor_service', 'inappropriate_behavior', 'fake_profile', 'pricing_issue', 'other') NOT NULL,
        description TEXT NOT NULL,
        evidence_urls JSON,
        status ENUM('pending', 'investigating', 'resolved', 'dismissed') DEFAULT 'pending',
        admin_notes TEXT,
        resolved_by INT NULL,
        resolved_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
        FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_reporter (reporter_id),
        INDEX idx_reported (reported_user_id),
        INDEX idx_status (status),
        INDEX idx_booking (booking_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Insert default subscription plans
    await pool.execute(`
      INSERT INTO subscriptions (name, type, price_monthly, max_services, featured_listings, priority_support, advanced_analytics, custom_portfolio, unlimited_photos, verified_badge, description, features) VALUES
      ('Plan Gratuito', 'free', 0, 2, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'Plan básico gratuito con funcionalidades limitadas', '{"max_services": 2, "basic_support": true, "standard_photos": 3}'),
      ('Plan Básico', 'basic', 5000, 10, FALSE, TRUE, FALSE, TRUE, FALSE, TRUE, 'Plan básico para profesionales independientes', '{"max_services": 10, "priority_support": true, "portfolio": true, "photos": 10, "verified_badge": true}'),
      ('Plan Premium', 'premium', 10000, -1, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 'Plan completo para empresas y profesionales establecidos', '{"unlimited_services": true, "featured_listings": true, "priority_support": true, "advanced_analytics": true, "custom_portfolio": true, "unlimited_photos": true, "verified_badge": true}')
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