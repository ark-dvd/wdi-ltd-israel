import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        wdi: {
          primary: '#1a365d',
          'primary-light': '#2d4a7c',
          'primary-dark': '#0f2744',
          secondary: '#c9a227',
          'secondary-light': '#dbb84a',
          accent: '#e8b923',
          gold: '#c9a961',
        },
      },
      fontFamily: {
        assistant: ['Assistant', 'Rubik', 'sans-serif'],
        heebo: ['Heebo', 'sans-serif'],
      },
      maxWidth: {
        container: '1200px',
      },
      boxShadow: {
        'wdi-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'wdi-md': '0 4px 6px rgba(0, 0, 0, 0.07)',
        'wdi-lg': '0 10px 25px rgba(0, 0, 0, 0.1)',
        'wdi-xl': '0 20px 40px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
