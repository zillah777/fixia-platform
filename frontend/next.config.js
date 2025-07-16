/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
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

module.exports = nextConfig;