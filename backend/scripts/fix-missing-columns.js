const { query } = require('../src/config/database');

const addMissingColumns = async () => {
  try {
    console.log('🔄 Adding missing columns to users table...');

    // Add latitude and longitude columns if they don't exist
    try {
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8)`);
      console.log('✅ Added latitude column');
    } catch (err) {
      console.log('latitude column may already exist:', err.message);
    }

    try {
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8)`);
      console.log('✅ Added longitude column');
    } catch (err) {
      console.log('longitude column may already exist:', err.message);
    }

    // Create index for location if it doesn't exist
    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude)`);
      console.log('✅ Created location index');
    } catch (err) {
      console.log('Location index may already exist:', err.message);
    }

    console.log('✅ Missing columns fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error adding missing columns:', error);
    throw error;
  }
};

const runFix = async () => {
  try {
    await addMissingColumns();
    console.log('🎉 Database fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Database fix failed:', error);
    process.exit(1);
  }
};

runFix();