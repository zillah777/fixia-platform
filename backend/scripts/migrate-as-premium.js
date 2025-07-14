const { pool } = require('../src/config/database');

const createASPremiumTables = async () => {
  try {
    console.log('🔄 Creating AS Premium features tables...');

    // Work locations for AS
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS as_work_locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        locality VARCHAR(100) NOT NULL,
        province VARCHAR(100) DEFAULT 'Chubut',
        travel_radius INT DEFAULT 0 COMMENT 'Radius in kilometers',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_locality (locality),
        UNIQUE KEY unique_user_location (user_id, locality)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Work categories for AS
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS as_work_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        category_id INT NOT NULL,
        subcategory VARCHAR(100),
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_category_id (category_id),
        UNIQUE KEY unique_user_category (user_id, category_id, subcategory)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // AS availability and scheduling
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS as_availability (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_day (day_of_week),
        UNIQUE KEY unique_user_day_time (user_id, day_of_week, start_time, end_time)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // AS pricing configuration
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS as_pricing (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        category_id INT NOT NULL,
        service_type ENUM('hourly', 'fixed', 'negotiable') NOT NULL,
        base_price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'ARS',
        minimum_hours DECIMAL(3,1) DEFAULT 1.0,
        travel_cost DECIMAL(10,2) DEFAULT 0,
        emergency_surcharge DECIMAL(5,2) DEFAULT 0 COMMENT 'Percentage surcharge for emergency services',
        is_negotiable BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_category_id (category_id),
        UNIQUE KEY unique_user_category_pricing (user_id, category_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // AS portfolio items
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS as_portfolio (
        id INT AUTO_INCREMENT PRIMARY KEY,
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_category_id (category_id),
        INDEX idx_featured (is_featured),
        INDEX idx_visible (is_visible)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // AS education and certifications for validation
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS as_education (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        education_type ENUM('formal', 'course', 'certification', 'workshop') NOT NULL,
        institution_name VARCHAR(200) NOT NULL,
        degree_title VARCHAR(200) NOT NULL,
        field_of_study VARCHAR(200),
        start_date DATE,
        end_date DATE,
        is_current BOOLEAN DEFAULT FALSE,
        certificate_image VARCHAR(500),
        verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
        verification_notes TEXT,
        is_visible BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_education_type (education_type),
        INDEX idx_verification_status (verification_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // AS privacy preferences
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS as_privacy_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_privacy (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // AS notification preferences
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS as_notification_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
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
        notification_radius INT DEFAULT 10 COMMENT 'Radius in kilometers for location-based notifications',
        quiet_hours_start TIME DEFAULT '22:00:00',
        quiet_hours_end TIME DEFAULT '08:00:00',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_notifications (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // AS service announcements (multiple categories)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS as_service_announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        category_id INT NOT NULL,
        subcategory VARCHAR(100),
        service_type ENUM('hourly', 'fixed', 'negotiable') NOT NULL,
        base_price DECIMAL(10,2),
        currency VARCHAR(3) DEFAULT 'ARS',
        location_type ENUM('client_location', 'my_location', 'both') DEFAULT 'both',
        requires_materials BOOLEAN DEFAULT FALSE,
        estimated_duration VARCHAR(50),
        availability_note TEXT,
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        views_count INT DEFAULT 0,
        inquiries_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_category_id (category_id),
        INDEX idx_active (is_active),
        INDEX idx_featured (is_featured),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // AS reports about explorers
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS as_explorer_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reporter_id INT NOT NULL COMMENT 'AS user reporting',
        reported_user_id INT NOT NULL COMMENT 'Explorer being reported',
        booking_id INT,
        report_type ENUM('suspicious_behavior', 'malicious_intent', 'non_compliance', 'fraud', 'harassment', 'other') NOT NULL,
        description TEXT NOT NULL,
        evidence_urls JSON COMMENT 'Array of evidence file URLs',
        status ENUM('pending', 'investigating', 'resolved', 'dismissed') DEFAULT 'pending',
        admin_notes TEXT,
        resolution_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
        INDEX idx_reporter (reporter_id),
        INDEX idx_reported (reported_user_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Service requests management
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS service_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
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
        urgency ENUM('low', 'medium', 'high', 'emergency') DEFAULT 'medium',
        status ENUM('pending', 'accepted', 'rejected', 'cancelled', 'completed') DEFAULT 'pending',
        provider_response TEXT,
        response_date TIMESTAMP NULL,
        expiry_date TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (announcement_id) REFERENCES as_service_announcements(id) ON DELETE SET NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        INDEX idx_client (client_id),
        INDEX idx_provider (provider_id),
        INDEX idx_status (status),
        INDEX idx_category (category_id),
        INDEX idx_location (location_lat, location_lng),
        INDEX idx_preferred_date (preferred_date),
        INDEX idx_expiry_date (expiry_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

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
      await pool.execute(
        'INSERT IGNORE INTO categories (name, description, icon) VALUES (?, ?, ?)',
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