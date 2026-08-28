/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xbay: {
          blue: '#0064D2',
          yellow: '#F5AF02',
          green: '#86B817',
          red: '#E53238',
          gray: '#E5E5E5'
        }
      }
    },
  },
  plugins: [],
}