/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:      { DEFAULT: '#F7FAFC', dark: '#0A0F14' },
        surface: { DEFAULT: '#FFFFFF', dark: '#121A22', subtle: '#F0F6FA', 'subtle-dark': '#0F1720' },
        primary: { DEFAULT: '#0F6E8C', hover: '#1CA9C9', dark: '#1CA9C9', 'dark-hover': '#6FE7DD' },
        accent:  { DEFAULT: '#6FE7DD' },
        ok:      { DEFAULT: '#3CBF7A', soft: '#E6F7EF', 'soft-dark': '#0E2A1F' },
        warn:    { DEFAULT: '#F4B740' },
        err:     { DEFAULT: '#E85D5D' },
        txt:     { DEFAULT: '#1A2B34', secondary: '#6B8796', muted: '#9BB3C0',
                   dark: '#E6F1F5', 'dark-secondary': '#9BB3C0', 'dark-muted': '#6B8796' },
        line:    { DEFAULT: '#E3EEF5', dark: '#1F2E3A' },
      },
      fontFamily: {
        sans: ['"Geist Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['10px', '14px'],
        'xs':  ['11px', '16px'],
        'sm':  ['12px', '16px'],
        'base': ['13px', '20px'],
        'md':  ['14px', '20px'],
        'lg':  ['16px', '24px'],
        'xl':  ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['28px', '36px'],
      },
      boxShadow: {
        card:  '0 1px 3px rgba(15,110,140,0.04), 0 1px 2px rgba(0,0,0,0.03)',
        'card-hover': '0 8px 24px rgba(15,110,140,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        'card-dark': '0 1px 3px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.1)',
        'card-dark-hover': '0 8px 24px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.15)',
        'elevated': '0 4px 12px rgba(15,110,140,0.06), 0 1px 4px rgba(0,0,0,0.03)',
      },
      borderRadius: {
        xl:  '12px',
        '2xl': '16px',
      },
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
      },
    },
  },
  plugins: [],
}
