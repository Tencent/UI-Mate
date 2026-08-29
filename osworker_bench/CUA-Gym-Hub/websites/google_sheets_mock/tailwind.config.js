/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sheets-green': '#0F9D58',
        'sheets-green-dark': '#0B8043',
        'selection-blue': 'rgba(26, 115, 232, 0.1)',
        'selection-border': '#1a73e8',
      }
    },
  },
  plugins: [],
}