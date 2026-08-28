/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xiscord: {
          bg: '#313338',
          dark: '#2b2d31',
          darker: '#1e1f22',
          light: '#383a40',
          lightest: '#f2f3f5',
          blurple: '#5865F2',
          green: '#23a55a',
          red: '#f23f42',
          yellow: '#f0b232',
          hover: '#2e3035',
          selected: '#404249',
          modifier: '#b5bac1',
          muted: '#949ba4',
          divider: '#3f4147',
          online: '#23a55a',
          idle: '#f0b232',
          dnd: '#f23f42',
          offline: '#80848e'
        }
      }
    },
  },
  plugins: [],
}