/**
 * QA Configuration for Fixia Platform
 * Central configuration for all quality assurance and testing automation
 */

module.exports = {
  // Global QA Settings
  global: {
    timeout: 30000,
    retries: 2,
    parallel: true,
    workers: process.env.CI ? 2 : 4,
    slowTestThreshold: 5000, // ms
    
    // Environment settings
    environments: {
      test: {
        api: 'http://localhost:5000/api',
        frontend: 'http://localhost:3000'
      },
      staging: {
        api: 'https://fixia-backend-staging.railway.app/api',
        frontend: 'https://fixia-staging.vercel.app'
      },
      production: {
        api: 'https://fixia-backend.railway.app/api',
        frontend: 'https://fixia-platform.vercel.app'
      }
    }
  },

  // Test Coverage Configuration
  coverage: {
    // Global coverage thresholds
    thresholds: {
      global: {
        statements: parseInt(process.env.COVERAGE_STATEMENTS_THRESHOLD) || 70,
        branches: parseInt(process.env.COVERAGE_BRANCHES_THRESHOLD) || 70,
        functions: parseInt(process.env.COVERAGE_FUNCTIONS_THRESHOLD) || 70,
        lines: parseInt(process.env.COVERAGE_LINES_THRESHOLD) || 70
      },
      
      // Critical files requiring higher coverage
      critical: {
        statements: 85,
        branches: 80,
        functions: 85,
        lines: 85,
        files: [
          // Authentication & Security
          'src/controllers/authController.js',
          'src/middleware/auth.js',
          'src/utils/validation.js',
          
          // Core Business Logic
          'src/controllers/servicesController.js',
          'src/controllers/paymentsController.js',
          'src/controllers/chatController.js',
          'src/controllers/dashboardController.js',
          
          // External Services
          'src/services/mercadopagoService.js',
          'src/services/emailService.js',
          
          // Data Layer
          'src/utils/database.js',
          'src/utils/queryOptimization.js',
          
          // Cache & Performance
          'src/services/cacheService.js',
          'src/middleware/cache.js'
        ]
      }
    },
    
    // Coverage reporting
    reporters: ['text', 'lcov', 'html', 'json-summary'],
    collectCoverageFrom: [
      'src/**/*.{js,jsx,ts,tsx}',
      '!src/**/*.test.{js,jsx,ts,tsx}',
      '!src/**/*.spec.{js,jsx,ts,tsx}',
      '!src/config/**',
      '!**/node_modules/**',
      '!**/coverage/**'
    ]
  },

  // Performance Testing Configuration
  performance: {
    // API Performance Thresholds (milliseconds)
    api: {
      thresholds: {
        // Authentication endpoints
        auth: {
          login: 500,
          register: 800,
          logout: 200,
          refresh: 300
        },
        
        // Service management
        services: {
          list: 600,
          details: 400,
          search: 800,
          create: 1000,
          update: 800,
          delete: 400
        },
        
        // Dashboard endpoints
        dashboard: {
          stats: 700,
          summary: 500,
          analytics: 1000
        },
        
        // Communication
        chat: {
          conversations: 600,
          messages: 400,
          send: 500
        },
        
        // Payments
        payments: {
          create: 1500,
          status: 300,
          webhook: 200
        },
        
        // File uploads
        uploads: {
          image: 2000,
          document: 3000
        }
      },
      
      // Load testing configuration
      loadTesting: {
        concurrentUsers: [1, 5, 10, 25],
        duration: '30s',
        rampUp: '10s'
      }
    },
    
    // Frontend Performance Thresholds
    frontend: {
      thresholds: {
        // Core Web Vitals
        loadTime: 3000,              // Total page load time
        firstContentfulPaint: 1500,  // First meaningful content
        largestContentfulPaint: 2500, // Largest content element
        timeToInteractive: 3000,      // Page becomes interactive
        
        // User Experience Metrics
        cumulativeLayoutShift: 0.1,   // Visual stability
        firstInputDelay: 100,         // Input responsiveness
        
        // Resource Metrics
        totalSize: 2048,              // KB - Total page size
        imageSize: 1024,              // KB - Total image size
        jsSize: 512,                  // KB - Total JavaScript size
        cssSize: 128,                 // KB - Total CSS size
        
        // Network Metrics
        networkRequests: 50,          // Maximum number of requests
        
        // Lighthouse scores (0-100)
        lighthouse: {
          performance: 80,
          accessibility: 90,
          bestPractices: 85,
          seo: 85
        }
      },
      
      // Pages to test
      criticalPages: [
        { name: 'Homepage', url: '/' },
        { name: 'Login', url: '/auth/login' },
        { name: 'Register', url: '/auth/registro' },
        { name: 'Explorer Dashboard', url: '/explorador/dashboard', auth: 'explorer' },
        { name: 'AS Dashboard', url: '/as/dashboard', auth: 'as' },
        { name: 'Service Search', url: '/explorador/buscar-servicio' },
        { name: 'Marketplace', url: '/explorador/marketplace' },
        { name: 'Chat Interface', url: '/explorador/chats', auth: 'explorer' },
        { name: 'Professional Profile', url: '/explorador/profesional/1' }
      ]
    }
  },

  // Visual Regression Testing Configuration
  visualRegression: {
    // Browser configurations
    browsers: ['chromium', 'firefox', 'webkit'],
    
    // Viewport configurations
    viewports: [
      { width: 1920, height: 1080, name: 'desktop-large' },
      { width: 1366, height: 768, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ],
    
    // Visual difference thresholds
    threshold: 0.2, // 20% pixel difference threshold
    failureThreshold: 5, // 5% difference causes failure
    
    // Pages to capture
    pages: [
      // Public pages
      { url: '/', name: 'homepage' },
      { url: '/como-funciona', name: 'how-it-works' },
      
      // Authentication pages
      { url: '/auth/login', name: 'auth-login' },
      { url: '/auth/registro', name: 'auth-register' },
      
      // Explorer pages
      { url: '/explorador/dashboard', name: 'explorer-dashboard', auth: 'explorer' },
      { url: '/explorador/marketplace', name: 'explorer-marketplace', auth: 'explorer' },
      { url: '/explorador/buscar-servicio', name: 'explorer-search', auth: 'explorer' },
      { url: '/explorador/chats', name: 'explorer-chats', auth: 'explorer' },
      
      // AS (Provider) pages
      { url: '/as/dashboard', name: 'as-dashboard', auth: 'as' },
      { url: '/as/servicios', name: 'as-services', auth: 'as' },
      { url: '/as/perfil', name: 'as-profile', auth: 'as' },
      { url: '/as/chats', name: 'as-chats', auth: 'as' },
      
      // Marketplace specific pages
      { url: '/explorador/profesional/1', name: 'professional-profile', auth: 'explorer' },
      
      // Error pages
      { url: '/404', name: 'not-found' },
      { url: '/500', name: 'server-error' }
    ],
    
    // Elements to hide for consistent screenshots
    hideElements: [
      '[data-testid*="timestamp"]',
      '[data-testid*="last-seen"]',
      '[data-testid*="time-ago"]',
      '.notification-badge',
      '[class*="animate-"]',
      '[class*="motion-"]',
      '[data-testid*="loading"]'
    ]
  },

  // E2E Testing Configuration
  e2e: {
    // Critical user journeys
    criticalJourneys: [
      {
        name: 'user-registration',
        description: 'Complete user registration flow',
        tests: ['e2e-tests/auth/registration.spec.ts']
      },
      {
        name: 'user-authentication',
        description: 'User login and authentication',
        tests: ['e2e-tests/auth/login.spec.ts']
      },
      {
        name: 'service-request',
        description: 'Explorer requests a service from AS',
        tests: ['e2e-tests/explorador/service-requests.spec.ts']
      },
      {
        name: 'service-management',
        description: 'AS manages services and responds to requests',
        tests: ['e2e-tests/as/service-management.spec.ts']
      },
      {
        name: 'chat-communication',
        description: 'Real-time chat between Explorer and AS',
        tests: ['e2e-tests/communication/chat.spec.ts']
      },
      {
        name: 'payment-processing',
        description: 'End-to-end payment flow with MercadoPago',
        tests: ['e2e-tests/payments/mercadopago.spec.ts']
      }
    ],
    
    // Test data configuration
    testData: {
      users: {
        explorer: {
          email: process.env.TEST_EXPLORER_EMAIL || 'explorer@test.fixia.com',
          password: process.env.TEST_EXPLORER_PASSWORD || 'test123'
        },
        as: {
          email: process.env.TEST_AS_EMAIL || 'as@test.fixia.com',
          password: process.env.TEST_AS_PASSWORD || 'test123'
        }
      },
      
      services: {
        categories: ['plomeria', 'electricidad', 'albanieria', 'limpieza'],
        locations: ['puerto-madryn', 'trelew', 'comodoro-rivadavia']
      }
    }
  },

  // Quality Gates Configuration
  qualityGates: {
    // Deployment readiness criteria
    deployment: {
      // Test quality requirements
      minimumTestCoverage: 70,
      minimumPassRate: 95,
      maximumFailedTests: 5,
      
      // Performance requirements
      maximumAPIResponseTime: 1000, // ms
      maximumPageLoadTime: 3000,    // ms
      minimumLighthouseScore: 80,
      
      // Security requirements
      maximumHighVulnerabilities: 0,
      maximumMediumVulnerabilities: 5,
      
      // Code quality requirements
      maximumCodeSmells: 10,
      maximumTechnicalDebt: 8, // hours
      maximumDuplication: 3.0, // %
      
      // Stability requirements
      maximumErrorRate: 1.0, // %
      minimumUptime: 99.9    // %
    },
    
    // Quality gate rules
    rules: {
      // Blocking rules (prevent deployment)
      blocking: [
        'security_high_vulnerabilities',
        'critical_test_failures',
        'performance_budget_exceeded',
        'coverage_below_minimum'
      ],
      
      // Warning rules (allow deployment with warnings)
      warning: [
        'security_medium_vulnerabilities',
        'minor_test_failures',
        'code_quality_issues',
        'visual_regression_differences'
      ]
    }
  },

  // Test Automation Configuration
  automation: {
    // Parallel execution
    parallel: {
      enabled: true,
      workers: process.env.CI ? 2 : 4,
      maxWorkers: 8
    },
    
    // Test retries
    retries: {
      unit: 0,        // Unit tests should not need retries
      integration: 2, // Integration tests may have network flakiness
      e2e: 2,        // E2E tests may have timing issues
      performance: 1, // Performance tests may have variance
      visual: 1      // Visual tests may have rendering differences
    },
    
    // Test timeouts (milliseconds)
    timeouts: {
      unit: 5000,
      integration: 15000,
      e2e: 30000,
      performance: 60000,
      visual: 30000
    },
    
    // Artifact retention
    artifacts: {
      screenshots: 7,  // days
      videos: 7,       // days
      reports: 30,     // days
      coverage: 30,    // days
      performance: 90  // days
    }
  },

  // Reporting Configuration
  reporting: {
    // Output formats
    formats: ['html', 'json', 'markdown', 'junit'],
    
    // Report destinations
    outputs: {
      local: './test-results',
      ci: './test-results',
      artifacts: true
    },
    
    // Notification settings
    notifications: {
      slack: {
        enabled: process.env.SLACK_WEBHOOK ? true : false,
        webhook: process.env.SLACK_WEBHOOK,
        channel: '#qa-alerts',
        onFailure: true,
        onSuccess: false,
        onQualityGateFailure: true
      },
      
      email: {
        enabled: false,
        recipients: ['qa@fixia.com.ar'],
        onFailure: true,
        onQualityGateFailure: true
      }
    },
    
    // Report content
    content: {
      includeStackTraces: true,
      includeScreenshots: true,
      includeVideos: true,
      includeLogs: true,
      includeMetrics: true,
      includeRecommendations: true
    }
  },

  // Integration Configuration
  integrations: {
    // CI/CD Systems
    github: {
      statusChecks: true,
      prComments: true,
      deploymentGating: true
    },
    
    // Monitoring & APM
    sentry: {
      enabled: process.env.SENTRY_DSN ? true : false,
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.GITHUB_SHA || 'local'
    },
    
    // Performance Monitoring
    lighthouse: {
      enabled: true,
      categories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: 'desktop',
      throttling: 'mobileSlow4G'
    }
  }
};