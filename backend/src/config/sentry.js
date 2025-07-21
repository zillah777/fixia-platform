const Sentry = require("@sentry/node");

const initSentry = (app) => {
  // Only initialize Sentry in production or staging
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'production',
      integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Sentry.Integrations.Express({ app }),
      ],
      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      // Capture 100% of the transactions for performance monitoring in development
      beforeSend(event) {
        // Don't send events in test environment
        if (process.env.NODE_ENV === 'test') {
          return null;
        }
        return event;
      },
      // Configure release
      release: process.env.SENTRY_RELEASE || `fixia-backend@${process.env.npm_package_version}`,
      // Additional configuration
      serverName: process.env.SERVER_NAME || 'fixia-backend',
      maxBreadcrumbs: 50,
      debug: process.env.NODE_ENV === 'development',
      // Filter sensitive data
      beforeBreadcrumb(breadcrumb) {
        // Don't log sensitive HTTP headers
        if (breadcrumb.category === 'http' && breadcrumb.data) {
          delete breadcrumb.data.authorization;
          delete breadcrumb.data.cookie;
        }
        return breadcrumb;
      }
    });

    console.log('✅ Sentry initialized for error tracking and performance monitoring');
  } else {
    console.log('📝 Sentry disabled in development mode (set NODE_ENV=production to enable)');
  }
};

// Middleware to capture errors
const sentryErrorHandler = () => {
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture all 4xx and 5xx errors
      return error.status >= 400;
    }
  });
};

// Middleware to capture requests
const sentryRequestHandler = () => {
  return Sentry.Handlers.requestHandler({
    // Control request data
    request: {
      // Don't include query parameters and body in error reports
      query: false,
      body: false
    }
  });
};

// Middleware to capture tracing
const sentryTracingHandler = () => {
  return Sentry.Handlers.tracingHandler();
};

// Custom error capturer with context
const captureException = (error, context = {}) => {
  Sentry.withScope((scope) => {
    // Add custom context
    if (context.user) {
      scope.setUser({
        id: context.user.id,
        email: context.user.email,
        user_type: context.user.user_type
      });
    }

    if (context.request) {
      scope.setTag('method', context.request.method);
      scope.setTag('url', context.request.originalUrl);
      scope.setTag('user_agent', context.request.get('User-Agent'));
    }

    if (context.extra) {
      Object.keys(context.extra).forEach(key => {
        scope.setExtra(key, context.extra[key]);
      });
    }

    if (context.tags) {
      Object.keys(context.tags).forEach(key => {
        scope.setTag(key, context.tags[key]);
      });
    }

    Sentry.captureException(error);
  });
};

// Custom message capturer
const captureMessage = (message, level = 'info', context = {}) => {
  Sentry.withScope((scope) => {
    scope.setLevel(level);
    
    if (context.user) {
      scope.setUser({
        id: context.user.id,
        email: context.user.email,
        user_type: context.user.user_type
      });
    }

    if (context.tags) {
      Object.keys(context.tags).forEach(key => {
        scope.setTag(key, context.tags[key]);
      });
    }

    if (context.extra) {
      Object.keys(context.extra).forEach(key => {
        scope.setExtra(key, context.extra[key]);
      });
    }

    Sentry.captureMessage(message);
  });
};

// Performance monitoring helper
const startTransaction = (name, op = 'http.server') => {
  return Sentry.startTransaction({
    name,
    op
  });
};

module.exports = {
  initSentry,
  sentryErrorHandler,
  sentryRequestHandler,
  sentryTracingHandler,
  captureException,
  captureMessage,
  startTransaction,
  Sentry
};