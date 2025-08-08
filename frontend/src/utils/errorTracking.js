import * as Sentry from '@sentry/nextjs';

/**
 * Enhanced error tracking utilities for Fixia frontend
 */

// Error severity levels
export const ERROR_LEVELS = {
  FATAL: 'fatal',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  DEBUG: 'debug'
};

// Error categories for better organization
export const ERROR_CATEGORIES = {
  AUTH: 'authentication',
  API: 'api_request',
  UI: 'user_interface',
  PAYMENT: 'payment',
  CHAT: 'real_time_chat',
  BOOKING: 'booking_system',
  NAVIGATION: 'navigation',
  PERFORMANCE: 'performance'
};

/**
 * Capture exception with enhanced context
 */
export const captureException = (error, context = {}) => {
  if (process.env['NODE_ENV'] === 'development') {
    console.error('Error captured:', error, context);
  }

  Sentry.withScope((scope) => {
    // Set user context
    if (context.user) {
      scope.setUser({
        id: context.user.id,
        email: context.user.email,
        userType: context.user.user_type
      });
    }

    // Set tags for filtering
    if (context.tags) {
      Object.keys(context.tags).forEach(key => {
        scope.setTag(key, context.tags[key]);
      });
    }

    // Set category tag
    if (context.category) {
      scope.setTag('category', context.category);
    }

    // Set extra context
    if (context.extra) {
      Object.keys(context.extra).forEach(key => {
        scope.setExtra(key, context.extra[key]);
      });
    }

    // Set level
    if (context.level) {
      scope.setLevel(context.level);
    }

    // Set fingerprint for grouping similar errors
    if (context.fingerprint) {
      scope.setFingerprint(context.fingerprint);
    }

    Sentry.captureException(error);
  });
};

/**
 * Capture custom message
 */
export const captureMessage = (message, level = ERROR_LEVELS.INFO, context = {}) => {
  if (process.env['NODE_ENV'] === 'development') {
    console.log('Message captured:', message, context);
  }

  Sentry.withScope((scope) => {
    scope.setLevel(level);

    if (context.user) {
      scope.setUser({
        id: context.user.id,
        email: context.user.email,
        userType: context.user.user_type
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

/**
 * Track API errors with specific context
 */
export const trackApiError = (error, endpoint, method = 'GET', user = null) => {
  const context = {
    category: ERROR_CATEGORIES.API,
    tags: {
      endpoint,
      method,
      status_code: error.response?.status?.toString() || 'unknown'
    },
    extra: {
      url: error.config?.url,
      responseData: error.response?.data,
      requestData: error.config?.data
    },
    user,
    level: ERROR_LEVELS.ERROR,
    fingerprint: ['api-error', endpoint, method]
  };

  captureException(error, context);
};

/**
 * Track authentication errors
 */
export const trackAuthError = (error, action, user = null) => {
  const context = {
    category: ERROR_CATEGORIES.AUTH,
    tags: {
      auth_action: action,
      error_type: error.name || 'AuthError'
    },
    extra: {
      errorMessage: error.message,
      errorCode: error.code
    },
    user,
    level: ERROR_LEVELS.WARNING,
    fingerprint: ['auth-error', action]
  };

  captureException(error, context);
};

/**
 * Track payment errors
 */
export const trackPaymentError = (error, paymentMethod, amount, user = null) => {
  const context = {
    category: ERROR_CATEGORIES.PAYMENT,
    tags: {
      payment_method: paymentMethod,
      error_type: error.name || 'PaymentError'
    },
    extra: {
      amount,
      errorMessage: error.message,
      errorCode: error.code
    },
    user,
    level: ERROR_LEVELS.ERROR,
    fingerprint: ['payment-error', paymentMethod]
  };

  captureException(error, context);
};

/**
 * Track UI/UX errors
 */
export const trackUIError = (error, component, action, user = null) => {
  const context = {
    category: ERROR_CATEGORIES.UI,
    tags: {
      component,
      ui_action: action,
      error_type: error.name || 'UIError'
    },
    extra: {
      errorMessage: error.message,
      stack: error.stack
    },
    user,
    level: ERROR_LEVELS.WARNING,
    fingerprint: ['ui-error', component, action]
  };

  captureException(error, context);
};

/**
 * Track performance issues
 */
export const trackPerformanceIssue = (metric, value, threshold, user = null) => {
  const context = {
    category: ERROR_CATEGORIES.PERFORMANCE,
    tags: {
      metric,
      performance_issue: 'slow_operation'
    },
    extra: {
      value,
      threshold,
      difference: value - threshold
    },
    user,
    level: ERROR_LEVELS.WARNING
  };

  captureMessage(`Performance issue: ${metric} took ${value}ms (threshold: ${threshold}ms)`, ERROR_LEVELS.WARNING, context);
};

/**
 * Track business events for analytics
 */
export const trackBusinessEvent = (event, data = {}, user = null) => {
  const context = {
    category: 'business',
    tags: {
      business_event: event
    },
    extra: data,
    user,
    level: ERROR_LEVELS.INFO
  };

  captureMessage(`Business event: ${event}`, ERROR_LEVELS.INFO, context);
};

/**
 * Set user context for all subsequent events
 */
export const setUserContext = (user) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    userType: user.user_type,
    subscriptionType: user.subscription_type,
    isVerified: user.is_verified
  });
};

/**
 * Clear user context (on logout)
 */
export const clearUserContext = () => {
  Sentry.setUser(null);
};

/**
 * Add breadcrumb for tracking user actions
 */
export const addBreadcrumb = (message, category, data = {}, level = 'info') => {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level,
    timestamp: Date.now() / 1000
  });
};

/**
 * Start performance transaction
 */
export const startTransaction = (name, op = 'navigation') => {
  return Sentry.startTransaction({
    name,
    op
  });
};

/**
 * Error boundary helper
 */
export const withErrorBoundary = (Component, fallbackComponent) => {
  return Sentry.withErrorBoundary(Component, {
    fallback: fallbackComponent,
    beforeCapture: (scope, error, errorInfo) => {
      scope.setTag('errorBoundary', true);
      scope.setContext('errorInfo', errorInfo);
    }
  });
};

// Export Sentry for direct access when needed
export { Sentry };