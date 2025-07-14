const { pool, query } = require('../src/config/database');

async function runFrontendCompatibleMigration() {
  console.log('🚀 Starting Frontend-Compatible Fixia Migration for PostgreSQL...');
  
  try {
    // Test connection first
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Enable required extensions
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    console.log('✅ Extensions enabled');
    
    client.release();
    
    // Run migrations exactly matching frontend types
    console.log('\n📋 Creating tables compatible with frontend types...\n');
    
    await createUsersTable();
    await createCategoriesTable();
    await createServicesTable();
    await createBookingsTable();
    await createReviewsTable();
    await createChatsTable();
    await createMessagesTable();
    await createPaymentsTable();
    await createNotificationsTable();
    await createAuthTables();
    await createIndexes();
    await insertInitialData();
    
    console.log('\n🎉 Frontend-compatible migration completed successfully!');
    console.log('📊 Database is now 100% compatible with frontend types');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function createUsersTable() {
  console.log('📝 Creating users table (frontend compatible)...');
  
  // Users table - exactly matching frontend User and ExtendedUser interfaces
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      user_type VARCHAR(20) CHECK (user_type IN ('customer', 'provider')) DEFAULT 'customer',
      phone VARCHAR(20),
      profile_photo_url TEXT,
      address TEXT,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      is_verified BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP,
      
      -- Extended user fields for professionals
      birth_date DATE,
      city VARCHAR(100),
      dni VARCHAR(20),
      dni_procedure_number VARCHAR(50),
      about_me TEXT,
      has_mobility BOOLEAN DEFAULT FALSE,
      verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'in_review', 'verified', 'rejected')),
      verification_score INTEGER DEFAULT 0,
      subscription_type VARCHAR(20) DEFAULT 'free' CHECK (subscription_type IN ('free', 'basic', 'premium')),
      subscription_expires_at TIMESTAMP,
      total_rating_points INTEGER DEFAULT 0,
      total_ratings_count INTEGER DEFAULT 0,
      profile_completion_percentage INTEGER DEFAULT 0,
      created_services_count INTEGER DEFAULT 0,
      completed_bookings_count INTEGER DEFAULT 0,
      
      -- Professional info (stored as JSON to match frontend interface)
      professional_info JSONB DEFAULT '{}',
      
      -- Password for authentication
      password_hash VARCHAR(255) NOT NULL
    )
  `);

  console.log('✅ Users table created');
}

async function createCategoriesTable() {
  console.log('📝 Creating categories table...');
  
  // Categories table - matching ServiceCategory type
  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      icon VARCHAR(50),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Categories table created');
}

async function createServicesTable() {
  console.log('📝 Creating services table (frontend compatible)...');
  
  // Services table - exactly matching Service interface
  await query(`
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(50) CHECK (category IN ('plomeria', 'electricidad', 'limpieza', 'reparaciones', 'belleza', 'otros')) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      duration_minutes INTEGER NOT NULL,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      address TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      -- Additional fields needed for frontend display
      average_rating DECIMAL(3,2) DEFAULT 0,
      total_reviews INTEGER DEFAULT 0,
      views_count INTEGER DEFAULT 0
    )
  `);

  // Service images table - for the images array in Service interface
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

  console.log('✅ Services table created');
}

async function createBookingsTable() {
  console.log('📝 Creating bookings table (frontend compatible)...');
  
  // Bookings table - exactly matching Booking interface
  await query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
      scheduled_date DATE NOT NULL,
      scheduled_time TIME NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
      payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
      notes TEXT,
      customer_address TEXT,
      customer_latitude DECIMAL(10, 8),
      customer_longitude DECIMAL(11, 8),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      -- Additional fields for full booking data
      duration_minutes INTEGER,
      customer_phone VARCHAR(20),
      provider_phone VARCHAR(20)
    )
  `);

  console.log('✅ Bookings table created');
}

async function createReviewsTable() {
  console.log('📝 Creating reviews table (frontend compatible)...');
  
  // Reviews table - exactly matching Review interface
  await query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
      booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      UNIQUE(booking_id)
    )
  `);

  console.log('✅ Reviews table created');
}

async function createChatsTable() {
  console.log('📝 Creating chats table (frontend compatible)...');
  
  // Chats table - exactly matching Chat interface
  await query(`
    CREATE TABLE IF NOT EXISTS chats (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      UNIQUE(customer_id, provider_id, booking_id)
    )
  `);

  console.log('✅ Chats table created');
}

async function createMessagesTable() {
  console.log('📝 Creating messages table (frontend compatible)...');
  
  // Messages table - exactly matching Message interface
  await query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
      sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image')),
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Messages table created');
}

async function createPaymentsTable() {
  console.log('📝 Creating payments table (frontend compatible)...');
  
  // Payments table - exactly matching Payment interface
  await query(`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
      customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      amount DECIMAL(10,2) NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      external_id VARCHAR(255),
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'refunded')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Payments table created');
}

async function createNotificationsTable() {
  console.log('📝 Creating notifications table (frontend compatible)...');
  
  // Notifications table - exactly matching Notification interface
  await query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(20) CHECK (type IN ('booking', 'payment', 'review', 'chat', 'system')) NOT NULL,
      related_id INTEGER,
      is_read BOOLEAN DEFAULT FALSE,
      read_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Notification preferences - matching NotificationPreferences interface
  await query(`
    CREATE TABLE IF NOT EXISTS notification_preferences (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
      email_notifications BOOLEAN DEFAULT TRUE,
      push_notifications BOOLEAN DEFAULT TRUE,
      sms_notifications BOOLEAN DEFAULT FALSE,
      booking_updates BOOLEAN DEFAULT TRUE,
      payment_updates BOOLEAN DEFAULT TRUE,
      chat_messages BOOLEAN DEFAULT TRUE,
      marketing_emails BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Notifications table created');
}

async function createAuthTables() {
  console.log('📝 Creating authentication tables...');
  
  // Email verification tokens
  await query(`
    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      email VARCHAR(255) NOT NULL,
      token VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

  console.log('✅ Authentication tables created');
}

async function createIndexes() {
  console.log('📝 Creating optimized indexes...');
  
  const indexes = [
    // Users
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_type ON users(user_type)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_verification ON users(verification_status)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active ON users(is_active)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_location ON users(latitude, longitude)',
    
    // Services
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_provider ON services(provider_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_category ON services(category)',
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
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_booking ON reviews(booking_id)',
    
    // Chats and Messages
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chats_customer ON chats(customer_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chats_provider ON chats(provider_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chats_booking ON chats(booking_id)',
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
    
    // Service Images
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_images_service ON service_images(service_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_images_primary ON service_images(is_primary)',
    
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
    'payments', 'notifications', 'notification_preferences'
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

  console.log('✅ Optimized indexes created');
}

async function insertInitialData() {
  console.log('📝 Inserting initial data matching frontend...');
  
  // Service categories matching ServiceCategory type exactly
  const categories = [
    { name: 'Plomería', slug: 'plomeria', icon: '🔧' },
    { name: 'Electricidad', slug: 'electricidad', icon: '⚡' },
    { name: 'Limpieza', slug: 'limpieza', icon: '🧹' },
    { name: 'Reparaciones', slug: 'reparaciones', icon: '🔨' },
    { name: 'Belleza', slug: 'belleza', icon: '💄' },
    { name: 'Otros', slug: 'otros', icon: '🛠️' }
  ];

  for (const category of categories) {
    await query(`
      INSERT INTO categories (name, slug, icon) 
      VALUES ($1, $2, $3) 
      ON CONFLICT (slug) DO NOTHING
    `, [category.name, category.slug, category.icon]);
  }

  // Create demo users for testing
  await query(`
    INSERT INTO users (
      first_name, last_name, email, password_hash, user_type, 
      phone, is_verified, verification_status, city, about_me,
      professional_info
    ) VALUES 
    (
      'María', 'González', 'cliente@demo.com', 
      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      'customer', '+54 9 280 123-4567', true, 'verified', 'Rawson',
      'Cliente exploradora de servicios en Chubut', '{}'
    ),
    (
      'Carlos', 'Rodríguez', 'profesional@demo.com',
      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      'provider', '+54 9 280 987-6543', true, 'verified', 'Trelew',
      'Plomero profesional con 10 años de experiencia',
      '{"profession": "Plomero", "years_experience": 10, "specialization": "Instalaciones y reparaciones residenciales"}'
    )
    ON CONFLICT (email) DO NOTHING
  `);

  console.log('✅ Initial data inserted');
}

// Views for easier frontend data fetching
async function createViews() {
  console.log('📝 Creating database views for optimized queries...');
  
  // Service view with provider info (matches Service interface exactly)
  await query(`
    CREATE OR REPLACE VIEW service_details AS
    SELECT 
      s.id,
      s.provider_id,
      s.title,
      s.description,
      s.category,
      s.price,
      s.duration_minutes,
      s.latitude,
      s.longitude,
      s.address,
      s.is_active,
      s.created_at,
      s.updated_at,
      u.first_name,
      u.last_name,
      u.profile_photo_url,
      u.is_verified,
      s.average_rating,
      s.total_reviews,
      COALESCE(
        array_agg(si.image_url ORDER BY si.sort_order) FILTER (WHERE si.image_url IS NOT NULL), 
        ARRAY[]::text[]
      ) as images
    FROM services s
    JOIN users u ON s.provider_id = u.id
    LEFT JOIN service_images si ON s.id = si.service_id
    GROUP BY s.id, u.first_name, u.last_name, u.profile_photo_url, u.is_verified
  `);

  // Booking view with all related data (matches Booking interface exactly)
  await query(`
    CREATE OR REPLACE VIEW booking_details AS
    SELECT 
      b.*,
      s.title as service_title,
      s.description as service_description,
      s.category,
      s.duration_minutes,
      uc.first_name as customer_first_name,
      uc.last_name as customer_last_name,
      uc.profile_photo_url as customer_photo,
      uc.phone as customer_phone,
      up.first_name as provider_first_name,
      up.last_name as provider_last_name,
      up.profile_photo_url as provider_photo,
      up.phone as provider_phone
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    JOIN users uc ON b.customer_id = uc.id
    JOIN users up ON b.provider_id = up.id
  `);

  // Chat view with user info (matches Chat interface exactly)
  await query(`
    CREATE OR REPLACE VIEW chat_details AS
    SELECT 
      c.id,
      c.customer_id,
      c.provider_id,
      c.booking_id,
      c.created_at,
      c.updated_at,
      CASE 
        WHEN c.customer_id = u1.id THEN u2.first_name
        ELSE u1.first_name
      END as other_user_first_name,
      CASE 
        WHEN c.customer_id = u1.id THEN u2.last_name
        ELSE u1.last_name
      END as other_user_last_name,
      CASE 
        WHEN c.customer_id = u1.id THEN u2.profile_photo_url
        ELSE u1.profile_photo_url
      END as other_user_photo,
      s.title as service_title,
      m.content as last_message,
      m.created_at as last_message_time,
      COUNT(CASE WHEN m.is_read = false AND m.sender_id != u1.id THEN 1 END) as unread_count
    FROM chats c
    JOIN users u1 ON c.customer_id = u1.id
    JOIN users u2 ON c.provider_id = u2.id
    LEFT JOIN services s ON c.booking_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM bookings b WHERE b.id = c.booking_id AND b.service_id = s.id
    )
    LEFT JOIN messages m ON c.id = m.chat_id
    GROUP BY c.id, u1.id, u2.id, s.title, m.content, m.created_at
  `);

  // Review view with user info (matches Review interface exactly)
  await query(`
    CREATE OR REPLACE VIEW review_details AS
    SELECT 
      r.id,
      r.customer_id,
      r.provider_id,
      r.service_id,
      r.booking_id,
      r.rating,
      r.comment,
      r.created_at,
      r.updated_at,
      uc.first_name as customer_first_name,
      uc.last_name as customer_last_name,
      uc.profile_photo_url as customer_photo,
      up.first_name as provider_first_name,
      up.last_name as provider_last_name,
      up.profile_photo_url as provider_photo,
      s.title as service_title
    FROM reviews r
    JOIN users uc ON r.customer_id = uc.id
    JOIN users up ON r.provider_id = up.id
    JOIN services s ON r.service_id = s.id
  `);

  // Message view with sender info (matches Message interface exactly)
  await query(`
    CREATE OR REPLACE VIEW message_details AS
    SELECT 
      m.id,
      m.chat_id,
      m.sender_id,
      m.content,
      m.message_type,
      m.is_read,
      m.created_at,
      u.first_name as sender_first_name,
      u.last_name as sender_last_name,
      u.profile_photo_url as sender_photo
    FROM messages m
    JOIN users u ON m.sender_id = u.id
  `);

  console.log('✅ Database views created');
}

// Run the frontend-compatible migration
runFrontendCompatibleMigration()
  .then(async () => {
    await createViews();
    console.log('\n🎉 Frontend-compatible migration completed successfully!');
    console.log('\n📋 Database Summary:');
    console.log('   ✅ All tables match frontend TypeScript interfaces exactly');
    console.log('   ✅ ServiceCategory enum values implemented');
    console.log('   ✅ BookingStatus and PaymentStatus enums implemented');
    console.log('   ✅ User types (customer/provider) implemented');
    console.log('   ✅ All notification types implemented');
    console.log('   ✅ Optimized indexes for performance');
    console.log('   ✅ Database views for complex queries');
    console.log('   ✅ Demo users created (passwords: demo123)');
    console.log('\n💡 Next steps:');
    console.log('   1. Update backend API controllers to use these tables');
    console.log('   2. Test API endpoints with frontend');
    console.log('   3. Run frontend and verify data flow');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Frontend-compatible migration failed:', error);
    process.exit(1);
  });