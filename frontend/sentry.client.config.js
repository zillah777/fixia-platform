import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || `fixia-frontend@${process.env.npm_package_version}`,
  
  // Filter sensitive data
  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry event:', event);
      return null;
    }
    
    // Filter out sensitive information
    if (event.request && event.request.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
    }
    
    return event;
  },
  
  // Additional configuration
  maxBreadcrumbs: 50,
  debug: process.env.NODE_ENV === 'development',
  
  // Configure integrations
  integrations: [
    Sentry.replayIntegration({
      // Mask text content for privacy
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Configure error filtering
  beforeBreadcrumb(breadcrumb) {
    // Don't log navigation breadcrumbs for auth pages
    if (breadcrumb.category === 'navigation' && 
        breadcrumb.data && 
        (breadcrumb.data.to?.includes('/login') || breadcrumb.data.to?.includes('/register'))) {
      return null;
    }
    return breadcrumb;
  },
  
  // Custom tags
  tags: {
    component: 'frontend',
  },
  
  // Custom context
  initialScope: {
    tags: { 
      component: 'frontend',
      version: process.env.npm_package_version 
    },
  },
});