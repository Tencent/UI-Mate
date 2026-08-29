/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xubspot: {
          DEFAULT: '#FF7A59', // Primary Orange
          hover: '#D95E40',
          dark: '#2D3E50', // Obsidian sidebar
          'dark-lighter': '#425B76',
          light: '#F5F8FA', // Background
          text: '#33475B', // Slate text
          border: '#CBD6E2', // Border
          teal: '#00A4BD', // Success teal
          red: '#F2545B', // Error red
          muted: '#7C98B6', // Muted text
        }
      }
    },
  },
  plugins: [],
}
