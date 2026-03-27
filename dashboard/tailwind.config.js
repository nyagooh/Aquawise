/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:      { DEFAULT: '#F0F5FF', dark: '#080D12' },
        surface: { DEFAULT: '#FFFFFF', dark: '#111920', subtle: '#F5F8FF', 'subtle-dark': '#0D1318' },
        primary: { DEFAULT: '#0F6E8C', hover: '#0D5E78', dark: '#1CA9C9', 'dark-hover': '#6FE7DD' },
        accent:  { DEFAULT: '#6FE7DD' },
        ok:      { DEFAULT: '#3CBF7A', soft: '#EEFBF3', 'soft-dark': '#0E2A1F' },
        warn:    { DEFAULT: '#F4B740' },
        err:     { DEFAULT: '#E85D5D' },
        txt:     { DEFAULT: '#1A2B34', secondary: '#4A6575', muted: '#8FA8B8',
                   dark: '#E6F1F5', 'dark-secondary': '#9BB3C0', 'dark-muted': '#5E7A8A' },
        line:    { DEFAULT: '#E0EAF5', dark: '#1A2730' },
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
      boxShadow: {
        card: '0 2px 8px rgba(15,80,140,0.04), 0 0 1px rgba(0,0,0,0.04)',
        elevated: '0 4px 20px rgba(15,80,140,0.06)',
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
