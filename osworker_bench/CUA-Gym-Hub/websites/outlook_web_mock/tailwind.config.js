/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Segoe UI"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#0078D4',
          light: '#EBF3FC',
          dark: '#106EBE',
          darker: '#005A9E',
        },
        neutral: {
          50: '#F5F5F5',
          100: '#F3F2F1',
          200: '#EDEBE9',
          300: '#D2D0CE',
          400: '#A19F9D',
          500: '#605E5C',
          600: '#484644',
          700: '#323130',
          800: '#242424',
          900: '#1B1A19',
        },
        danger: '#D13438',
        success: '#107C10',
        warning: '#FF8C00',
        category: {
          blue: '#0078D4',
          green: '#107C10',
          orange: '#FF8C00',
          purple: '#8764B8',
          red: '#D13438',
          yellow: '#FFB900',
        },
      },
      fontSize: {
        xxs: ['11px', '14px'],
      },
    },
  },
  plugins: [],
}
