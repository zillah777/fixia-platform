const { query } = require('../src/config/database');

const createPromotionalTables = async () => {
  try {
    console.log('🔄 Creating promotional subscription system tables...');

    // Promotional campaigns table
    await query(`
      CREATE TABLE IF NOT EXISTS promotional_campaigns (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('provider', 'client', 'both')),
        max_participants INT NOT NULL,
        current_participants INT DEFAULT 0,
        duration_months INT NOT NULL,
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_promotional_campaigns_user_type ON promotional_campaigns(user_type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_promotional_campaigns_active ON promotional_campaigns(is_active)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_promotional_campaigns_participants ON promotional_campaigns(current_participants, max_participants)`);

    // User promotional subscriptions table
    await query(`
      CREATE TABLE IF NOT EXISTS user_promotional_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        campaign_id INT NOT NULL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (campaign_id) REFERENCES promotional_campaigns(id) ON DELETE CASCADE,
        UNIQUE (user_id, campaign_id)
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_user_promotional_subscriptions_user_id ON user_promotional_subscriptions(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_promotional_subscriptions_campaign_id ON user_promotional_subscriptions(campaign_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_promotional_subscriptions_expires_at ON user_promotional_subscriptions(expires_at)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_promotional_subscriptions_active ON user_promotional_subscriptions(is_active)`);

    // Update subscriptions table to monthly only
    try {
      await query(`ALTER TABLE subscriptions DROP COLUMN IF EXISTS price_yearly`);
      await query(`ALTER TABLE subscriptions ALTER COLUMN price_monthly SET NOT NULL`);
      await query(`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'ARS'`);
      await query(`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) DEFAULT 'monthly'`);
      await query(`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_days INT DEFAULT 0`);
      await query(`ALTER TABLE subscriptions ADD CONSTRAINT IF NOT EXISTS check_billing_cycle CHECK (billing_cycle IN ('monthly'))`);
    } catch (err) {
      console.log('Some subscription table modifications may already exist:', err.message);
    }

    // User availability status table (for real-time matching)
    await query(`
      CREATE TABLE IF NOT EXISTS user_availability_status (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        is_available BOOLEAN DEFAULT FALSE,
        availability_type VARCHAR(20) DEFAULT 'offline' CHECK (availability_type IN ('online', 'busy', 'offline')),
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        location_lat DECIMAL(10, 8),
        location_lng DECIMAL(11, 8),
        location_updated_at TIMESTAMP,
        push_notifications_enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (user_id)
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_user_availability_status_user_id ON user_availability_status(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_availability_status_available ON user_availability_status(is_available)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_availability_status_availability_type ON user_availability_status(availability_type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_availability_status_location ON user_availability_status(location_lat, location_lng)`);

    // Smart search requests table (for "busco niñera para hoy a las 10pm")
    await query(`
      CREATE TABLE IF NOT EXISTS smart_search_requests (
        id SERIAL PRIMARY KEY,
        client_id INT NOT NULL,
        category_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        location_address VARCHAR(500),
        location_lat DECIMAL(10, 8),
        location_lng DECIMAL(11, 8),
        required_date DATE NOT NULL,
        required_time TIME NOT NULL,
        urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent', 'emergency')),
        max_budget DECIMAL(10,2),
        currency VARCHAR(3) DEFAULT 'ARS',
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'matched', 'cancelled', 'expired')),
        matched_provider_id INT,
        expires_at TIMESTAMP NOT NULL,
        notifications_sent INT DEFAULT 0,
        responses_received INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY (matched_provider_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_smart_search_requests_client_id ON smart_search_requests(client_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_smart_search_requests_category_id ON smart_search_requests(category_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_smart_search_requests_required_datetime ON smart_search_requests(required_date, required_time)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_smart_search_requests_location ON smart_search_requests(location_lat, location_lng)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_smart_search_requests_status ON smart_search_requests(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_smart_search_requests_urgency ON smart_search_requests(urgency)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_smart_search_requests_expires_at ON smart_search_requests(expires_at)`);

    // Smart search notifications table
    await query(`
      CREATE TABLE IF NOT EXISTS smart_search_notifications (
        id SERIAL PRIMARY KEY,
        search_request_id INT NOT NULL,
        provider_id INT NOT NULL,
        notification_type VARCHAR(20) NOT NULL CHECK (notification_type IN ('push', 'sms', 'email')),
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL,
        responded_at TIMESTAMP NULL,
        response_type VARCHAR(20) NULL CHECK (response_type IN ('interested', 'not_available', 'ignored')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (search_request_id) REFERENCES smart_search_requests(id) ON DELETE CASCADE,
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (search_request_id, provider_id, notification_type)
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_smart_search_notifications_search_request ON smart_search_notifications(search_request_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_smart_search_notifications_provider ON smart_search_notifications(provider_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_smart_search_notifications_sent_at ON smart_search_notifications(sent_at)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_smart_search_notifications_read_at ON smart_search_notifications(read_at)`);

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
    await query(`
      UPDATE subscriptions SET 
        price_monthly = 0,
        name = 'Plan Gratuito',
        description = 'Plan básico gratuito con funcionalidades limitadas',
        features = '{"max_services": 2, "basic_support": true, "standard_photos": 3, "chat_basic": true}',
        billing_cycle = 'monthly'
      WHERE type = 'free'
    `);

    await query(`
      UPDATE subscriptions SET 
        price_monthly = 5000,
        name = 'Plan Mensual',
        description = 'Plan completo para profesionales - Facturación mensual',
        features = '{"unlimited_services": true, "priority_support": true, "advanced_features": true, "real_time_notifications": true, "smart_matching": true, "analytics": true}',
        billing_cycle = 'monthly'
      WHERE type = 'basic' OR type = 'premium'
    `);

    // Create promotional campaign for first 200 AS and 200 Explorers
    await query(`
      INSERT INTO promotional_campaigns (name, description, user_type, max_participants, duration_months, end_date)
      VALUES 
      ('Lanzamiento AS - 200 Gratis', 'Plan gratuito de 2 meses para los primeros 200 profesionales (AS)', 'provider', 200, 2, NOW() + INTERVAL '6 months'),
      ('Lanzamiento Exploradores - 200 Gratis', 'Acceso gratuito de 2 meses para los primeros 200 exploradores', 'client', 200, 2, NOW() + INTERVAL '6 months')
      ON CONFLICT (name) DO NOTHING
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