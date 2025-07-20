const { query } = require('../src/config/database');

const createChatTables = async () => {
  try {
    console.log('🔄 Creating chat system tables...');

    // Chat messages table for Explorer-AS communication
    await query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        chat_room_id VARCHAR(100) NOT NULL,
        sender_id INT NOT NULL,
        message TEXT NOT NULL,
        message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'location', 'service_update')),
        attachment_url VARCHAR(500),
        is_read BOOLEAN DEFAULT FALSE,
        is_system_message BOOLEAN DEFAULT FALSE,
        reply_to_message_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reply_to_message_id) REFERENCES chat_messages(id) ON DELETE SET NULL
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_room_id ON chat_messages(chat_room_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON chat_messages(is_read)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_message_type ON chat_messages(message_type)`);

    // Chat participants table (for group chats if needed in future)
    await query(`
      CREATE TABLE IF NOT EXISTS chat_participants (
        id SERIAL PRIMARY KEY,
        chat_room_id VARCHAR(100) NOT NULL,
        user_id INT NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_read_at TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT TRUE,
        role VARCHAR(20) DEFAULT 'participant' CHECK (role IN ('participant', 'admin')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (chat_room_id, user_id)
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_chat_participants_chat_room_id ON chat_participants(chat_room_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_chat_participants_active ON chat_participants(is_active)`);

    // Chat room metadata
    await query(`
      CREATE TABLE IF NOT EXISTS chat_rooms (
        id VARCHAR(100) PRIMARY KEY,
        room_type VARCHAR(20) DEFAULT 'explorer_as' CHECK (room_type IN ('explorer_as', 'group', 'support')),
        room_name VARCHAR(200),
        created_by INT NOT NULL,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        metadata JSONB, -- Additional room metadata
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_chat_rooms_room_type ON chat_rooms(room_type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by ON chat_rooms(created_by)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_chat_rooms_last_activity ON chat_rooms(last_activity)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_chat_rooms_active ON chat_rooms(is_active)`);

    // User role switching history (Explorer can become AS)
    await query(`
      CREATE TABLE IF NOT EXISTS user_role_history (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        old_user_type VARCHAR(20) NOT NULL CHECK (old_user_type IN ('client', 'provider')),
        new_user_type VARCHAR(20) NOT NULL CHECK (new_user_type IN ('client', 'provider')),
        switch_reason TEXT,
        approval_required BOOLEAN DEFAULT FALSE,
        approved_by INT,
        approved_at TIMESTAMP NULL,
        switched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    await query(`CREATE INDEX IF NOT EXISTS idx_user_role_history_user_id ON user_role_history(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_role_history_switched_at ON user_role_history(switched_at)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_role_history_approval ON user_role_history(approval_required, approved_at)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_role_history_active ON user_role_history(is_active)`);

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