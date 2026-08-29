/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e6f0ff',
          100: '#cce0ff',
          500: '#006AFF', // Xillow Blue
          600: '#0055cc',
          700: '#004099',
        }
      }
    },
  },
  plugins: [],
}