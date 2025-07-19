const { pool } = require('./src/config/database');

async function testDashboardQuery() {
  try {
    console.log('Testing dashboard MySQL queries...');
    
    const userId = 1; // Test with a valid user ID
    
    // Test the stats query
    console.log('Testing stats query...');
    const [statsResult] = await pool.execute(`
      SELECT 
        COALESCE(SUM(CASE WHEN esr.status = 'active' THEN 1 ELSE 0 END), 0) as active_service_requests,
        COALESCE(SUM(CASE WHEN eac.status = 'service_in_progress' THEN 1 ELSE 0 END), 0) as active_connections,
        COALESCE(SUM(CASE WHEN eac.status = 'completed' THEN 1 ELSE 0 END), 0) as completed_services,
        COALESCE(SUM(CASE WHEN eac.status = 'completed' THEN eac.final_agreed_price ELSE 0 END), 0) as total_spent,
        COUNT(DISTINCT esr.id) as total_requests,
        COALESCE((
          SELECT COUNT(*) 
          FROM chat_messages cm 
          INNER JOIN explorer_as_connections eac2 ON cm.chat_room_id = eac2.chat_room_id 
          WHERE eac2.explorer_id = ? AND cm.is_read = false AND cm.sender_id != ?
        ), 0) as unread_messages
      FROM users u
      LEFT JOIN explorer_service_requests esr ON u.id = esr.explorer_id
      LEFT JOIN explorer_as_connections eac ON u.id = eac.explorer_id
      WHERE u.id = ?
    `, [userId, userId, userId]);

    console.log('Stats result:', statsResult[0]);
    
    // Test the activity query
    console.log('Testing activity query...');
    const [recentActivity] = await pool.execute(`
      SELECT 
        'service_request' as activity_type,
        esr.id,
        esr.title as service_title,
        esr.status,
        esr.created_at,
        esr.urgency,
        c.name as category_name,
        (SELECT COUNT(*) FROM as_service_interests asi WHERE asi.request_id = esr.id) as interest_count
      FROM explorer_service_requests esr
      LEFT JOIN categories c ON esr.category_id = c.id
      WHERE esr.explorer_id = ?
      
      UNION ALL
      
      SELECT 
        'connection' as activity_type,
        eac.id,
        CONCAT('Conexión con ', u.first_name, ' ', u.last_name) as service_title,
        eac.status,
        eac.created_at,
        'medium' as urgency,
        'Conexión AS' as category_name,
        0 as interest_count
      FROM explorer_as_connections eac
      LEFT JOIN users u ON eac.as_id = u.id
      WHERE eac.explorer_id = ?
      
      ORDER BY created_at DESC
      LIMIT 10
    `, [userId, userId]);

    console.log('Activity result:', recentActivity);
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testDashboardQuery();