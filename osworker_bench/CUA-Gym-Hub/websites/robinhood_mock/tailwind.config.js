/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00C805', // Xobinhood Green
        'primary-dark': '#00A804',
        danger: '#FF5000', // Xobinhood Red
        'danger-dark': '#E04600',
        background: '#000000',
        surface: '#1E2124',
        'surface-hover': '#2A2E32',
        text: '#FFFFFF',
        'text-muted': '#8F9398',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}