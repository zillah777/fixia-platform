/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Environment variables are handled by .env.local file
  // env: {
  //   NEXT_PUBLIC_API_URL: 'http://localhost:5000',
  // },
  // Optimize build for Vercel
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
  },
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
    return config;
  },
};

module.exports = nextConfig;