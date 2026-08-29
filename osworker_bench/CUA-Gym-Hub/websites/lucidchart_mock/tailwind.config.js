/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F96B13',
        'primary-dark': '#E05E0E',
        'lucid-blue': '#4A86C8',
        'lucid-dark': '#2D2D2D',
        'lucid-sidebar': '#3D3D3D',
        canvas: '#F0F0F0',
        'selection-blue': '#0D99FF',
      }
    },
  },
  plugins: [],
}
