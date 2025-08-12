#!/usr/bin/env node

/**
 * Performance Testing Automation for Fixia Platform
 * Comprehensive API and Frontend performance monitoring with automated alerts
 */

const { chromium } = require('playwright');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class FixiaPerformanceTesting {
  constructor(options = {}) {
    this.config = {
      apiBaseUrl: options.apiBaseUrl || process.env.API_BASE_URL || 'http://localhost:5000/api',
      frontendBaseUrl: options.frontendBaseUrl || process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
      reportDir: options.reportDir || './test-results/performance',
      
      // Performance thresholds
      thresholds: {
        // API thresholds (milliseconds)
        api: {
          auth: { login: 500, register: 800 },
          services: { list: 600, details: 400, search: 800 },
          dashboard: { stats: 700, summary: 500 },
          chat: { conversations: 600, messages: 400 },
          payments: { create: 1000, status: 300 }
        },
        
        // Frontend thresholds (milliseconds)
        frontend: {
          loadTime: 3000,
          firstContentfulPaint: 1500,
          largestContentfulPaint: 2500,
          cumulativeLayoutShift: 0.1,
          firstInputDelay: 100
        },
        
        // Resource thresholds
        resources: {
          memoryUsage: 100, // MB
          cpuUsage: 80,     // %
          networkRequests: 50
        }
      },
      
      // Test configuration
      iterations: options.iterations || 5,
      concurrentUsers: options.concurrentUsers || [1, 5, 10],
      timeout: options.timeout || 30000
    };
    
    this.results = {
      api: [],
      frontend: [],
      loadTests: [],
      errors: []
    };
  }

  async run() {
    console.log('⚡ Starting Fixia Performance Testing...');
    
    await this.setupReportDirectory();
    
    try {
      // Run API performance tests
      await this.runAPIPerformanceTests();
      
      // Run frontend performance tests
      await this.runFrontendPerformanceTests();
      
      // Run load tests
      await this.runLoadTests();
      
      // Generate comprehensive report
      await this.generatePerformanceReport();
      
      // Check performance thresholds
      await this.evaluatePerformanceThresholds();
      
    } catch (error) {
      console.error('❌ Performance testing failed:', error);
      process.exit(1);
    }
    
    console.log('✅ Performance testing completed successfully!');
  }

  async setupReportDirectory() {
    await fs.mkdir(this.config.reportDir, { recursive: true });
    await fs.mkdir(path.join(this.config.reportDir, 'api'), { recursive: true });
    await fs.mkdir(path.join(this.config.reportDir, 'frontend'), { recursive: true });
    await fs.mkdir(path.join(this.config.reportDir, 'load'), { recursive: true });
  }

  /**
   * API Performance Testing
   */
  async runAPIPerformanceTests() {
    console.log('\n🚀 Running API Performance Tests...');
    
    const testSuites = [
      {
        name: 'Authentication',
        tests: [
          { name: 'login', method: 'POST', url: '/auth/login', payload: { email: 'test@example.com', password: 'test123' }},
          { name: 'register', method: 'POST', url: '/auth/register', payload: { email: 'new@example.com', password: 'test123', first_name: 'Test', last_name: 'User' }}
        ]
      },
      {
        name: 'Services',
        tests: [
          { name: 'list', method: 'GET', url: '/services' },
          { name: 'details', method: 'GET', url: '/services/1' },
          { name: 'search', method: 'GET', url: '/services/search?q=plomero&location=puerto-madryn' }
        ]
      },
      {
        name: 'Dashboard',
        auth: true,
        tests: [
          { name: 'stats', method: 'GET', url: '/dashboard/stats' },
          { name: 'summary', method: 'GET', url: '/dashboard/summary' }
        ]
      },
      {
        name: 'Chat',
        auth: true,
        tests: [
          { name: 'conversations', method: 'GET', url: '/chat/conversations' },
          { name: 'messages', method: 'GET', url: '/chat/conversations/1/messages' }
        ]
      }
    ];
    
    // Get auth token for protected endpoints
    const authToken = await this.getAuthToken();
    
    for (const suite of testSuites) {
      console.log(`  📊 Testing ${suite.name}...`);
      
      for (const test of suite.tests) {
        const results = await this.runAPITest(test, suite.auth ? authToken : null);
        this.results.api.push({
          suite: suite.name,
          test: test.name,
          ...results
        });
      }
    }
  }

  async runAPITest(testConfig, authToken = null) {
    const url = `${this.config.apiBaseUrl}${testConfig.url}`;
    const results = [];
    
    // Run multiple iterations
    for (let i = 0; i < this.config.iterations; i++) {
      const startTime = Date.now();
      const startMemory = process.memoryUsage();
      
      try {
        const config = {
          method: testConfig.method,
          url,
          timeout: this.config.timeout,
          headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
        };
        
        if (testConfig.payload) {
          config.data = testConfig.payload;
          config.headers['Content-Type'] = 'application/json';
        }
        
        const response = await axios(config);
        const endTime = Date.now();
        const endMemory = process.memoryUsage();
        
        results.push({
          iteration: i + 1,
          responseTime: endTime - startTime,
          statusCode: response.status,
          memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
          success: true
        });
        
      } catch (error) {
        const endTime = Date.now();
        
        results.push({
          iteration: i + 1,
          responseTime: endTime - startTime,
          statusCode: error.response?.status || 0,
          error: error.message,
          success: false
        });
        
        this.results.errors.push({
          test: `${testConfig.method} ${testConfig.url}`,
          error: error.message,
          statusCode: error.response?.status
        });
      }
      
      // Wait between iterations
      if (i < this.config.iterations - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Calculate statistics
    const successfulResults = results.filter(r => r.success);
    const responseTimes = successfulResults.map(r => r.responseTime);
    
    return {
      url: testConfig.url,
      method: testConfig.method,
      iterations: this.config.iterations,
      successfulIterations: successfulResults.length,
      failureRate: ((this.config.iterations - successfulResults.length) / this.config.iterations * 100).toFixed(2),
      performance: {
        avg: responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0,
        min: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
        max: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
        p95: responseTimes.length > 0 ? this.calculatePercentile(responseTimes, 95) : 0,
        p99: responseTimes.length > 0 ? this.calculatePercentile(responseTimes, 99) : 0
      }
    };
  }

  async getAuthToken() {
    try {
      const response = await axios.post(`${this.config.apiBaseUrl}/auth/login`, {
        email: process.env.TEST_USER_EMAIL || 'test@example.com',
        password: process.env.TEST_USER_PASSWORD || 'test123'
      });
      
      return response.data.data.token;
    } catch (error) {
      console.warn('⚠️ Could not authenticate for protected API tests');
      return null;
    }
  }

  /**
   * Frontend Performance Testing
   */
  async runFrontendPerformanceTests() {
    console.log('\n🌐 Running Frontend Performance Tests...');
    
    const pages = [
      { name: 'Homepage', url: '/' },
      { name: 'Login', url: '/auth/login' },
      { name: 'Register', url: '/auth/registro' },
      { name: 'Explorer Dashboard', url: '/explorador/dashboard', auth: 'explorer' },
      { name: 'AS Dashboard', url: '/as/dashboard', auth: 'as' },
      { name: 'Service Search', url: '/explorador/buscar-servicio' },
      { name: 'Marketplace', url: '/explorador/marketplace' },
      { name: 'Professional Profile', url: '/explorador/profesional/1' }
    ];
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    
    try {
      for (const pageConfig of pages) {
        console.log(`  📄 Testing ${pageConfig.name}...`);
        
        const pageResults = await this.runFrontendPageTest(context, pageConfig);
        this.results.frontend.push(pageResults);
      }
    } finally {
      await browser.close();
    }
  }

  async runFrontendPageTest(context, pageConfig) {
    const page = await context.newPage();
    const results = [];
    
    try {
      // Enable performance monitoring
      await page.addInitScript(() => {
        window.performanceMetrics = [];
        
        // Monitor network requests
        window.networkRequests = [];
        
        // Override fetch to track API calls
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
          const startTime = performance.now();
          return originalFetch.apply(this, args).then(response => {
            const endTime = performance.now();
            window.networkRequests.push({
              url: args[0],
              duration: endTime - startTime,
              status: response.status
            });
            return response;
          });
        };
      });
      
      for (let i = 0; i < this.config.iterations; i++) {
        const iterationResults = await this.runSinglePageIteration(page, pageConfig, i + 1);
        results.push(iterationResults);
      }
      
    } finally {
      await page.close();
    }
    
    // Calculate aggregated metrics
    const successfulResults = results.filter(r => r.success);
    
    return {
      page: pageConfig.name,
      url: pageConfig.url,
      iterations: this.config.iterations,
      successfulIterations: successfulResults.length,
      metrics: this.aggregatePageMetrics(successfulResults)
    };
  }

  async runSinglePageIteration(page, pageConfig, iteration) {
    const startTime = Date.now();
    
    try {
      // Handle authentication if needed
      if (pageConfig.auth) {
        await this.authenticatePage(page, pageConfig.auth);
      }
      
      // Navigate and wait for load
      const response = await page.goto(`${this.config.frontendBaseUrl}${pageConfig.url}`, {
        waitUntil: 'networkidle',
        timeout: this.config.timeout
      });
      
      // Wait for Fixia-specific elements
      await this.waitForFixiaPageElements(page);
      
      // Collect performance metrics
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        return {
          // Core Web Vitals
          loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
          domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
          firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          
          // Network metrics
          networkRequests: window.networkRequests ? window.networkRequests.length : 0,
          totalNetworkTime: window.networkRequests ? 
            window.networkRequests.reduce((sum, req) => sum + req.duration, 0) : 0,
          
          // Memory usage (if available)
          memoryUsage: performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0
        };
      });
      
      const totalTime = Date.now() - startTime;
      
      return {
        iteration,
        success: true,
        totalTime,
        statusCode: response.status(),
        ...metrics
      };
      
    } catch (error) {
      const totalTime = Date.now() - startTime;
      
      this.results.errors.push({
        test: `Frontend ${pageConfig.name}`,
        error: error.message
      });
      
      return {
        iteration,
        success: false,
        totalTime,
        error: error.message
      };
    }
  }

  async authenticatePage(page, userType) {
    const credentials = {
      explorer: {
        email: process.env.TEST_EXPLORER_EMAIL || 'explorer@test.com',
        password: process.env.TEST_EXPLORER_PASSWORD || 'test123'
      },
      as: {
        email: process.env.TEST_AS_EMAIL || 'as@test.com',
        password: process.env.TEST_AS_PASSWORD || 'test123'
      }
    };
    
    if (!credentials[userType]) return;
    
    await page.goto(`${this.config.frontendBaseUrl}/auth/login`);
    await page.fill('input[type="email"]', credentials[userType].email);
    await page.fill('input[type="password"]', credentials[userType].password);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    try {
      await page.waitForURL(/\/(explorador|as)\/dashboard/, { timeout: 10000 });
    } catch (error) {
      console.warn(`⚠️ Authentication may have failed for ${userType}`);
    }
  }

  async waitForFixiaPageElements(page) {
    // Wait for common Fixia elements to load
    try {
      await page.waitForSelector('body', { timeout: 5000 });
      
      // Wait for navigation if present
      try {
        await page.waitForSelector('[data-testid="fixia-nav"]', { timeout: 3000 });
      } catch (e) {
        // Navigation might not be present on all pages
      }
      
      // Wait for main content area
      try {
        await page.waitForSelector('main', { timeout: 3000 });
      } catch (e) {
        // Main might not be present
      }
      
      // Wait for any loading states to finish
      try {
        await page.waitForSelector('[data-testid*="loading"]', { state: 'hidden', timeout: 2000 });
      } catch (e) {
        // No loading states found
      }
      
      // Additional wait for JavaScript to settle
      await page.waitForTimeout(1000);
      
    } catch (error) {
      console.warn(`⚠️ Some page elements may not have loaded properly: ${error.message}`);
    }
  }

  /**
   * Load Testing
   */
  async runLoadTests() {
    console.log('\n🔥 Running Load Tests...');
    
    const criticalEndpoints = [
      { name: 'Homepage', url: '/' },
      { name: 'Service Search', url: '/api/services/search?q=plomero' },
      { name: 'Login', url: '/api/auth/login', method: 'POST', payload: { email: 'test@example.com', password: 'test123' }}
    ];
    
    for (const users of this.config.concurrentUsers) {
      console.log(`  👥 Testing with ${users} concurrent users...`);
      
      for (const endpoint of criticalEndpoints) {
        const loadTestResult = await this.runLoadTest(endpoint, users);
        this.results.loadTests.push({
          endpoint: endpoint.name,
          concurrentUsers: users,
          ...loadTestResult
        });
      }
    }
  }

  async runLoadTest(endpoint, concurrentUsers) {
    const promises = [];
    const startTime = Date.now();
    
    // Create concurrent requests
    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(this.makeLoadTestRequest(endpoint, i));
    }
    
    try {
      const results = await Promise.allSettled(promises);
      const endTime = Date.now();
      
      const successfulRequests = results.filter(r => r.status === 'fulfilled' && r.value.success);
      const failedRequests = results.filter(r => r.status === 'rejected' || !r.value.success);
      
      const responseTimes = successfulRequests.map(r => r.value.responseTime);
      
      return {
        totalTime: endTime - startTime,
        totalRequests: concurrentUsers,
        successfulRequests: successfulRequests.length,
        failedRequests: failedRequests.length,
        successRate: (successfulRequests.length / concurrentUsers * 100).toFixed(2),
        averageResponseTime: responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0,
        maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
        minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0
      };
      
    } catch (error) {
      this.results.errors.push({
        test: `Load test ${endpoint.name} (${concurrentUsers} users)`,
        error: error.message
      });
      
      return {
        error: error.message,
        totalRequests: concurrentUsers,
        successfulRequests: 0,
        failedRequests: concurrentUsers
      };
    }
  }

  async makeLoadTestRequest(endpoint, userIndex) {
    const startTime = Date.now();
    
    try {
      let response;
      
      if (endpoint.url.startsWith('/api/')) {
        // API request
        const config = {
          method: endpoint.method || 'GET',
          url: `${this.config.apiBaseUrl.replace('/api', '')}${endpoint.url}`,
          timeout: this.config.timeout
        };
        
        if (endpoint.payload) {
          config.data = endpoint.payload;
          config.headers = { 'Content-Type': 'application/json' };
        }
        
        response = await axios(config);
      } else {
        // Frontend request
        response = await axios.get(`${this.config.frontendBaseUrl}${endpoint.url}`, {
          timeout: this.config.timeout
        });
      }
      
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        responseTime,
        statusCode: response.status,
        userIndex
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        responseTime,
        error: error.message,
        statusCode: error.response?.status || 0,
        userIndex
      };
    }
  }

  /**
   * Utility Methods
   */
  
  calculatePercentile(values, percentile) {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  aggregatePageMetrics(results) {
    const metrics = ['totalTime', 'loadTime', 'firstContentfulPaint', 'networkRequests', 'memoryUsage'];
    const aggregated = {};
    
    for (const metric of metrics) {
      const values = results.map(r => r[metric] || 0).filter(v => v > 0);
      
      if (values.length > 0) {
        aggregated[metric] = {
          avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
          min: Math.min(...values),
          max: Math.max(...values),
          p95: this.calculatePercentile(values, 95)
        };
      }
    }
    
    return aggregated;
  }

  async evaluatePerformanceThresholds() {
    console.log('\n🚥 Evaluating Performance Thresholds...');
    
    const failures = [];
    
    // Check API performance
    for (const result of this.results.api) {
      const threshold = this.getAPIThreshold(result.suite, result.test);
      if (threshold && result.performance.avg > threshold) {
        failures.push(`API ${result.suite}.${result.test}: ${result.performance.avg}ms > ${threshold}ms threshold`);
      }
    }
    
    // Check frontend performance
    for (const result of this.results.frontend) {
      if (result.metrics.totalTime?.avg > this.config.thresholds.frontend.loadTime) {
        failures.push(`Frontend ${result.page}: ${result.metrics.totalTime.avg}ms > ${this.config.thresholds.frontend.loadTime}ms threshold`);
      }
    }
    
    // Check load test results
    for (const result of this.results.loadTests) {
      if (parseFloat(result.successRate) < 95) {
        failures.push(`Load test ${result.endpoint}: ${result.successRate}% success rate < 95% threshold`);
      }
    }
    
    if (failures.length > 0) {
      console.error('❌ Performance thresholds failed:');
      failures.forEach(failure => console.error(`  - ${failure}`));
      throw new Error(`${failures.length} performance threshold failures`);
    }
    
    console.log('✅ All performance thresholds passed!');
  }

  getAPIThreshold(suite, test) {
    return this.config.thresholds.api[suite.toLowerCase()]?.[test];
  }

  async generatePerformanceReport() {
    console.log('\n📊 Generating Performance Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      config: {
        iterations: this.config.iterations,
        concurrentUsers: this.config.concurrentUsers,
        thresholds: this.config.thresholds
      },
      summary: {
        totalAPITests: this.results.api.length,
        totalFrontendTests: this.results.frontend.length,
        totalLoadTests: this.results.loadTests.length,
        totalErrors: this.results.errors.length
      },
      results: {
        api: this.results.api,
        frontend: this.results.frontend,
        loadTests: this.results.loadTests,
        errors: this.results.errors
      }
    };
    
    // Write JSON report
    const jsonPath = path.join(this.config.reportDir, 'performance-report.json');
    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));
    
    // Generate HTML report
    await this.generateHTMLReport(report);
    
    console.log(`📄 Performance reports generated in ${this.config.reportDir}`);
  }

  async generateHTMLReport(report) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fixia Performance Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1400px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .metric-label { color: #666; }
        .section { margin-bottom: 40px; }
        .results-grid { display: grid; gap: 20px; margin-bottom: 30px; }
        .result-card { border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; }
        .result-header { font-weight: bold; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
        .performance-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; }
        .performance-metric { text-align: center; background: #f8f9fa; padding: 10px; border-radius: 4px; }
        .success { color: #28a745; }
        .warning { color: #ffc107; }
        .error { color: #dc3545; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #dee2e6; }
        th { background: #f8f9fa; font-weight: bold; }
        .chart { height: 300px; background: #f8f9fa; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚡ Fixia Performance Report</h1>
            <p>Generated on ${report.timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <div class="metric-value">${report.summary.totalAPITests}</div>
                <div class="metric-label">API Tests</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.totalFrontendTests}</div>
                <div class="metric-label">Frontend Tests</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.totalLoadTests}</div>
                <div class="metric-label">Load Tests</div>
            </div>
            <div class="metric">
                <div class="metric-value ${report.summary.totalErrors > 0 ? 'error' : 'success'}">${report.summary.totalErrors}</div>
                <div class="metric-label">Errors</div>
            </div>
        </div>
        
        <!-- API Performance Results -->
        <div class="section">
            <h2>🚀 API Performance Results</h2>
            <div class="results-grid">
                ${report.results.api.map(result => `
                <div class="result-card">
                    <div class="result-header">${result.suite} - ${result.test}</div>
                    <p><strong>URL:</strong> ${result.method} ${result.url}</p>
                    <p><strong>Success Rate:</strong> ${((result.successfulIterations / result.iterations) * 100).toFixed(1)}%</p>
                    <div class="performance-metrics">
                        <div class="performance-metric">
                            <div><strong>${result.performance.avg}ms</strong></div>
                            <div>Average</div>
                        </div>
                        <div class="performance-metric">
                            <div><strong>${result.performance.min}ms</strong></div>
                            <div>Min</div>
                        </div>
                        <div class="performance-metric">
                            <div><strong>${result.performance.max}ms</strong></div>
                            <div>Max</div>
                        </div>
                        <div class="performance-metric">
                            <div><strong>${result.performance.p95}ms</strong></div>
                            <div>P95</div>
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
        
        <!-- Frontend Performance Results -->
        <div class="section">
            <h2>🌐 Frontend Performance Results</h2>
            <div class="results-grid">
                ${report.results.frontend.map(result => `
                <div class="result-card">
                    <div class="result-header">${result.page}</div>
                    <p><strong>URL:</strong> ${result.url}</p>
                    <p><strong>Success Rate:</strong> ${((result.successfulIterations / result.iterations) * 100).toFixed(1)}%</p>
                    <div class="performance-metrics">
                        ${Object.entries(result.metrics).map(([metric, values]) => `
                        <div class="performance-metric">
                            <div><strong>${values.avg}${metric.includes('Time') ? 'ms' : metric === 'memoryUsage' ? 'MB' : ''}</strong></div>
                            <div>${metric.replace(/([A-Z])/g, ' $1').toLowerCase()}</div>
                        </div>
                        `).join('')}
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
        
        <!-- Load Test Results -->
        <div class="section">
            <h2>🔥 Load Test Results</h2>
            <table>
                <thead>
                    <tr>
                        <th>Endpoint</th>
                        <th>Users</th>
                        <th>Success Rate</th>
                        <th>Avg Response</th>
                        <th>Max Response</th>
                        <th>Min Response</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.results.loadTests.map(result => `
                    <tr>
                        <td>${result.endpoint}</td>
                        <td>${result.concurrentUsers}</td>
                        <td class="${parseFloat(result.successRate) >= 95 ? 'success' : 'error'}">${result.successRate}%</td>
                        <td>${result.averageResponseTime}ms</td>
                        <td>${result.maxResponseTime}ms</td>
                        <td>${result.minResponseTime}ms</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        ${report.results.errors.length > 0 ? `
        <div class="section">
            <h2>❌ Errors</h2>
            <div class="results-grid">
                ${report.results.errors.map(error => `
                <div class="result-card">
                    <div class="result-header error">${error.test}</div>
                    <p><strong>Error:</strong> ${error.error}</p>
                    ${error.statusCode ? `<p><strong>Status Code:</strong> ${error.statusCode}</p>` : ''}
                </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
    </div>
</body>
</html>`;
    
    const htmlPath = path.join(this.config.reportDir, 'performance-report.html');
    await fs.writeFile(htmlPath, html);
  }
}

// Execute if run directly
if (require.main === module) {
  const performanceTesting = new FixiaPerformanceTesting({
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000/api',
    frontendBaseUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
    iterations: parseInt(process.env.PERFORMANCE_ITERATIONS) || 5,
    concurrentUsers: process.env.CONCURRENT_USERS?.split(',').map(n => parseInt(n)) || [1, 5, 10]
  });
  
  performanceTesting.run().catch(error => {
    console.error('Performance testing failed:', error);
    process.exit(1);
  });
}

module.exports = FixiaPerformanceTesting;