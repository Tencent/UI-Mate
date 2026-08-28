/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00C4CC', // Xanva Blue
        'primary-dark': '#008F95',
        canvas: '#ffffff',
        sidebar: '#0e1318',
        panel: '#252627',
      }
    },
  },
  plugins: [],
}