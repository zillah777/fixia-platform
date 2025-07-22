/**
 * SeeNode.com Deployment Configuration
 * Optimized configuration for Fixia backend deployment
 */

module.exports = {
  // Application Configuration
  app: {
    name: 'fixia-backend',
    port: process.env.PORT || 8080,
    node_version: '18.x',
    main: 'server.js',
    
    // Environment-specific settings
    environments: {
      production: {
        instances: 'max', // Use all available CPU cores
        exec_mode: 'cluster',
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        node_args: '--max-old-space-size=1024'
      },
      staging: {
        instances: 2,
        exec_mode: 'cluster',
        autorestart: true,
        watch: false,
        max_memory_restart: '512M'
      }
    }
  },

  // Build Configuration
  build: {
    // Install dependencies
    install: 'npm ci --production',
    
    // Build scripts
    scripts: {
      prebuild: [
        'echo "Preparing Fixia backend for SeeNode deployment..."',
        'npm run migrate || echo "Migration will run at startup"'
      ],
      postbuild: [
        'echo "Build completed successfully"',
        'echo "Fixia backend ready for deployment"'
      ]
    },

    // Environment variables validation
    required_env: [
      'DATABASE_URL',
      'JWT_SECRET',
      'NODE_ENV'
    ],

    optional_env: [
      'REDIS_URL',
      'SENTRY_DSN',
      'SENDGRID_API_KEY',
      'CLOUDFLARE_DOMAIN'
    ]
  },

  // Health Check Configuration
  health: {
    endpoint: '/health',
    timeout: 5000,
    interval: 30000,
    retries: 3
  },

  // Scaling Configuration
  scaling: {
    min_instances: 1,
    max_instances: 10,
    
    // Auto-scaling rules
    cpu_threshold: 80,
    memory_threshold: 85,
    response_time_threshold: 1000,
    
    // Scale up/down policies
    scale_up_cooldown: 300,    // 5 minutes
    scale_down_cooldown: 600   // 10 minutes
  },

  // Resource Limits
  resources: {
    memory: {
      min: '256MB',
      max: '1GB'
    },
    cpu: {
      min: 0.1,
      max: 1.0
    }
  },

  // Networking
  network: {
    // Custom domains (to be configured in SeeNode dashboard)
    domains: [
      'api.fixia.com.ar',
      'backend.fixia.com.ar'
    ],
    
    // SSL/TLS
    ssl: true,
    force_https: true,
    
    // CORS origins
    cors_origins: [
      'https://fixia.com.ar',
      'https://www.fixia.com.ar',
      'https://fixia-platform.vercel.app'
    ]
  },

  // Database Configuration
  database: {
    type: 'postgresql',
    ssl: true,
    pool: {
      min: 2,
      max: 10,
      idle_timeout: 30000
    },
    
    // Migration settings
    migrations: {
      auto_run: true,
      table: 'migrations',
      directory: './scripts'
    }
  },

  // Redis Configuration (optional)
  redis: {
    enabled: true,
    fallback: 'memory',
    pool: {
      min: 1,
      max: 5
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    
    // Log rotation
    rotation: {
      size: '50MB',
      files: 5
    },
    
    // Structured logging
    structured: true,
    include_metadata: true
  },

  // Monitoring & Alerts
  monitoring: {
    // Metrics collection
    metrics: {
      enabled: true,
      interval: 60000,
      retention: '7d'
    },
    
    // Alerts
    alerts: {
      email: process.env.ALERT_EMAIL,
      webhook: process.env.ALERT_WEBHOOK,
      
      // Alert conditions
      conditions: {
        high_memory: '90%',
        high_cpu: '90%',
        slow_response: '2000ms',
        error_rate: '5%'
      }
    }
  },

  // Security Configuration
  security: {
    // Rate limiting
    rate_limit: {
      enabled: true,
      window: 900000,  // 15 minutes
      max: 1000,       // requests per window
      skip_successful: false
    },
    
    // Request filtering
    filtering: {
      max_request_size: '10MB',
      allowed_methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      block_suspicious: true
    },
    
    // Headers
    security_headers: {
      hsts: true,
      content_type_options: true,
      frame_options: 'DENY',
      xss_protection: true
    }
  },

  // Backup Configuration
  backup: {
    enabled: true,
    schedule: '0 2 * * *', // Daily at 2 AM
    retention: '30d',
    
    // What to backup
    include: [
      'uploads/',
      'logs/',
      'config/'
    ]
  },

  // Development Configuration
  development: {
    hot_reload: false, // Not needed for backend
    debug: process.env.NODE_ENV === 'development',
    
    // Development-specific features
    features: {
      api_docs: true,
      debug_routes: false,
      verbose_logging: true
    }
  }
};

// Export environment-specific config
const env = process.env.NODE_ENV || 'development';
const config = module.exports;

// Merge environment-specific settings
if (config.app.environments[env]) {
  Object.assign(config.app, config.app.environments[env]);
}

// SeeNode-specific optimizations
if (process.env.SEENODE_DEPLOYMENT === 'true') {
  // Enable all SeeNode features
  config.seenode_features = {
    auto_scaling: true,
    load_balancing: true,
    health_monitoring: true,
    log_aggregation: true,
    metrics_collection: true,
    ssl_termination: true
  };
}