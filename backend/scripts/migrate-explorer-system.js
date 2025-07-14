const { pool } = require('../src/config/database');

const createExplorerTables = async () => {
  try {
    console.log('🔄 Creating Explorer system tables...');

    // Explorer profiles (extended client information)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS explorer_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        preferred_localities JSON COMMENT 'Array of preferred localities in Chubut',
        preferred_categories JSON COMMENT 'Array of preferred service categories',
        average_budget_range VARCHAR(50),
        communication_preference ENUM('chat', 'whatsapp', 'phone', 'email') DEFAULT 'chat',
        is_reliable_client BOOLEAN DEFAULT TRUE,
        total_services_hired INT DEFAULT 0,
        total_amount_spent DECIMAL(10,2) DEFAULT 0,
        preferred_payment_method VARCHAR(100),
        special_requirements TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_explorer_profile (user_id),
        INDEX idx_user_id (user_id),
        INDEX idx_reliable (is_reliable_client)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Explorer service requests (BUSCO ALBAÑIL PARA TRABAJO EN RAWSON)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS explorer_service_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        explorer_id INT NOT NULL,
        category_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        locality VARCHAR(100) NOT NULL,
        specific_address TEXT,
        location_lat DECIMAL(10, 8),
        location_lng DECIMAL(11, 8),
        urgency ENUM('low', 'medium', 'high', 'emergency') DEFAULT 'medium',
        budget_min DECIMAL(10,2),
        budget_max DECIMAL(10,2),
        currency VARCHAR(3) DEFAULT 'ARS',
        preferred_date DATE,
        preferred_time TIME,
        flexible_timing BOOLEAN DEFAULT TRUE,
        status ENUM('active', 'in_progress', 'completed', 'cancelled') DEFAULT 'active',
        selected_as_id INT,
        expires_at TIMESTAMP NOT NULL,
        views_count INT DEFAULT 0,
        interested_as_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (explorer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY (selected_as_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_explorer_id (explorer_id),
        INDEX idx_category_id (category_id),
        INDEX idx_locality (locality),
        INDEX idx_status (status),
        INDEX idx_urgency (urgency),
        INDEX idx_expires_at (expires_at),
        INDEX idx_preferred_date (preferred_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // AS interests in explorer requests (when AS clicks "LO TENGO")
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS as_service_interests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        as_id INT NOT NULL,
        message TEXT,
        proposed_price DECIMAL(10,2),
        currency VARCHAR(3) DEFAULT 'ARS',
        estimated_completion_time VARCHAR(100),
        availability_date DATE,
        availability_time TIME,
        status ENUM('pending', 'accepted', 'rejected', 'expired') DEFAULT 'pending',
        viewed_by_explorer BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES explorer_service_requests(id) ON DELETE CASCADE,
        FOREIGN KEY (as_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_request_id (request_id),
        INDEX idx_as_id (as_id),
        INDEX idx_status (status),
        INDEX idx_viewed (viewed_by_explorer),
        UNIQUE KEY unique_as_request (request_id, as_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Explorer-AS connections and chat initiation
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS explorer_as_connections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        explorer_id INT NOT NULL,
        as_id INT NOT NULL,
        request_id INT,
        connection_type ENUM('service_request', 'direct_contact', 'chat_initiated') DEFAULT 'service_request',
        chat_room_id VARCHAR(100) UNIQUE NOT NULL,
        status ENUM('active', 'service_in_progress', 'completed', 'cancelled') DEFAULT 'active',
        service_started_at TIMESTAMP NULL,
        service_completed_at TIMESTAMP NULL,
        final_agreed_price DECIMAL(10,2),
        currency VARCHAR(3) DEFAULT 'ARS',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (explorer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (as_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (request_id) REFERENCES explorer_service_requests(id) ON DELETE SET NULL,
        INDEX idx_explorer_id (explorer_id),
        INDEX idx_as_id (as_id),
        INDEX idx_request_id (request_id),
        INDEX idx_chat_room (chat_room_id),
        INDEX idx_status (status),
        UNIQUE KEY unique_explorer_as_request (explorer_id, as_id, request_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Explorer reviews for AS (mandatory after service completion)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS explorer_as_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        connection_id INT NOT NULL,
        explorer_id INT NOT NULL,
        as_id INT NOT NULL,
        request_id INT,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        service_quality_rating INT CHECK (service_quality_rating >= 1 AND service_quality_rating <= 5),
        punctuality_rating INT CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
        communication_rating INT CHECK (communication_rating >= 1 AND communication_rating <= 5),
        value_for_money_rating INT CHECK (value_for_money_rating >= 1 AND value_for_money_rating <= 5),
        would_hire_again BOOLEAN DEFAULT TRUE,
        recommend_to_others BOOLEAN DEFAULT TRUE,
        review_photos JSON COMMENT 'Array of photo URLs',
        is_verified_review BOOLEAN DEFAULT FALSE,
        helpful_votes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (connection_id) REFERENCES explorer_as_connections(id) ON DELETE CASCADE,
        FOREIGN KEY (explorer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (as_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (request_id) REFERENCES explorer_service_requests(id) ON DELETE SET NULL,
        INDEX idx_connection_id (connection_id),
        INDEX idx_explorer_id (explorer_id),
        INDEX idx_as_id (as_id),
        INDEX idx_rating (rating),
        INDEX idx_created_at (created_at),
        UNIQUE KEY unique_explorer_as_review (connection_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // AS reviews for Explorer (so AS can see what kind of client they are)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS as_explorer_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        connection_id INT NOT NULL,
        as_id INT NOT NULL,
        explorer_id INT NOT NULL,
        request_id INT,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        payment_reliability_rating INT CHECK (payment_reliability_rating >= 1 AND payment_reliability_rating <= 5),
        communication_rating INT CHECK (communication_rating >= 1 AND communication_rating <= 5),
        clarity_of_requirements_rating INT CHECK (clarity_of_requirements_rating >= 1 AND clarity_of_requirements_rating <= 5),
        respect_rating INT CHECK (respect_rating >= 1 AND respect_rating <= 5),
        would_work_again BOOLEAN DEFAULT TRUE,
        recommend_to_others BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (connection_id) REFERENCES explorer_as_connections(id) ON DELETE CASCADE,
        FOREIGN KEY (as_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (explorer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (request_id) REFERENCES explorer_service_requests(id) ON DELETE SET NULL,
        INDEX idx_connection_id (connection_id),
        INDEX idx_as_id (as_id),
        INDEX idx_explorer_id (explorer_id),
        INDEX idx_rating (rating),
        INDEX idx_created_at (created_at),
        UNIQUE KEY unique_as_explorer_review (connection_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Explorer mandatory review tracking (to enforce rating before next service)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS explorer_review_obligations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        explorer_id INT NOT NULL,
        connection_id INT NOT NULL,
        as_id INT NOT NULL,
        service_completed_at TIMESTAMP NOT NULL,
        review_due_date TIMESTAMP NOT NULL,
        is_reviewed BOOLEAN DEFAULT FALSE,
        review_id INT,
        reminder_sent_count INT DEFAULT 0,
        last_reminder_sent TIMESTAMP,
        is_blocking_new_services BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (explorer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (connection_id) REFERENCES explorer_as_connections(id) ON DELETE CASCADE,
        FOREIGN KEY (as_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (review_id) REFERENCES explorer_as_reviews(id) ON DELETE SET NULL,
        INDEX idx_explorer_id (explorer_id),
        INDEX idx_connection_id (connection_id),
        INDEX idx_is_reviewed (is_reviewed),
        INDEX idx_blocking (is_blocking_new_services),
        INDEX idx_due_date (review_due_date),
        UNIQUE KEY unique_explorer_obligation (explorer_id, connection_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Chubut localities database
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS chubut_localities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        postal_code VARCHAR(10),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        population INT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_department (department),
        INDEX idx_active (is_active),
        UNIQUE KEY unique_locality_department (name, department)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // User role switching tracking (Explorer can become AS with same account)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_role_switches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        from_role ENUM('client', 'provider') NOT NULL,
        to_role ENUM('client', 'provider') NOT NULL,
        switch_reason TEXT,
        switched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_switched_at (switched_at),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('✅ Explorer system tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating Explorer system tables:', error);
    throw error;
  }
};

const insertChubutLocalities = async () => {
  try {
    console.log('🔄 Inserting Chubut localities...');

    const localities = [
      // Departamento Rawson
      { name: 'Rawson', department: 'Rawson', postal_code: '9103', latitude: -43.3006, longitude: -65.1027, population: 31787 },
      { name: 'Playa Unión', department: 'Rawson', postal_code: '9103', latitude: -43.3181, longitude: -65.0394, population: 8000 },
      { name: 'Playa Magagna', department: 'Rawson', postal_code: '9103', latitude: -43.2892, longitude: -65.0633, population: 1500 },
      
      // Departamento Trelew
      { name: 'Trelew', department: 'Trelew', postal_code: '9100', latitude: -43.2489, longitude: -65.3050, population: 120000 },
      { name: 'Puerto Madryn', department: 'Biedma', postal_code: '9120', latitude: -42.7658, longitude: -65.0362, population: 93995 },
      
      // Departamento Gaiman
      { name: 'Gaiman', department: 'Gaiman', postal_code: '9105', latitude: -43.2839, longitude: -65.4925, population: 6627 },
      { name: 'Dolavon', department: 'Gaiman', postal_code: '9107', latitude: -43.3097, longitude: -65.7189, population: 3054 },
      
      // Departamento Comodoro Rivadavia
      { name: 'Comodoro Rivadavia', department: 'Escalante', postal_code: '9000', latitude: -45.8627, longitude: -67.4937, population: 200000 },
      { name: 'Rada Tilly', department: 'Escalante', postal_code: '9001', latitude: -45.9194, longitude: -67.5547, population: 12910 },
      
      // Departamento Esquel
      { name: 'Esquel', department: 'Futaleufú', postal_code: '9200', latitude: -42.9097, longitude: -71.3167, population: 40000 },
      { name: 'Trevelin', department: 'Futaleufú', postal_code: '9203', latitude: -43.0847, longitude: -71.4628, population: 8500 },
      
      // Departamento Puerto Madryn (Biedma)
      { name: 'Puerto Pirámides', department: 'Biedma', postal_code: '9121', latitude: -42.5736, longitude: -64.2831, population: 565 },
      
      // Otras localidades importantes
      { name: 'Sarmiento', department: 'Sarmiento', postal_code: '9020', latitude: -45.5881, longitude: -69.0694, population: 13000 },
      { name: 'Río Mayo', department: 'Río Senguer', postal_code: '9040', latitude: -45.6856, longitude: -70.2569, population: 3500 },
      { name: 'Alto Río Senguer', department: 'Río Senguer', postal_code: '9041', latitude: -45.0333, longitude: -70.8333, population: 1200 },
      { name: 'Gobernador Costa', department: 'Río Senguer', postal_code: '9042', latitude: -45.6167, longitude: -69.2833, population: 2800 },
      { name: 'Las Plumas', department: 'Gastre', postal_code: '9015', latitude: -43.7833, longitude: -69.1167, population: 500 },
      { name: 'Gastre', department: 'Gastre', postal_code: '9015', latitude: -42.2667, longitude: -69.2167, population: 1500 },
      { name: 'Paso de Indios', department: 'Paso de Indios', postal_code: '9017', latitude: -43.8833, longitude: -68.7333, population: 800 },
      { name: 'Tecka', department: 'Languiñeo', postal_code: '9211', latitude: -43.4833, longitude: -70.8167, population: 1200 },
      { name: 'Gualjaina', department: 'Cushamen', postal_code: '9217', latitude: -42.6167, longitude: -70.1833, population: 2000 },
      { name: 'El Maitén', department: 'Cushamen', postal_code: '9217', latitude: -42.0497, longitude: -71.1708, population: 4000 },
      { name: 'El Hoyo', department: 'Cushamen', postal_code: '9211', latitude: -42.0667, longitude: -71.5167, population: 7000 },
      { name: 'Epuyén', department: 'Cushamen', postal_code: '9211', latitude: -42.1167, longitude: -71.5833, population: 2500 },
      { name: 'Cholila', department: 'Cushamen', postal_code: '9217', latitude: -42.5167, longitude: -71.4333, population: 3000 },
      { name: 'Lago Puelo', department: 'Cushamen', postal_code: '9211', latitude: -42.0667, longitude: -71.6000, population: 4500 },
      { name: 'José de San Martín', department: 'Tehuelches', postal_code: '9050', latitude: -44.0500, longitude: -70.4667, population: 1500 },
      { name: 'Facundo', department: 'Tehuelches', postal_code: '9050', latitude: -44.4833, longitude: -70.8333, population: 800 }
    ];

    for (const locality of localities) {
      await pool.execute(`
        INSERT IGNORE INTO chubut_localities (name, department, postal_code, latitude, longitude, population)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [locality.name, locality.department, locality.postal_code, locality.latitude, locality.longitude, locality.population]);
    }

    console.log(`✅ Successfully inserted ${localities.length} Chubut localities!`);
    
  } catch (error) {
    console.error('❌ Error inserting Chubut localities:', error);
    throw error;
  }
};

const runExplorerMigration = async () => {
  try {
    await createExplorerTables();
    await insertChubutLocalities();
    console.log('🎉 Explorer system migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Explorer system migration failed:', error);
    process.exit(1);
  }
};

runExplorerMigration();