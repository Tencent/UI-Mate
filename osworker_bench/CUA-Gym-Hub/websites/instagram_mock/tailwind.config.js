/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ig: {
          primary: '#0095f6',
          secondary: '#dbdbdb',
          link: '#00376b',
          error: '#ed4956',
          separator: '#efefef',
          text: '#262626',
          subtext: '#8e8e8e',
          bg: '#fafafa',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      keyframes: {
        heart: {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' }
        },
        story: {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        }
      },
      animation: {
        heart: 'heart 0.3s ease-in-out forwards',
        story: 'story linear forwards'
      }
    },
  },
  plugins: [],
}
