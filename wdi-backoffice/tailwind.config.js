/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'wdi-blue': '#1a365d',
        'wdi-gold': '#c9a961',
      },
    },
  },
  plugins: [],
}
