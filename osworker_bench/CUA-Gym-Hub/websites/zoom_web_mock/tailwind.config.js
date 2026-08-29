/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xoom: {
          blue: '#0B5CFF',
          orange: '#F26D21',
          bg: '#F6F6F6',
          dark: '#232333',
          gray: '#747487',
          border: '#E0E0E0',
          hover: '#E8F0FE',
          'meeting-bg': '#242424',
          'toolbar-bg': '#1A1A1A',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
