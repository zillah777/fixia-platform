const { Pool } = require('pg');
require('dotenv').config();

// Database config
const pool = new Pool({
  host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
  port: process.env.DB_PORT || process.env.PGPORT || 5432,
  user: process.env.DB_USER || process.env.PGUSER || 'postgres',
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
  database: process.env.DB_NAME || process.env.PGDATABASE || 'fixia_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function testUser() {
  try {
    console.log('🔍 Verificando usuario en base de datos...');
    
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, user_type, is_active, created_at FROM users WHERE email = $1',
      ['mmata@chubut.gov.ar']
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Usuario encontrado:');
      console.log(result.rows[0]);
    } else {
      console.log('❌ Usuario NO encontrado con email: mmata@chubut.gov.ar');
      
      // Ver todos los usuarios para debug
      const allUsers = await pool.query('SELECT email, first_name, last_name FROM users LIMIT 10');
      console.log('\n📝 Primeros 10 usuarios en la base de datos:');
      allUsers.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - ${user.first_name} ${user.last_name}`);
      });
    }
    
  } catch (error) {
    console.error('🚨 Error:', error.message);
  } finally {
    await pool.end();
  }
}

testUser();