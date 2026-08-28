/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        qb: {
          blue: '#0077C5',
          hover: '#006BB3',
          green: '#2CA01C',
          'green-hover': '#249017',
          'green-light': '#E8F5E3',
          red: '#D32F2F',
          amber: '#F59E0B',
          bg: '#F4F5F8',
          dark: '#2C2C2C',
          'text-primary': '#212121',
          'text-secondary': '#6B7280',
          border: '#E5E7EB',
          'success': '#108043',
        }
      },
      fontFamily: {
        sans: ['"Avenir Next"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
