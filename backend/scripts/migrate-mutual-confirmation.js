const { query } = require('../src/config/database');

const addMutualConfirmationFields = async () => {
  try {
    console.log('🔄 Adding mutual confirmation system...');

    // Add fields to explorer_as_connections for mutual confirmation
    try {
      await query(`ALTER TABLE explorer_as_connections ADD COLUMN IF NOT EXISTS explorer_confirmed_completion BOOLEAN DEFAULT FALSE`);
      await query(`ALTER TABLE explorer_as_connections ADD COLUMN IF NOT EXISTS as_confirmed_completion BOOLEAN DEFAULT FALSE`);
      await query(`ALTER TABLE explorer_as_connections ADD COLUMN IF NOT EXISTS explorer_confirmed_at TIMESTAMP NULL`);
      await query(`ALTER TABLE explorer_as_connections ADD COLUMN IF NOT EXISTS as_confirmed_at TIMESTAMP NULL`);
      await query(`ALTER TABLE explorer_as_connections ADD COLUMN IF NOT EXISTS requires_mutual_confirmation BOOLEAN DEFAULT TRUE`);
    } catch (err) {
      console.log('Some columns may already exist:', err.message);
    }

    // Add AS review obligations (AS must also review Explorer)
    await query(`
      CREATE TABLE IF NOT EXISTS as_review_obligations (
        id SERIAL PRIMARY KEY,
        as_id INT NOT NULL,
        connection_id INT NOT NULL,
        explorer_id INT NOT NULL,
        service_completed_at TIMESTAMP NOT NULL,
        review_due_date TIMESTAMP NOT NULL,
        is_reviewed BOOLEAN DEFAULT FALSE,
        review_id INT,
        reminder_sent_count INT DEFAULT 0,
        last_reminder_sent TIMESTAMP,
        is_blocking_new_services BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (as_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (connection_id) REFERENCES explorer_as_connections(id) ON DELETE CASCADE,
        FOREIGN KEY (explorer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (review_id) REFERENCES as_explorer_reviews(id) ON DELETE SET NULL,
        UNIQUE (as_id, connection_id)
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_as_review_obligations_as_id ON as_review_obligations(as_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_review_obligations_connection_id ON as_review_obligations(connection_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_review_obligations_is_reviewed ON as_review_obligations(is_reviewed)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_review_obligations_blocking ON as_review_obligations(is_blocking_new_services)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_as_review_obligations_due_date ON as_review_obligations(review_due_date)`);

    // Service completion confirmations table
    await query(`
      CREATE TABLE IF NOT EXISTS service_completion_confirmations (
        id SERIAL PRIMARY KEY,
        connection_id INT NOT NULL,
        user_id INT NOT NULL,
        user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('explorer', 'as')),
        confirmed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        confirmation_message TEXT,
        work_quality_satisfaction VARCHAR(20) DEFAULT 'good' CHECK (work_quality_satisfaction IN ('excellent', 'good', 'fair', 'poor')),
        payment_received BOOLEAN DEFAULT FALSE, -- Only for AS confirmations
        service_delivered BOOLEAN DEFAULT FALSE, -- Only for Explorer confirmations
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (connection_id) REFERENCES explorer_as_connections(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (connection_id, user_id)
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_service_completion_confirmations_connection_id ON service_completion_confirmations(connection_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_service_completion_confirmations_user_id ON service_completion_confirmations(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_service_completion_confirmations_user_type ON service_completion_confirmations(user_type)`);

    console.log('✅ Mutual confirmation system added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding mutual confirmation system:', error);
    throw error;
  }
};

const runMutualConfirmationMigration = async () => {
  try {
    await addMutualConfirmationFields();
    console.log('🎉 Mutual confirmation migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Mutual confirmation migration failed:', error);
    process.exit(1);
  }
};

runMutualConfirmationMigration();