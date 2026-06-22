/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          50:  '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#7C3AED',
          600: '#6D28D9',
          700: '#5B21B6',
          800: '#4C1D95',
          900: '#2E1065',
        },
        surface: {
          DEFAULT: 'var(--bg-surface)',
          50:  'var(--bg-surface-2)',
          100: 'var(--bg-surface-3)',
        },
        secondary: 'var(--text-secondary)',
        accent: 'var(--accent)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        success: 'var(--success)',
        muted: 'var(--text-muted)',
        border: 'var(--border-color)',
        background: 'var(--bg-base)',
        card: 'var(--card-bg)',
        input: 'var(--input-bg)',
        inputBorder: 'var(--input-border)',
        primaryText: 'var(--text-primary)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        xl:  '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        card:   '0 4px 24px 0 rgba(0,0,0,0.05)',
        hover:  '0 8px 40px 0 rgba(0,0,0,0.1)',
        glow:   '0 0 30px var(--primary)',
        'glow-accent': '0 0 30px var(--accent)',
        inner:  'inset 0 1px 0 rgba(255,255,255,0.05)',
        neon:   '0 0 20px var(--primary), 0 0 60px rgba(124,58,237,0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh':   'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F0F1A 100%)',
        'gradient-purple': 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 50%, #06B6D4 100%)',
        'gradient-card':   'linear-gradient(145deg, rgba(124,58,237,0.1) 0%, rgba(79,70,229,0.05) 100%)',
        'gradient-sidebar':'linear-gradient(180deg, #1A1A2E 0%, #0F0F1A 100%)',
      },
      animation: {
        'fade-in':   'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up':  'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in':  'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'glow-pulse':'glowPulse 2s ease-in-out infinite',
        'float':     'float 6s ease-in-out infinite',
        'shimmer':   'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(124,58,237,0.3)' },
          '50%':      { boxShadow: '0 0 30px rgba(124,58,237,0.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
