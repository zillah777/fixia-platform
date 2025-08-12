#!/usr/bin/env node

/**
 * Visual Regression Testing Setup for Fixia Platform
 * Integrates with Playwright for screenshot comparison and visual diff detection
 */

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');

class FixiaVisualTesting {
  constructor(options = {}) {
    this.config = {
      browsers: options.browsers || ['chromium'], // can add 'firefox', 'webkit'
      viewports: options.viewports || [
        { width: 1920, height: 1080, name: 'desktop' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 375, height: 667, name: 'mobile' }
      ],
      baselineDir: options.baselineDir || './test-results/visual/baseline',
      currentDir: options.currentDir || './test-results/visual/current',
      diffDir: options.diffDir || './test-results/visual/diff',
      threshold: options.threshold || 0.2, // 20% pixel difference threshold
      baseUrl: options.baseUrl || process.env.TEST_BASE_URL || 'http://localhost:3000',
      pages: options.pages || [
        // Authentication pages
        { url: '/auth/login', name: 'auth-login' },
        { url: '/auth/registro', name: 'auth-register' },
        
        // Explorer pages
        { url: '/explorador/dashboard', name: 'explorer-dashboard', auth: 'explorer' },
        { url: '/explorador/marketplace', name: 'explorer-marketplace', auth: 'explorer' },
        { url: '/explorador/buscar-servicio', name: 'explorer-search', auth: 'explorer' },
        
        // AS (Provider) pages
        { url: '/as/dashboard', name: 'as-dashboard', auth: 'as' },
        { url: '/as/servicios', name: 'as-services', auth: 'as' },
        { url: '/as/perfil', name: 'as-profile', auth: 'as' },
        
        // Public pages
        { url: '/', name: 'homepage' },
        { url: '/como-funciona', name: 'how-it-works' },
        
        // Chat interface
        { url: '/explorador/chats', name: 'chat-interface', auth: 'explorer' },
        
        // Marketplace specific pages
        { url: '/explorador/profesional/1', name: 'professional-profile', auth: 'explorer' }
      ]
    };
    
    this.results = {
      passed: 0,
      failed: 0,
      differences: []
    };
    
    this.credentials = {
      explorer: {
        email: process.env.TEST_EXPLORER_EMAIL || 'explorer@test.com',
        password: process.env.TEST_EXPLORER_PASSWORD || 'test123'
      },
      as: {
        email: process.env.TEST_AS_EMAIL || 'as@test.com',
        password: process.env.TEST_AS_PASSWORD || 'test123'
      }
    };
  }

  async run() {
    console.log('🎭 Starting Visual Regression Testing...');
    
    await this.setupDirectories();
    
    for (const browserName of this.config.browsers) {
      console.log(`\n📱 Testing with ${browserName}...`);
      
      const browser = await this.launchBrowser(browserName);
      
      try {
        await this.testBrowser(browser, browserName);
      } finally {
        await browser.close();
      }
    }
    
    await this.generateReport();
    
    console.log(`\n✅ Visual regression testing completed!`);
    console.log(`📊 Results: ${this.results.passed} passed, ${this.results.failed} failed`);
    
    if (this.results.failed > 0) {
      console.log(`🔍 Check visual differences in: ${this.config.diffDir}`);
      process.exit(1);
    }
  }

  async setupDirectories() {
    const dirs = [this.config.baselineDir, this.config.currentDir, this.config.diffDir];
    
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async launchBrowser(browserName) {
    const browserInstances = {
      chromium,
      firefox,
      webkit
    };
    
    return await browserInstances[browserName].launch({
      headless: true,
      args: browserName === 'chromium' ? [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ] : []
    });
  }

  async testBrowser(browser, browserName) {
    const context = await browser.newContext({
      ignoreHTTPSErrors: true
    });
    
    for (const viewport of this.config.viewports) {
      console.log(`  📐 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      const page = await context.newPage();
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Set up performance optimizations
      await page.route('**/*', route => {
        const resourceType = route.request().resourceType();
        if (['font', 'media'].includes(resourceType)) {
          route.abort();
        } else {
          route.continue();
        }
      });
      
      try {
        for (const pageConfig of this.config.pages) {
          await this.testPage(page, pageConfig, browserName, viewport.name);
        }
      } finally {
        await page.close();
      }
    }
    
    await context.close();
  }

  async testPage(page, pageConfig, browserName, viewportName) {
    try {
      console.log(`    📄 Testing: ${pageConfig.name}`);
      
      // Handle authentication if required
      if (pageConfig.auth) {
        await this.authenticate(page, pageConfig.auth);
      }
      
      // Navigate to the page
      await page.goto(`${this.config.baseUrl}${pageConfig.url}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      // Wait for Fixia-specific elements to load
      await this.waitForFixiaElements(page, pageConfig);
      
      // Hide dynamic content for consistent screenshots
      await this.hideVolatileElements(page);
      
      // Capture screenshot
      const screenshotName = `${pageConfig.name}-${browserName}-${viewportName}.png`;
      const currentPath = path.join(this.config.currentDir, screenshotName);
      const baselinePath = path.join(this.config.baselineDir, screenshotName);
      
      await page.screenshot({
        path: currentPath,
        fullPage: true,
        animations: 'disabled'
      });
      
      // Compare with baseline if it exists
      await this.compareScreenshots(screenshotName, pageConfig.name);
      
    } catch (error) {
      console.error(`    ❌ Error testing ${pageConfig.name}: ${error.message}`);
      this.results.failed++;
      
      this.results.differences.push({
        page: pageConfig.name,
        browser: browserName,
        viewport: viewportName,
        error: error.message,
        type: 'error'
      });
    }
  }

  async authenticate(page, userType) {
    if (!this.credentials[userType]) {
      throw new Error(`Unknown user type: ${userType}`);
    }
    
    const { email, password } = this.credentials[userType];
    
    // Navigate to login page
    await page.goto(`${this.config.baseUrl}/auth/login`);
    
    // Fill login form
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for dashboard redirect
    await page.waitForURL(/\/(explorador|as)\/dashboard/, { timeout: 15000 });
  }

  async waitForFixiaElements(page, pageConfig) {
    try {
      // Wait for common Fixia UI elements
      await page.waitForSelector('[data-testid="fixia-nav"]', { timeout: 5000 });
    } catch {
      // If nav not found, wait for main content
      try {
        await page.waitForSelector('main', { timeout: 5000 });
      } catch {
        // Fallback: just wait for body
        await page.waitForSelector('body');
      }
    }
    
    // Wait for Liquid Glass effects to settle
    await page.waitForTimeout(1000);
    
    // Wait for any skeleton loading states to finish
    try {
      await page.waitForSelector('[data-testid*="skeleton"]', { state: 'hidden', timeout: 3000 });
    } catch {
      // No skeletons found, continue
    }
    
    // Page-specific waits
    if (pageConfig.name.includes('dashboard')) {
      try {
        await page.waitForSelector('[data-testid*="summary-card"]', { timeout: 5000 });
      } catch {
        // Dashboard cards might not be present
      }
    }
    
    if (pageConfig.name.includes('marketplace')) {
      try {
        await page.waitForSelector('[data-testid*="service-card"]', { timeout: 5000 });
      } catch {
        // Service cards might not be loaded yet
      }
    }
  }

  async hideVolatileElements(page) {
    // Hide elements that change frequently and would cause false positives
    await page.addStyleTag({
      content: `
        /* Hide dynamic content */
        [data-testid*="timestamp"],
        [data-testid*="last-seen"],
        [data-testid*="time-ago"],
        .notification-badge,
        [class*="animate-"],
        [class*="motion-"],
        [data-testid*="loading"] {
          opacity: 0 !important;
        }
        
        /* Stabilize animations */
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
        
        /* Hide cursor blinking */
        input, textarea {
          caret-color: transparent !important;
        }
        
        /* Ensure consistent scrollbars */
        ::-webkit-scrollbar {
          display: none !important;
        }
      `
    });
  }

  async compareScreenshots(screenshotName, pageName) {
    const currentPath = path.join(this.config.currentDir, screenshotName);
    const baselinePath = path.join(this.config.baselineDir, screenshotName);
    const diffPath = path.join(this.config.diffDir, screenshotName);
    
    try {
      // Check if baseline exists
      await fs.access(baselinePath);
    } catch {
      // No baseline exists, copy current as baseline
      await fs.copyFile(currentPath, baselinePath);
      console.log(`    📸 Created baseline for ${screenshotName}`);
      this.results.passed++;
      return;
    }
    
    // Load images
    const currentBuffer = await fs.readFile(currentPath);
    const baselineBuffer = await fs.readFile(baselinePath);
    
    const currentPng = PNG.sync.read(currentBuffer);
    const baselinePng = PNG.sync.read(baselineBuffer);
    
    // Ensure images are same size
    if (currentPng.width !== baselinePng.width || currentPng.height !== baselinePng.height) {
      console.log(`    ⚠️  Size mismatch for ${screenshotName}`);
      this.results.failed++;
      
      this.results.differences.push({
        page: pageName,
        screenshot: screenshotName,
        type: 'size-mismatch',
        currentSize: `${currentPng.width}x${currentPng.height}`,
        baselineSize: `${baselinePng.width}x${baselinePng.height}`
      });
      return;
    }
    
    // Compare pixels
    const diff = new PNG({ width: currentPng.width, height: currentPng.height });
    const pixelDifferences = pixelmatch(
      currentPng.data,
      baselinePng.data,
      diff.data,
      currentPng.width,
      currentPng.height,
      {
        threshold: this.config.threshold,
        includeAA: false,
        diffMask: true
      }
    );
    
    const totalPixels = currentPng.width * currentPng.height;
    const diffPercentage = (pixelDifferences / totalPixels) * 100;
    
    if (pixelDifferences > 0) {
      // Save diff image
      await fs.writeFile(diffPath, PNG.sync.write(diff));
      
      console.log(`    📊 ${pageName}: ${diffPercentage.toFixed(2)}% different (${pixelDifferences} pixels)`);
      
      if (diffPercentage > 5) { // 5% threshold for failure
        this.results.failed++;
        
        this.results.differences.push({
          page: pageName,
          screenshot: screenshotName,
          type: 'visual-difference',
          pixelDifferences,
          diffPercentage: diffPercentage.toFixed(2),
          diffPath: diffPath
        });
      } else {
        this.results.passed++;
        console.log(`    ✅ Minor differences within acceptable threshold`);
      }
    } else {
      this.results.passed++;
      console.log(`    ✅ No visual differences detected`);
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.results.passed + this.results.failed,
        passed: this.results.passed,
        failed: this.results.failed,
        passRate: this.results.passed + this.results.failed > 0 
          ? ((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(2) 
          : 0
      },
      differences: this.results.differences,
      config: {
        browsers: this.config.browsers,
        viewports: this.config.viewports.map(v => `${v.name} (${v.width}x${v.height})`),
        threshold: this.config.threshold,
        pages: this.config.pages.length
      }
    };
    
    // Write JSON report
    const reportPath = path.join(this.config.diffDir, 'visual-regression-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Generate HTML report
    await this.generateHTMLReport(report);
    
    console.log(`📄 Visual regression report generated: ${reportPath}`);
  }

  async generateHTMLReport(report) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fixia Visual Regression Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .metric-label { color: #666; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .differences { margin-top: 40px; }
        .difference { border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .difference-header { font-weight: bold; margin-bottom: 10px; }
        .difference-details { color: #666; }
        .image-comparison { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px; }
        .image-container { text-align: center; }
        .image-container img { max-width: 100%; border: 1px solid #ddd; border-radius: 4px; }
        .image-label { font-weight: bold; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>👁️ Fixia Visual Regression Report</h1>
            <p>Generated on ${report.timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <div class="metric-value ${report.summary.passRate >= 95 ? 'success' : 'error'}">${report.summary.passRate}%</div>
                <div class="metric-label">Pass Rate</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.totalTests}</div>
                <div class="metric-label">Total Tests</div>
            </div>
            <div class="metric">
                <div class="metric-value success">${report.summary.passed}</div>
                <div class="metric-label">Passed</div>
            </div>
            <div class="metric">
                <div class="metric-value ${report.summary.failed > 0 ? 'error' : 'success'}">${report.summary.failed}</div>
                <div class="metric-label">Failed</div>
            </div>
        </div>
        
        ${report.differences.length > 0 ? `
        <div class="differences">
            <h2>Visual Differences</h2>
            ${report.differences.map(diff => `
            <div class="difference">
                <div class="difference-header">${diff.page} - ${diff.screenshot}</div>
                <div class="difference-details">
                    <p><strong>Type:</strong> ${diff.type}</p>
                    ${diff.diffPercentage ? `<p><strong>Difference:</strong> ${diff.diffPercentage}%</p>` : ''}
                    ${diff.pixelDifferences ? `<p><strong>Pixels Changed:</strong> ${diff.pixelDifferences}</p>` : ''}
                    ${diff.error ? `<p><strong>Error:</strong> ${diff.error}</p>` : ''}
                </div>
            </div>
            `).join('')}
        </div>
        ` : '<div class="differences"><h2>✅ No Visual Differences Found</h2></div>'}
        
        <div class="config">
            <h2>Test Configuration</h2>
            <p><strong>Browsers:</strong> ${report.config.browsers.join(', ')}</p>
            <p><strong>Viewports:</strong> ${report.config.viewports.join(', ')}</p>
            <p><strong>Threshold:</strong> ${report.config.threshold}</p>
            <p><strong>Pages Tested:</strong> ${report.config.pages}</p>
        </div>
    </div>
</body>
</html>`;
    
    const htmlPath = path.join(this.config.diffDir, 'visual-regression-report.html');
    await fs.writeFile(htmlPath, html);
    
    console.log(`📊 HTML report generated: ${htmlPath}`);
  }
}

// Install required dependencies if not present
async function installDependencies() {
  console.log('📦 Checking visual testing dependencies...');
  
  try {
    require('pixelmatch');
    require('pngjs');
  } catch (error) {
    console.log('Installing pixelmatch and pngjs...');
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    await execAsync('npm install --save-dev pixelmatch pngjs');
    console.log('✅ Dependencies installed');
  }
}

// Execute if run directly
if (require.main === module) {
  (async () => {
    try {
      await installDependencies();
      
      const visualTesting = new FixiaVisualTesting({
        browsers: process.env.VISUAL_BROWSERS?.split(',') || ['chromium'],
        baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000'
      });
      
      await visualTesting.run();
      
    } catch (error) {
      console.error('Visual regression testing failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = FixiaVisualTesting;