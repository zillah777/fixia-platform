const { pool, query } = require('../src/config/database');

async function runCompleteSystemMigration() {
  console.log('🚀 Starting Complete Fixia System Migration for PostgreSQL...');
  
  try {
    // Test connection first
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Enable required extensions
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    console.log('✅ Extensions enabled');
    
    client.release();
    
    // Run migrations in order
    console.log('\n📋 Starting complete system creation...\n');
    
    await createCoreUserSystem();
    await createServiceSystem();
    await createBookingSystem();
    await createChatSystem();
    await createReviewSystem();
    await createPaymentSystem();
    await createNotificationSystem();
    await createASProfessionalSystem();
    await createExplorerSystem();
    await createBadgeSystem();
    await createPromotionalSystem();
    await createSecuritySystem();
    await createSystemSettings();
    await createIndexesAndConstraints();
    await insertInitialData();
    
    console.log('\n🎉 Complete system migration completed successfully!');
    console.log('📊 Database is ready for production use');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function createCoreUserSystem() {
  console.log('📝 Creating core user system...');
  
  // Enhanced users table - core of the system
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      user_type VARCHAR(20) CHECK (user_type IN ('customer', 'provider', 'admin')) DEFAULT 'customer',
      profile_photo_url TEXT,
      address TEXT,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      city VARCHAR(100),
      
      -- Verification and status
      is_verified BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'in_review', 'verified', 'rejected')),
      verification_score INTEGER DEFAULT 0,
      
      -- Email verification
      email_verified BOOLEAN DEFAULT FALSE,
      email_verified_at TIMESTAMP,
      
      -- Professional specific fields
      birth_date DATE,
      dni VARCHAR(20),
      dni_procedure_number VARCHAR(50),
      about_me TEXT,
      has_mobility BOOLEAN DEFAULT FALSE,
      
      -- Subscription info
      subscription_type VARCHAR(20) DEFAULT 'free' CHECK (subscription_type IN ('free', 'basic', 'premium')),
      subscription_expires_at TIMESTAMP,
      
      -- Stats
      total_rating_points INTEGER DEFAULT 0,
      total_ratings_count INTEGER DEFAULT 0,
      profile_completion_percentage INTEGER DEFAULT 0,
      created_services_count INTEGER DEFAULT 0,
      completed_bookings_count INTEGER DEFAULT 0,
      
      -- Professional info
      profession VARCHAR(100),
      license_number VARCHAR(100),
      specialization TEXT,
      years_experience INTEGER DEFAULT 0,
      
      -- Timestamps
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Email verification tokens
  await query(`
    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      email VARCHAR(255) NOT NULL,
      token VARCHAR(255) UNIQUE NOT NULL,
      type VARCHAR(50) DEFAULT 'email_verification',
      expires_at TIMESTAMP NOT NULL,
      used_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, type)
    )
  `);

  // Password reset tokens
  await query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User sessions for security
  await query(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      session_token VARCHAR(255) UNIQUE NOT NULL,
      ip_address INET,
      user_agent TEXT,
      expires_at TIMESTAMP NOT NULL,
      last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Core user system created');
}

async function createServiceSystem() {
  console.log('📝 Creating service system...');
  
  // Service categories
  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      icon VARCHAR(50),
      group_name VARCHAR(100),
      parent_id INTEGER REFERENCES categories(id),
      is_active BOOLEAN DEFAULT TRUE,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Services table
  await query(`
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'ARS',
      duration_minutes INTEGER NOT NULL,
      
      -- Location
      address TEXT,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      
      -- Status and visibility
      is_active BOOLEAN DEFAULT TRUE,
      is_featured BOOLEAN DEFAULT FALSE,
      views_count INTEGER DEFAULT 0,
      
      -- Stats
      average_rating DECIMAL(3,2) DEFAULT 0,
      total_reviews INTEGER DEFAULT 0,
      total_bookings INTEGER DEFAULT 0,
      
      -- Timestamps
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
      is_primary BOOLEAN DEFAULT FALSE,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Service availability
  await query(`
    CREATE TABLE IF NOT EXISTS service_availability (
      id SERIAL PRIMARY KEY,
      service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
      day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      is_available BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Service system created');
}

async function createBookingSystem() {
  console.log('📝 Creating booking system...');
  
  // Bookings table
  await query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
      
      -- Scheduling
      scheduled_date DATE NOT NULL,
      scheduled_time TIME NOT NULL,
      
      -- Pricing
      total_amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'ARS',
      
      -- Status
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
      payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
      
      -- Additional info
      notes TEXT,
      customer_address TEXT,
      customer_latitude DECIMAL(10, 8),
      customer_longitude DECIMAL(11, 8),
      
      -- Completion tracking
      started_at TIMESTAMP,
      completed_at TIMESTAMP,
      cancelled_at TIMESTAMP,
      cancellation_reason TEXT,
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Booking status history
  await query(`
    CREATE TABLE IF NOT EXISTS booking_status_history (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
      previous_status VARCHAR(20),
      new_status VARCHAR(20) NOT NULL,
      changed_by INTEGER REFERENCES users(id),
      reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Booking system created');
}

async function createChatSystem() {
  console.log('📝 Creating chat system...');
  
  // Chat conversations
  await query(`
    CREATE TABLE IF NOT EXISTS chats (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
      
      -- Status
      is_active BOOLEAN DEFAULT TRUE,
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      UNIQUE(customer_id, provider_id, booking_id)
    )
  `);

  // Chat messages
  await query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
      sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
      attachment_url TEXT,
      
      -- Read status
      is_read BOOLEAN DEFAULT FALSE,
      read_at TIMESTAMP,
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Chat system created');
}

async function createReviewSystem() {
  console.log('📝 Creating review system...');
  
  // Reviews table
  await query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
      booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
      
      -- Rating
      rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
      comment TEXT,
      
      -- Detailed ratings
      service_quality_rating INTEGER CHECK (service_quality_rating >= 1 AND service_quality_rating <= 5),
      punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
      communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
      value_for_money_rating INTEGER CHECK (value_for_money_rating >= 1 AND value_for_money_rating <= 5),
      
      -- Additional feedback
      would_hire_again BOOLEAN,
      recommend_to_others BOOLEAN,
      
      -- Status
      is_public BOOLEAN DEFAULT TRUE,
      is_verified BOOLEAN DEFAULT FALSE,
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      UNIQUE(booking_id)
    )
  `);

  // Review responses (providers can respond to reviews)
  await query(`
    CREATE TABLE IF NOT EXISTS review_responses (
      id SERIAL PRIMARY KEY,
      review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
      provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      response TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Review system created');
}

async function createPaymentSystem() {
  console.log('📝 Creating payment system...');
  
  // Payments table
  await query(`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
      customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      
      -- Amount
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'ARS',
      
      -- Payment method and provider
      payment_method VARCHAR(50) NOT NULL,
      payment_provider VARCHAR(50) DEFAULT 'mercadopago',
      external_id VARCHAR(255),
      
      -- Status
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'refunded')),
      
      -- Timing
      processed_at TIMESTAMP,
      expires_at TIMESTAMP,
      
      -- Additional data
      payment_data JSONB,
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Payment webhooks log
  await query(`
    CREATE TABLE IF NOT EXISTS payment_webhooks (
      id SERIAL PRIMARY KEY,
      payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
      webhook_data JSONB NOT NULL,
      status VARCHAR(50),
      processed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Earnings summary for providers
  await query(`
    CREATE TABLE IF NOT EXISTS provider_earnings (
      id SERIAL PRIMARY KEY,
      provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      total_earnings DECIMAL(10,2) DEFAULT 0,
      completed_payments INTEGER DEFAULT 0,
      pending_payments INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(provider_id, year, month)
    )
  `);

  console.log('✅ Payment system created');
}

async function createNotificationSystem() {
  console.log('📝 Creating notification system...');
  
  // Notifications table
  await query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) NOT NULL CHECK (type IN ('booking', 'payment', 'review', 'chat', 'system', 'promotion')),
      related_id INTEGER,
      
      -- Status
      is_read BOOLEAN DEFAULT FALSE,
      read_at TIMESTAMP,
      
      -- Delivery channels
      sent_email BOOLEAN DEFAULT FALSE,
      sent_push BOOLEAN DEFAULT FALSE,
      sent_sms BOOLEAN DEFAULT FALSE,
      
      -- Additional data
      action_url TEXT,
      notification_data JSONB,
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Notification preferences
  await query(`
    CREATE TABLE IF NOT EXISTS notification_preferences (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      
      -- Channels
      email_notifications BOOLEAN DEFAULT TRUE,
      push_notifications BOOLEAN DEFAULT TRUE,
      sms_notifications BOOLEAN DEFAULT FALSE,
      
      -- Types
      booking_updates BOOLEAN DEFAULT TRUE,
      payment_updates BOOLEAN DEFAULT TRUE,
      chat_messages BOOLEAN DEFAULT TRUE,
      marketing_emails BOOLEAN DEFAULT FALSE,
      review_reminders BOOLEAN DEFAULT TRUE,
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      UNIQUE(user_id)
    )
  `);

  console.log('✅ Notification system created');
}

async function createASProfessionalSystem() {
  console.log('📝 Creating AS professional system...');
  
  // Professional profiles (extended info for providers)
  await query(`
    CREATE TABLE IF NOT EXISTS professional_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
      
      -- Professional info
      business_name VARCHAR(200),
      business_description TEXT,
      website_url VARCHAR(500),
      
      -- Verification documents
      id_document_url TEXT,
      professional_license_url TEXT,
      insurance_document_url TEXT,
      
      -- Service areas and preferences
      service_radius_km INTEGER DEFAULT 10,
      minimum_service_price DECIMAL(10,2) DEFAULT 1000,
      auto_accept_bookings BOOLEAN DEFAULT FALSE,
      advance_booking_days INTEGER DEFAULT 7,
      
      -- Working hours
      working_hours_start TIME DEFAULT '08:00',
      working_hours_end TIME DEFAULT '18:00',
      working_days TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      
      -- Verification status
      document_verification_status VARCHAR(20) DEFAULT 'pending',
      background_check_status VARCHAR(20) DEFAULT 'pending',
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Professional certifications
  await query(`
    CREATE TABLE IF NOT EXISTS professional_certifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      certification_name VARCHAR(200) NOT NULL,
      issuing_organization VARCHAR(200),
      issue_date DATE,
      expiry_date DATE,
      certificate_url TEXT,
      is_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Portfolio items
  await query(`
    CREATE TABLE IF NOT EXISTS portfolio_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      category_id INTEGER REFERENCES categories(id),
      completion_date DATE,
      project_value DECIMAL(10,2),
      client_feedback TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Portfolio images
  await query(`
    CREATE TABLE IF NOT EXISTS portfolio_images (
      id SERIAL PRIMARY KEY,
      portfolio_id INTEGER REFERENCES portfolio_items(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      caption TEXT,
      is_before_image BOOLEAN DEFAULT FALSE,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ AS professional system created');
}

async function createExplorerSystem() {
  console.log('📝 Creating explorer (customer) system...');
  
  // Service requests (explorers can post service needs)
  await query(`
    CREATE TABLE IF NOT EXISTS service_requests (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      
      -- Request details
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      
      -- Location
      address TEXT,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      
      -- Budget and timing
      budget_min DECIMAL(10,2),
      budget_max DECIMAL(10,2),
      preferred_date DATE,
      preferred_time TIME,
      urgency VARCHAR(20) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'emergency')),
      flexible_timing BOOLEAN DEFAULT TRUE,
      
      -- Status
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'completed', 'cancelled')),
      selected_provider_id INTEGER REFERENCES users(id),
      
      -- Metrics
      views_count INTEGER DEFAULT 0,
      responses_count INTEGER DEFAULT 0,
      
      -- Timestamps
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Provider responses to service requests
  await query(`
    CREATE TABLE IF NOT EXISTS service_request_responses (
      id SERIAL PRIMARY KEY,
      request_id INTEGER REFERENCES service_requests(id) ON DELETE CASCADE,
      provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      
      -- Response details
      message TEXT NOT NULL,
      proposed_price DECIMAL(10,2),
      estimated_duration VARCHAR(100),
      available_date DATE,
      available_time TIME,
      
      -- Status
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
      viewed_by_customer BOOLEAN DEFAULT FALSE,
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      UNIQUE(request_id, provider_id)
    )
  `);

  console.log('✅ Explorer system created');
}

async function createBadgeSystem() {
  console.log('📝 Creating badge system...');
  
  // Badges definition
  await query(`
    CREATE TABLE IF NOT EXISTS badges (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      icon VARCHAR(100),
      category VARCHAR(50),
      
      -- Requirements
      requirements JSONB,
      points_required INTEGER DEFAULT 0,
      
      -- Status
      is_active BOOLEAN DEFAULT TRUE,
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User badges (earned badges)
  await query(`
    CREATE TABLE IF NOT EXISTS user_badges (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
      earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      progress_data JSONB,
      UNIQUE(user_id, badge_id)
    )
  `);

  // Badge progress tracking
  await query(`
    CREATE TABLE IF NOT EXISTS badge_progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
      current_progress INTEGER DEFAULT 0,
      target_progress INTEGER NOT NULL,
      progress_data JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, badge_id)
    )
  `);

  console.log('✅ Badge system created');
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
      
      -- Participation limits
      max_participants INTEGER,
      current_participants INTEGER DEFAULT 0,
      
      -- Benefits
      benefits JSONB,
      
      -- Timing
      start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      end_date TIMESTAMP,
      
      -- Status
      is_active BOOLEAN DEFAULT TRUE,
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User promotional subscriptions
  await query(`
    CREATE TABLE IF NOT EXISTS user_promotional_subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      campaign_id INTEGER REFERENCES promotional_campaigns(id) ON DELETE CASCADE,
      
      -- Subscription details
      subscription_type VARCHAR(20) DEFAULT 'premium',
      benefits_data JSONB,
      
      -- Timing
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP,
      
      -- Status
      is_active BOOLEAN DEFAULT TRUE,
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      UNIQUE(user_id, campaign_id)
    )
  `);

  console.log('✅ Promotional system created');
}

async function createSecuritySystem() {
  console.log('📝 Creating security system...');
  
  // Security logs
  await query(`
    CREATE TABLE IF NOT EXISTS security_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      event_type VARCHAR(50) NOT NULL,
      ip_address INET,
      user_agent TEXT,
      success BOOLEAN DEFAULT TRUE,
      details JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Reports and moderation
  await query(`
    CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      reporter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      reported_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      reported_content_type VARCHAR(50),
      reported_content_id INTEGER,
      reason VARCHAR(100) NOT NULL,
      description TEXT,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
      moderator_id INTEGER REFERENCES users(id),
      moderator_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Security system created');
}

async function createSystemSettings() {
  console.log('📝 Creating system settings...');
  
  // System configuration
  await query(`
    CREATE TABLE IF NOT EXISTS system_settings (
      id SERIAL PRIMARY KEY,
      setting_key VARCHAR(100) UNIQUE NOT NULL,
      setting_value TEXT,
      setting_type VARCHAR(20) DEFAULT 'string',
      description TEXT,
      is_public BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Feature flags
  await query(`
    CREATE TABLE IF NOT EXISTS feature_flags (
      id SERIAL PRIMARY KEY,
      feature_name VARCHAR(100) UNIQUE NOT NULL,
      is_enabled BOOLEAN DEFAULT FALSE,
      description TEXT,
      target_user_types TEXT[],
      rollout_percentage INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ System settings created');
}

async function createIndexesAndConstraints() {
  console.log('📝 Creating database indexes and constraints...');
  
  const indexes = [
    // Users
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_type ON users(user_type)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_verification ON users(verification_status)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_location ON users(latitude, longitude)',
    
    // Services
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_provider ON services(provider_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_category ON services(category_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_active ON services(is_active)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_location ON services(latitude, longitude)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_price ON services(price)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_rating ON services(average_rating)',
    
    // Bookings
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_customer ON bookings(customer_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_provider ON bookings(provider_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_service ON bookings(service_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_status ON bookings(status)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_date ON bookings(scheduled_date)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status)',
    
    // Reviews
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_provider ON reviews(provider_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_service ON reviews(service_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_rating ON reviews(rating)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_public ON reviews(is_public)',
    
    // Chats and Messages
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chats_customer ON chats(customer_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chats_provider ON chats(provider_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_chat ON messages(chat_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender ON messages(sender_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_read ON messages(is_read)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_created ON messages(created_at)',
    
    // Payments
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_booking ON payments(booking_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_customer ON payments(customer_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_status ON payments(status)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_external ON payments(external_id)',
    
    // Notifications
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user ON notifications(user_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_read ON notifications(is_read)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_type ON notifications(type)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created ON notifications(created_at)',
    
    // Service Requests
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_requests_customer ON service_requests(customer_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_requests_category ON service_requests(category_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_requests_status ON service_requests(status)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_requests_location ON service_requests(latitude, longitude)',
    
    // Search optimization
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_text_search ON services USING gin(to_tsvector(\'spanish\', title || \' \' || description))',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_text_search ON users USING gin(to_tsvector(\'spanish\', first_name || \' \' || last_name || \' \' || COALESCE(about_me, \'\')))'
  ];

  for (const indexSQL of indexes) {
    try {
      await query(indexSQL);
    } catch (error) {
      console.log(`ℹ️  Index might already exist: ${error.message.substring(0, 100)}...`);
    }
  }

  // Create trigger for updating timestamps
  await query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Apply triggers to tables with updated_at columns
  const tablesWithUpdatedAt = [
    'users', 'services', 'bookings', 'chats', 'reviews', 
    'payments', 'professional_profiles', 'service_requests',
    'notification_preferences', 'system_settings', 'feature_flags'
  ];

  for (const table of tablesWithUpdatedAt) {
    await query(`
      DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
      CREATE TRIGGER update_${table}_updated_at 
        BEFORE UPDATE ON ${table} 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  console.log('✅ Database indexes and constraints created');
}

async function insertInitialData() {
  console.log('📝 Inserting initial data...');
  
  // Service categories (comprehensive list)
  const categories = [
    { name: 'Plomería', slug: 'plomeria', icon: '🔧', group: 'Mantenimiento y reparaciones' },
    { name: 'Electricidad', slug: 'electricidad', icon: '⚡', group: 'Mantenimiento y reparaciones' },
    { name: 'Carpintería', slug: 'carpinteria', icon: '🔨', group: 'Mantenimiento y reparaciones' },
    { name: 'Pintura', slug: 'pintura', icon: '🎨', group: 'Mantenimiento y reparaciones' },
    { name: 'Limpieza', slug: 'limpieza', icon: '🧹', group: 'Servicios para el hogar' },
    { name: 'Jardinería', slug: 'jardineria', icon: '🌱', group: 'Jardinería y espacios exteriores' },
    { name: 'Belleza y Estética', slug: 'belleza', icon: '💄', group: 'Servicios personales' },
    { name: 'Reparaciones Generales', slug: 'reparaciones', icon: '🛠️', group: 'Mantenimiento y reparaciones' },
    { name: 'Tecnología', slug: 'tecnologia', icon: '💻', group: 'Servicios especializados' },
    { name: 'Otros', slug: 'otros', icon: '📋', group: 'Servicios generales' }
  ];

  for (const category of categories) {
    await query(`
      INSERT INTO categories (name, slug, icon, group_name) 
      VALUES ($1, $2, $3, $4) 
      ON CONFLICT (slug) DO NOTHING
    `, [category.name, category.slug, category.icon, category.group]);
  }

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
    CREATE TABLE IF NOT EXISTS localities (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      province VARCHAR(50) DEFAULT 'Chubut',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  for (const locality of localities) {
    await query(`
      INSERT INTO localities (name) 
      VALUES ($1) 
      ON CONFLICT (name) DO NOTHING
    `, [locality]);
  }

  // Promotional campaigns
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
      '{"free_months": 2, "plan_type": "premium", "description": "2 meses gratis de suscripción premium"}',
      CURRENT_TIMESTAMP + INTERVAL '6 months'
    ) ON CONFLICT DO NOTHING
  `);

  await query(`
    INSERT INTO promotional_campaigns (
      name, description, campaign_type, target_user_type, 
      max_participants, benefits, end_date
    ) VALUES (
      'Lanzamiento Fixia - Primeros 200 Exploradores',
      'Los primeros 200 Exploradores obtienen funciones premium gratis',
      'launch_promo',
      'customer',
      200,
      '{"free_months": 2, "plan_type": "premium", "description": "2 meses gratis de funciones premium"}',
      CURRENT_TIMESTAMP + INTERVAL '6 months'
    ) ON CONFLICT DO NOTHING
  `);

  // Basic badges
  const badges = [
    { name: 'Nuevo Usuario', description: 'Bienvenido a Fixia', icon: '🎉', category: 'inicio', requirements: '{"type": "registration"}' },
    { name: 'Primera Reserva', description: 'Completaste tu primera reserva', icon: '📅', category: 'actividad', requirements: '{"type": "bookings", "count": 1}' },
    { name: 'Cliente Frecuente', description: '10 servicios completados', icon: '⭐', category: 'actividad', requirements: '{"type": "bookings", "count": 10}' },
    { name: 'Profesional Verificado', description: 'Identidad verificada', icon: '✅', category: 'confianza', requirements: '{"type": "verification"}' },
    { name: 'Excelencia en Servicio', description: 'Calificación promedio 4.8+', icon: '🏆', category: 'calidad', requirements: '{"type": "rating", "min": 4.8, "min_reviews": 10}' }
  ];

  for (const badge of badges) {
    await query(`
      INSERT INTO badges (name, description, icon, category, requirements) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT DO NOTHING
    `, [badge.name, badge.description, badge.icon, badge.category, badge.requirements]);
  }

  // System settings
  const settings = [
    { key: 'platform_name', value: 'Fixia', type: 'string', description: 'Nombre de la plataforma', is_public: true },
    { key: 'support_email', value: 'soporte@fixia.com.ar', type: 'string', description: 'Email de soporte', is_public: true },
    { key: 'max_booking_advance_days', value: '30', type: 'integer', description: 'Días máximos de anticipación para reservas' },
    { key: 'review_deadline_days', value: '7', type: 'integer', description: 'Días para dejar reseña después del servicio' },
    { key: 'default_service_radius_km', value: '10', type: 'integer', description: 'Radio de servicio por defecto' },
    { key: 'platform_commission_percentage', value: '10', type: 'decimal', description: 'Comisión de la plataforma' }
  ];

  for (const setting of settings) {
    await query(`
      INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (setting_key) DO NOTHING
    `, [setting.key, setting.value, setting.type, setting.description, setting.is_public]);
  }

  // Feature flags
  const features = [
    { name: 'chat_system', enabled: true, description: 'Sistema de chat entre usuarios' },
    { name: 'video_calls', enabled: false, description: 'Videollamadas en la plataforma' },
    { name: 'advanced_search', enabled: true, description: 'Búsqueda avanzada con filtros' },
    { name: 'badge_system', enabled: true, description: 'Sistema de badges y logros' },
    { name: 'promotional_campaigns', enabled: true, description: 'Campañas promocionales' }
  ];

  for (const feature of features) {
    await query(`
      INSERT INTO feature_flags (feature_name, is_enabled, description) 
      VALUES ($1, $2, $3) 
      ON CONFLICT (feature_name) DO NOTHING
    `, [feature.name, feature.enabled, feature.description]);
  }

  console.log('✅ Initial data inserted');
}

// Run the complete migration
runCompleteSystemMigration()
  .then(() => {
    console.log('\n🎉 Complete system migration finished successfully!');
    console.log('💡 Next steps:');
    console.log('   1. Configure environment variables');
    console.log('   2. Test the API endpoints');
    console.log('   3. Run the frontend application');
    console.log('   4. Create admin user if needed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Complete migration failed:', error);
    process.exit(1);
  });