const { pool, query } = require('../src/config/database');

async function cleanupDuplicateCategories() {
  console.log('🧹 Starting duplicate categories cleanup...');
  
  try {
    // Step 1: Find and display duplicates
    console.log('\n📊 Finding duplicate categories...');
    const duplicatesQuery = `
      SELECT name, COUNT(*) as count, array_agg(id) as ids
      FROM categories
      WHERE is_active = true
      GROUP BY name
      HAVING COUNT(*) > 1
      ORDER BY count DESC, name ASC
    `;
    
    const duplicatesResult = await query(duplicatesQuery);
    const duplicates = duplicatesResult.rows;
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate categories found!');
      return;
    }
    
    console.log(`\n⚠️  Found ${duplicates.length} categories with duplicates:`);
    duplicates.forEach(dup => {
      console.log(`  - "${dup.name}": ${dup.count} copies (IDs: ${dup.ids.join(', ')})`);
    });
    
    // Step 2: Count total duplicate records to delete
    let totalToDelete = 0;
    duplicates.forEach(dup => {
      totalToDelete += dup.count - 1; // Keep one, delete the rest
    });
    
    console.log(`\n🗑️  Will delete ${totalToDelete} duplicate records`);
    
    // Step 3: Clean up duplicates (keep the oldest record for each category)
    console.log('\n🔧 Cleaning up duplicates...');
    
    for (const duplicate of duplicates) {
      const categoryName = duplicate.name;
      const allIds = duplicate.ids;
      
      // Keep the record with the smallest ID (oldest), mark others as inactive first
      const idsToDeactivate = allIds.slice(1); // Skip the first (oldest) ID
      
      console.log(`\n  Processing "${categoryName}":`);
      console.log(`    Keeping ID: ${allIds[0]}`);
      console.log(`    Deactivating IDs: ${idsToDeactivate.join(', ')}`);
      
      // Deactivate duplicates instead of deleting (safer approach)
      if (idsToDeactivate.length > 0) {
        const deactivateQuery = `
          UPDATE categories 
          SET is_active = false, 
              name = name || ' (DUPLICATE_' || id || ')',
              updated_at = NOW()
          WHERE id = ANY($1)
        `;
        
        await query(deactivateQuery, [idsToDeactivate]);
        console.log(`    ✅ Deactivated ${idsToDeactivate.length} duplicates`);
      }
    }
    
    // Step 4: Verify cleanup
    console.log('\n🔍 Verifying cleanup...');
    const verifyResult = await query(duplicatesQuery);
    const remainingDuplicates = verifyResult.rows;
    
    if (remainingDuplicates.length === 0) {
      console.log('✅ All duplicates cleaned up successfully!');
    } else {
      console.log(`⚠️  ${remainingDuplicates.length} categories still have duplicates:`);
      remainingDuplicates.forEach(dup => {
        console.log(`  - "${dup.name}": ${dup.count} copies`);
      });
    }
    
    // Step 5: Show final category count
    const totalResult = await query('SELECT COUNT(*) as count FROM categories WHERE is_active = true');
    const totalActive = totalResult.rows[0].count;
    console.log(`\n📊 Final result: ${totalActive} active categories`);
    
  } catch (error) {
    console.error('❌ Error cleaning up duplicates:', error);
    throw error;
  }
}

// Run the cleanup
cleanupDuplicateCategories()
  .then(() => {
    console.log('\n🎉 Cleanup completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Cleanup failed:', error);
    process.exit(1);
  });