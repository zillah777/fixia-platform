const { query } = require('../src/config/database');

const createExplorerTables = async () => {
  try {
    console.log('🔄 Creating Explorer system tables...');

    // Explorer profiles (extended client information)
    await query(`
      CREATE TABLE IF NOT EXISTS explorer_profiles (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        preferred_localities JSONB, -- Array of preferred localities in Chubut
        preferred_categories JSONB, -- Array of preferred service categories
        average_budget_range VARCHAR(50),
        communication_preference VARCHAR(20) DEFAULT 'chat' CHECK (communication_preference IN ('chat', 'whatsapp', 'phone', 'email')),
        is_reliable_client BOOLEAN DEFAULT TRUE,
        total_services_hired INT DEFAULT 0,
        total_amount_spent DECIMAL(10,2) DEFAULT 0,
        preferred_payment_method VARCHAR(100),
        special_requirements TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (user_id)
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_profiles_user_id ON explorer_profiles(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_profiles_reliable ON explorer_profiles(is_reliable_client)`);

    // Explorer service requests (BUSCO ALBAÑIL PARA TRABAJO EN RAWSON)
    await query(`
      CREATE TABLE IF NOT EXISTS explorer_service_requests (
        id SERIAL PRIMARY KEY,
        explorer_id INT NOT NULL,
        category_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        locality VARCHAR(100) NOT NULL,
        specific_address TEXT,
        location_lat DECIMAL(10, 8),
        location_lng DECIMAL(11, 8),
        urgency VARCHAR(20) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'emergency')),
        budget_min DECIMAL(10,2),
        budget_max DECIMAL(10,2),
        currency VARCHAR(3) DEFAULT 'ARS',
        preferred_date DATE,
        preferred_time TIME,
        flexible_timing BOOLEAN DEFAULT TRUE,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'completed', 'cancelled')),
        selected_as_id INT,
        expires_at TIMESTAMP NOT NULL,
        views_count INT DEFAULT 0,
        interested_as_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (explorer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY (selected_as_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_service_requests_explorer_id ON explorer_service_requests(explorer_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_service_requests_category_id ON explorer_service_requests(category_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_service_requests_locality ON explorer_service_requests(locality)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_service_requests_status ON explorer_service_requests(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_service_requests_urgency ON explorer_service_requests(urgency)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_service_requests_expires_at ON explorer_service_requests(expires_at)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_service_requests_preferred_date ON explorer_service_requests(preferred_date)`);

    // AS interests in explorer requests (when AS clicks "LO TENGO")
    await query(`
      CREATE TABLE IF NOT EXISTS as_service_interests (
        id SERIAL PRIMARY KEY,
        request_id INT NOT NULL,
        as_id INT NOT NULL,
        message TEXT,
        proposed_price DECIMAL(10,2),
        currency VARCHAR(3) DEFAULT 'ARS',
        estimated_completion_time VARCHAR(100),
        availability_date DATE,
        availability_time TIME,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
        viewed_by_explorer BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES explorer_service_requests(id) ON DELETE CASCADE,
        FOREIGN KEY (as_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (request_id, as_id)
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_as_service_interests_request_id ON as_service_interests(request_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_service_interests_as_id ON as_service_interests(as_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_service_interests_status ON as_service_interests(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_service_interests_viewed ON as_service_interests(viewed_by_explorer)`);

    // Explorer-AS connections and chat initiation
    await query(`
      CREATE TABLE IF NOT EXISTS explorer_as_connections (
        id SERIAL PRIMARY KEY,
        explorer_id INT NOT NULL,
        as_id INT NOT NULL,
        request_id INT,
        connection_type VARCHAR(30) DEFAULT 'service_request' CHECK (connection_type IN ('service_request', 'direct_contact', 'chat_initiated')),
        chat_room_id VARCHAR(100) UNIQUE NOT NULL,
        status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'service_in_progress', 'completed', 'cancelled')),
        service_started_at TIMESTAMP NULL,
        service_completed_at TIMESTAMP NULL,
        final_agreed_price DECIMAL(10,2),
        currency VARCHAR(3) DEFAULT 'ARS',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (explorer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (as_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (request_id) REFERENCES explorer_service_requests(id) ON DELETE SET NULL,
        UNIQUE (explorer_id, as_id, request_id)
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_as_connections_explorer_id ON explorer_as_connections(explorer_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_as_connections_as_id ON explorer_as_connections(as_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_as_connections_request_id ON explorer_as_connections(request_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_as_connections_chat_room ON explorer_as_connections(chat_room_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_as_connections_status ON explorer_as_connections(status)`);

    // Explorer reviews for AS (mandatory after service completion)
    await query(`
      CREATE TABLE IF NOT EXISTS explorer_as_reviews (
        id SERIAL PRIMARY KEY,
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
        review_photos JSONB, -- Array of photo URLs
        is_verified_review BOOLEAN DEFAULT FALSE,
        helpful_votes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (connection_id) REFERENCES explorer_as_connections(id) ON DELETE CASCADE,
        FOREIGN KEY (explorer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (as_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (request_id) REFERENCES explorer_service_requests(id) ON DELETE SET NULL,
        UNIQUE (connection_id)
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_as_reviews_connection_id ON explorer_as_reviews(connection_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_as_reviews_explorer_id ON explorer_as_reviews(explorer_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_as_reviews_as_id ON explorer_as_reviews(as_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_as_reviews_rating ON explorer_as_reviews(rating)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_as_reviews_created_at ON explorer_as_reviews(created_at)`);

    // AS reviews for Explorer (so AS can see what kind of client they are)
    await query(`
      CREATE TABLE IF NOT EXISTS as_explorer_reviews (
        id SERIAL PRIMARY KEY,
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (connection_id) REFERENCES explorer_as_connections(id) ON DELETE CASCADE,
        FOREIGN KEY (as_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (explorer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (request_id) REFERENCES explorer_service_requests(id) ON DELETE SET NULL,
        UNIQUE (connection_id)
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_as_explorer_reviews_connection_id ON as_explorer_reviews(connection_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_explorer_reviews_as_id ON as_explorer_reviews(as_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_explorer_reviews_explorer_id ON as_explorer_reviews(explorer_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_explorer_reviews_rating ON as_explorer_reviews(rating)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_explorer_reviews_created_at ON as_explorer_reviews(created_at)`);

    // Explorer mandatory review tracking (to enforce rating before next service)
    await query(`
      CREATE TABLE IF NOT EXISTS explorer_review_obligations (
        id SERIAL PRIMARY KEY,
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (explorer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (connection_id) REFERENCES explorer_as_connections(id) ON DELETE CASCADE,
        FOREIGN KEY (as_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (review_id) REFERENCES explorer_as_reviews(id) ON DELETE SET NULL,
        UNIQUE (explorer_id, connection_id)
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_review_obligations_explorer_id ON explorer_review_obligations(explorer_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_review_obligations_connection_id ON explorer_review_obligations(connection_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_review_obligations_is_reviewed ON explorer_review_obligations(is_reviewed)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_review_obligations_blocking ON explorer_review_obligations(is_blocking_new_services)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_explorer_review_obligations_due_date ON explorer_review_obligations(review_due_date)`);

    // Chubut localities database
    await query(`
      CREATE TABLE IF NOT EXISTS chubut_localities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        postal_code VARCHAR(10),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        population INT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (name, department)
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_chubut_localities_name ON chubut_localities(name)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_chubut_localities_department ON chubut_localities(department)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_chubut_localities_active ON chubut_localities(is_active)`);

    // User role switching tracking (Explorer can become AS with same account)
    await query(`
      CREATE TABLE IF NOT EXISTS user_role_switches (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        from_role VARCHAR(20) NOT NULL CHECK (from_role IN ('client', 'provider')),
        to_role VARCHAR(20) NOT NULL CHECK (to_role IN ('client', 'provider')),
        switch_reason TEXT,
        switched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_user_role_switches_user_id ON user_role_switches(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_role_switches_switched_at ON user_role_switches(switched_at)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_role_switches_active ON user_role_switches(is_active)`);

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
      await query(`
        INSERT INTO chubut_localities (name, department, postal_code, latitude, longitude, population)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (name, department) DO NOTHING
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