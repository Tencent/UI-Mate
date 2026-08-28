/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xmazon: {
          DEFAULT: '#131921',
          dark: '#0F1111',
          light: '#232f3e',
          lighter: '#37475a',
          blue: '#007185',
          darkBlue: '#004f5d',
          orange: '#ff9900',
          yellow: '#febd69',
          darkYellow: '#f0c14b',
          deepOrange: '#f08804',
          bg: '#eaeded',
          green: '#067d62',
          prime: '#00a8e1',
          red: '#cc0c39',
          star: '#de7921',
        }
      },
      fontFamily: {
        ember: ['"Xmazon Ember"', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}