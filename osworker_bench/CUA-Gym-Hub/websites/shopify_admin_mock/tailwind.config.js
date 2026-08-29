
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      colors: {
        xhopify: {
          green: '#008060',
          hover: '#004c3f',
          bg: '#f1f1f1',
          surface: '#ffffff',
          text: '#303030',
          subtext: '#616161',
          border: '#e3e3e3',
          focus: '#005bd3',
          success: '#047b5d',
          error: '#d72c0d',
          warning: '#b98900',
          'sidebar-bg': '#f6f6f7',
          'sidebar-active': '#f0f0f0',
          'btn-primary': '#303030',
          'btn-primary-hover': '#1a1a1a',
        }
      },
      borderRadius: {
        'card': '12px',
        'btn': '8px',
        'badge': '10px',
        'input': '8px',
      },
      boxShadow: {
        'card': '0 1px 0 rgba(0,0,0,0.05)',
        'modal': '0 26px 80px rgba(0,0,0,0.2)',
      },
      fontSize: {
        'body': ['13px', { lineHeight: '20px', fontWeight: '450' }],
        'label': ['13px', { lineHeight: '20px', fontWeight: '550' }],
        'subheading': ['13px', { lineHeight: '20px', fontWeight: '650', letterSpacing: '0.5px' }],
        'page-title': ['20px', { lineHeight: '28px', fontWeight: '650' }],
        'card-title': ['14px', { lineHeight: '20px', fontWeight: '650' }],
        'large-heading': ['24px', { lineHeight: '32px', fontWeight: '700' }],
      },
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
      }
    },
  },
  plugins: [],
}
