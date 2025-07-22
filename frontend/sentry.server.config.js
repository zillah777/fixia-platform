import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry if DSN is provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Release tracking
  release: process.env.SENTRY_RELEASE || `fixia-frontend@${process.env.npm_package_version}`,
  
  // Server-specific configuration
  debug: process.env.NODE_ENV === 'development',
  maxBreadcrumbs: 50,
  
  // Filter sensitive data
  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry server event:', event);
      return null;
    }
    
    // Filter out sensitive information
    if (event.request) {
      if (event.request.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      
      // Remove sensitive query parameters
      if (event.request.query_string) {
        const sanitizedQuery = event.request.query_string
          .replace(/token=[^&]*/g, 'token=***')
          .replace(/password=[^&]*/g, 'password=***')
          .replace(/api_key=[^&]*/g, 'api_key=***');
        event.request.query_string = sanitizedQuery;
      }
    }
    
    return event;
  },
  
  // Server-specific tags
  tags: {
    component: 'frontend-server',
  },
  
  // Configure error filtering
  beforeBreadcrumb(breadcrumb) {
    // Don't log database connection breadcrumbs
    if (breadcrumb.category === 'query' || breadcrumb.category === 'db') {
      return null;
    }
    return breadcrumb;
  },
  
  // Initial scope
  initialScope: {
    tags: { 
      component: 'frontend-server',
      version: process.env.npm_package_version 
    },
  },
  });
}