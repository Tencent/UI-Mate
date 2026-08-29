/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A73E8',       // Google Blue (updated)
        'primary-hover': '#1557B0',
        secondary: '#5F6368',     // Google Gray
        folder: '#5F6368',        // Folder icon gray
        danger: '#EA4335',        // Google Red
        success: '#0F9D58',       // Google Green
        surface: '#F8F9FA',       // Background
        border: '#DADCE0',
        'sidebar-active': '#C2E7FF',
        'selected-row': '#E8F0FE',
        'star-active': '#F4B400',
        'text-primary': '#202124',
        'text-secondary': '#5F6368',
        'google-plus': '#1A73E8',
      },
      fontFamily: {
        sans: ['"Google Sans"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'sidebar': '28px',
      }
    },
  },
  plugins: [],
}
