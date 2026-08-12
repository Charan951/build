/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF', // Pure White
        primary: '#CDFB47',    // Lime Accent
        dark: '#0F1412',       // Primary Dark
        black: '#000000',
        white: '#FFFFFF',
        slateText: '#737373',
        glassBorder: 'rgba(0,0,0,0.08)',
        glassBg: 'rgba(255,255,255,0.70)',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Modular type scale (1.25 ratio), tuned line-height/tracking per size.
        display: ['clamp(2.75rem, 2rem + 3.2vw, 5.25rem)', { lineHeight: '0.98', letterSpacing: '-0.03em' }],
        h1: ['clamp(2.25rem, 1.7rem + 2.2vw, 3.75rem)', { lineHeight: '1.04', letterSpacing: '-0.025em' }],
        h2: ['clamp(1.75rem, 1.4rem + 1.4vw, 2.75rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        h3: ['clamp(1.375rem, 1.2rem + 0.7vw, 1.875rem)', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        h4: ['1.375rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        h5: ['1.125rem', { lineHeight: '1.35', letterSpacing: '-0.005em' }],
        h6: ['1rem', { lineHeight: '1.4', letterSpacing: '0' }],
        body: ['1rem', { lineHeight: '1.65', letterSpacing: '0' }],
        bodyLg: ['1.125rem', { lineHeight: '1.6', letterSpacing: '0' }],
        small: ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }],
        caption: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
      },
      borderRadius: {
        button: '20px',
        card: '32px',
        heroCard: '40px',
        form: '18px',
        dialog: '36px',
      },
      boxShadow: {
        soft: '0 20px 50px rgba(0,0,0,0.06)',
        hover: '0 35px 80px rgba(0,0,0,0.12)',
        glass: '0 15px 40px rgba(0,0,0,0.05)',
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
};
