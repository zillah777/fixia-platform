/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // iOS-Style Corporate Breakpoints
      screens: {
        'xs': '375px',     // iPhone SE, iPhone 12 mini
        'sm': '414px',     // iPhone Pro Max, Pixel phones
        'md': '768px',     // iPad Mini, Tablet portrait
        'lg': '1024px',    // iPad Pro, Desktop small
        'xl': '1280px',   // Desktop standard
        '2xl': '1536px',  // Desktop large
        '3xl': '1920px',  // Desktop extra large
        // iOS-specific breakpoints
        'iphone': {'max': '414px'},
        'ipad': {'min': '768px', 'max': '1024px'},
        'desktop': {'min': '1025px'},
        // Corporate layout breakpoints
        'sidebar-mobile': {'max': '1023px'},
        'sidebar-desktop': {'min': '1024px'},
      },
      colors: {
        // FIXIA 2025 - Apple-Inspired Minimal Color System
        // Less is more - Professional elegance through simplicity
        
        // Primary: Corporate Blue - Single brand color
        primary: {
          50: '#f0f9ff',    // Ultra light background
          100: '#e0f2fe',   // Light background
          200: '#bae6fd',   // Soft accent
          300: '#7dd3fc',   // Light interactive
          400: '#38bdf8',   // Medium interactive
          500: '#0ea5e9',   // Main brand color - Professional & Trustworthy
          600: '#0284c7',   // Hover states
          700: '#0369a1',   // Active states
          800: '#075985',   // Deep brand
          900: '#0c4a6e',   // Darkest brand
        },
        
        // Neutral: Apple-style grays - The foundation
        neutral: {
          50: '#fafafa',    // Pure background
          100: '#f5f5f5',   // Card backgrounds
          200: '#e5e5e5',   // Borders
          300: '#d4d4d4',   // Dividers
          400: '#a3a3a3',   // Placeholder text
          500: '#737373',   // Secondary text
          600: '#525252',   // Primary text light
          700: '#404040',   // Primary text
          800: '#262626',   // Headers
          900: '#171717',   // Deep text
        },

        // Success: Apple-style green - Clean & minimal
        success: {
          50: '#f0fdf4',
          400: '#4ade80',   
          500: '#22c55e',   // Clean success state
          600: '#16a34a',
        },

        // Warning: Apple-style amber - Subtle alerts
        warning: {
          50: '#fefce8',
          400: '#facc15',
          500: '#eab308',   // Clear warning state
          600: '#ca8a04',
        },

        // Error: Apple-style red - Clear but not aggressive
        error: {
          50: '#fef2f2',
          400: '#f87171',
          500: '#ef4444',   // Clean error state
          600: '#dc2626',
        },

        // Legacy aliases for backward compatibility
        // These will be gradually phased out
        secondary: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        
        // Simplified aliases
        accent: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        
        trust: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'gradient-x': 'gradientX 15s ease infinite',
        'gradient-y': 'gradientY 15s ease infinite',
        'gradient-xy': 'gradientXY 15s ease infinite',
        'bounce-slow': 'bounce 3s infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 20px rgba(14, 165, 233, 0.4)'
          },
          '50%': { 
            opacity: '.8',
            boxShadow: '0 0 40px rgba(14, 165, 233, 0.8)'
          },
        },
        gradientX: {
          '0%, 100%': {
            transform: 'translateX(0%)',
          },
          '50%': {
            transform: 'translateX(100%)',
          },
        },
        gradientY: {
          '0%, 100%': {
            transform: 'translateY(0%)',
          },
          '50%': {
            transform: 'translateY(100%)',
          },
        },
        gradientXY: {
          '0%, 100%': {
            transform: 'translate(0%, 0%)',
          },
          '25%': {
            transform: 'translate(100%, 0%)',
          },
          '50%': {
            transform: 'translate(100%, 100%)',
          },
          '75%': {
            transform: 'translate(0%, 100%)',
          },
        },
      },
    },
  },
  plugins: [],
}

