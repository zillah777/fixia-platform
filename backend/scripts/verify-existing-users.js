const { query } = require('../src/config/database');

async function verifyExistingUsers() {
  try {
    console.log('🔄 Verificando usuarios existentes...');
    
    // Update all existing users to be verified if email verification is not required
    const shouldAutoVerify = process.env.REQUIRE_EMAIL_VERIFICATION !== 'true';
    
    if (shouldAutoVerify) {
      const result = await query(`
        UPDATE users 
        SET email_verified = true, updated_at = CURRENT_TIMESTAMP 
        WHERE email_verified = false OR email_verified IS NULL
        RETURNING id, email, first_name, last_name
      `);
      
      console.log(`✅ ${result.rows.length} usuarios verificados automáticamente:`);
      result.rows.forEach(user => {
        console.log(`   - ${user.first_name} ${user.last_name} (${user.email})`);
      });
    } else {
      console.log('⚠️  REQUIRE_EMAIL_VERIFICATION está habilitado, usuarios deben verificar manualmente');
    }
    
    // Show current users status
    const statusResult = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE email_verified = true) as verified_users,
        COUNT(*) FILTER (WHERE email_verified = false OR email_verified IS NULL) as unverified_users
      FROM users
    `);
    
    const stats = statusResult.rows[0];
    console.log('\n📊 Estado actual de usuarios:');
    console.log(`   Total: ${stats.total_users}`);
    console.log(`   Verificados: ${stats.verified_users}`);
    console.log(`   Sin verificar: ${stats.unverified_users}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error al verificar usuarios:', error);
    process.exit(1);
  }
}

verifyExistingUsers();