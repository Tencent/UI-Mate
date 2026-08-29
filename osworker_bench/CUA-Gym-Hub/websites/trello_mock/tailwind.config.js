/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xrello: {
          blue: '#0079BF',
          dark: '#091e42',
          gray: '#ebecf0',
          hover: '#dfe1e6',
          text: '#172b4d',
          green: '#61bd4f',
          red: '#eb5a46',
          yellow: '#f2d600'
        }
      }
    },
  },
  plugins: [],
}