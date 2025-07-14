const { pool } = require('../src/config/database');

const createChatTables = async () => {
  try {
    console.log('🔄 Creating chat system tables...');

    // Chat messages table for Explorer-AS communication
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        chat_room_id VARCHAR(100) NOT NULL,
        sender_id INT NOT NULL,
        message TEXT NOT NULL,
        message_type ENUM('text', 'image', 'document', 'location', 'service_update') DEFAULT 'text',
        attachment_url VARCHAR(500),
        is_read BOOLEAN DEFAULT FALSE,
        is_system_message BOOLEAN DEFAULT FALSE,
        reply_to_message_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reply_to_message_id) REFERENCES chat_messages(id) ON DELETE SET NULL,
        INDEX idx_chat_room_id (chat_room_id),
        INDEX idx_sender_id (sender_id),
        INDEX idx_created_at (created_at),
        INDEX idx_is_read (is_read),
        INDEX idx_message_type (message_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Chat participants table (for group chats if needed in future)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS chat_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        chat_room_id VARCHAR(100) NOT NULL,
        user_id INT NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_read_at TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT TRUE,
        role ENUM('participant', 'admin') DEFAULT 'participant',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_chat_room_id (chat_room_id),
        INDEX idx_user_id (user_id),
        INDEX idx_active (is_active),
        UNIQUE KEY unique_chat_participant (chat_room_id, user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Chat room metadata
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS chat_rooms (
        id VARCHAR(100) PRIMARY KEY,
        room_type ENUM('explorer_as', 'group', 'support') DEFAULT 'explorer_as',
        room_name VARCHAR(200),
        created_by INT NOT NULL,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        metadata JSON COMMENT 'Additional room metadata',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_room_type (room_type),
        INDEX idx_created_by (created_by),
        INDEX idx_last_activity (last_activity),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // User role switching history (Explorer can become AS)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_role_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        old_user_type ENUM('client', 'provider') NOT NULL,
        new_user_type ENUM('client', 'provider') NOT NULL,
        switch_reason TEXT,
        approval_required BOOLEAN DEFAULT FALSE,
        approved_by INT,
        approved_at TIMESTAMP NULL,
        switched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_switched_at (switched_at),
        INDEX idx_approval (approval_required, approved_at),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('✅ Chat system tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating chat system tables:', error);
    throw error;
  }
};

const runChatMigration = async () => {
  try {
    await createChatTables();
    console.log('🎉 Chat system migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Chat system migration failed:', error);
    process.exit(1);
  }
};

runChatMigration();