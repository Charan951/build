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
