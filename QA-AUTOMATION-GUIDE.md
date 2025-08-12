# 🔍 Fixia QA Automation System

> **Comprehensive Quality Assurance Automation for the Fixia Marketplace Platform**

## 📖 Overview

The Fixia QA Automation System is a comprehensive testing and quality assurance framework designed specifically for the Fixia marketplace platform. It provides automated testing, performance monitoring, visual regression detection, and deployment readiness evaluation.

### 🎯 Key Features

- **Automated Test Execution Pipeline** - Parallel test running with intelligent retry mechanisms
- **Visual Regression Testing** - Cross-browser screenshot comparison and diff detection
- **Performance Testing Automation** - API and frontend performance monitoring with budgets
- **Coverage Analysis** - Comprehensive test coverage reporting with quality gates
- **Quality Gates Integration** - Automated deployment readiness verification
- **CI/CD Integration** - Seamless GitHub Actions workflow integration

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 7+
- Git

### Installation

1. **Install QA Dependencies**
   ```bash
   npm run setup:qa
   ```

2. **Configure Environment Variables**
   ```bash
   # Copy and configure QA environment
   cp .env.example .env.qa
   
   # Set QA-specific variables
   export NODE_ENV=test
   export COVERAGE_THRESHOLD=70
   export PERFORMANCE_BUDGET=3000
   export VISUAL_DIFF_THRESHOLD=5
   ```

3. **Run Initial QA Setup**
   ```bash
   # Install Playwright browsers
   npm run test:e2e:install-deps
   
   # Verify QA system
   npm run quality:check
   ```

### Quick Commands

```bash
# Run all QA automation
npm run qa:full

# Individual QA components
npm run qa:coverage      # Coverage analysis
npm run qa:performance   # Performance testing  
npm run qa:visual       # Visual regression testing

# Quality gates evaluation
npm run quality:gates
```

---

## 🧪 Testing Framework Components

### 1. **Automated Test Execution Pipeline**

Located: `/scripts/qa-automation.js`

**Features:**
- Parallel test execution with configurable workers
- Intelligent test retry mechanisms for flaky tests
- Comprehensive test result aggregation and reporting
- Failed test analysis with actionable recommendations

**Configuration:**
```javascript
const config = {
  parallelWorkers: 4,
  retryFailedTests: 2,
  testTimeout: 30000,
  coverageThreshold: { statements: 70, branches: 70, functions: 70, lines: 70 }
};
```

**Usage:**
```bash
# Run complete QA pipeline
node scripts/qa-automation.js

# With custom configuration
PARALLEL_WORKERS=8 RETRY_ATTEMPTS=3 node scripts/qa-automation.js
```

### 2. **Visual Regression Testing**

Located: `/scripts/visual-regression-setup.js`

**Features:**
- Cross-browser screenshot capture (Chromium, Firefox, WebKit)
- Multi-viewport testing (Desktop, Tablet, Mobile)
- Pixel-perfect comparison with configurable thresholds
- Automated baseline management and diff visualization

**Configuration:**
```javascript
const config = {
  browsers: ['chromium', 'firefox'],
  viewports: [
    { width: 1920, height: 1080, name: 'desktop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 375, height: 667, name: 'mobile' }
  ],
  threshold: 0.2, // 20% pixel difference threshold
  failureThreshold: 5 // 5% difference causes failure
};
```

**Pages Tested:**
- Authentication pages (login, registration)
- Dashboard interfaces (Explorer, AS)
- Marketplace and service listings
- Chat interfaces and communication flows
- Payment and transaction pages

**Usage:**
```bash
# Run visual regression tests
node scripts/visual-regression-setup.js

# With production baseline
TEST_BASE_URL=https://fixia-platform.vercel.app node scripts/visual-regression-setup.js
```

### 3. **Performance Testing Automation**

Located: `/scripts/performance-testing.js`

**Features:**
- API endpoint performance monitoring with response time tracking
- Frontend performance analysis with Core Web Vitals
- Load testing with concurrent user simulation
- Performance budget enforcement and threshold alerts

**API Performance Thresholds:**
```javascript
const thresholds = {
  auth: { login: 500, register: 800 },
  services: { list: 600, details: 400, search: 800 },
  dashboard: { stats: 700, summary: 500 },
  chat: { conversations: 600, messages: 400 },
  payments: { create: 1000, status: 300 }
};
```

**Frontend Performance Thresholds:**
```javascript
const thresholds = {
  loadTime: 3000,              // Total page load time
  firstContentfulPaint: 1500,  // First meaningful content
  largestContentfulPaint: 2500, // Largest content element
  cumulativeLayoutShift: 0.1,   // Visual stability
  firstInputDelay: 100          // Input responsiveness
};
```

**Usage:**
```bash
# Run performance tests
node scripts/performance-testing.js

# With custom budgets
PERFORMANCE_BUDGET=2000 API_TIMEOUT=800 node scripts/performance-testing.js
```

### 4. **Coverage Analysis & Quality Gates**

Located: `/scripts/coverage-analysis.js`

**Features:**
- Comprehensive test coverage analysis with detailed reporting
- Critical file coverage enforcement for security-sensitive components
- Dead code detection and cleanup recommendations
- Quality gate evaluation with deployment readiness assessment

**Coverage Requirements:**
```javascript
const thresholds = {
  global: { statements: 70, branches: 70, functions: 70, lines: 70 },
  critical: { 
    statements: 85, branches: 80, functions: 85, lines: 85,
    files: [
      'src/controllers/authController.js',
      'src/controllers/paymentsController.js',
      'src/middleware/auth.js',
      'src/services/mercadopagoService.js'
    ]
  }
};
```

**Quality Gates:**
- **Coverage Gates**: Minimum test coverage thresholds
- **Performance Gates**: API response time and page load budgets  
- **Security Gates**: Vulnerability scanning and dependency auditing
- **Code Quality Gates**: Linting, type checking, and complexity analysis

**Usage:**
```bash
# Run coverage analysis
node scripts/coverage-analysis.js

# Evaluate quality gates
STRICT_QUALITY_GATES=true node scripts/coverage-analysis.js
```

---

## ⚙️ Configuration

### Central Configuration

All QA settings are centralized in `/qa.config.js`:

```javascript
module.exports = {
  // Global settings
  global: {
    timeout: 30000,
    retries: 2,
    workers: 4
  },
  
  // Coverage thresholds
  coverage: {
    thresholds: {
      global: { statements: 70, branches: 70, functions: 70, lines: 70 },
      critical: { statements: 85, branches: 80, functions: 85, lines: 85 }
    }
  },
  
  // Performance budgets
  performance: {
    api: { auth: { login: 500 }, services: { list: 600 } },
    frontend: { loadTime: 3000, firstContentfulPaint: 1500 }
  },
  
  // Visual regression settings
  visualRegression: {
    browsers: ['chromium'],
    threshold: 0.2,
    failureThreshold: 5
  },
  
  // Quality gates
  qualityGates: {
    deployment: {
      minimumTestCoverage: 70,
      minimumPassRate: 95,
      maximumAPIResponseTime: 1000
    }
  }
};
```

### Environment Variables

```bash
# Coverage Thresholds
COVERAGE_STATEMENTS_THRESHOLD=70
COVERAGE_BRANCHES_THRESHOLD=70
COVERAGE_FUNCTIONS_THRESHOLD=70
COVERAGE_LINES_THRESHOLD=70

# Performance Budgets
PERFORMANCE_BUDGET=3000          # Frontend load time (ms)
API_RESPONSE_THRESHOLD=1000      # API response time (ms)
LIGHTHOUSE_PERFORMANCE_SCORE=80  # Minimum Lighthouse score

# Visual Regression
VISUAL_DIFF_THRESHOLD=5          # Percentage difference threshold
VISUAL_BROWSERS=chromium,firefox # Browsers to test

# Quality Gates
STRICT_QUALITY_GATES=true        # Fail build on quality gate failures
DEPLOYMENT_READY_THRESHOLD=95    # Minimum pass rate for deployment

# Test Environment
NODE_ENV=test
TEST_BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:5000/api

# Test Credentials
TEST_EXPLORER_EMAIL=explorer@test.fixia.com
TEST_EXPLORER_PASSWORD=test123
TEST_AS_EMAIL=as@test.fixia.com  
TEST_AS_PASSWORD=test123
```

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow

The QA system is fully integrated with GitHub Actions via `.github/workflows/qa-automation.yml`:

**Workflow Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main`
- Daily scheduled runs at 2 AM UTC
- Manual workflow dispatch with custom parameters

**Workflow Jobs:**
1. **Pre-flight Checks** - Determine what tests to run based on file changes
2. **Code Quality Analysis** - ESLint, TypeScript checking, security audits
3. **Backend Tests** - Unit tests, integration tests, coverage analysis
4. **E2E Tests** - Critical user journey testing with Playwright
5. **Visual Regression** - Cross-browser visual comparison testing
6. **Performance Tests** - API and frontend performance monitoring
7. **QA Report Generation** - Comprehensive test result aggregation
8. **Quality Gates Evaluation** - Deployment readiness assessment
9. **Automated Deployment** - Deploy only if all quality gates pass

**Quality Gate Integration:**
```yaml
- name: Evaluate quality gates
  run: |
    node scripts/coverage-analysis.js
    node scripts/qa-automation.js
    
    # Check deployment readiness
    if [ "${{ needs.quality-gates.result }}" == "success" ]; then
      echo "✅ All quality gates passed - ready for deployment"
    else
      echo "❌ Quality gates failed - deployment blocked"
      exit 1
    fi
```

### Branch Protection Rules

Recommended GitHub branch protection rules:

```yaml
# .github/branch-protection.yml
protection_rules:
  main:
    required_status_checks:
      - "QA/quality-gates"
      - "Backend Tests"
      - "E2E Tests" 
      - "Performance Tests"
    enforce_admins: true
    required_pull_request_reviews:
      required_approving_review_count: 1
      require_code_owner_reviews: true
```

---

## 📊 Reporting & Analytics

### Test Reports

The QA system generates comprehensive reports in multiple formats:

**HTML Reports:**
- Interactive coverage reports with file-level details
- Visual regression reports with side-by-side comparisons
- Performance reports with trend analysis
- Quality gate status dashboards

**JSON Reports:**
- Machine-readable test results for CI/CD integration
- Coverage data for external tools (Codecov, SonarQube)
- Performance metrics for monitoring systems

**Markdown Summaries:**
- Pull request comments with test results
- README-style summaries for quick reference
- Deployment readiness checklists

### Artifacts & Retention

Test artifacts are automatically collected and retained:

```javascript
const retention = {
  screenshots: 7,   // days
  videos: 7,        // days  
  reports: 30,      // days
  coverage: 30,     // days
  performance: 90   // days
};
```

### Notifications

Automated notifications for test failures and quality gate status:

**Slack Integration:**
```bash
# Set Slack webhook for notifications
export SLACK_WEBHOOK=https://hooks.slack.com/services/...

# Notifications sent to #qa-alerts channel for:
# - Test failures
# - Quality gate failures  
# - Performance budget exceeded
# - Visual regression detected
```

---

## 🛠️ Marketplace-Specific Testing

### Critical User Journeys

The QA system focuses on marketplace-specific critical paths:

1. **User Authentication Flow**
   - Registration with email verification
   - Login with proper session management
   - Role-based access control (Explorer vs AS)

2. **Service Discovery & Booking**
   - Service search and filtering
   - Professional profile viewing
   - Service request submission

3. **Real-time Communication**
   - Chat system functionality
   - Message delivery and read receipts
   - File sharing and media support

4. **Payment Processing** 
   - MercadoPago integration testing
   - Payment flow completion
   - Webhook processing and order updates

5. **Marketplace Operations**
   - Service listing management
   - Review and rating system
   - Dashboard analytics and reporting

### Fixia-Specific Test Data

```javascript
const testData = {
  users: {
    explorer: {
      email: 'explorer@test.fixia.com',
      location: 'Puerto Madryn',
      preferences: ['plomeria', 'electricidad']
    },
    as: {
      email: 'as@test.fixia.com', 
      services: ['Plomería', 'Reparaciones'],
      coverage_area: 'Puerto Madryn y alrededores'
    }
  },
  
  services: {
    categories: ['plomeria', 'electricidad', 'albanieria', 'limpieza'],
    locations: ['puerto-madryn', 'trelew', 'comodoro-rivadavia'],
    price_ranges: [500, 1500, 3000, 5000]
  },
  
  payments: {
    test_cards: {
      approved: '4170000000000001', 
      declined: '4000000000000002'
    }
  }
};
```

---

## 🔧 Troubleshooting

### Common Issues

**1. Visual Regression Test Failures**
```bash
# Check for UI changes or timing issues
npm run qa:visual

# Update baselines after confirmed UI changes
git add test-results/visual/baseline/
git commit -m "Update visual regression baselines"
```

**2. Performance Test Failures**  
```bash
# Check API response times
curl -w "@curl-format.txt" -s -o /dev/null http://localhost:5000/api/services

# Optimize slow endpoints
npm run qa:performance -- --verbose
```

**3. Coverage Below Thresholds**
```bash
# Identify uncovered code
npm run test:coverage

# Generate detailed coverage report
npm run qa:coverage
```

**4. E2E Test Flakiness**
```bash
# Run with retries and debugging
npm run test:e2e:debug

# Check for timing issues
npm run test:e2e -- --timeout=60000
```

### Debug Mode

Enable detailed logging and debugging:

```bash
# Enable debug logging
export LOG_LEVEL=debug
export QA_DEBUG=true

# Run with verbose output
npm run qa:full -- --verbose

# Generate debug reports
DEBUG=* node scripts/qa-automation.js
```

### Health Checks

Verify QA system health:

```bash
# Check system dependencies
node -e "
  console.log('Node version:', process.version);
  console.log('Playwright installed:', require('@playwright/test'));
  console.log('Database connection:', process.env.DB_HOST);
"

# Verify test environment
npm run quality:check -- --dry-run
```

---

## 📈 Advanced Usage

### Custom Test Suites

Create marketplace-specific test suites:

```javascript
// custom-test-suite.js
const FixiaQAAgent = require('./scripts/qa-automation');

class MarketplaceTestSuite extends FixiaQAAgent {
  async runMarketplaceTests() {
    // Custom marketplace testing logic
    await this.testServiceDiscovery();
    await this.testPaymentFlows();
    await this.testChatFunctionality();
  }
  
  async testServiceDiscovery() {
    // Test service search and filtering
    console.log('🔍 Testing service discovery...');
  }
  
  async testPaymentFlows() {
    // Test MercadoPago integration
    console.log('💳 Testing payment flows...');
  }
}

// Run custom test suite
const testSuite = new MarketplaceTestSuite();
testSuite.runMarketplaceTests();
```

### Performance Profiling

Deep performance analysis:

```bash
# Profile API endpoints
node --prof scripts/performance-testing.js
node --prof-process isolate-* > profile.txt

# Frontend performance profiling  
npm run qa:performance -- --profile --lighthouse
```

### Visual Regression Baselines

Manage visual regression baselines:

```bash
# Create new baselines
npm run qa:visual -- --update-baselines

# Compare with specific baseline
npm run qa:visual -- --baseline-dir=./baselines/v1.0.0

# Approve visual changes
npm run qa:visual -- --approve-changes
```

---

## 🚀 Deployment Integration

### Production Readiness Checklist

Before deploying to production, ensure:

- [ ] All unit tests pass (>95% pass rate)
- [ ] Integration tests complete successfully  
- [ ] E2E critical journeys validated
- [ ] Performance budgets met
- [ ] Visual regressions resolved
- [ ] Security vulnerabilities addressed
- [ ] Code coverage above thresholds
- [ ] Quality gates passed

### Automated Deployment Gates

```yaml
# GitHub Actions deployment job
deploy:
  name: Deploy to Production
  needs: [quality-gates]
  if: needs.quality-gates.result == 'success'
  environment: production
  
  steps:
  - name: Verify deployment readiness
    run: |
      if [ "${{ needs.quality-gates.result }}" == "success" ]; then
        echo "✅ Quality gates passed - deploying to production"
      else
        echo "❌ Quality gates failed - blocking deployment"  
        exit 1
      fi
      
  - name: Deploy application
    run: |
      # Deploy to production
      npm run deploy:production
```

### Post-Deployment Verification

```bash
# Verify production deployment
npm run qa:performance -- --env=production
npm run qa:visual -- --env=production --baseline-dir=production-baselines

# Monitor post-deployment metrics
node scripts/post-deployment-health-check.js
```

---

## 📚 Best Practices

### Test Writing Guidelines

1. **Write Marketplace-Focused Tests**
   - Test critical business flows (service booking, payments)
   - Validate user role-based functionality
   - Test real-world usage scenarios

2. **Performance-First Testing** 
   - Set realistic performance budgets
   - Test under load with concurrent users
   - Monitor Core Web Vitals continuously

3. **Visual Consistency**
   - Test across multiple browsers and viewports
   - Hide dynamic content for stable screenshots
   - Update baselines systematically

4. **Comprehensive Coverage**
   - Prioritize critical file coverage (auth, payments, chat)
   - Test error handling and edge cases
   - Validate integration points

### CI/CD Best Practices

1. **Parallel Execution**
   - Run tests in parallel for faster feedback
   - Use appropriate worker counts for CI environment
   - Cache dependencies for faster builds

2. **Quality Gates Integration**
   - Block deployments on quality gate failures
   - Provide clear feedback on test failures
   - Generate actionable recommendations

3. **Artifact Management**
   - Retain test artifacts for debugging
   - Store baselines for visual regression testing
   - Archive performance trends for analysis

---

## 🤝 Contributing

### Adding New Tests

1. **API Tests**: Add to `/backend/tests/`
2. **E2E Tests**: Add to `/e2e-tests/` 
3. **Visual Tests**: Update page list in `visual-regression-setup.js`
4. **Performance Tests**: Add endpoints to `performance-testing.js`

### Updating Thresholds

Update thresholds in `/qa.config.js`:

```javascript
// Example: Increase coverage threshold
coverage: {
  thresholds: {
    global: { statements: 80 } // Increased from 70
  }
}
```

### Custom QA Extensions

Create custom QA extensions by extending the base classes:

```javascript
const FixiaQAAgent = require('./scripts/qa-automation');

class CustomQAExtension extends FixiaQAAgent {
  // Add custom testing logic
}
```

---

## 📞 Support

- **Documentation**: This guide covers comprehensive QA automation setup
- **Issues**: Report QA system issues via GitHub Issues
- **Configuration**: Modify settings in `/qa.config.js`
- **CI/CD**: GitHub Actions workflow in `.github/workflows/qa-automation.yml`

---

**Fixia QA Automation System** - Ensuring marketplace quality through comprehensive automated testing.

*Generated for Fixia Platform - Service Marketplace for Chubut, Argentina*