/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Marketplace-Optimized Breakpoints (inspired by Airbnb/Upwork)
      screens: {
        'xs': '375px',     // Mobile first
        'sm': '640px',     // Small tablet
        'md': '768px',     // Tablet portrait
        'lg': '1024px',    // Desktop small
        'xl': '1280px',    // Desktop standard
        '2xl': '1440px',   // Desktop large
        '3xl': '1920px',   // Desktop extra large
        // Marketplace-specific breakpoints
        'mobile': {'max': '767px'},
        'tablet': {'min': '768px', 'max': '1023px'},
        'desktop': {'min': '1024px'},
        'wide': {'min': '1440px'},
      },
      colors: {
        // 🎨 FIXIA DESIGN SYSTEM - "Trust & Flow" Palette
        // Filosofía: "Confianza Líquida" - Sistema profesional de marketplace
        
        // PRIMARY - Confianza Profesional (Trust Blue)
        primary: {
          50: '#f0f9ff',   // Ultra light
          100: '#e0f2fe',  // Very light
          200: '#bae6fd',  // Light
          300: '#7dd3fc',  // Light accent
          400: '#38bdf8',  // Medium light
          500: '#226F83',  // 🎯 BRAND PRIMARY - Azul Profundo
          600: '#1A5A6B',  // Medium dark (hover states)
          700: '#0c4a6e',  // Dark
          800: '#075985',  // Very dark
          900: '#0c4a6e',  // Ultra dark
          950: '#062139',  // Near black
        },
        
        // PRIMARY LIGHT - Celeste suave para backgrounds
        'primary-light': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#5B9BAA',  // 🎯 CELESTE - Backgrounds, Cards
          500: '#38bdf8',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        
        // SECONDARY - Energía & Acción (Trust Orange)
        secondary: {
          50: '#fff7ed',   // Ultra light
          100: '#ffedd5',  // Very light
          200: '#fed7aa',  // Light
          300: '#fdba74',  // Light accent
          400: '#fb923c',  // Medium light
          500: '#FC8940',  // 🎯 BRAND SECONDARY - Naranja Active States
          600: '#ea580c',  // Medium dark
          700: '#c2410c',  // Dark
          800: '#9a3412',  // Very dark
          900: '#7c2d12',  // Ultra dark
          950: '#431407',  // Near black
        },
        
        // ACCENT - Highlights & Success
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#FEC113',  // 🎯 BRAND ACCENT - Amarillo Highlights
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        
        // NEUTRALS - Sofisticación (Fixia Grays)
        // Colores neutros para texto y fondos - paleta profesional
        'fixia-text': {
          primary: '#2C2C2C',    // 🎯 Títulos y texto principal
          secondary: '#6B7280',  // 🎯 Subtítulos
          muted: '#9CA3AF',      // 🎯 Texto auxiliar
        },
        'fixia-surface': {
          border: '#E5E7EB',     // 🎯 Bordes sutiles
          surface: '#F9FAFB',    // 🎯 Fondos suaves
          white: '#FFFFFF',      // 🎯 Base limpia
        },
        
        // DARK MODE - "Midnight Professional"
        'fixia-dark': {
          bg: '#0F172A',         // 🎯 Fondo principal
          surface: '#1E293B',    // 🎯 Cards y elementos
          border: '#334155',     // 🎯 Bordes sutiles
          text: '#F1F5F9',       // 🎯 Texto principal
          'text-muted': '#94A3B8', // 🎯 Texto secundario
          primary: '#38BDF8',    // 🎯 Azul más brillante
          accent: '#FB923C',     // 🎯 Naranja más suave
        },
        
        // SUCCESS - Growth & Positive Actions
        success: {
          50: '#f0fdf4',   // Ultra light green
          100: '#dcfce7',  // Very light green
          200: '#bbf7d0',  // Light green
          300: '#86efac',  // Light accent green
          400: '#4ade80',  // Medium light green
          500: '#22c55e',  // Success green
          600: '#16a34a',  // Medium dark green
          700: '#15803d',  // Dark green
          800: '#166534',  // Very dark green
          900: '#14532d',  // Ultra dark green
          950: '#052e16',  // Near black green
        },
        
        // WARNING - Attention & Caution
        warning: {
          50: '#fffbeb',   // Ultra light yellow
          100: '#fef3c7',  // Very light yellow
          200: '#fde68a',  // Light yellow
          300: '#fcd34d',  // Light accent yellow
          400: '#fbbf24',  // Medium light yellow
          500: '#f59e0b',  // Warning yellow
          600: '#d97706',  // Medium dark yellow
          700: '#b45309',  // Dark yellow
          800: '#92400e',  // Very dark yellow
          900: '#78350f',  // Ultra dark yellow
          950: '#451a03',  // Near black yellow
        },
        
        // ERROR - Errors & Destructive Actions
        error: {
          50: '#fef2f2',   // Ultra light red
          100: '#fee2e2',  // Very light red
          200: '#fecaca',  // Light red
          300: '#fca5a5',  // Light accent red
          400: '#f87171',  // Medium light red
          500: '#ef4444',  // Error red
          600: '#dc2626',  // Medium dark red
          700: '#b91c1c',  // Dark red
          800: '#991b1b',  // Very dark red
          900: '#7f1d1d',  // Ultra dark red
          950: '#450a0a',  // Near black red
        },
        
        // INFO - Information & Links
        info: {
          50: '#f0f9ff',   // Ultra light blue
          100: '#e0f2fe',  // Very light blue
          200: '#bae6fd',  // Light blue
          300: '#7dd3fc',  // Light accent blue
          400: '#38bdf8',  // Medium light blue
          500: '#0ea5e9',  // Info blue
          600: '#0284c7',  // Medium dark blue
          700: '#0369a1',  // Dark blue
          800: '#075985',  // Very dark blue
          900: '#0c4a6e',  // Ultra dark blue
          950: '#082f49',  // Near black blue
        },
        
        // SURFACE - Backgrounds & Cards
        surface: {
          50: '#ffffff',   // Pure white
          100: '#fafafa',  // Off white
          200: '#f5f5f5',  // Light surface
          300: '#f0f0f0',  // Medium light surface
          400: '#e5e5e5',  // Medium surface
          500: '#d4d4d4',  // Standard surface
          600: '#a3a3a3',  // Dark surface
          700: '#737373',  // Darker surface
          800: '#525252',  // Very dark surface
          900: '#404040',  // Ultra dark surface
          950: '#262626',  // Near black surface
        },
      },
      fontFamily: {
        // 📝 ULTRA-MODERN FIXIA TYPOGRAPHY SYSTEM with fallbacks
        'display': ['Plus Jakarta Sans', 'Plus Jakarta Sans-fallback', 'Inter', 'system-ui', '-apple-system', 'sans-serif'], // Hero & display text
        'heading': ['Plus Jakarta Sans', 'Plus Jakarta Sans-fallback', 'Inter', 'system-ui', '-apple-system', 'sans-serif'], // Headings
        'body': ['Inter', 'Inter-fallback', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],   // Body text
        'ui': ['Inter', 'Inter-fallback', 'system-ui', '-apple-system', 'sans-serif'],                          // UI elements
        'mono': ['JetBrains Mono', 'SF Mono', 'Monaco', 'Cascadia Code', 'Consolas', 'monospace'],        // Code
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
        '5xl': ['3rem', { lineHeight: '1' }],           // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
        '7xl': ['4.5rem', { lineHeight: '1' }],         // 72px
        '8xl': ['6rem', { lineHeight: '1' }],           // 96px
        '9xl': ['8rem', { lineHeight: '1' }],           // 128px
      },
      spacing: {
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
        '128': '32rem',   // 512px
        '144': '36rem',   // 576px
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',   // 2px
        'DEFAULT': '0.25rem', // 4px
        'md': '0.375rem',   // 6px
        'lg': '0.5rem',     // 8px
        'xl': '0.75rem',    // 12px
        '2xl': '1rem',      // 16px
        '3xl': '1.5rem',    // 24px
        'full': '9999px',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'DEFAULT': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'none': 'none',
        // Marketplace-specific shadows
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'button': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'button-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      animation: {
        // Ultra-modern marketplace animations
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
        'fade-in-slow': 'fadeIn 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
        'slide-down': 'slideDown 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
        'slide-left': 'slideLeft 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
        'slide-right': 'slideRight 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
        'bounce-in': 'bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'float': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'gradient': 'gradient-shift 3s ease-in-out infinite',
        'typewriter': 'typewriter 3s steps(40, end)',
        'spin-slow': 'spin 8s linear infinite',
        'ping-slow': 'ping 4s cubic-bezier(0, 0, 0.2, 1) infinite',
        // Enhanced marketplace-specific animations
        'card-hover': 'cardHover 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
        'button-press': 'buttonPress 0.15s cubic-bezier(0.23, 1, 0.32, 1)',
        'modal-enter': 'modalEnter 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
        'toast-enter': 'toastEnter 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
        'hero-float': 'float 6s ease-in-out infinite',
        'text-reveal': 'fadeIn 1s cubic-bezier(0.23, 1, 0.32, 1) 0.3s both',
      },
      keyframes: {
        // Core animations
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
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
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
          },
          '50%': { 
            opacity: '0.8',
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)'
          },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        // Enhanced marketplace-specific keyframes
        cardHover: {
          '0%': { transform: 'scale(1) translateY(0) rotate(0deg)' },
          '100%': { transform: 'scale(1.03) translateY(-4px) rotate(0.5deg)' },
        },
        buttonPress: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.98)' },
          '100%': { transform: 'scale(1)' },
        },
        modalEnter: {
          '0%': { 
            opacity: '0', 
            transform: 'scale(0.95) translateY(10px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'scale(1) translateY(0)' 
          },
        },
        toastEnter: {
          '0%': { 
            opacity: '0', 
            transform: 'translateX(100%)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateX(0)' 
          },
        },
      },
    },
  },
  plugins: [],
}

