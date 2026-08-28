/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xeddit: {
          orange: '#FF4500',
          blue: '#0079D3',
          periwinkle: '#7193FF',
          gray: '#DAE0E6',
          dark: '#1C1C1C',
          hover: '#F6F7F8',
          border: '#CCCCCC',
          'border-hover': '#898989',
          'nav-border': '#EDEFF1',
          'text-secondary': '#787C7E',
          'text-muted': '#A8AAAB',
          'green': '#46D160',
        }
      },
      fontSize: {
        'post-title': ['18px', { lineHeight: '22px', fontWeight: '500' }],
        'metadata': ['12px', { lineHeight: '16px' }],
        'comment-body': ['14px', { lineHeight: '21px' }],
        'sidebar-heading': ['10px', { lineHeight: '12px', fontWeight: '700', letterSpacing: '0.05em' }],
      },
    },
  },
  plugins: [],
}
