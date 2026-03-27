/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Unified corporate blue-violet palette ──
        bg:      { DEFAULT: '#F4F2FF', dark: '#0B0A14' },
        surface: { DEFAULT: '#FFFFFF', dark: '#14131F', subtle: '#F9F8FF', 'subtle-dark': '#100F1C' },
        primary: { DEFAULT: '#6C5CE7', hover: '#5A4BD1', dark: '#A29BFE', 'dark-hover': '#C4BFFF',
                   light: 'rgba(108,92,231,0.08)', 'light-dark': 'rgba(162,155,254,0.08)' },
        ok:      { DEFAULT: '#3CBF7A', soft: '#EEFBF3', 'soft-dark': '#0E2A1F' },
        warn:    { DEFAULT: '#F4B740' },
        err:     { DEFAULT: '#E85D5D' },
        txt:     { DEFAULT: '#1A1A2E', secondary: '#55526B', muted: '#9490AA',
                   dark: '#EEEDF5', 'dark-secondary': '#A8A5BE', 'dark-muted': '#6B6880' },
        line:    { DEFAULT: '#E8E4F5', dark: '#1E1C2E' },
      },
      fontFamily: {
        sans: ['"Geist Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['10px', '14px'],
        'xs':  ['11px', '15px'],
        'sm':  ['12px', '16px'],
        'base': ['14px', '20px'],
        'md':  ['15px', '22px'],
        'lg':  ['17px', '26px'],
        'xl':  ['20px', '28px'],
        '2xl': ['26px', '34px'],
        '3xl': ['32px', '40px'],
      },
      borderRadius: {
        xl:  '14px',
        '2xl': '20px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
