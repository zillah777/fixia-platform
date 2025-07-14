const { pool } = require('../src/config/database');

const createPromotionalTables = async () => {
  try {
    console.log('🔄 Creating promotional subscription system tables...');

    // Promotional campaigns table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS promotional_campaigns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        user_type ENUM('provider', 'client', 'both') NOT NULL,
        max_participants INT NOT NULL,
        current_participants INT DEFAULT 0,
        duration_months INT NOT NULL,
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_type (user_type),
        INDEX idx_active (is_active),
        INDEX idx_participants (current_participants, max_participants)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // User promotional subscriptions table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_promotional_subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        campaign_id INT NOT NULL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (campaign_id) REFERENCES promotional_campaigns(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_campaign_id (campaign_id),
        INDEX idx_expires_at (expires_at),
        INDEX idx_active (is_active),
        UNIQUE KEY unique_user_campaign (user_id, campaign_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Update subscriptions table to monthly only
    await pool.execute(`
      ALTER TABLE subscriptions 
      DROP COLUMN IF EXISTS price_yearly,
      MODIFY COLUMN price_monthly DECIMAL(10,2) NOT NULL,
      ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'ARS',
      ADD COLUMN IF NOT EXISTS billing_cycle ENUM('monthly') DEFAULT 'monthly',
      ADD COLUMN IF NOT EXISTS trial_days INT DEFAULT 0
    `);

    // User availability status table (for real-time matching)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_availability_status (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        is_available BOOLEAN DEFAULT FALSE,
        availability_type ENUM('online', 'busy', 'offline') DEFAULT 'offline',
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        location_lat DECIMAL(10, 8),
        location_lng DECIMAL(11, 8),
        location_updated_at TIMESTAMP,
        push_notifications_enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_available (is_available),
        INDEX idx_availability_type (availability_type),
        INDEX idx_location (location_lat, location_lng),
        UNIQUE KEY unique_user_availability (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Smart search requests table (for "busco niñera para hoy a las 10pm")
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS smart_search_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        category_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        location_address VARCHAR(500),
        location_lat DECIMAL(10, 8),
        location_lng DECIMAL(11, 8),
        required_date DATE NOT NULL,
        required_time TIME NOT NULL,
        urgency ENUM('normal', 'urgent', 'emergency') DEFAULT 'normal',
        max_budget DECIMAL(10,2),
        currency VARCHAR(3) DEFAULT 'ARS',
        status ENUM('active', 'matched', 'cancelled', 'expired') DEFAULT 'active',
        matched_provider_id INT,
        expires_at TIMESTAMP NOT NULL,
        notifications_sent INT DEFAULT 0,
        responses_received INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY (matched_provider_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_client_id (client_id),
        INDEX idx_category_id (category_id),
        INDEX idx_required_datetime (required_date, required_time),
        INDEX idx_location (location_lat, location_lng),
        INDEX idx_status (status),
        INDEX idx_urgency (urgency),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Smart search notifications table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS smart_search_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        search_request_id INT NOT NULL,
        provider_id INT NOT NULL,
        notification_type ENUM('push', 'sms', 'email') NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL,
        responded_at TIMESTAMP NULL,
        response_type ENUM('interested', 'not_available', 'ignored') NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (search_request_id) REFERENCES smart_search_requests(id) ON DELETE CASCADE,
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_search_request (search_request_id),
        INDEX idx_provider (provider_id),
        INDEX idx_sent_at (sent_at),
        INDEX idx_read_at (read_at),
        UNIQUE KEY unique_search_provider_type (search_request_id, provider_id, notification_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('✅ Promotional system tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating promotional system tables:', error);
    throw error;
  }
};

const insertPromotionalData = async () => {
  try {
    console.log('🔄 Inserting promotional campaign data...');

    // Update existing subscription plans to monthly only
    await pool.execute(`
      UPDATE subscriptions SET 
        price_monthly = 0,
        name = 'Plan Gratuito',
        description = 'Plan básico gratuito con funcionalidades limitadas',
        features = '{"max_services": 2, "basic_support": true, "standard_photos": 3, "chat_basic": true}',
        billing_cycle = 'monthly'
      WHERE type = 'free'
    `);

    await pool.execute(`
      UPDATE subscriptions SET 
        price_monthly = 5000,
        name = 'Plan Mensual',
        description = 'Plan completo para profesionales - Facturación mensual',
        features = '{"unlimited_services": true, "priority_support": true, "advanced_features": true, "real_time_notifications": true, "smart_matching": true, "analytics": true}',
        billing_cycle = 'monthly'
      WHERE type = 'basic' OR type = 'premium'
    `);

    // Create promotional campaign for first 200 AS and 200 Explorers
    await pool.execute(`
      INSERT INTO promotional_campaigns (name, description, user_type, max_participants, duration_months, end_date)
      VALUES 
      ('Lanzamiento AS - 200 Gratis', 'Plan gratuito de 2 meses para los primeros 200 profesionales (AS)', 'provider', 200, 2, DATE_ADD(NOW(), INTERVAL 6 MONTH)),
      ('Lanzamiento Exploradores - 200 Gratis', 'Acceso gratuito de 2 meses para los primeros 200 exploradores', 'client', 200, 2, DATE_ADD(NOW(), INTERVAL 6 MONTH))
    `);

    console.log('✅ Promotional campaign data inserted successfully!');
    
  } catch (error) {
    console.error('❌ Error inserting promotional data:', error);
    throw error;
  }
};

const runPromotionalMigration = async () => {
  try {
    await createPromotionalTables();
    await insertPromotionalData();
    console.log('🎉 Promotional system migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Promotional system migration failed:', error);
    process.exit(1);
  }
};

runPromotionalMigration();