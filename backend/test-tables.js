const { query } = require('./src/config/database');

async function testTables() {
  try {
    console.log('Testing if Fixia tables exist...');
    
    // Check users table
    console.log('Checking users table...');
    const users = await query('SELECT COUNT(*) FROM users LIMIT 1');
    console.log('Users table exists, count:', users.rows[0].count);
    
    // Check explorer_service_requests table
    console.log('Checking explorer_service_requests table...');
    const esr = await query('SELECT COUNT(*) FROM explorer_service_requests LIMIT 1');
    console.log('explorer_service_requests table exists, count:', esr.rows[0].count);
    
    // Check categories table
    console.log('Checking categories table...');
    const categories = await query('SELECT COUNT(*) FROM categories LIMIT 1');
    console.log('categories table exists, count:', categories.rows[0].count);
    
    console.log('All tables exist!');
    
  } catch (error) {
    console.error('Table test failed:', error.message);
    
    // Check what tables exist
    try {
      console.log('Checking what tables exist...');
      const tables = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      console.log('Existing tables:', tables.rows.map(r => r.table_name));
    } catch (err) {
      console.error('Could not check tables:', err.message);
    }
  } finally {
    process.exit(0);
  }
}

testTables();