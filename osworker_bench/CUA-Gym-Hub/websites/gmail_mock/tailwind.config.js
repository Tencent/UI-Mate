/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xmail: {
          red: '#EA4335',
          bg: '#F6F8FC',
          hover: '#F2F2F2',
          selected: '#C2DBFF',
          text: '#202124',
          secondary: '#5f6368',
        }
      }
    },
  },
  plugins: [],
}