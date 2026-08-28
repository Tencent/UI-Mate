/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a73e8',
        'primary-hover': '#1557b0',
        'primary-light': '#e8f0fe',
        'primary-selected': '#e8f0fe',
        secondary: '#e8f0fe',
        success: '#137333',
        'success-light': '#e6f4ea',
        warning: '#f29900',
        danger: '#d93025',
        surface: '#ffffff',
        background: '#f1f3f4',
        border: '#dadce0',
        'text-primary': '#202124',
        'text-secondary': '#5f6368',
        'text-tertiary': '#70757a',
        'price-green': '#137333',
      },
      fontFamily: {
        google: ['"Google Sans"', 'Roboto', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
        'card-hover': '0 1px 3px 0 rgba(60,64,67,0.3), 0 6px 10px 4px rgba(60,64,67,0.15)',
        'popover': '0 2px 10px rgba(0,0,0,0.2)',
      }
    },
  },
  plugins: [],
}
