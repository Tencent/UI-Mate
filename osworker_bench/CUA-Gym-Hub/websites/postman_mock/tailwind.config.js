/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6C37',
        'primary-hover': '#E05A2B',
        'method-get': '#00AA55',
        'method-post': '#EAB308',
        'method-put': '#2563EB',
        'method-delete': '#EF4444',
        'method-patch': '#8B5CF6',
        'method-head': '#6B7280',
        'method-options': '#6B7280',
        'sidebar-bg': '#F9FAFB',
        'sidebar-border': '#E5E5E5',
        'icon-rail': '#2D2D2D',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
      }
    },
  },
  plugins: [],
}
