/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0875E1',
        'primary-hover': '#0660C1',
        'xorkday-orange': '#F68D2E',
        'sidebar-blue': '#003A70',
        'light-blue': '#E8F2FC',
        secondary: '#005CB9',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        background: '#F3F4F6',
        surface: '#FFFFFF',
      }
    },
  },
  plugins: [],
}
