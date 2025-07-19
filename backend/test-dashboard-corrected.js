const { query } = require('./src/config/database');

async function testDashboardQueries() {
  try {
    console.log('Testing corrected dashboard PostgreSQL queries...');
    
    const userId = 1; // Test with a valid user ID
    
    // Test the stats query
    console.log('Testing stats query...');
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT esr.id) FILTER (WHERE esr.status = 'active') as active_service_requests,
        COUNT(DISTINCT eac.id) FILTER (WHERE eac.status = 'service_in_progress') as active_connections,
        COUNT(DISTINCT eac.id) FILTER (WHERE eac.status = 'completed') as completed_services,
        COALESCE(SUM(eac.final_agreed_price) FILTER (WHERE eac.status = 'completed'), 0) as total_spent,
        COUNT(DISTINCT esr.id) as total_requests,
        COALESCE((
          SELECT COUNT(*) 
          FROM chat_messages cm 
          INNER JOIN explorer_as_connections eac2 ON cm.chat_room_id = eac2.chat_room_id 
          WHERE eac2.explorer_id = $1 AND cm.is_read = false AND cm.sender_id != $1
        ), 0) as unread_messages
      FROM users u
      LEFT JOIN explorer_service_requests esr ON u.id = esr.explorer_id
      LEFT JOIN explorer_as_connections eac ON u.id = eac.explorer_id
      WHERE u.id = $1
      GROUP BY u.id
    `;

    const result = await query(statsQuery, [userId]);
    console.log('Stats result:', result.rows[0]);
    
    // Test the activity query
    console.log('Testing activity query...');
    const recentActivityQuery = `
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
      WHERE esr.explorer_id = $1
      
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
      WHERE eac.explorer_id = $1
      
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const recentActivity = await query(recentActivityQuery, [userId]);
    console.log('Activity result count:', recentActivity.rows.length);
    console.log('Activity sample:', recentActivity.rows[0]);
    
    console.log('All dashboard queries work correctly!');
    
  } catch (error) {
    console.error('Dashboard test failed:', error);
  } finally {
    process.exit(0);
  }
}

testDashboardQueries();