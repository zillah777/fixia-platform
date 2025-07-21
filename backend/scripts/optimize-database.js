const { query } = require('../src/config/database');
const logger = require('../src/utils/logger');

/**
 * Database Optimization Script
 * ULTRA-CONSERVATIVE: Only adds indexes if they don't exist
 * Does NOT modify existing structures
 */

// Performance indexes to add (only if they don't exist)
const PERFORMANCE_INDEXES = [
  // Services table optimization
  {
    table: 'services',
    name: 'idx_services_category_active',
    columns: ['category', 'is_active'],
    type: 'btree',
    purpose: 'Optimize service filtering by category and active status'
  },
  {
    table: 'services',
    name: 'idx_services_price_range',
    columns: ['price'],
    type: 'btree',
    purpose: 'Optimize price range queries'
  },
  {
    table: 'services',
    name: 'idx_services_location',
    columns: ['location'],
    type: 'btree',
    purpose: 'Optimize location-based searches'
  },
  {
    table: 'services',
    name: 'idx_services_provider_active',
    columns: ['provider_id', 'is_active'],
    type: 'btree',
    purpose: 'Optimize provider service listings'
  },
  {
    table: 'services',
    name: 'idx_services_created_desc',
    columns: ['created_at DESC'],
    type: 'btree',
    purpose: 'Optimize newest services queries'
  },

  // Users table optimization
  {
    table: 'users',
    name: 'idx_users_email_unique',
    columns: ['email'],
    type: 'unique',
    purpose: 'Ensure email uniqueness and fast login'
  },
  {
    table: 'users',
    name: 'idx_users_type_location',
    columns: ['user_type', 'location'],
    type: 'btree',
    purpose: 'Optimize provider searches by location'
  },

  // Service requests optimization
  {
    table: 'service_requests',
    name: 'idx_service_requests_service_status',
    columns: ['service_id', 'status'],
    type: 'btree',
    purpose: 'Optimize service request filtering'
  },
  {
    table: 'service_requests',
    name: 'idx_service_requests_client_id',
    columns: ['client_id', 'created_at DESC'],
    type: 'btree',
    purpose: 'Optimize client request history'
  },
  {
    table: 'service_requests',
    name: 'idx_service_requests_provider_id',
    columns: ['provider_id', 'status'],
    type: 'btree',
    purpose: 'Optimize provider request management'
  },

  // Reviews optimization
  {
    table: 'reviews',
    name: 'idx_reviews_service_rating',
    columns: ['service_id', 'rating'],
    type: 'btree',
    purpose: 'Optimize service rating calculations'
  },
  {
    table: 'reviews',
    name: 'idx_reviews_provider_rating',
    columns: ['provider_id', 'rating'],
    type: 'btree',
    purpose: 'Optimize provider rating calculations'
  },

  // Chat messages optimization
  {
    table: 'chat_messages',
    name: 'idx_chat_messages_chat_timestamp',
    columns: ['chat_id', 'created_at DESC'],
    type: 'btree',
    purpose: 'Optimize chat message retrieval'
  }
];

// Check if index exists
const indexExists = async (tableName, indexName) => {
  try {
    const result = await query(`
      SELECT 1 
      FROM pg_indexes 
      WHERE tablename = $1 AND indexname = $2
    `, [tableName, indexName]);
    
    return result.rows.length > 0;
  } catch (error) {
    logger.error('Error checking index existence', error, { table: tableName, index: indexName });
    return false;
  }
};

// Check if table exists
const tableExists = async (tableName) => {
  try {
    const result = await query(`
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_name = $1 AND table_schema = 'public'
    `, [tableName]);
    
    return result.rows.length > 0;
  } catch (error) {
    logger.error('Error checking table existence', error, { table: tableName });
    return false;
  }
};

// Create index safely
const createIndexSafely = async (indexConfig) => {
  const { table, name, columns, type, purpose } = indexConfig;
  
  try {
    // Check if table exists
    const tableExistsResult = await tableExists(table);
    if (!tableExistsResult) {
      logger.warn(`Table ${table} does not exist, skipping index ${name}`);
      return { success: false, reason: 'table_not_found' };
    }

    // Check if index already exists
    const exists = await indexExists(table, name);
    if (exists) {
      logger.info(`Index ${name} already exists, skipping`);
      return { success: true, reason: 'already_exists' };
    }

    // Create the index
    let createSQL;
    if (type === 'unique') {
      createSQL = `CREATE UNIQUE INDEX CONCURRENTLY ${name} ON ${table} (${columns.join(', ')})`;
    } else {
      createSQL = `CREATE INDEX CONCURRENTLY ${name} ON ${table} (${columns.join(', ')})`;
    }

    logger.info(`Creating index: ${name}`, { table, purpose });
    await query(createSQL);
    
    logger.info(`Index created successfully: ${name}`);
    return { success: true, reason: 'created' };

  } catch (error) {
    logger.error(`Failed to create index ${name}`, error, { table, columns });
    return { success: false, reason: 'error', error: error.message };
  }
};

// Analyze table statistics (helpful for query planning)
const analyzeTable = async (tableName) => {
  try {
    const tableExistsResult = await tableExists(tableName);
    if (!tableExistsResult) {
      return { success: false, reason: 'table_not_found' };
    }

    await query(`ANALYZE ${tableName}`);
    logger.info(`Table analyzed: ${tableName}`);
    return { success: true };
  } catch (error) {
    logger.error(`Failed to analyze table ${tableName}`, error);
    return { success: false, error: error.message };
  }
};

// Get database statistics
const getDatabaseStats = async () => {
  try {
    const stats = {};

    // Get table sizes
    const tableSizes = await query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `);
    stats.tableSizes = tableSizes.rows;

    // Get index usage
    const indexUsage = await query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      ORDER BY idx_tup_read DESC
    `);
    stats.indexUsage = indexUsage.rows;

    // Get slow queries info (if available)
    const slowQueries = await query(`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows
      FROM pg_stat_statements 
      WHERE query NOT LIKE '%pg_stat_statements%'
      ORDER BY total_time DESC 
      LIMIT 10
    `).catch(() => ({ rows: [] })); // pg_stat_statements might not be enabled
    stats.slowQueries = slowQueries.rows;

    return stats;
  } catch (error) {
    logger.error('Error getting database statistics', error);
    return null;
  }
};

// Main optimization function
const optimizeDatabase = async (options = {}) => {
  const {
    dryRun = false,
    skipAnalyze = false,
    includeStats = false
  } = options;

  logger.info('Starting database optimization', { dryRun, skipAnalyze, includeStats });

  const results = {
    indexes: {
      created: 0,
      skipped: 0,
      failed: 0,
      details: []
    },
    analysis: {
      tablesAnalyzed: 0,
      failed: 0
    },
    stats: null
  };

  // Create performance indexes
  for (const indexConfig of PERFORMANCE_INDEXES) {
    if (dryRun) {
      logger.info(`[DRY RUN] Would create index: ${indexConfig.name}`, {
        table: indexConfig.table,
        purpose: indexConfig.purpose
      });
      results.indexes.details.push({
        name: indexConfig.name,
        action: 'dry_run',
        table: indexConfig.table
      });
      continue;
    }

    const result = await createIndexSafely(indexConfig);
    results.indexes.details.push({
      name: indexConfig.name,
      table: indexConfig.table,
      ...result
    });

    if (result.success) {
      if (result.reason === 'created') {
        results.indexes.created++;
      } else {
        results.indexes.skipped++;
      }
    } else {
      results.indexes.failed++;
    }

    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Analyze tables for better query planning
  if (!skipAnalyze && !dryRun) {
    const tablesToAnalyze = [...new Set(PERFORMANCE_INDEXES.map(idx => idx.table))];
    
    for (const table of tablesToAnalyze) {
      const result = await analyzeTable(table);
      if (result.success) {
        results.analysis.tablesAnalyzed++;
      } else {
        results.analysis.failed++;
      }
    }
  }

  // Gather database statistics
  if (includeStats) {
    results.stats = await getDatabaseStats();
  }

  logger.info('Database optimization completed', results);
  return results;
};

// CLI interface
const main = async () => {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const skipAnalyze = args.includes('--skip-analyze');
  const includeStats = args.includes('--stats');
  const help = args.includes('--help');

  if (help) {
    console.log(`
Database Optimization Tool

Usage: node scripts/optimize-database.js [options]

Options:
  --dry-run        Show what would be done without making changes
  --skip-analyze   Skip table analysis step
  --stats          Include database statistics in output
  --help           Show this help message

Examples:
  node scripts/optimize-database.js                    # Full optimization
  node scripts/optimize-database.js --dry-run          # Preview changes
  node scripts/optimize-database.js --stats            # Include statistics
    `);
    process.exit(0);
  }

  try {
    const results = await optimizeDatabase({
      dryRun,
      skipAnalyze,
      includeStats
    });

    console.log('\n=== Database Optimization Results ===');
    console.log(`Indexes created: ${results.indexes.created}`);
    console.log(`Indexes skipped: ${results.indexes.skipped}`);
    console.log(`Indexes failed: ${results.indexes.failed}`);
    console.log(`Tables analyzed: ${results.analysis.tablesAnalyzed}`);

    if (results.stats) {
      console.log('\n=== Database Statistics ===');
      console.log('Table sizes:', results.stats.tableSizes.slice(0, 5));
      console.log('Most used indexes:', results.stats.indexUsage.slice(0, 5));
    }

    process.exit(0);
  } catch (error) {
    logger.error('Database optimization failed', error);
    console.error('Optimization failed:', error.message);
    process.exit(1);
  }
};

// Export for use as module
module.exports = {
  optimizeDatabase,
  createIndexSafely,
  getDatabaseStats,
  PERFORMANCE_INDEXES
};

// Run as script if called directly
if (require.main === module) {
  main();
}