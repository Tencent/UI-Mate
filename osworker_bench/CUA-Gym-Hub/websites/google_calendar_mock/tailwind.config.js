/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A73E8', // Google Blue
        'primary-hover': '#1557B0',
        'google-gray': '#F1F3F4',
        'google-border': '#DADCE0',
        'text-primary': '#3C4043',
        'text-secondary': '#70757A',
      },
      gridTemplateRows: {
        '48': 'repeat(48, minmax(0, 1fr))', // For 30min slots in 24h
      }
    },
  },
  plugins: [],
}