const { pool, query } = require('../src/config/database');

async function createNotificationPreferencesTable() {
  console.log('🔔 Creating notification_preferences table...');
  
  try {
    // Create notification_preferences table
    await query(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        
        -- Email notifications
        email_notifications BOOLEAN DEFAULT true,
        email_booking_updates BOOLEAN DEFAULT true,
        email_review_received BOOLEAN DEFAULT true,
        email_message_received BOOLEAN DEFAULT true,
        email_promotional BOOLEAN DEFAULT false,
        
        -- Push notifications
        push_notifications BOOLEAN DEFAULT true,
        push_booking_updates BOOLEAN DEFAULT true,
        push_review_received BOOLEAN DEFAULT true,
        push_message_received BOOLEAN DEFAULT true,
        push_promotional BOOLEAN DEFAULT false,
        
        -- SMS notifications (for emergencies)
        sms_notifications BOOLEAN DEFAULT false,
        sms_emergency_only BOOLEAN DEFAULT true,
        
        -- In-app notifications
        inapp_notifications BOOLEAN DEFAULT true,
        inapp_booking_updates BOOLEAN DEFAULT true,
        inapp_review_received BOOLEAN DEFAULT true,
        inapp_message_received BOOLEAN DEFAULT true,
        
        -- Frequency settings
        notification_frequency VARCHAR(20) DEFAULT 'immediate' CHECK (notification_frequency IN ('immediate', 'daily', 'weekly')),
        
        -- Marketing preferences
        marketing_emails BOOLEAN DEFAULT false,
        marketing_push BOOLEAN DEFAULT false,
        
        -- Privacy settings
        show_online_status BOOLEAN DEFAULT true,
        allow_profile_visibility BOOLEAN DEFAULT true,
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Constraints
        UNIQUE(user_id)
      )
    `);

    // Create index for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id 
      ON notification_preferences(user_id)
    `);

    // Create default notification preferences for existing users
    await query(`
      INSERT INTO notification_preferences (user_id)
      SELECT id FROM users 
      WHERE id NOT IN (SELECT user_id FROM notification_preferences)
    `);

    console.log('✅ notification_preferences table created successfully');
    console.log('✅ Default preferences added for existing users');
    
  } catch (error) {
    console.error('❌ Failed to create notification_preferences table:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createNotificationPreferencesTable()
    .then(() => {
      console.log('🎉 Notification preferences migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createNotificationPreferencesTable };