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
          blue: '#003DA5', // XocuSign Blue
          dark: '#1e1e1e',
          light: '#f9f9f9',
          success: '#24a148',
          warning: '#f1c21b',
          error: '#da1e28'
        }
      }
    },
  },
  plugins: [],
}