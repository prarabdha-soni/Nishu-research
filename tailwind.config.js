/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        g: {
          bg:       '#171614',
          surface:  '#22201D',
          s2:       '#2A2824',
          s3:       '#312E2B',
          text:     '#F4EFE6',
          muted:    '#B8B2A7',
          faint:    '#6B6560',
          accent:   '#FFB357',
          'accent-2': '#E8A045',
          purple:   '#9B8EC4',
          green:    '#6FC98B',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['clamp(3.2rem, 9vw, 9.5rem)', { lineHeight: '0.88', letterSpacing: '-0.04em' }],
        'display': ['clamp(2rem, 5vw, 5rem)', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'heading': ['clamp(1.4rem, 3vw, 2.4rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      },
      animation: {
        'grid-flow':  'gridFlow 35s linear infinite',
        'orb-drift':  'orbDrift 14s ease-in-out infinite',
        'orb-drift-2': 'orbDrift2 18s ease-in-out infinite',
        'fade-up':    'fadeUp 0.7s ease forwards',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        gridFlow: {
          '0%':   { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '60px 60px' },
        },
        orbDrift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%':      { transform: 'translate(40px, -50px) scale(1.05)' },
          '66%':      { transform: 'translate(-30px, 20px) scale(0.97)' },
        },
        orbDrift2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '40%':      { transform: 'translate(-50px, 30px) scale(1.08)' },
          '70%':      { transform: 'translate(20px, -40px) scale(0.95)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '0.9' },
        },
      },
      backgroundImage: {
        'hero-grid': [
          'linear-gradient(rgba(255,179,87,0.035) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(255,179,87,0.035) 1px, transparent 1px)',
        ].join(', '),
        'surface-gradient': 'linear-gradient(135deg, #22201D 0%, #1e1c19 100%)',
        'accent-gradient':  'linear-gradient(135deg, #FFB357, #E8A045)',
        'glow-gradient':    'radial-gradient(circle, rgba(255,179,87,0.12) 0%, transparent 70%)',
        'purple-gradient':  'radial-gradient(circle, rgba(155,142,196,0.1) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}
