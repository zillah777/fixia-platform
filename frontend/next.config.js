const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
      },
      {
        protocol: 'https',
        hostname: 'fixia-platform-production.up.railway.app',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'fonts.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'fonts.gstatic.com',
      },
      // Unsplash for demo images
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // AWS S3 for user uploads
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
      // Cloudinary for image optimization
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      // Common Argentine image hosting services
      {
        protocol: 'https',
        hostname: '*.mercadolibre.com',
      }
    ],
    // Optimize for Argentine mobile-first approach
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 3600, // 1 hour cache for better performance
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Device sizes optimized for Argentine market
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Headers for CORS and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
        ],
      },
    ];
  },
  // Environment variables are handled by .env.local file
  // env: {
  //   NEXT_PUBLIC_API_URL: 'http://localhost:5000',
  // },
  // Optimize build for Vercel
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
  },
  // Compression and optimization
  compress: true,
  poweredByHeader: false,
  // Exclude problematic patterns
  webpack: (config, { isServer }) => {
    // Avoid processing certain file patterns that can cause micromatch issues
    config.watchOptions = {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/.next/**',
        '**/out/**',
        '**/*.backup',
        '**/*.bak',
        '**/*.orig',
        '**/*.tmp',
        '**/tsconfig.tsbuildinfo',
      ],
    };
    
    // Bundle analyzer in development
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }
    
    return config;
  },
};

// Sentry configuration
const sentryConfig = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  
  // Automatically tree-shake Sentry logger statements
  disableLogger: true,
  
  // Hides source maps from generated client bundles
  hideSourceMaps: true,
  
  // Upload source maps to Sentry
  widenClientFileUpload: true,
  
  // Transpiles SDK to be compatible with IE11
  transpileClientSDK: true,
  
  // Routes browser requests to Sentry through a Next.js rewrite
  tunnelRoute: "/monitoring",
  
  // Only run Sentry build plugin in production
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

// Make sure adding Sentry options is the last code to run before exporting
module.exports = process.env.NODE_ENV === 'production' && process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(nextConfig, sentryConfig)
  : nextConfig;