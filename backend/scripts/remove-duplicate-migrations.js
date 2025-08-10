const fs = require('fs');
const path = require('path');
const { logger } = require('../src/utils/smartLogger');

/**
 * DUPLICATE MIGRATION REMOVAL SCRIPT
 * 
 * Identifies and safely removes duplicate migration scripts based on the audit findings.
 * This script addresses 5 duplicate migration scripts that create the same tables.
 */

class DuplicateMigrationRemover {
  constructor(scriptsPath = './') {
    this.scriptsPath = scriptsPath;
    this.migrationFiles = [];
    this.duplicateAnalysis = [];
    this.removalPlan = [];
  }

  async analyzeMigrations() {
    console.log('🔍 Analyzing migration files for duplicates...\n');
    
    try {
      // Get all migration files
      const files = fs.readdirSync(this.scriptsPath)
        .filter(file => file.startsWith('migrate') && file.endsWith('.js'))
        .sort();

      console.log(`📋 Found ${files.length} migration files:`);
      files.forEach(file => console.log(`   - ${file}`));

      this.migrationFiles = files;
      
      // Analyze each migration file
      const migrationAnalysis = {};
      
      for (const file of files) {
        const analysis = await this.analyzeMigrationFile(file);
        migrationAnalysis[file] = analysis;
      }

      // Identify duplicates based on table creation patterns
      await this.identifyDuplicates(migrationAnalysis);
      
      return this.duplicateAnalysis;

    } catch (error) {
      logger.error('Error analyzing migrations:', error);
      throw error;
    }
  }

  async analyzeMigrationFile(filename) {
    const filePath = path.join(this.scriptsPath, filename);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract key patterns
      const analysis = {
        filename,
        size: content.length,
        tables: [],
        functions: [],
        indexes: [],
        hasBasicTables: false,
        hasExtendedTables: false,
        hasASSystem: false,
        hasExplorerSystem: false,
        hasChatSystem: false,
        hasPromotionalSystem: false,
        creationDate: fs.statSync(filePath).mtime
      };

      // Find table creations
      const tableMatches = content.match(/CREATE TABLE IF NOT EXISTS (\w+)/g);
      if (tableMatches) {
        analysis.tables = tableMatches.map(match => 
          match.replace('CREATE TABLE IF NOT EXISTS ', '')
        );
      }

      // Find function creations
      const functionMatches = content.match(/async function (\w+)/g);
      if (functionMatches) {
        analysis.functions = functionMatches.map(match => 
          match.replace('async function ', '')
        );
      }

      // Find index creations
      const indexMatches = content.match(/CREATE INDEX[^;]+/g);
      if (indexMatches) {
        analysis.indexes = indexMatches;
      }

      // Check for system patterns
      analysis.hasBasicTables = analysis.tables.includes('users') && 
                              analysis.tables.includes('services') && 
                              analysis.tables.includes('bookings');
      
      analysis.hasExtendedTables = analysis.functions.includes('createExtendedTables') ||
                                 analysis.tables.includes('subscriptions');
      
      analysis.hasASSystem = analysis.functions.includes('createASPremiumFeatures') ||
                           analysis.tables.includes('as_work_locations');
      
      analysis.hasExplorerSystem = analysis.functions.includes('createExplorerSystem') ||
                                 analysis.tables.includes('explorer_service_requests');
      
      analysis.hasChatSystem = analysis.functions.includes('createChatSystem') ||
                             analysis.tables.includes('chat_rooms');
      
      analysis.hasPromotionalSystem = analysis.functions.includes('createPromotionalSystem') ||
                                    analysis.tables.includes('promotional_campaigns');

      return analysis;

    } catch (error) {
      logger.error(`Error analyzing ${filename}:`, error);
      return { filename, error: error.message };
    }
  }

  async identifyDuplicates(migrationAnalysis) {
    console.log('\n🔍 Identifying duplicate migration patterns...\n');
    
    const filesList = Object.values(migrationAnalysis);
    
    // Group migrations by functionality
    const groups = {
      basic: [],
      complete: [],
      extended: [],
      frontend_compatible: [],
      specialized: []
    };

    for (const analysis of filesList) {
      if (analysis.error) continue;

      // Classify migrations
      if (analysis.filename.includes('complete-system')) {
        groups.complete.push(analysis);
      } else if (analysis.filename.includes('frontend-compatible')) {
        groups.frontend_compatible.push(analysis);
      } else if (analysis.filename.includes('extended')) {
        groups.extended.push(analysis);
      } else if (analysis.hasBasicTables && analysis.tables.length <= 10) {
        groups.basic.push(analysis);
      } else {
        groups.specialized.push(analysis);
      }
    }

    console.log('📊 Migration classification:');
    for (const [group, migrations] of Object.entries(groups)) {
      if (migrations.length > 0) {
        console.log(`\n   ${group.toUpperCase()} (${migrations.length} files):`);
        migrations.forEach(m => {
          console.log(`   - ${m.filename} (${m.tables.length} tables, ${(m.size/1024).toFixed(1)}KB)`);
        });
      }
    }

    // Identify specific duplicates
    await this.identifySpecificDuplicates(groups);
  }

  async identifySpecificDuplicates(groups) {
    console.log('\n🎯 Identifying specific duplicates...\n');
    
    const duplicates = [];

    // 1. Basic table duplicates
    if (groups.basic.length > 1) {
      // Keep the smallest, most focused basic migration
      const sortedBasic = groups.basic.sort((a, b) => a.size - b.size);
      const keepBasic = sortedBasic[0];
      const removeBasic = sortedBasic.slice(1);
      
      duplicates.push({
        type: 'basic_tables',
        keep: keepBasic.filename,
        remove: removeBasic.map(m => m.filename),
        reason: 'Multiple basic table migrations - keeping smallest focused version'
      });
    }

    // 2. Frontend compatible duplicates
    if (groups.frontend_compatible.length > 1) {
      // Keep the "fixed" version if it exists
      const fixedVersion = groups.frontend_compatible.find(m => m.filename.includes('fixed'));
      const otherVersions = groups.frontend_compatible.filter(m => !m.filename.includes('fixed'));
      
      if (fixedVersion && otherVersions.length > 0) {
        duplicates.push({
          type: 'frontend_compatible',
          keep: fixedVersion.filename,
          remove: otherVersions.map(m => m.filename),
          reason: 'Multiple frontend-compatible versions - keeping fixed version'
        });
      }
    }

    // 3. Complete system vs specialized
    if (groups.complete.length > 0 && (groups.basic.length > 0 || groups.extended.length > 0)) {
      const completeSystem = groups.complete[0]; // Assume first is most comprehensive
      const redundantSpecialized = [
        ...groups.basic.filter(m => m.hasBasicTables),
        ...groups.extended.filter(m => m.hasExtendedTables)
      ];

      if (redundantSpecialized.length > 0) {
        duplicates.push({
          type: 'complete_vs_specialized',
          keep: completeSystem.filename,
          remove: redundantSpecialized.map(m => m.filename),
          reason: 'Complete system migration supersedes specialized migrations'
        });
      }
    }

    // 4. Check for similar table sets
    await this.findSimilarTableSets(Object.values(groups).flat());

    this.duplicateAnalysis = duplicates;
    
    if (duplicates.length > 0) {
      console.log('🔍 Duplicate patterns identified:');
      duplicates.forEach((duplicate, index) => {
        console.log(`\n   ${index + 1}. ${duplicate.type.toUpperCase()}`);
        console.log(`      Keep: ${duplicate.keep}`);
        console.log(`      Remove: ${duplicate.remove.join(', ')}`);
        console.log(`      Reason: ${duplicate.reason}`);
      });
    } else {
      console.log('✅ No obvious duplicates found in migration analysis');
    }
  }

  async findSimilarTableSets(migrations) {
    console.log('\n🔍 Analyzing table overlaps...\n');
    
    const tableOverlaps = [];
    
    for (let i = 0; i < migrations.length; i++) {
      for (let j = i + 1; j < migrations.length; j++) {
        const migration1 = migrations[i];
        const migration2 = migrations[j];
        
        if (migration1.error || migration2.error) continue;
        
        const commonTables = migration1.tables.filter(table => 
          migration2.tables.includes(table)
        );
        
        if (commonTables.length >= 3) { // Significant overlap
          const overlapPercentage = (commonTables.length / Math.min(migration1.tables.length, migration2.tables.length)) * 100;
          
          tableOverlaps.push({
            file1: migration1.filename,
            file2: migration2.filename,
            commonTables: commonTables,
            overlapPercentage: overlapPercentage.toFixed(1)
          });
          
          console.log(`📊 Table overlap: ${migration1.filename} & ${migration2.filename}`);
          console.log(`   Common tables (${commonTables.length}): ${commonTables.join(', ')}`);
          console.log(`   Overlap: ${overlapPercentage.toFixed(1)}%`);
        }
      }
    }

    return tableOverlaps;
  }

  generateRemovalPlan() {
    console.log('\n📋 Generating safe removal plan...\n');
    
    const removalPlan = {
      timestamp: new Date().toISOString(),
      recommendations: [],
      safeToRemove: [],
      requiresReview: [],
      backupRequired: []
    };

    // Generate specific recommendations
    for (const duplicate of this.duplicateAnalysis) {
      for (const filename of duplicate.remove) {
        const recommendation = {
          filename,
          action: 'remove',
          reason: duplicate.reason,
          keepInstead: duplicate.keep,
          type: duplicate.type
        };

        // Determine safety level
        if (duplicate.type === 'frontend_compatible' || duplicate.type === 'basic_tables') {
          removalPlan.safeToRemove.push(recommendation);
        } else {
          removalPlan.requiresReview.push(recommendation);
        }

        removalPlan.recommendations.push(recommendation);
      }
    }

    // Always backup before removal
    removalPlan.backupRequired = removalPlan.recommendations.map(r => r.filename);

    console.log('📋 Removal Plan Summary:');
    console.log(`   - Safe to remove: ${removalPlan.safeToRemove.length} files`);
    console.log(`   - Requires review: ${removalPlan.requiresReview.length} files`);
    console.log(`   - Backup required: ${removalPlan.backupRequired.length} files`);

    if (removalPlan.safeToRemove.length > 0) {
      console.log('\n✅ SAFE TO REMOVE:');
      removalPlan.safeToRemove.forEach(item => {
        console.log(`   - ${item.filename} (${item.reason})`);
      });
    }

    if (removalPlan.requiresReview.length > 0) {
      console.log('\n⚠️  REQUIRES REVIEW:');
      removalPlan.requiresReview.forEach(item => {
        console.log(`   - ${item.filename} (${item.reason})`);
      });
    }

    this.removalPlan = removalPlan;
    
    // Save plan to file
    fs.writeFileSync('./duplicate-migration-removal-plan.json', JSON.stringify(removalPlan, null, 2));
    console.log('\n💾 Removal plan saved to: duplicate-migration-removal-plan.json');
    
    return removalPlan;
  }

  async createBackup() {
    console.log('\n💾 Creating backup of migration files...\n');
    
    const backupDir = './migration-backups';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}`);
    
    // Create backup directory
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    fs.mkdirSync(backupPath, { recursive: true });
    
    // Copy all migration files to backup
    for (const filename of this.migrationFiles) {
      const sourcePath = path.join(this.scriptsPath, filename);
      const backupFilePath = path.join(backupPath, filename);
      fs.copyFileSync(sourcePath, backupFilePath);
    }
    
    console.log(`✅ Backup created at: ${backupPath}`);
    console.log(`📦 Backed up ${this.migrationFiles.length} migration files`);
    
    return backupPath;
  }

  async executeRemoval(dryRun = true) {
    if (dryRun) {
      console.log('\n🔍 DRY RUN - No files will be actually removed\n');
    } else {
      console.log('\n⚠️  EXECUTING REMOVAL - Files will be permanently removed\n');
      await this.createBackup();
    }

    let removedCount = 0;
    
    for (const item of this.removalPlan.safeToRemove) {
      const filePath = path.join(this.scriptsPath, item.filename);
      
      if (fs.existsSync(filePath)) {
        if (dryRun) {
          console.log(`🗑️  Would remove: ${item.filename}`);
          console.log(`   Reason: ${item.reason}`);
          console.log(`   Use instead: ${item.keepInstead}`);
        } else {
          fs.unlinkSync(filePath);
          console.log(`✅ Removed: ${item.filename}`);
          removedCount++;
        }
      } else {
        console.log(`⚠️  File not found: ${item.filename}`);
      }
    }

    console.log(`\n📊 Summary: ${removedCount} files ${dryRun ? 'would be' : 'were'} removed`);
    
    if (!dryRun && removedCount > 0) {
      console.log('💡 Remember to update any scripts or documentation that reference the removed files');
    }

    return removedCount;
  }
}

// Main execution function
async function removeDuplicateMigrations() {
  console.log('🚀 Starting Duplicate Migration Analysis & Removal...\n');
  
  try {
    const remover = new DuplicateMigrationRemover();
    
    // Analyze migrations
    await remover.analyzeMigrations();
    
    // Generate removal plan
    remover.generateRemovalPlan();
    
    // Execute dry run
    await remover.executeRemoval(true);
    
    console.log('\n✅ Analysis complete!');
    console.log('📋 Review the generated plan file and run with executeRemoval(false) to proceed');
    
  } catch (error) {
    logger.error('❌ Duplicate migration removal failed:', error);
    throw error;
  }
}

// Export for use in other scripts
module.exports = { DuplicateMigrationRemover };

// Run if called directly
if (require.main === module) {
  removeDuplicateMigrations();
}