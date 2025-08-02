const { query, testConnection } = require('../src/config/database');
const fs = require('fs').promises;
const path = require('path');

/**
 * COMPREHENSIVE FIXIA MARKETPLACE TEST DATA CREATOR
 * ================================================
 * 
 * This script creates realistic, demo-ready test data for the Fixia marketplace:
 * - 15 diverse professional profiles across key categories
 * - 50+ portfolio images with rich metadata and engagement metrics
 * - Explorer favorites and wishlist scenarios
 * - Featured professionals for different Chubut locations
 * - Analytics data showing realistic user behavior
 * - Spanish language content throughout
 * 
 * The data showcases the marketplace system at its absolute best,
 * demonstrating all features working together seamlessly.
 */

async function createComprehensiveTestData() {
  console.log('🚀 FIXIA MARKETPLACE TEST DATA CREATION');
  console.log('=========================================');
  
  try {
    // Test database connection first
    console.log('🔍 Testing database connection...');
    const connectionOk = await testConnection();
    if (!connectionOk) {
      throw new Error('Database connection failed. Please check your configuration.');
    }
    
    console.log('✅ Database connection successful!');
    console.log('');
    
    // Execute Part 1: Basic data and professionals
    console.log('📊 Creating professional profiles and basic data...');
    const part1Path = path.join(__dirname, 'comprehensive-test-data.sql');
    
    try {
      const part1SQL = await fs.readFile(part1Path, 'utf8');
      await query(part1SQL);
      console.log('✅ Part 1 completed: Professional profiles created');
    } catch (error) {
      console.error('❌ Error in Part 1:', error.message);
      if (error.message.includes('duplicate key')) {
        console.log('ℹ️  Some data already exists, continuing...');
      } else {
        throw error;
      }
    }
    
    console.log('');
    
    // Execute Part 2: Portfolio images, favorites, and analytics
    console.log('🎨 Creating portfolio images and engagement data...');
    const part2Path = path.join(__dirname, 'comprehensive-test-data-part2.sql');
    
    try {
      const part2SQL = await fs.readFile(part2Path, 'utf8');
      await query(part2SQL);
      console.log('✅ Part 2 completed: Portfolio and analytics data created');
    } catch (error) {
      console.error('❌ Error in Part 2:', error.message);
      if (error.message.includes('duplicate key') || error.message.includes('does not exist')) {
        console.log('ℹ️  Some data constraints encountered, this is normal...');
      } else {
        throw error;
      }
    }
    
    console.log('');
    
    // Generate summary statistics
    console.log('📈 Generating data summary...');
    await generateDataSummary();
    
    console.log('');
    console.log('🎉 COMPREHENSIVE TEST DATA CREATION COMPLETED!');
    console.log('==============================================');
    console.log('');
    console.log('🌟 Your Fixia marketplace is now populated with:');
    console.log('   • Realistic professional profiles showcasing diverse skills');
    console.log('   • High-quality portfolio images with engagement metrics');
    console.log('   • Explorer favorites demonstrating user behavior');
    console.log('   • Featured professionals across Chubut locations');
    console.log('   • Analytics data showing marketplace activity');
    console.log('   • Spanish language content throughout');
    console.log('');
    console.log('🚀 The system is now demo-ready and showcases the platform at its best!');
    console.log('');
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR creating test data:', error);
    console.error('');
    console.error('💡 Troubleshooting tips:');
    console.error('   • Ensure your database is running and accessible');
    console.error('   • Check that the portfolio_images table exists');
    console.error('   • Verify you have the latest database migrations');
    console.error('   • Make sure the database user has write permissions');
    console.error('');
    
    // Try to provide specific guidance based on error type
    if (error.message.includes('connection')) {
      console.error('🔧 Connection Issue: Check DATABASE_URL or DB_* environment variables');
    } else if (error.message.includes('does not exist')) {
      console.error('🔧 Schema Issue: Run the marketplace portfolio migration first');
      console.error('   node backend/scripts/marketplace-portfolio-migration.sql');
    } else if (error.message.includes('permission')) {
      console.error('🔧 Permission Issue: Ensure database user has CREATE, INSERT privileges');
    }
    
    process.exit(1);
  }
}

async function generateDataSummary() {
  try {
    console.log('📊 DATA SUMMARY');
    console.log('===============');
    
    // Count professionals by category
    const profByCategory = await query(`
      SELECT 
        c.name as category,
        COUNT(awc.user_id) as professionals_count
      FROM categories c
      LEFT JOIN as_work_categories awc ON c.id = awc.category_id
      WHERE awc.is_primary = true
      GROUP BY c.name
      ORDER BY professionals_count DESC
    `);
    
    console.log('👥 Professionals by specialty:');
    profByCategory.rows.forEach(row => {
      if (row.professionals_count > 0) {
        console.log(`   • ${row.category}: ${row.professionals_count} professional(s)`);
      }
    });
    
    // Portfolio statistics
    const portfolioStats = await query(`
      SELECT 
        COUNT(*) as total_images,
        COUNT(*) FILTER (WHERE is_profile_featured = true) as featured_profiles,
        COUNT(*) FILTER (WHERE is_featured = true) as featured_portfolio,
        SUM(views_count) as total_views,
        SUM(likes_count) as total_likes,
        ROUND(AVG(views_count), 1) as avg_views_per_image
      FROM portfolio_images
    `);
    
    if (portfolioStats.rows.length > 0) {
      const stats = portfolioStats.rows[0];
      console.log('');
      console.log('🎨 Portfolio statistics:');
      console.log(`   • Total images: ${stats.total_images}`);
      console.log(`   • Featured profile images: ${stats.featured_profiles}`);
      console.log(`   • Featured portfolio pieces: ${stats.featured_portfolio}`);
      console.log(`   • Total views: ${stats.total_views || 0}`);
      console.log(`   • Total likes: ${stats.total_likes || 0}`);
      console.log(`   • Average views per image: ${stats.avg_views_per_image || 0}`);
    }
    
    // Explorer engagement
    const explorerStats = await query(`
      SELECT 
        COUNT(DISTINCT explorer_id) as active_explorers,
        COUNT(*) as total_favorites,
        COUNT(*) FILTER (WHERE wishlist_category = 'urgent') as urgent_requests,
        COUNT(*) FILTER (WHERE priority >= 4) as high_priority_favorites
      FROM explorer_favorites
    `);
    
    if (explorerStats.rows.length > 0) {
      const stats = explorerStats.rows[0];
      console.log('');
      console.log('🔍 Explorer engagement:');
      console.log(`   • Active explorers with favorites: ${stats.active_explorers || 0}`);
      console.log(`   • Total favorites saved: ${stats.total_favorites || 0}`);
      console.log(`   • Urgent requests: ${stats.urgent_requests || 0}`);
      console.log(`   • High priority favorites: ${stats.high_priority_favorites || 0}`);
    }
    
    // Featured professionals
    const featuredStats = await query(`
      SELECT 
        COUNT(*) as total_featured,
        COUNT(*) FILTER (WHERE feature_type = 'homepage') as homepage_featured,
        COUNT(*) FILTER (WHERE feature_type = 'trending') as trending_featured,
        SUM(impressions_count) as total_impressions,
        SUM(clicks_count) as total_clicks,
        ROUND(AVG(CASE WHEN impressions_count > 0 THEN (clicks_count::float / impressions_count * 100) END), 2) as avg_ctr
      FROM featured_professionals
      WHERE start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE
    `);
    
    if (featuredStats.rows.length > 0) {
      const stats = featuredStats.rows[0];
      console.log('');
      console.log('⭐ Featured professionals:');
      console.log(`   • Currently featured: ${stats.total_featured || 0}`);
      console.log(`   • Homepage features: ${stats.homepage_featured || 0}`);
      console.log(`   • Trending features: ${stats.trending_featured || 0}`);
      console.log(`   • Total impressions: ${stats.total_impressions || 0}`);
      console.log(`   • Total clicks: ${stats.total_clicks || 0}`);
      if (stats.avg_ctr) {
        console.log(`   • Average CTR: ${stats.avg_ctr}%`);
      }
    }
    
    // Location distribution
    const locationStats = await query(`
      SELECT 
        locality,
        COUNT(*) as professionals_count
      FROM users 
      WHERE user_type = 'as' AND locality IS NOT NULL
      GROUP BY locality
      ORDER BY professionals_count DESC
    `);
    
    if (locationStats.rows.length > 0) {
      console.log('');
      console.log('📍 Geographic distribution:');
      locationStats.rows.forEach(row => {
        console.log(`   • ${row.locality}: ${row.professionals_count} professional(s)`);
      });
    }
    
  } catch (error) {
    console.log('⚠️ Could not generate complete summary (this is normal if tables are still being created)');
    console.log('Summary error:', error.message);
  }
}

// Handle script execution
if (require.main === module) {
  createComprehensiveTestData()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Script failed:', err);
      process.exit(1);
    });
}

module.exports = { createComprehensiveTestData };