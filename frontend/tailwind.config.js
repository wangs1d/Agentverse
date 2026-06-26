/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        apple: {
          blue: '#2e8dff',
          'blue-dark': '#007aff',
          card: '#1c1c1e',
          'card-hover': '#2c2c2e',
          border: '#3a3a3c',
          'border-light': '#48484a',
          text: '#f5f5f7',
          'text-secondary': '#8e8e93',
          'text-tertiary': '#6e6e73',
          success: '#30d158',
          error: '#ff453a',
          warning: '#ff9f0a',
        },
        ink: {
          950: '#0a0a0a',
          900: '#0d0d0d',
          850: '#121212',
          800: '#1a1a1a',
          750: '#1f1f1f',
          700: '#262626',
          600: '#2a2a2a',
          500: '#3a3a3a',
          400: '#4a4a4a',
          300: '#6b6b6b',
          200: '#8e8e93',
          100: '#b8b8b8',
          50: '#f5f5f7',
        },
        tech: {
          DEFAULT: '#2e8dff',
          light: '#5aa8ff',
          neon: '#3399ff',
          deep: '#0064d6',
        },
        accent: {
          success: '#30d158',
          warn: '#ff9f0a',
          danger: '#ff453a',
          warning: '#ff9f0a',
        },
      },
      fontFamily: {
        sans: [
          'DM Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        apple: '1.2rem',
      },
      boxShadow: {
        'apple-card': '0 1px 2px 0 rgba(0,0,0,0.36)',
        'apple-md': '0 4px 8px -2px rgba(0,0,0,0.44)',
        'apple-lg': '0 8px 24px -8px rgba(0,0,0,0.50)',
        'glow-soft': '0 0 24px -8px rgba(46,141,255,0.25)',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(0.95)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
}
