const { pool, query } = require('../src/config/database');

async function runMigration() {
  console.log('🚀 Starting Fixia PostgreSQL Database Migration...');
  
  try {
    // Test connection first
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✅ UUID extension enabled');
    
    // Create schemas if needed
    await client.query('CREATE SCHEMA IF NOT EXISTS public');
    console.log('✅ Public schema ready');
    
    client.release();
    
    // Run migrations in order
    console.log('\n📋 Starting table creation...\n');
    
    await createBaseTables();
    await createExtendedTables();
    await createBadgeSystem();
    await createASPremiumFeatures();
    await createExplorerSystem();
    await createChatSystem();
    await createMutualConfirmation();
    await createPromotionalSystem();
    await insertInitialData();
    
    console.log('\n🎉 All migrations completed successfully!');
    console.log('📊 Database is ready for Fixia platform');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function createBaseTables() {
  console.log('📝 Creating base tables...');
  
  // Users table (main)
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      user_type VARCHAR(20) CHECK (user_type IN ('customer', 'provider', 'admin')) DEFAULT 'customer',
      profile_image TEXT,
      date_of_birth DATE,
      gender VARCHAR(10),
      locality VARCHAR(100),
      address TEXT,
      verification_status VARCHAR(20) DEFAULT 'pending',
      email_verified BOOLEAN DEFAULT false,
      email_verified_at TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Email verification tokens table
  await query(`
    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      email VARCHAR(255) NOT NULL,
      token VARCHAR(255) UNIQUE NOT NULL,
      type VARCHAR(50) DEFAULT 'email_verification',
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, type)
    )
  `);

  // Categories table
  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      icon VARCHAR(50),
      group_name VARCHAR(100),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Services table
  await query(`
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL(10,2),
      currency VARCHAR(3) DEFAULT 'ARS',
      duration_hours INTEGER,
      location VARCHAR(200),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Service images
  await query(`
    CREATE TABLE IF NOT EXISTS service_images (
      id SERIAL PRIMARY KEY,
      service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      caption TEXT,
      is_primary BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bookings table
  await query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
      booking_date DATE NOT NULL,
      booking_time TIME NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      total_amount DECIMAL(10,2),
      currency VARCHAR(3) DEFAULT 'ARS',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Reviews table
  await query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
      reviewer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      reviewed_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
      comment TEXT,
      is_public BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Chat messages
  await query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Notifications
  await query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'info',
      is_read BOOLEAN DEFAULT false,
      action_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Payments
  await query(`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'ARS',
      payment_method VARCHAR(50),
      payment_status VARCHAR(20) DEFAULT 'pending',
      transaction_id VARCHAR(100),
      processed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Base tables created');
}

async function createExtendedTables() {
  console.log('📝 Creating extended user tables...');
  
  // Subscriptions
  await query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      plan_type VARCHAR(20) CHECK (plan_type IN ('free', 'basic', 'premium')) DEFAULT 'free',
      status VARCHAR(20) DEFAULT 'active',
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP,
      auto_renew BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Subscription payments
  await query(`
    CREATE TABLE IF NOT EXISTS subscription_payments (
      id SERIAL PRIMARY KEY,
      subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE,
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'ARS',
      payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      payment_method VARCHAR(50),
      transaction_id VARCHAR(100)
    )
  `);

  // User verifications
  await query(`
    CREATE TABLE IF NOT EXISTS user_verifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      verification_type VARCHAR(50) NOT NULL,
      document_url TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      verified_at TIMESTAMP,
      verified_by INTEGER REFERENCES users(id),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Extended tables created');
}

async function createBadgeSystem() {
  console.log('📝 Creating badge system...');
  
  // Badges
  await query(`
    CREATE TABLE IF NOT EXISTS badges (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      icon VARCHAR(100),
      category VARCHAR(50),
      requirements JSONB,
      points_required INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User badges
  await query(`
    CREATE TABLE IF NOT EXISTS user_badges (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
      earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, badge_id)
    )
  `);

  console.log('✅ Badge system created');
}

async function createASPremiumFeatures() {
  console.log('📝 Creating AS premium features...');
  
  // AS work locations
  await query(`
    CREATE TABLE IF NOT EXISTS as_work_locations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      location_name VARCHAR(100) NOT NULL,
      is_primary BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // AS work categories
  await query(`
    CREATE TABLE IF NOT EXISTS as_work_categories (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
      experience_years INTEGER DEFAULT 0,
      is_primary BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, category_id)
    )
  `);

  // AS portfolio
  await query(`
    CREATE TABLE IF NOT EXISTS as_portfolio (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      image_url TEXT,
      completed_date DATE,
      client_feedback TEXT,
      category_id INTEGER REFERENCES categories(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ AS premium features created');
}

async function createExplorerSystem() {
  console.log('📝 Creating Explorer system...');
  
  // Explorer service requests
  await query(`
    CREATE TABLE IF NOT EXISTS explorer_service_requests (
      id SERIAL PRIMARY KEY,
      explorer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      locality VARCHAR(100) NOT NULL,
      specific_address TEXT,
      urgency VARCHAR(20) CHECK (urgency IN ('low', 'medium', 'high', 'emergency')) DEFAULT 'medium',
      budget_min DECIMAL(10,2),
      budget_max DECIMAL(10,2),
      preferred_date DATE,
      preferred_time TIME,
      flexible_timing BOOLEAN DEFAULT true,
      status VARCHAR(20) DEFAULT 'active',
      expires_at TIMESTAMP,
      views_count INTEGER DEFAULT 0,
      interested_as_count INTEGER DEFAULT 0,
      selected_as_id INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // AS service interests
  await query(`
    CREATE TABLE IF NOT EXISTS as_service_interests (
      id SERIAL PRIMARY KEY,
      request_id INTEGER REFERENCES explorer_service_requests(id) ON DELETE CASCADE,
      as_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      message TEXT,
      proposed_price DECIMAL(10,2),
      currency VARCHAR(3) DEFAULT 'ARS',
      estimated_completion_time VARCHAR(100),
      availability_date DATE,
      availability_time TIME,
      status VARCHAR(20) DEFAULT 'pending',
      viewed_by_explorer BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(request_id, as_id)
    )
  `);

  // Explorer-AS connections
  await query(`
    CREATE TABLE IF NOT EXISTS explorer_as_connections (
      id SERIAL PRIMARY KEY,
      explorer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      as_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      request_id INTEGER REFERENCES explorer_service_requests(id) ON DELETE SET NULL,
      connection_type VARCHAR(50) DEFAULT 'service_request',
      chat_room_id VARCHAR(100) UNIQUE NOT NULL,
      status VARCHAR(20) DEFAULT 'active',
      service_started_at TIMESTAMP,
      service_completed_at TIMESTAMP,
      final_agreed_price DECIMAL(10,2),
      currency VARCHAR(3) DEFAULT 'ARS',
      explorer_confirmed_completion BOOLEAN DEFAULT false,
      as_confirmed_completion BOOLEAN DEFAULT false,
      explorer_confirmed_at TIMESTAMP,
      as_confirmed_at TIMESTAMP,
      requires_mutual_confirmation BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Explorer reviews
  await query(`
    CREATE TABLE IF NOT EXISTS explorer_as_reviews (
      id SERIAL PRIMARY KEY,
      connection_id INTEGER REFERENCES explorer_as_connections(id) ON DELETE CASCADE,
      explorer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      as_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
      comment TEXT NOT NULL,
      service_quality_rating INTEGER CHECK (service_quality_rating >= 1 AND service_quality_rating <= 5),
      punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
      communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
      value_for_money_rating INTEGER CHECK (value_for_money_rating >= 1 AND value_for_money_rating <= 5),
      would_hire_again BOOLEAN DEFAULT true,
      recommend_to_others BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Explorer review obligations
  await query(`
    CREATE TABLE IF NOT EXISTS explorer_review_obligations (
      id SERIAL PRIMARY KEY,
      explorer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      connection_id INTEGER REFERENCES explorer_as_connections(id) ON DELETE CASCADE,
      as_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      service_completed_at TIMESTAMP NOT NULL,
      review_due_date TIMESTAMP NOT NULL,
      is_reviewed BOOLEAN DEFAULT false,
      is_blocking_new_services BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(explorer_id, connection_id)
    )
  `);

  // AS review obligations
  await query(`
    CREATE TABLE IF NOT EXISTS as_review_obligations (
      id SERIAL PRIMARY KEY,
      as_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      connection_id INTEGER REFERENCES explorer_as_connections(id) ON DELETE CASCADE,
      explorer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      service_completed_at TIMESTAMP NOT NULL,
      review_due_date TIMESTAMP NOT NULL,
      is_reviewed BOOLEAN DEFAULT false,
      is_blocking_new_services BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(as_id, connection_id)
    )
  `);

  console.log('✅ Explorer system created');
}

async function createChatSystem() {
  console.log('📝 Creating advanced chat system...');
  
  // Chat rooms
  await query(`
    CREATE TABLE IF NOT EXISTS chat_rooms (
      id VARCHAR(100) PRIMARY KEY,
      connection_id INTEGER REFERENCES explorer_as_connections(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Chat messages (enhanced)
  await query(`
    DROP TABLE IF EXISTS chat_messages;
    CREATE TABLE chat_messages (
      id SERIAL PRIMARY KEY,
      chat_room_id VARCHAR(100) REFERENCES chat_rooms(id) ON DELETE CASCADE,
      sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      message_type VARCHAR(20) DEFAULT 'text',
      attachment_url TEXT,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Advanced chat system created');
}

async function createMutualConfirmation() {
  console.log('📝 Creating mutual confirmation system...');
  
  // Service completion confirmations
  await query(`
    CREATE TABLE IF NOT EXISTS service_completion_confirmations (
      id SERIAL PRIMARY KEY,
      connection_id INTEGER REFERENCES explorer_as_connections(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      user_type VARCHAR(20) CHECK (user_type IN ('explorer', 'as')) NOT NULL,
      confirmation_message TEXT,
      work_quality_satisfaction VARCHAR(20) DEFAULT 'good',
      payment_received BOOLEAN,
      service_delivered BOOLEAN,
      confirmed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(connection_id, user_id)
    )
  `);

  console.log('✅ Mutual confirmation system created');
}

async function createPromotionalSystem() {
  console.log('📝 Creating promotional system...');
  
  // Promotional campaigns
  await query(`
    CREATE TABLE IF NOT EXISTS promotional_campaigns (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      campaign_type VARCHAR(50) NOT NULL,
      target_user_type VARCHAR(20) CHECK (target_user_type IN ('customer', 'provider', 'both')),
      max_participants INTEGER,
      current_participants INTEGER DEFAULT 0,
      benefits JSONB,
      start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      end_date TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User promotional subscriptions
  await query(`
    CREATE TABLE IF NOT EXISTS user_promotional_subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      campaign_id INTEGER REFERENCES promotional_campaigns(id) ON DELETE CASCADE,
      subscription_type VARCHAR(20) DEFAULT 'premium',
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, campaign_id)
    )
  `);

  // Smart search requests
  await query(`
    CREATE TABLE IF NOT EXISTS smart_search_requests (
      id SERIAL PRIMARY KEY,
      explorer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      search_query TEXT NOT NULL,
      category_id INTEGER REFERENCES categories(id),
      locality VARCHAR(100),
      urgency VARCHAR(20) DEFAULT 'medium',
      budget_max DECIMAL(10,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Smart search notifications
  await query(`
    CREATE TABLE IF NOT EXISTS smart_search_notifications (
      id SERIAL PRIMARY KEY,
      search_request_id INTEGER REFERENCES smart_search_requests(id) ON DELETE CASCADE,
      as_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      notification_type VARCHAR(50) DEFAULT 'new_request',
      sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      responded_at TIMESTAMP,
      UNIQUE(search_request_id, as_id)
    )
  `);

  console.log('✅ Promotional system created');
}

async function insertInitialData() {
  console.log('📝 Inserting initial data...');
  
  // Chubut localities
  const localities = [
    'Rawson', 'Trelew', 'Puerto Madryn', 'Comodoro Rivadavia', 'Esquel',
    'Gaiman', 'Dolavon', 'Rada Tilly', 'Trevelin', 'Puerto Pirámides',
    'Sarmiento', 'Río Mayo', 'Alto Río Senguer', 'Gobernador Costa',
    'Las Plumas', 'Gastre', 'Paso de Indios', 'Tecka', 'Gualjaina',
    'El Maitén', 'El Hoyo', 'Epuyén', 'Cholila', 'Lago Puelo',
    'José de San Martín', 'Facundo', 'Playa Unión', 'Playa Magagna'
  ];

  await query(`
    CREATE TABLE IF NOT EXISTS chubut_localities (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      region VARCHAR(50),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  for (const locality of localities) {
    await query(`
      INSERT INTO chubut_localities (name, region) 
      VALUES ($1, 'Chubut') 
      ON CONFLICT (name) DO NOTHING
    `, [locality]);
  }

  // Basic service categories (will be populated with full 107 categories later)
  const basicCategories = [
    { name: 'Plomería', icon: '🔧', group: 'Mantenimiento y reparaciones' },
    { name: 'Electricidad', icon: '⚡', group: 'Mantenimiento y reparaciones' },
    { name: 'Carpintería', icon: '🔨', group: 'Mantenimiento y reparaciones' },
    { name: 'Limpieza', icon: '🧹', group: 'Servicios para el hogar y la familia' },
    { name: 'Jardinería', icon: '🌱', group: 'Jardinería y espacios exteriores' }
  ];

  for (const category of basicCategories) {
    await query(`
      INSERT INTO categories (name, icon, group_name) 
      VALUES ($1, $2, $3) 
      ON CONFLICT DO NOTHING
    `, [category.name, category.icon, category.group]);
  }

  // Promotional campaign for first 200 users
  await query(`
    INSERT INTO promotional_campaigns (
      name, description, campaign_type, target_user_type, 
      max_participants, benefits, end_date
    ) VALUES (
      'Lanzamiento Fixia - Primeros 200 AS',
      'Los primeros 200 profesionales AS obtienen 2 meses gratis de suscripción premium',
      'launch_promo',
      'provider',
      200,
      '{"free_months": 2, "plan_type": "premium"}',
      CURRENT_TIMESTAMP + INTERVAL '6 months'
    ) ON CONFLICT DO NOTHING
  `);

  await query(`
    INSERT INTO promotional_campaigns (
      name, description, campaign_type, target_user_type, 
      max_participants, benefits, end_date
    ) VALUES (
      'Lanzamiento Fixia - Primeros 200 Exploradores',
      'Los primeros 200 Exploradores obtienen 2 meses gratis de funciones premium',
      'launch_promo',
      'client',
      200,
      '{"free_months": 2, "plan_type": "premium"}',
      CURRENT_TIMESTAMP + INTERVAL '6 months'
    ) ON CONFLICT DO NOTHING
  `);

  console.log('✅ Initial data inserted');
}

// Create indexes for performance
async function createIndexes() {
  console.log('📝 Creating database indexes...');
  
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type)',
    'CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id)',
    'CREATE INDEX IF NOT EXISTS idx_services_user ON services(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(chat_room_id)',
    'CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_explorer_requests_category ON explorer_service_requests(category_id)',
    'CREATE INDEX IF NOT EXISTS idx_explorer_requests_explorer ON explorer_service_requests(explorer_id)',
    'CREATE INDEX IF NOT EXISTS idx_as_interests_request ON as_service_interests(request_id)',
    'CREATE INDEX IF NOT EXISTS idx_as_interests_as ON as_service_interests(as_id)',
    'CREATE INDEX IF NOT EXISTS idx_connections_explorer ON explorer_as_connections(explorer_id)',
    'CREATE INDEX IF NOT EXISTS idx_connections_as ON explorer_as_connections(as_id)',
    'CREATE INDEX IF NOT EXISTS idx_explorer_reviews_connection ON explorer_as_reviews(connection_id)',
    'CREATE INDEX IF NOT EXISTS idx_explorer_reviews_explorer ON explorer_as_reviews(explorer_id)',
    'CREATE INDEX IF NOT EXISTS idx_explorer_reviews_as ON explorer_as_reviews(as_id)',
    'CREATE INDEX IF NOT EXISTS idx_smart_search_explorer ON smart_search_requests(explorer_id)',
    'CREATE INDEX IF NOT EXISTS idx_smart_search_category ON smart_search_requests(category_id)'
  ];

  for (const indexSQL of indexes) {
    await query(indexSQL);
  }

  console.log('✅ Database indexes created');
}

// Run the migration
runMigration()
  .then(async () => {
    await createIndexes();
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });