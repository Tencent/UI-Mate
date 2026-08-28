/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1DA1F2',
        'primary-hover': '#1a91da',
        'text-primary': '#0F1419',
        'text-secondary': '#536471',
        secondary: '#536471',
        success: '#00BA7C',
        danger: '#F4212E',
        'like-active': '#F91880',
        'repost-active': '#00BA7C',
        'bookmark-active': '#1DA1F2',
        warning: '#FFAD1F',
        'bg-hover': '#F7F9F9',
        'border-default': '#EFF3F4',
        'gray-light': '#EFF3F4',
        'gray-lighter': '#F7F9F9',
        'gray-dark': '#0F1419',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
