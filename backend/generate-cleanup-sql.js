const { query, testConnection } = require('./src/config/database');
const fs = require('fs');

async function generateCleanupSQL() {
  try {
    console.log('🔍 Connecting to PostgreSQL database...');
    
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    console.log('\n📝 GENERATING CLEANUP SQL SCRIPT\n');

    // Get duplicate information
    const duplicatesQuery = `
      WITH normalized_categories AS (
        SELECT 
          id,
          name,
          LOWER(TRIM(name)) as normalized_name
        FROM categories 
        WHERE name IS NOT NULL AND TRIM(name) != ''
      ),
      duplicate_groups AS (
        SELECT normalized_name, COUNT(*) as duplicate_count
        FROM normalized_categories
        GROUP BY normalized_name
        HAVING COUNT(*) > 1
      )
      SELECT 
        nc.normalized_name,
        MIN(nc.id) as keep_id,
        ARRAY_AGG(nc.id ORDER BY nc.id) as all_ids,
        COUNT(*) as total_count
      FROM normalized_categories nc
      JOIN duplicate_groups dg ON nc.normalized_name = dg.normalized_name
      GROUP BY nc.normalized_name
      ORDER BY nc.normalized_name ASC
    `;

    const duplicatesResult = await query(duplicatesQuery);
    
    if (duplicatesResult.rows.length === 0) {
      console.log('✅ No duplicates found to clean up.');
      return;
    }

    // Generate SQL script
    let sqlScript = `-- =====================================================
-- FIXIA CATEGORIES DUPLICATE CLEANUP SCRIPT
-- Generated on: ${new Date().toISOString()}
-- =====================================================
-- 
-- This script will:
-- 1. Update foreign key references to point to the kept category IDs
-- 2. Delete duplicate category records
-- 
-- IMPORTANT: 
-- - BACKUP your database before running this script!
-- - Review each section before executing
-- - Run in a transaction for safety
-- 
-- =====================================================

BEGIN;

-- Backup information (for reference)
-- Total categories before cleanup: ${await getTotalCount()}
-- Unique category names: ${duplicatesResult.rows.length}
-- Duplicate records to delete: ${await getDuplicateCount()}

-- =====================================================
-- SECTION 1: UPDATE FOREIGN KEY REFERENCES
-- =====================================================

`;

    // Add foreign key updates for each table
    const foreignKeyTables = [
      'services',
      'as_work_categories', 
      'as_portfolio',
      'explorer_service_requests',
      'smart_search_requests'
    ];

    for (const table of foreignKeyTables) {
      sqlScript += `-- Update ${table} references\n`;
      
      for (const group of duplicatesResult.rows) {
        const keepId = group.keep_id;
        const allIds = group.all_ids;
        const deleteIds = allIds.filter(id => id !== keepId);
        
        if (deleteIds.length > 0) {
          sqlScript += `UPDATE ${table} SET category_id = ${keepId} WHERE category_id IN (${deleteIds.join(', ')}); -- ${group.normalized_name}\n`;
        }
      }
      sqlScript += '\n';
    }

    sqlScript += `-- =====================================================
-- SECTION 2: DELETE DUPLICATE CATEGORIES
-- =====================================================

`;

    for (const group of duplicatesResult.rows) {
      const keepId = group.keep_id;
      const allIds = group.all_ids;
      const deleteIds = allIds.filter(id => id !== keepId);
      
      if (deleteIds.length > 0) {
        sqlScript += `-- Delete duplicates for "${group.normalized_name}" (keep ID: ${keepId})\n`;
        sqlScript += `DELETE FROM categories WHERE id IN (${deleteIds.join(', ')});\n\n`;
      }
    }

    sqlScript += `-- =====================================================
-- SECTION 3: VERIFICATION QUERIES
-- =====================================================

-- Check remaining categories
SELECT COUNT(*) as remaining_categories FROM categories;

-- Check for any remaining duplicates
SELECT 
  LOWER(TRIM(name)) as normalized_name,
  COUNT(*) as count
FROM categories 
GROUP BY LOWER(TRIM(name))
HAVING COUNT(*) > 1;

-- Check final category list
SELECT id, name, group_name, is_active 
FROM categories 
ORDER BY id;

-- =====================================================
-- SECTION 4: COMMIT OR ROLLBACK
-- =====================================================

-- If everything looks good, commit:
COMMIT;

-- If there are issues, rollback instead:
-- ROLLBACK;

-- =====================================================
-- END OF CLEANUP SCRIPT
-- =====================================================
`;

    // Write to file
    const scriptPath = '/mnt/c/xampp/htdocs/fixia.com.ar/backend/cleanup-categories.sql';
    fs.writeFileSync(scriptPath, sqlScript);

    console.log('✅ SQL cleanup script generated successfully!');
    console.log(`📁 Script saved to: ${scriptPath}`);
    console.log('\n📋 Script Summary:');
    
    duplicatesResult.rows.forEach((group, index) => {
      const deleteCount = group.all_ids.length - 1; // -1 because we keep one
      console.log(`   ${index + 1}. "${group.normalized_name}": Keep ID ${group.keep_id}, delete ${deleteCount} duplicates`);
    });

    const totalToDelete = duplicatesResult.rows.reduce((sum, group) => sum + (group.all_ids.length - 1), 0);
    console.log(`\n📊 Total: Delete ${totalToDelete} duplicate records, keep ${duplicatesResult.rows.length} unique categories`);

    console.log('\n🚀 Next steps:');
    console.log('1. Review the generated SQL script');
    console.log('2. Backup your database');
    console.log('3. Execute the script in your PostgreSQL client');
    console.log('4. Verify the results using the verification queries');

  } catch (error) {
    console.error('❌ Error generating cleanup SQL:', error);
  } finally {
    process.exit(0);
  }
}

async function getTotalCount() {
  try {
    const result = await query('SELECT COUNT(*) as count FROM categories');
    return result.rows[0].count;
  } catch (error) {
    return 'unknown';
  }
}

async function getDuplicateCount() {
  try {
    const result = await query(`
      SELECT COUNT(*) - COUNT(DISTINCT LOWER(TRIM(name))) as duplicates
      FROM categories 
      WHERE name IS NOT NULL AND TRIM(name) != ''
    `);
    return result.rows[0].duplicates;
  } catch (error) {
    return 'unknown';
  }
}

generateCleanupSQL();