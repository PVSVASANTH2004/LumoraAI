import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Lumora design tokens — driven by CSS custom properties so they
        // automatically swap between light and dark mode.
        surface: {
          DEFAULT: 'rgb(var(--surface-default) / <alpha-value>)',
          dim: 'rgb(var(--surface-dim) / <alpha-value>)',
          bright: 'rgb(var(--surface-bright) / <alpha-value>)',
          lowest: 'rgb(var(--surface-lowest) / <alpha-value>)',
          low: 'rgb(var(--surface-low) / <alpha-value>)',
          container: 'rgb(var(--surface-container) / <alpha-value>)',
          high: 'rgb(var(--surface-high) / <alpha-value>)',
          highest: 'rgb(var(--surface-highest) / <alpha-value>)',
        },
        lumora: {
          primary: 'rgb(var(--lumora-primary) / <alpha-value>)',
          'primary-container': 'rgb(var(--lumora-secondary) / <alpha-value>)',
          secondary: 'rgb(var(--lumora-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--lumora-tertiary) / <alpha-value>)',
          error: 'rgb(var(--lumora-error) / <alpha-value>)',
          outline: 'rgb(var(--lumora-outline) / <alpha-value>)',
          'outline-variant': 'rgb(var(--lumora-outline-variant) / <alpha-value>)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '1.5rem',
        '2xl': '2rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        typing: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(124, 58, 237, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.6)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 2s infinite linear',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
        typing: 'typing 1s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #7c3aed, #3b82f6)',
        'gradient-surface': 'linear-gradient(180deg, rgb(var(--surface-low)) 0%, rgb(var(--surface-dim)) 100%)',
      },
      boxShadow: {
        'glow-primary': '0 0 15px rgba(124, 58, 237, 0.2)',
        'glow-primary-strong': '0 0 25px rgba(124, 58, 237, 0.4)',
        float: '0 20px 40px rgba(0,0,0,0.4)',
        card: '0 4px 24px rgba(0,0,0,0.3)',
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [animate],
}

export default config
