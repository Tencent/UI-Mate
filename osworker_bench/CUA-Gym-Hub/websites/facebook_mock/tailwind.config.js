/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1877F2',
        secondary: '#42b72a',
        bg: '#F0F2F5',
        card: '#FFFFFF',
        text: {
          primary: '#050505',
          secondary: '#65676B',
        },
        hover: '#E4E6EB',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}