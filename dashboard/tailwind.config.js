/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand:  { DEFAULT: '#0B8ED9', light: '#E8F4FD', dark: '#076aa3' },
        accent: { DEFAULT: '#2BB5A0', light: '#F0FAF8', dark: '#1e8a7a' },
        canvas: { DEFAULT: '#F5F7FB', dark: '#0d1117' },
        surface:{ DEFAULT: '#ffffff', dark: '#161b22' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'] },
      borderRadius: { '2xl': '16px', '3xl': '20px' },
    },
  },
  plugins: [],
}
