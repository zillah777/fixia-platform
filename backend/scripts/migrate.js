const { query } = require('../src/config/database');

const createTables = async () => {
  try {
    console.log('🔄 Creating database tables...');

    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('customer', 'provider')),
        phone VARCHAR(20),
        profile_photo_url VARCHAR(500),
        profile_image VARCHAR(500),
        address TEXT,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        is_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL
      )
    `);
    
    // Create indexes for users table
    await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude)`);

    // Services table
    await query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        provider_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(20) NOT NULL CHECK (category IN ('plomeria', 'electricidad', 'limpieza', 'reparaciones', 'belleza', 'otros')),
        price DECIMAL(10, 2) NOT NULL,
        duration_minutes INT NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        address TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Create indexes for services table
    await query(`CREATE INDEX IF NOT EXISTS idx_services_provider ON services(provider_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_services_category ON services(category)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_services_location ON services(latitude, longitude)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_services_price ON services(price)`);

    // Service images table
    await query(`
      CREATE TABLE IF NOT EXISTS service_images (
        id SERIAL PRIMARY KEY,
        service_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
      )
    `);
    
    // Create index for service_images table
    await query(`CREATE INDEX IF NOT EXISTS idx_service_images_service ON service_images(service_id)`);

    // Bookings table
    await query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        customer_id INT NOT NULL,
        provider_id INT NOT NULL,
        service_id INT NOT NULL,
        scheduled_date DATE NOT NULL,
        scheduled_time TIME NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
        payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
        notes TEXT,
        customer_address TEXT,
        customer_latitude DECIMAL(10, 8),
        customer_longitude DECIMAL(11, 8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
      )
    `);
    
    // Create indexes for bookings table
    await query(`CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_bookings_service ON bookings(service_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(scheduled_date)`);

    // Reviews table
    await query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        customer_id INT NOT NULL,
        provider_id INT NOT NULL,
        service_id INT NOT NULL,
        booking_id INT NOT NULL,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        UNIQUE (booking_id)
      )
    `);
    
    // Create indexes for reviews table
    await query(`CREATE INDEX IF NOT EXISTS idx_reviews_provider ON reviews(provider_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_reviews_service ON reviews(service_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating)`);

    // Chats table
    await query(`
      CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        customer_id INT NOT NULL,
        provider_id INT NOT NULL,
        booking_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
        UNIQUE (customer_id, provider_id, booking_id)
      )
    `);
    
    // Create indexes for chats table
    await query(`CREATE INDEX IF NOT EXISTS idx_chats_customer ON chats(customer_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_chats_provider ON chats(provider_id)`);

    // Messages table
    await query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        chat_id INT NOT NULL,
        sender_id INT NOT NULL,
        content TEXT NOT NULL,
        message_type VARCHAR(10) DEFAULT 'text' CHECK (message_type IN ('text', 'image')),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Create indexes for messages table
    await query(`CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(is_read)`);

    // Payments table
    await query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        booking_id INT NOT NULL,
        customer_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        external_id VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'refunded')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Create indexes for payments table
    await query(`CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)`);

    // Notifications table
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('booking', 'payment', 'review', 'chat', 'system')),
        related_id INT,
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Create indexes for notifications table
    await query(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type)`);

    console.log('✅ All tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

const runMigration = async () => {
  try {
    await createTables();
    console.log('🎉 Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
};

runMigration();