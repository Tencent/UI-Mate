/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xira: {
          blue: '#0052CC',
          darkBlue: '#172B4D',
          lightBlue: '#DEEBFF',
          green: '#36B37E',
          yellow: '#FFAB00',
          red: '#DE350B',
          gray: '#F4F5F7',
          text: '#172B4D',
          subtext: '#5E6C84',
          border: '#DFE1E6'
        }
      }
    },
  },
  plugins: [],
}