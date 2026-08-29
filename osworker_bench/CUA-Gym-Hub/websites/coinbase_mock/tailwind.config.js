/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0052FF',
        'primary-dark': '#0040CC',
        'primary-light': '#EBF0FF',
        success: '#05B169',
        danger: '#CF202F',
        background: '#FFFFFF',
        surface: '#F8F8F8',
        'surface-hover': '#F0F0F0',
        border: '#E8E8E8',
        text: '#0A0B0D',
        'text-secondary': '#5B616E',
        'text-muted': '#8A919E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
