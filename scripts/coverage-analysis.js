#!/usr/bin/env node

/**
 * Coverage Analysis and Quality Gates for Fixia Platform
 * Comprehensive test coverage analysis with detailed reporting and quality enforcement
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

class FixiaCoverageAnalysis {
  constructor(options = {}) {
    this.config = {
      // Coverage thresholds
      thresholds: {
        global: {
          statements: options.statements || 70,
          branches: options.branches || 70,
          functions: options.functions || 70,
          lines: options.lines || 70
        },
        // Critical files requiring higher coverage
        critical: {
          statements: 85,
          branches: 80,
          functions: 85,
          lines: 85,
          files: [
            'src/controllers/authController.js',
            'src/controllers/servicesController.js',
            'src/controllers/paymentsController.js',
            'src/controllers/chatController.js',
            'src/middleware/auth.js',
            'src/services/mercadopagoService.js',
            'src/utils/validation.js'
          ]
        }
      },
      
      // Directories to analyze
      directories: {
        backend: './backend',
        frontend: './frontend'
      },
      
      // Output directories
      outputDir: options.outputDir || './test-results/coverage',
      
      // Quality gate rules
      qualityGates: {
        // Minimum test coverage
        minimumCoverage: 70,
        
        // Maximum allowed technical debt (in hours)
        maxTechnicalDebt: 8,
        
        // Code quality thresholds
        codeQuality: {
          duplicatedLines: 3.0, // %
          maintainabilityIndex: 70,
          cyclomaticComplexity: 10
        },
        
        // Test quality metrics
        testQuality: {
          minTestsPerController: 5,
          minAssertionsPerTest: 2,
          maxTestDuration: 5000 // ms
        }
      }
    };
    
    this.results = {
      coverage: {
        backend: null,
        frontend: null,
        combined: null
      },
      qualityGates: {},
      recommendations: [],
      deadCode: [],
      testAnalysis: {}
    };
  }

  async run() {
    console.log('📊 Starting Fixia Coverage Analysis...');
    
    await this.setupOutputDirectory();
    
    try {
      // Run coverage analysis
      await this.runBackendCoverageAnalysis();
      await this.runFrontendCoverageAnalysis();
      
      // Analyze test quality
      await this.analyzeTestQuality();
      
      // Detect dead code
      await this.detectDeadCode();
      
      // Generate comprehensive coverage report
      await this.generateCoverageReport();
      
      // Evaluate quality gates
      await this.evaluateQualityGates();
      
      // Generate recommendations
      await this.generateRecommendations();
      
    } catch (error) {
      console.error('❌ Coverage analysis failed:', error);
      process.exit(1);
    }
    
    console.log('✅ Coverage analysis completed successfully!');
  }

  async setupOutputDirectory() {
    await fs.mkdir(this.config.outputDir, { recursive: true });
    await fs.mkdir(path.join(this.config.outputDir, 'backend'), { recursive: true });
    await fs.mkdir(path.join(this.config.outputDir, 'frontend'), { recursive: true });
    await fs.mkdir(path.join(this.config.outputDir, 'reports'), { recursive: true });
  }

  /**
   * Backend Coverage Analysis
   */
  async runBackendCoverageAnalysis() {
    console.log('\n🔧 Running Backend Coverage Analysis...');
    
    try {
      // Run Jest with coverage
      const { stdout } = await execAsync('npm run test:coverage', {
        cwd: this.config.directories.backend
      });
      
      // Parse coverage report
      const coverageData = await this.parseCoverageReport('backend');
      this.results.coverage.backend = coverageData;
      
      // Analyze critical files coverage
      await this.analyzeCriticalFilesCoverage('backend', coverageData);
      
      console.log('✅ Backend coverage analysis completed');
      
    } catch (error) {
      console.error('❌ Backend coverage analysis failed:', error.message);
      
      // Try to parse any existing coverage data
      try {
        const coverageData = await this.parseCoverageReport('backend');
        this.results.coverage.backend = coverageData;
      } catch (parseError) {
        console.warn('⚠️ Could not parse existing backend coverage data');
      }
    }
  }

  /**
   * Frontend Coverage Analysis  
   */
  async runFrontendCoverageAnalysis() {
    console.log('\n🌐 Running Frontend Coverage Analysis...');
    
    try {
      // Check if frontend has test coverage setup
      const packageJsonPath = path.join(this.config.directories.frontend, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      
      if (packageJson.scripts && packageJson.scripts['test:coverage']) {
        const { stdout } = await execAsync('npm run test:coverage', {
          cwd: this.config.directories.frontend
        });
        
        const coverageData = await this.parseCoverageReport('frontend');
        this.results.coverage.frontend = coverageData;
        
        console.log('✅ Frontend coverage analysis completed');
      } else {
        console.log('⚠️ Frontend coverage testing not configured');
        this.results.coverage.frontend = this.createEmptyCoverageReport();
      }
      
    } catch (error) {
      console.warn('⚠️ Frontend coverage analysis failed:', error.message);
      this.results.coverage.frontend = this.createEmptyCoverageReport();
    }
  }

  async parseCoverageReport(type) {
    const coveragePath = path.join(
      this.config.directories[type], 
      'coverage', 
      'coverage-summary.json'
    );
    
    try {
      const coverageData = JSON.parse(await fs.readFile(coveragePath, 'utf8'));
      
      return {
        total: coverageData.total,
        files: Object.keys(coverageData)
          .filter(key => key !== 'total')
          .map(filePath => ({
            path: filePath,
            coverage: coverageData[filePath]
          })),
        timestamp: new Date().toISOString(),
        type: type
      };
      
    } catch (error) {
      throw new Error(`Could not parse ${type} coverage report: ${error.message}`);
    }
  }

  async analyzeCriticalFilesCoverage(type, coverageData) {
    console.log(`  🎯 Analyzing critical files coverage for ${type}...`);
    
    const criticalFiles = this.config.thresholds.critical.files;
    const lowCoverageFiles = [];
    
    for (const file of coverageData.files) {
      const isCritical = criticalFiles.some(criticalFile => 
        file.path.includes(criticalFile)
      );
      
      if (iscritical) {
        const coverage = file.coverage;
        const issues = [];
        
        if (coverage.statements.pct < this.config.thresholds.critical.statements) {
          issues.push(`Statements: ${coverage.statements.pct}% < ${this.config.thresholds.critical.statements}%`);
        }
        
        if (coverage.branches.pct < this.config.thresholds.critical.branches) {
          issues.push(`Branches: ${coverage.branches.pct}% < ${this.config.thresholds.critical.branches}%`);
        }
        
        if (coverage.functions.pct < this.config.thresholds.critical.functions) {
          issues.push(`Functions: ${coverage.functions.pct}% < ${this.config.thresholds.critical.functions}%`);
        }
        
        if (issues.length > 0) {
          lowCoverageFiles.push({
            file: file.path,
            issues: issues,
            coverage: coverage
          });
        }
      }
    }
    
    if (lowCoverageFiles.length > 0) {
      console.warn(`⚠️ ${lowCoverageFiles.length} critical files have insufficient coverage`);
      this.results.qualityGates.criticalFilesCoverage = {
        passed: false,
        issues: lowCoverageFiles
      };
    } else {
      console.log('✅ All critical files meet coverage requirements');
      this.results.qualityGates.criticalFilesCoverage = {
        passed: true,
        issues: []
      };
    }
  }

  /**
   * Test Quality Analysis
   */
  async analyzeTestQuality() {
    console.log('\n🧪 Analyzing Test Quality...');
    
    try {
      // Analyze backend test files
      await this.analyzeBackendTestQuality();
      
      // Analyze frontend test files (if they exist)
      await this.analyzeFrontendTestQuality();
      
    } catch (error) {
      console.warn('⚠️ Test quality analysis failed:', error.message);
    }
  }

  async analyzeBackendTestQuality() {
    const testDir = path.join(this.config.directories.backend, 'tests');
    
    try {
      await fs.access(testDir);
    } catch {
      console.warn('⚠️ Backend test directory not found');
      return;
    }
    
    const testFiles = await this.findTestFiles(testDir);
    const testAnalysis = {
      totalFiles: testFiles.length,
      totalTests: 0,
      averageTestsPerFile: 0,
      slowTests: [],
      testsByType: {
        unit: 0,
        integration: 0,
        e2e: 0
      }
    };
    
    for (const testFile of testFiles) {
      try {
        const content = await fs.readFile(testFile, 'utf8');
        const analysis = this.analyzeTestFile(content, testFile);
        
        testAnalysis.totalTests += analysis.testCount;
        
        if (analysis.slowTests.length > 0) {
          testAnalysis.slowTests.push(...analysis.slowTests);
        }
        
        // Categorize tests
        if (testFile.includes('unit')) {
          testAnalysis.testsByType.unit += analysis.testCount;
        } else if (testFile.includes('integration')) {
          testAnalysis.testsByType.integration += analysis.testCount;
        } else if (testFile.includes('e2e')) {
          testAnalysis.testsByType.e2e += analysis.testCount;
        }
        
      } catch (error) {
        console.warn(`⚠️ Could not analyze test file ${testFile}: ${error.message}`);
      }
    }
    
    testAnalysis.averageTestsPerFile = testFiles.length > 0 ? 
      Math.round(testAnalysis.totalTests / testFiles.length) : 0;
    
    this.results.testAnalysis.backend = testAnalysis;
    
    console.log(`  📈 Backend: ${testAnalysis.totalTests} tests in ${testAnalysis.totalFiles} files`);
  }

  async analyzeFrontendTestQuality() {
    // Similar implementation for frontend tests
    this.results.testAnalysis.frontend = {
      totalFiles: 0,
      totalTests: 0,
      averageTestsPerFile: 0,
      slowTests: [],
      testsByType: { unit: 0, integration: 0, e2e: 0 }
    };
  }

  analyzeTestFile(content, filePath) {
    const analysis = {
      testCount: 0,
      assertionCount: 0,
      slowTests: []
    };
    
    // Count test cases (describe/it blocks)
    const testMatches = content.match(/(it|test)\s*\(/g);
    analysis.testCount = testMatches ? testMatches.length : 0;
    
    // Count assertions (expect calls)
    const assertionMatches = content.match(/expect\s*\(/g);
    analysis.assertionCount = assertionMatches ? assertionMatches.length : 0;
    
    // Look for potential slow tests (setTimeout, large timeouts)
    const timeoutMatches = content.match(/timeout:\s*(\d+)/g);
    if (timeoutMatches) {
      timeoutMatches.forEach(match => {
        const timeout = parseInt(match.match(/\d+/)[0]);
        if (timeout > this.config.qualityGates.testQuality.maxTestDuration) {
          analysis.slowTests.push({
            file: filePath,
            timeout: timeout,
            recommended: this.config.qualityGates.testQuality.maxTestDuration
          });
        }
      });
    }
    
    return analysis;
  }

  /**
   * Dead Code Detection
   */
  async detectDeadCode() {
    console.log('\n🔍 Detecting Dead Code...');
    
    try {
      // Analyze backend for unused exports/imports
      await this.detectBackendDeadCode();
      
      // Analyze frontend for unused components/utilities
      await this.detectFrontendDeadCode();
      
    } catch (error) {
      console.warn('⚠️ Dead code detection failed:', error.message);
    }
  }

  async detectBackendDeadCode() {
    const srcDir = path.join(this.config.directories.backend, 'src');
    
    try {
      const jsFiles = await this.findJavaScriptFiles(srcDir);
      const deadCodeIssues = [];
      
      for (const file of jsFiles) {
        const content = await fs.readFile(file, 'utf8');
        const issues = this.analyzeFileForDeadCode(content, file);
        
        if (issues.length > 0) {
          deadCodeIssues.push({
            file: file,
            issues: issues
          });
        }
      }
      
      this.results.deadCode = deadCodeIssues;
      
      if (deadCodeIssues.length > 0) {
        console.log(`  🧹 Found potential dead code in ${deadCodeIssues.length} files`);
      } else {
        console.log('  ✅ No obvious dead code detected');
      }
      
    } catch (error) {
      console.warn(`⚠️ Backend dead code detection failed: ${error.message}`);
    }
  }

  async detectFrontendDeadCode() {
    // Similar implementation for frontend dead code detection
    console.log('  📱 Frontend dead code detection not yet implemented');
  }

  analyzeFileForDeadCode(content, filePath) {
    const issues = [];
    
    // Look for unused variables (basic detection)
    const variableDeclarations = content.match(/(?:const|let|var)\s+(\w+)/g);
    if (variableDeclarations) {
      variableDeclarations.forEach(declaration => {
        const varName = declaration.split(/\s+/).pop();
        const usage = new RegExp(`\\b${varName}\\b`, 'g');
        const matches = content.match(usage);
        
        if (matches && matches.length <= 1) { // Only declared, never used
          issues.push({
            type: 'unused_variable',
            variable: varName,
            line: this.findLineNumber(content, declaration)
          });
        }
      });
    }
    
    // Look for unused imports
    const importMatches = content.match(/(?:const|import)\s+.*?require\(.*?\)/g);
    if (importMatches) {
      // Basic unused import detection would go here
    }
    
    return issues;
  }

  /**
   * Quality Gates Evaluation
   */
  async evaluateQualityGates() {
    console.log('\n🚥 Evaluating Quality Gates...');
    
    const gates = {
      overallCoverage: this.evaluateOverallCoverage(),
      criticalFilesCoverage: this.results.qualityGates.criticalFilesCoverage,
      testQuality: this.evaluateTestQuality(),
      deadCode: this.evaluateDeadCode(),
      codeComplexity: await this.evaluateCodeComplexity()
    };
    
    this.results.qualityGates = gates;
    
    const passedGates = Object.values(gates).filter(gate => gate.passed).length;
    const totalGates = Object.keys(gates).length;
    
    console.log(`📊 Quality Gates: ${passedGates}/${totalGates} passed`);
    
    // List failed gates
    const failedGates = Object.entries(gates)
      .filter(([_, gate]) => !gate.passed)
      .map(([name, gate]) => ({ name, ...gate }));
    
    if (failedGates.length > 0) {
      console.log('\n❌ Failed Quality Gates:');
      failedGates.forEach(gate => {
        console.log(`  - ${gate.name}: ${gate.message || 'Failed'}`);
      });
      
      if (process.env.STRICT_QUALITY_GATES === 'true') {
        throw new Error(`${failedGates.length} quality gates failed`);
      }
    } else {
      console.log('✅ All quality gates passed!');
    }
  }

  evaluateOverallCoverage() {
    const backendCoverage = this.results.coverage.backend;
    const frontendCoverage = this.results.coverage.frontend;
    
    if (!backendCoverage) {
      return {
        passed: false,
        message: 'No backend coverage data available'
      };
    }
    
    const coverage = backendCoverage.total;
    const thresholds = this.config.thresholds.global;
    
    const failedMetrics = [];
    
    if (coverage.statements.pct < thresholds.statements) {
      failedMetrics.push(`statements: ${coverage.statements.pct}% < ${thresholds.statements}%`);
    }
    
    if (coverage.branches.pct < thresholds.branches) {
      failedMetrics.push(`branches: ${coverage.branches.pct}% < ${thresholds.branches}%`);
    }
    
    if (coverage.functions.pct < thresholds.functions) {
      failedMetrics.push(`functions: ${coverage.functions.pct}% < ${thresholds.functions}%`);
    }
    
    if (coverage.lines.pct < thresholds.lines) {
      failedMetrics.push(`lines: ${coverage.lines.pct}% < ${thresholds.lines}%`);
    }
    
    return {
      passed: failedMetrics.length === 0,
      message: failedMetrics.length > 0 ? 
        `Coverage below threshold: ${failedMetrics.join(', ')}` :
        'Coverage meets all thresholds',
      coverage: coverage
    };
  }

  evaluateTestQuality() {
    const backend = this.results.testAnalysis.backend;
    
    if (!backend) {
      return {
        passed: false,
        message: 'No test analysis data available'
      };
    }
    
    const issues = [];
    
    if (backend.averageTestsPerFile < this.config.qualityGates.testQuality.minTestsPerController) {
      issues.push(`Average tests per file: ${backend.averageTestsPerFile} < ${this.config.qualityGates.testQuality.minTestsPerController}`);
    }
    
    if (backend.slowTests.length > 0) {
      issues.push(`${backend.slowTests.length} slow tests detected`);
    }
    
    return {
      passed: issues.length === 0,
      message: issues.length > 0 ? issues.join(', ') : 'Test quality meets requirements',
      details: backend
    };
  }

  evaluateDeadCode() {
    return {
      passed: this.results.deadCode.length === 0,
      message: this.results.deadCode.length > 0 ? 
        `${this.results.deadCode.length} files contain potential dead code` :
        'No dead code detected',
      deadCodeFiles: this.results.deadCode.length
    };
  }

  async evaluateCodeComplexity() {
    // Placeholder for code complexity analysis
    return {
      passed: true,
      message: 'Code complexity analysis not implemented',
      avgComplexity: 0
    };
  }

  /**
   * Generate Recommendations
   */
  async generateRecommendations() {
    console.log('\n💡 Generating Recommendations...');
    
    const recommendations = [];
    
    // Coverage recommendations
    const overallCoverage = this.results.qualityGates.overallCoverage;
    if (!overallCoverage.passed) {
      recommendations.push({
        priority: 'high',
        category: 'coverage',
        title: 'Improve Test Coverage',
        description: `Overall test coverage is below threshold. Focus on: ${overallCoverage.message}`,
        actionItems: [
          'Add unit tests for uncovered functions',
          'Add integration tests for critical user flows',
          'Review and improve existing test assertions'
        ]
      });
    }
    
    // Critical files recommendations
    const criticalFiles = this.results.qualityGates.criticalFilesCoverage;
    if (!criticalFiles.passed) {
      recommendations.push({
        priority: 'high',
        category: 'critical-coverage',
        title: 'Improve Critical Files Coverage',
        description: 'Critical files have insufficient test coverage',
        actionItems: criticalFiles.issues.map(issue => 
          `Improve coverage for ${issue.file}: ${issue.issues.join(', ')}`
        )
      });
    }
    
    // Test quality recommendations
    const testQuality = this.results.qualityGates.testQuality;
    if (!testQuality.passed) {
      recommendations.push({
        priority: 'medium',
        category: 'test-quality',
        title: 'Improve Test Quality',
        description: testQuality.message,
        actionItems: [
          'Add more comprehensive test cases',
          'Optimize slow-running tests',
          'Improve test assertions and coverage'
        ]
      });
    }
    
    // Dead code recommendations
    if (this.results.deadCode.length > 0) {
      recommendations.push({
        priority: 'low',
        category: 'maintenance',
        title: 'Remove Dead Code',
        description: `${this.results.deadCode.length} files contain potential dead code`,
        actionItems: [
          'Review and remove unused variables',
          'Clean up unused imports',
          'Remove commented-out code blocks'
        ]
      });
    }
    
    this.results.recommendations = recommendations;
    
    console.log(`📋 Generated ${recommendations.length} recommendations`);
  }

  /**
   * Generate Comprehensive Report
   */
  async generateCoverageReport() {
    console.log('\n📊 Generating Coverage Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        backend: this.results.coverage.backend?.total || null,
        frontend: this.results.coverage.frontend?.total || null,
        qualityGatesPassed: Object.values(this.results.qualityGates).filter(g => g.passed).length,
        totalQualityGates: Object.keys(this.results.qualityGates).length
      },
      coverage: this.results.coverage,
      qualityGates: this.results.qualityGates,
      testAnalysis: this.results.testAnalysis,
      deadCode: this.results.deadCode,
      recommendations: this.results.recommendations,
      config: this.config
    };
    
    // Write JSON report
    const jsonPath = path.join(this.config.outputDir, 'reports', 'coverage-analysis.json');
    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));
    
    // Generate HTML report
    await this.generateHTMLCoverageReport(report);
    
    // Generate markdown summary
    await this.generateMarkdownSummary(report);
    
    console.log(`📄 Coverage reports generated in ${this.config.outputDir}/reports/`);
  }

  async generateHTMLCoverageReport(report) {
    // Comprehensive HTML report generation (abbreviated for space)
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fixia Coverage Analysis Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1400px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .metric-label { color: #666; }
        .success { color: #28a745; }
        .warning { color: #ffc107; }
        .error { color: #dc3545; }
        .section { margin-bottom: 40px; }
        .coverage-bar { width: 100%; height: 20px; background: #e0e0e0; border-radius: 10px; overflow: hidden; }
        .coverage-fill { height: 100%; transition: width 0.3s ease; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6; }
        th { background: #f8f9fa; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Fixia Coverage Analysis Report</h1>
            <p>Generated on ${report.timestamp}</p>
        </div>
        
        <div class="summary">
            ${report.summary.backend ? `
            <div class="metric">
                <div class="metric-value ${this.getCoverageClass(report.summary.backend.statements.pct)}">${report.summary.backend.statements.pct}%</div>
                <div class="metric-label">Backend Coverage</div>
            </div>
            ` : ''}
            
            <div class="metric">
                <div class="metric-value ${report.summary.qualityGatesPassed === report.summary.totalQualityGates ? 'success' : 'error'}">${report.summary.qualityGatesPassed}/${report.summary.totalQualityGates}</div>
                <div class="metric-label">Quality Gates</div>
            </div>
            
            <div class="metric">
                <div class="metric-value">${report.deadCode.length}</div>
                <div class="metric-label">Dead Code Issues</div>
            </div>
            
            <div class="metric">
                <div class="metric-value">${report.recommendations.length}</div>
                <div class="metric-label">Recommendations</div>
            </div>
        </div>
        
        <!-- Coverage Details -->
        ${report.summary.backend ? `
        <div class="section">
            <h2>📈 Coverage Details</h2>
            <table>
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Coverage</th>
                        <th>Threshold</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Statements</td>
                        <td>${report.summary.backend.statements.pct}%</td>
                        <td>${report.config.thresholds.global.statements}%</td>
                        <td class="${report.summary.backend.statements.pct >= report.config.thresholds.global.statements ? 'success' : 'error'}">${report.summary.backend.statements.pct >= report.config.thresholds.global.statements ? '✅' : '❌'}</td>
                    </tr>
                    <tr>
                        <td>Branches</td>
                        <td>${report.summary.backend.branches.pct}%</td>
                        <td>${report.config.thresholds.global.branches}%</td>
                        <td class="${report.summary.backend.branches.pct >= report.config.thresholds.global.branches ? 'success' : 'error'}">${report.summary.backend.branches.pct >= report.config.thresholds.global.branches ? '✅' : '❌'}</td>
                    </tr>
                    <tr>
                        <td>Functions</td>
                        <td>${report.summary.backend.functions.pct}%</td>
                        <td>${report.config.thresholds.global.functions}%</td>
                        <td class="${report.summary.backend.functions.pct >= report.config.thresholds.global.functions ? 'success' : 'error'}">${report.summary.backend.functions.pct >= report.config.thresholds.global.functions ? '✅' : '❌'}</td>
                    </tr>
                    <tr>
                        <td>Lines</td>
                        <td>${report.summary.backend.lines.pct}%</td>
                        <td>${report.config.thresholds.global.lines}%</td>
                        <td class="${report.summary.backend.lines.pct >= report.config.thresholds.global.lines ? 'success' : 'error'}">${report.summary.backend.lines.pct >= report.config.thresholds.global.lines ? '✅' : '❌'}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        ` : ''}
        
        <!-- Recommendations -->
        ${report.recommendations.length > 0 ? `
        <div class="section">
            <h2>💡 Recommendations</h2>
            ${report.recommendations.map(rec => `
            <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid ${rec.priority === 'high' ? '#dc3545' : rec.priority === 'medium' ? '#ffc107' : '#28a745'};">
                <h3>${rec.title} (${rec.priority} priority)</h3>
                <p>${rec.description}</p>
                <ul>
                    ${rec.actionItems.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            `).join('')}
        </div>
        ` : ''}
    </div>
</body>
</html>`;
    
    const htmlPath = path.join(this.config.outputDir, 'reports', 'coverage-report.html');
    await fs.writeFile(htmlPath, html);
  }

  async generateMarkdownSummary(report) {
    const markdown = `# 📊 Fixia Coverage Analysis Summary

**Generated:** ${report.timestamp}

## Summary

- **Backend Coverage:** ${report.summary.backend?.statements.pct || 'N/A'}%
- **Quality Gates:** ${report.summary.qualityGatesPassed}/${report.summary.totalQualityGates} passed
- **Dead Code Issues:** ${report.deadCode.length}
- **Recommendations:** ${report.recommendations.length}

## Coverage Breakdown

${report.summary.backend ? `
| Metric | Coverage | Threshold | Status |
|--------|----------|-----------|--------|
| Statements | ${report.summary.backend.statements.pct}% | ${report.config.thresholds.global.statements}% | ${report.summary.backend.statements.pct >= report.config.thresholds.global.statements ? '✅' : '❌'} |
| Branches | ${report.summary.backend.branches.pct}% | ${report.config.thresholds.global.branches}% | ${report.summary.backend.branches.pct >= report.config.thresholds.global.branches ? '✅' : '❌'} |
| Functions | ${report.summary.backend.functions.pct}% | ${report.config.thresholds.global.functions}% | ${report.summary.backend.functions.pct >= report.config.thresholds.global.functions ? '✅' : '❌'} |
| Lines | ${report.summary.backend.lines.pct}% | ${report.config.thresholds.global.lines}% | ${report.summary.backend.lines.pct >= report.config.thresholds.global.lines ? '✅' : '❌'} |
` : '**Backend coverage data not available**'}

## Quality Gates

${Object.entries(report.qualityGates).map(([gate, result]) => 
`- **${gate}:** ${result.passed ? '✅' : '❌'} ${result.message || ''}`).join('\n')}

${report.recommendations.length > 0 ? `
## Recommendations

${report.recommendations.map(rec => `
### ${rec.title} (${rec.priority} priority)

${rec.description}

**Action Items:**
${rec.actionItems.map(item => `- ${item}`).join('\n')}
`).join('\n')}
` : ''}

---
*Generated by Fixia Coverage Analysis*`;

    const markdownPath = path.join(this.config.outputDir, 'reports', 'coverage-summary.md');
    await fs.writeFile(markdownPath, markdown);
  }

  /**
   * Utility Methods
   */
  
  createEmptyCoverageReport() {
    return {
      total: {
        statements: { pct: 0, covered: 0, total: 0 },
        branches: { pct: 0, covered: 0, total: 0 },
        functions: { pct: 0, covered: 0, total: 0 },
        lines: { pct: 0, covered: 0, total: 0 }
      },
      files: [],
      timestamp: new Date().toISOString(),
      type: 'empty'
    };
  }

  getCoverageClass(percentage) {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  }

  findLineNumber(content, search) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(search)) {
        return i + 1;
      }
    }
    return 0;
  }

  async findTestFiles(dir) {
    const files = [];
    
    async function findFiles(currentDir) {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          await findFiles(fullPath);
        } else if (entry.isFile() && (
          entry.name.endsWith('.test.js') ||
          entry.name.endsWith('.spec.js') ||
          entry.name.endsWith('.test.ts') ||
          entry.name.endsWith('.spec.ts')
        )) {
          files.push(fullPath);
        }
      }
    }
    
    await findFiles(dir);
    return files;
  }

  async findJavaScriptFiles(dir) {
    const files = [];
    
    async function findFiles(currentDir) {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory() && !entry.name.includes('node_modules')) {
          await findFiles(fullPath);
        } else if (entry.isFile() && (
          entry.name.endsWith('.js') ||
          entry.name.endsWith('.ts')
        ) && !entry.name.includes('.test.') && !entry.name.includes('.spec.')) {
          files.push(fullPath);
        }
      }
    }
    
    await findFiles(dir);
    return files;
  }
}

// Execute if run directly
if (require.main === module) {
  const coverageAnalysis = new FixiaCoverageAnalysis({
    outputDir: process.env.COVERAGE_OUTPUT_DIR || './test-results/coverage',
    statements: parseInt(process.env.COVERAGE_STATEMENTS_THRESHOLD) || 70,
    branches: parseInt(process.env.COVERAGE_BRANCHES_THRESHOLD) || 70,
    functions: parseInt(process.env.COVERAGE_FUNCTIONS_THRESHOLD) || 70,
    lines: parseInt(process.env.COVERAGE_LINES_THRESHOLD) || 70
  });
  
  coverageAnalysis.run().catch(error => {
    console.error('Coverage analysis failed:', error);
    process.exit(1);
  });
}

module.exports = FixiaCoverageAnalysis;