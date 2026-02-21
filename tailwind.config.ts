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
        },
      },
      fontFamily: {
        // Reference Next.js optimized font variable with spec fallbacks
        assistant: ['var(--font-assistant)', 'Rubik', 'sans-serif'],
        heebo: ['var(--font-heebo)', 'sans-serif'],
      },
      maxWidth: {
        container: '1200px',
      },
      boxShadow: {
        // Aligned to ORIGINAL_DESIGN_SPEC §1.6 — must match :root CSS variables
        'wdi-sm': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'wdi-md': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'wdi-lg': '0 8px 25px rgba(0, 0, 0, 0.12)',
        'wdi-xl': '0 15px 40px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
