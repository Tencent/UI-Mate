/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xinterest: {
          red: '#E60023',
          hover: '#AD081B',
          dark: '#111111',
          light: '#E9E9E9',
          gray: '#767676',
          sand: '#e5e5e0',
          'sand-hover': '#d5d5d0',
          'warm-light': '#e0e0d9',
          fog: '#f6f6f3',
          'plum-black': '#211922',
          'olive-gray': '#62625b',
          'warm-silver': '#91918c',
          'focus-blue': '#0074E8',
        }
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px'
      },
      fontFamily: {
        'xinterest': ['"Xinterest Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen-Sans', 'Ubuntu', 'Cantarell', '"Fira Sans"', '"Droid Sans"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}