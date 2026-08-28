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
          DEFAULT: '#003087',
          dark: '#001c64',
          light: '#0070ba',
          hover: '#009cde',
        },
        pp: {
          bg: '#f5f7fa',
          card: '#ffffff',
          border: '#e6e9eb',
          text: '#2c2e2f',
          'text-secondary': '#6c7378',
          green: '#019c34',
          red: '#c9302c',
          yellow: '#e8a317',
          'btn-primary': '#0070ba',
          'btn-primary-hover': '#005ea6',
          'btn-disabled': '#cbd2d6',
          link: '#0070ba',
        }
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'pp-card': '0 2px 4px rgba(0,0,0,0.08)',
        'pp-hover': '0 4px 8px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        'pp': '8px',
      },
    },
  },
  plugins: [],
}
