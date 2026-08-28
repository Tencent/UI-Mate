/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aws: {
          // Brand (orange only for logo/branding)
          orange: '#FF9900',
          hover: '#EC7211',
          // Navigation
          squid: '#0f141a',
          nav: '#0f141a',
          dark: '#0f141a',
          // Backgrounds
          bg: '#ffffff',
          card: '#FFFFFF',
          // Primary interactive color (blue, NOT orange)
          blue: '#0972D3',
          'blue-dark': '#033160',
          'blue-hover': '#033160',
          'blue-active': '#033160',
          'blue-light': '#f2f8fd',
          // Borders
          border: '#c6c6cd',
          'border-input': '#7d8998',
          // Text
          text: '#000716',
          'text-secondary': '#5f6b7a',
          'text-disabled': '#9ba7b6',
          // Status
          success: '#037F0C',
          error: '#d91515',
          warning: '#8D6605',
          info: '#0972D3',
        }
      },
      fontFamily: {
        aws: ['"Noto Sans"', '"Amazon Ember"', '"Helvetica Neue"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['Monaco', 'Menlo', '"Ubuntu Mono"', 'Consolas', 'monospace'],
      },
      fontSize: {
        'aws-body': '14px',
      },
      boxShadow: {
        'aws': '0 1px 1px 0 rgba(0,7,22,.05)',
        'aws-md': '0 2px 4px 0 rgba(0,7,22,.1)',
        'aws-lg': '0 4px 8px 0 rgba(0,7,22,.15)',
      }
    },
  },
  plugins: [],
}
