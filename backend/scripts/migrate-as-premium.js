const { query } = require('../src/config/database');

const createASPremiumTables = async () => {
  try {
    console.log('🔄 Creating AS Premium features tables...');

    // Work locations for AS
    await query(`
      CREATE TABLE IF NOT EXISTS as_work_locations (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        locality VARCHAR(100) NOT NULL,
        province VARCHAR(100) DEFAULT 'Chubut',
        travel_radius INT DEFAULT 0, -- Radius in kilometers
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (user_id, locality)
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_as_work_locations_user_id ON as_work_locations(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_work_locations_locality ON as_work_locations(locality)`);

    // Work categories for AS
    await query(`
      CREATE TABLE IF NOT EXISTS as_work_categories (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        category_id INT NOT NULL,
        subcategory VARCHAR(100),
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        UNIQUE (user_id, category_id, subcategory)
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_as_work_categories_user_id ON as_work_categories(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_work_categories_category_id ON as_work_categories(category_id)`);

    // AS availability and scheduling
    await query(`
      CREATE TABLE IF NOT EXISTS as_availability (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (user_id, day_of_week, start_time, end_time)
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_as_availability_user_id ON as_availability(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_availability_day ON as_availability(day_of_week)`);

    // AS pricing configuration
    await query(`
      CREATE TABLE IF NOT EXISTS as_pricing (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        category_id INT NOT NULL,
        service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('hourly', 'fixed', 'negotiable')),
        base_price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'ARS',
        minimum_hours DECIMAL(3,1) DEFAULT 1.0,
        travel_cost DECIMAL(10,2) DEFAULT 0,
        emergency_surcharge DECIMAL(5,2) DEFAULT 0, -- Percentage surcharge for emergency services
        is_negotiable BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        UNIQUE (user_id, category_id)
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_as_pricing_user_id ON as_pricing(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_pricing_category_id ON as_pricing(category_id)`);

    // AS portfolio items
    await query(`
      CREATE TABLE IF NOT EXISTS as_portfolio (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        category_id INT,
        image_url VARCHAR(500),
        project_date DATE,
        client_name VARCHAR(100),
        project_value DECIMAL(10,2),
        is_featured BOOLEAN DEFAULT FALSE,
        is_visible BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_as_portfolio_user_id ON as_portfolio(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_portfolio_category_id ON as_portfolio(category_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_portfolio_featured ON as_portfolio(is_featured)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_portfolio_visible ON as_portfolio(is_visible)`);

    // AS education and certifications for validation
    await query(`
      CREATE TABLE IF NOT EXISTS as_education (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        education_type VARCHAR(20) NOT NULL CHECK (education_type IN ('formal', 'course', 'certification', 'workshop')),
        institution_name VARCHAR(200) NOT NULL,
        degree_title VARCHAR(200) NOT NULL,
        field_of_study VARCHAR(200),
        start_date DATE,
        end_date DATE,
        is_current BOOLEAN DEFAULT FALSE,
        certificate_image VARCHAR(500),
        verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
        verification_notes TEXT,
        is_visible BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_as_education_user_id ON as_education(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_education_education_type ON as_education(education_type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_education_verification_status ON as_education(verification_status)`);

    // AS privacy preferences
    await query(`
      CREATE TABLE IF NOT EXISTS as_privacy_settings (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        show_profile_photo BOOLEAN DEFAULT TRUE,
        show_full_name BOOLEAN DEFAULT TRUE,
        show_phone BOOLEAN DEFAULT FALSE,
        show_whatsapp BOOLEAN DEFAULT FALSE,
        show_email BOOLEAN DEFAULT FALSE,
        show_address BOOLEAN DEFAULT FALSE,
        show_exact_location BOOLEAN DEFAULT FALSE,
        show_years_experience BOOLEAN DEFAULT TRUE,
        show_education BOOLEAN DEFAULT TRUE,
        show_certifications BOOLEAN DEFAULT TRUE,
        show_portfolio BOOLEAN DEFAULT TRUE,
        show_reviews BOOLEAN DEFAULT TRUE,
        show_response_time BOOLEAN DEFAULT TRUE,
        allow_direct_contact BOOLEAN DEFAULT TRUE,
        allow_public_reviews BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (user_id)
      )
    `);

    // AS notification preferences
    await query(`
      CREATE TABLE IF NOT EXISTS as_notification_settings (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        email_new_requests BOOLEAN DEFAULT TRUE,
        email_messages BOOLEAN DEFAULT TRUE,
        email_reviews BOOLEAN DEFAULT TRUE,
        email_payment_updates BOOLEAN DEFAULT TRUE,
        email_marketing BOOLEAN DEFAULT FALSE,
        push_new_requests BOOLEAN DEFAULT TRUE,
        push_messages BOOLEAN DEFAULT TRUE,
        push_reviews BOOLEAN DEFAULT TRUE,
        push_reminders BOOLEAN DEFAULT TRUE,
        push_marketing BOOLEAN DEFAULT FALSE,
        sms_urgent_requests BOOLEAN DEFAULT FALSE,
        sms_confirmations BOOLEAN DEFAULT FALSE,
        notification_radius INT DEFAULT 10, -- Radius in kilometers for location-based notifications
        quiet_hours_start TIME DEFAULT '22:00:00',
        quiet_hours_end TIME DEFAULT '08:00:00',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (user_id)
      )
    `);

    // AS service announcements (multiple categories)
    await query(`
      CREATE TABLE IF NOT EXISTS as_service_announcements (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        category_id INT NOT NULL,
        subcategory VARCHAR(100),
        service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('hourly', 'fixed', 'negotiable')),
        base_price DECIMAL(10,2),
        currency VARCHAR(3) DEFAULT 'ARS',
        location_type VARCHAR(20) DEFAULT 'both' CHECK (location_type IN ('client_location', 'my_location', 'both')),
        requires_materials BOOLEAN DEFAULT FALSE,
        estimated_duration VARCHAR(50),
        availability_note TEXT,
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        views_count INT DEFAULT 0,
        inquiries_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_as_service_announcements_user_id ON as_service_announcements(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_service_announcements_category_id ON as_service_announcements(category_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_service_announcements_active ON as_service_announcements(is_active)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_service_announcements_featured ON as_service_announcements(is_featured)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_service_announcements_created_at ON as_service_announcements(created_at)`);

    // AS reports about explorers
    await query(`
      CREATE TABLE IF NOT EXISTS as_explorer_reports (
        id SERIAL PRIMARY KEY,
        reporter_id INT NOT NULL, -- AS user reporting
        reported_user_id INT NOT NULL, -- Explorer being reported
        booking_id INT,
        report_type VARCHAR(30) NOT NULL CHECK (report_type IN ('suspicious_behavior', 'malicious_intent', 'non_compliance', 'fraud', 'harassment', 'other')),
        description TEXT NOT NULL,
        evidence_urls JSONB, -- Array of evidence file URLs
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
        admin_notes TEXT,
        resolution_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_as_explorer_reports_reporter ON as_explorer_reports(reporter_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_explorer_reports_reported ON as_explorer_reports(reported_user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_explorer_reports_status ON as_explorer_reports(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_explorer_reports_created_at ON as_explorer_reports(created_at)`);

    // Service requests management
    await query(`
      CREATE TABLE IF NOT EXISTS service_requests (
        id SERIAL PRIMARY KEY,
        client_id INT NOT NULL,
        provider_id INT NOT NULL,
        announcement_id INT,
        category_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        location_address TEXT,
        location_lat DECIMAL(10, 8),
        location_lng DECIMAL(11, 8),
        preferred_date DATE,
        preferred_time TIME,
        budget_min DECIMAL(10,2),
        budget_max DECIMAL(10,2),
        currency VARCHAR(3) DEFAULT 'ARS',
        urgency VARCHAR(20) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'emergency')),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'completed')),
        provider_response TEXT,
        response_date TIMESTAMP NULL,
        expiry_date TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (announcement_id) REFERENCES as_service_announcements(id) ON DELETE SET NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_service_requests_client ON service_requests(client_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_service_requests_provider ON service_requests(provider_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_service_requests_category ON service_requests(category_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_service_requests_location ON service_requests(location_lat, location_lng)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_service_requests_preferred_date ON service_requests(preferred_date)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_service_requests_expiry_date ON service_requests(expiry_date)`);

    console.log('✅ AS Premium tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating AS Premium tables:', error);
    throw error;
  }
};

const insertDefaultData = async () => {
  try {
    console.log('🔄 Inserting default data for AS Premium features...');

    // Insert some default categories if they don't exist
    const categories = [
      { name: 'Peluquería y Belleza', description: 'Servicios de estética y cuidado personal', icon: '💇' },
      { name: 'Jardinería', description: 'Cuidado de jardines y espacios verdes', icon: '🌱' },
      { name: 'Paseador de Perros', description: 'Cuidado y paseo de mascotas', icon: '🐕' },
      { name: 'Limpieza del Hogar', description: 'Servicios de limpieza doméstica', icon: '🧹' },
      { name: 'Reparaciones', description: 'Arreglos y mantenimiento del hogar', icon: '🔧' },
      { name: 'Plomería', description: 'Instalaciones y reparaciones de agua', icon: '🚰' },
      { name: 'Electricidad', description: 'Instalaciones y reparaciones eléctricas', icon: '⚡' },
      { name: 'Pintura', description: 'Pintura de interiores y exteriores', icon: '🎨' },
      { name: 'Carpintería', description: 'Trabajos en madera y muebles', icon: '🪚' },
      { name: 'Albañilería', description: 'Construcción y reparaciones de obra', icon: '🧱' }
    ];

    for (const category of categories) {
      await query(
        'INSERT INTO categories (name, description, icon) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
        [category.name, category.description, category.icon]
      );
    }

    console.log('✅ Default data inserted successfully!');
    
  } catch (error) {
    console.error('❌ Error inserting default data:', error);
    throw error;
  }
};

const runASPremiumMigration = async () => {
  try {
    await createASPremiumTables();
    await insertDefaultData();
    console.log('🎉 AS Premium migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 AS Premium migration failed:', error);
    process.exit(1);
  }
};

runASPremiumMigration();