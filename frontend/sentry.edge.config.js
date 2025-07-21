import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  
  // Performance Monitoring for Edge Runtime
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Release tracking
  release: process.env.SENTRY_RELEASE || `fixia-frontend@${process.env.npm_package_version}`,
  
  // Edge-specific configuration
  debug: process.env.NODE_ENV === 'development',
  maxBreadcrumbs: 25, // Lower limit for edge runtime
  
  // Filter sensitive data
  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    
    // Filter out sensitive information
    if (event.request && event.request.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
    }
    
    return event;
  },
  
  // Edge-specific tags
  tags: {
    component: 'frontend-edge',
  },
  
  // Initial scope
  initialScope: {
    tags: { 
      component: 'frontend-edge',
      version: process.env.npm_package_version 
    },
  },
});