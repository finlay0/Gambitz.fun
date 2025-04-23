import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        primary: '#9945FF',
        accent: '#14F195',
        neutral: '#2c2c2c',
        border: '#3a3a3a',
      },
    },
  },
  plugins: [],
};

export default config; 