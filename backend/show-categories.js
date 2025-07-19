const { query } = require('./src/config/database');

async function showCategories() {
  try {
    const result = await query(`
      SELECT DISTINCT name, group_name 
      FROM categories 
      WHERE is_active = TRUE 
      ORDER BY group_name, name 
      LIMIT 50
    `);
    
    console.log('Distinct categories by group:');
    let currentGroup = '';
    
    result.rows.forEach(row => {
      if (row.group_name !== currentGroup) {
        console.log('\n📁', row.group_name + ':');
        currentGroup = row.group_name;
      }
      console.log('  -', row.name);
    });
    
    // Also get count by group
    const countResult = await query(`
      SELECT group_name, COUNT(DISTINCT name) as unique_count, COUNT(*) as total_count
      FROM categories 
      WHERE is_active = TRUE 
      GROUP BY group_name 
      ORDER BY group_name
    `);
    
    console.log('\n\n📊 Categories summary:');
    countResult.rows.forEach(row => {
      console.log(`- ${row.group_name}: ${row.unique_count} unique (${row.total_count} total)`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

showCategories();