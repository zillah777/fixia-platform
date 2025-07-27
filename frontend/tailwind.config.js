/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Base colors
        border: 'rgba(255, 255, 255, 0.1)',
        input: 'rgba(255, 255, 255, 0.05)',
        ring: 'rgba(102, 126, 234, 0.3)',
        background: '#0a0a0b',
        foreground: 'rgba(255, 255, 255, 0.95)',
        
        // Primary - Liquid Blue
        primary: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#8b93f7',
          500: '#667eea',
          600: '#5a67d8',
          700: '#4c51bf',
          800: '#434190',
          900: '#3c366b',
          DEFAULT: '#667eea',
          foreground: 'rgba(255, 255, 255, 0.98)',
        },
        
        // Secondary - Glass Effect
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          foreground: 'rgba(255, 255, 255, 0.8)',
        },
        
        // Trust/Accent colors
        trust: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        
        // Status colors
        destructive: {
          DEFAULT: '#ff6b6b',
          foreground: 'rgba(255, 255, 255, 0.98)',
        },
        success: {
          DEFAULT: '#51cf66',
          foreground: 'rgba(255, 255, 255, 0.98)',
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#51cf66',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          DEFAULT: '#ffd93d',
          foreground: 'rgba(0, 0, 0, 0.9)',
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#ffd93d',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          DEFAULT: '#ff6b6b',
          foreground: 'rgba(255, 255, 255, 0.98)',
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ff6b6b',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        info: {
          DEFAULT: '#3b82f6',
          foreground: 'rgba(255, 255, 255, 0.98)',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        
        // UI elements
        muted: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',
          foreground: 'rgba(255, 255, 255, 0.6)',
        },
        accent: {
          DEFAULT: 'rgba(102, 126, 234, 0.15)',
          foreground: 'rgba(255, 255, 255, 0.9)',
        },
        popover: {
          DEFAULT: 'rgba(20, 20, 23, 0.95)',
          foreground: 'rgba(255, 255, 255, 0.9)',
        },
        card: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',
          foreground: 'rgba(255, 255, 255, 0.9)',
        },
        
        // Neutral system for light/dark compatibility
        neutral: {
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
          950: '#0a0a0a',
        },
        
        // Chart colors
        chart: {
          1: '#667eea',
          2: '#764ba2',
          3: '#f093fb',
          4: '#51cf66',
          5: '#ffd93d',
        },
      },
      borderRadius: {
        lg: '1rem',
        md: 'calc(1rem - 2px)',
        sm: 'calc(1rem - 4px)',
        xl: '1.5rem',
        '2xl': '2rem',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
        display: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    function({ addUtilities }) {
      const newUtilities = {
        '.glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-medium': {
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(24px)',
          '-webkit-backdrop-filter': 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-strong': {
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(32px)',
          '-webkit-backdrop-filter': 'blur(32px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.liquid-gradient': {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}