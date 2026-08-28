/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#172B4D',
        secondary: '#6B778C',
        accent: '#0052CC',
        'accent-hover': '#0065FF',
        success: '#36B37E',
        warning: '#FFAB00',
        danger: '#DE350B',
        'bg-light': '#F4F5F7',
      }
    },
  },
  plugins: [],
}