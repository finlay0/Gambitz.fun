import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#ffffff',
        primary: '#9945FF',
        'primary-dark': '#7535CC',
        'primary-light': '#B975FF',
        secondary: '#14F195',
        'secondary-dark': '#10C278',
        'secondary-light': '#45F5AD',
        accent: '#14F195',
        neutral: '#2c2c2c',
        'neutral-dark': '#1a1a1a',
        'neutral-light': '#3a3a3a',
        border: '#3a3a3a',
        'border-light': '#4a4a4a',
        'solana-green': '#14F195',
        'solana-purple': '#9945FF',
        'solana-teal': '#01FEF9',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
      },
      boxShadow: {
        'glow': '0 0 15px rgba(153, 69, 255, 0.5)',
        'glow-green': '0 0 15px rgba(20, 241, 149, 0.5)',
      },
    },
  },
  plugins: [],
};

export default config; 