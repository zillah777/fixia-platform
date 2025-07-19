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
        // FIXIA 2025 - Modern iOS-Style Palette
        // Sophisticated 5-color system: teal, orange, emerald, coral, deep green
        
        // Deep forest green - Primary brand
        forest: {
          50: '#f0f7f4',
          100: '#daeee4', 
          200: '#b5ddc9',
          300: '#85c4a7',
          400: '#55a582',
          500: '#264653',  // Main brand
          600: '#1f3a44',
          700: '#192f36',
          800: '#14242a',
          900: '#0f1a1e',
        },
        
        // Teal - Secondary brand
        teal: {
          50: '#f0fdfa',
          100: '#d4f7f0',
          200: '#a9efe1',
          300: '#7ee0d2',
          400: '#53d1c3',
          500: '#2a9d8f',  // Vibrant teal
          600: '#227e72',
          700: '#1a5e55',
          800: '#124038',
          900: '#0a201c',
        },
        
        // Amber/Gold - Accent highlights
        gold: {
          50: '#fefdf4',
          100: '#fef9e3',
          200: '#fef3c7',
          300: '#fde68a',
          400: '#fcd34d',
          500: '#e9c46a',  // Warm gold
          600: '#d69e2e',
          700: '#b7791f',
          800: '#975a16',
          900: '#744210',
        },
        
        // Coral/Orange - Interactive elements
        coral: {
          50: '#fef7f0',
          100: '#fdeee0',
          200: '#fbddc1',
          300: '#f8c492',
          400: '#f5ab63',
          500: '#f4a261',  // Warm coral
          600: '#e8924d',
          700: '#cc7a3a',
          800: '#a66129',
          900: '#7d4a1f',
        },
        
        // Terracotta/Red - States & alerts
        terra: {
          50: '#fef4f2',
          100: '#fce8e4',
          200: '#f9d1ca',
          300: '#f5b0a0',
          400: '#f18f76',
          500: '#e76f51',  // Rich terracotta
          600: '#d85b41',
          700: '#bd4a32',
          800: '#9c3d28',
          900: '#7a2f1f',
        },
        
        // Neutral grays - Modern iOS style
        gray: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },

        // Modern iOS semantic mapping 
        primary: {
          50: '#f0f7f4',
          100: '#daeee4',
          200: '#b5ddc9',
          300: '#85c4a7',
          400: '#55a582',
          500: '#264653',  // Forest green
          600: '#1f3a44',
          700: '#192f36',
          800: '#14242a',
          900: '#0f1a1e',
        },

        secondary: {
          50: '#f0fdfa',
          100: '#d4f7f0',
          200: '#a9efe1',
          300: '#7ee0d2',
          400: '#53d1c3',
          500: '#2a9d8f',  // Teal
          600: '#227e72',
          700: '#1a5e55',
          800: '#124038',
          900: '#0a201c',
        },

        neutral: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },

        success: {
          50: '#f0fdfa',
          500: '#2a9d8f',  // Teal
          600: '#227e72',
        },

        warning: {
          50: '#fefdf4',
          500: '#e9c46a',  // Gold
          600: '#d69e2e',
        },

        error: {
          50: '#fef4f2',
          500: '#e76f51',  // Terracotta
          600: '#d85b41',
        },

        accent: {
          50: '#fefdf4',
          500: '#e9c46a',  // Gold
          600: '#d69e2e',
        },

        trust: {
          50: '#f0fdfa',
          500: '#2a9d8f',  // Teal
          600: '#227e72',
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

