const { pool } = require('../src/config/database');

const addMutualConfirmationFields = async () => {
  try {
    console.log('🔄 Adding mutual confirmation system...');

    // Add fields to explorer_as_connections for mutual confirmation
    await pool.execute(`
      ALTER TABLE explorer_as_connections 
      ADD COLUMN explorer_confirmed_completion BOOLEAN DEFAULT FALSE,
      ADD COLUMN as_confirmed_completion BOOLEAN DEFAULT FALSE,
      ADD COLUMN explorer_confirmed_at TIMESTAMP NULL,
      ADD COLUMN as_confirmed_at TIMESTAMP NULL,
      ADD COLUMN requires_mutual_confirmation BOOLEAN DEFAULT TRUE
    `);

    // Add AS review obligations (AS must also review Explorer)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS as_review_obligations (
        id INT AUTO_INCREMENT PRIMARY KEY,
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (as_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (connection_id) REFERENCES explorer_as_connections(id) ON DELETE CASCADE,
        FOREIGN KEY (explorer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (review_id) REFERENCES as_explorer_reviews(id) ON DELETE SET NULL,
        INDEX idx_as_id (as_id),
        INDEX idx_connection_id (connection_id),
        INDEX idx_is_reviewed (is_reviewed),
        INDEX idx_blocking (is_blocking_new_services),
        INDEX idx_due_date (review_due_date),
        UNIQUE KEY unique_as_obligation (as_id, connection_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Service completion confirmations table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS service_completion_confirmations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        connection_id INT NOT NULL,
        user_id INT NOT NULL,
        user_type ENUM('explorer', 'as') NOT NULL,
        confirmed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        confirmation_message TEXT,
        work_quality_satisfaction ENUM('excellent', 'good', 'fair', 'poor') DEFAULT 'good',
        payment_received BOOLEAN DEFAULT FALSE COMMENT 'Only for AS confirmations',
        service_delivered BOOLEAN DEFAULT FALSE COMMENT 'Only for Explorer confirmations',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (connection_id) REFERENCES explorer_as_connections(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_connection_id (connection_id),
        INDEX idx_user_id (user_id),
        INDEX idx_user_type (user_type),
        UNIQUE KEY unique_user_confirmation (connection_id, user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

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