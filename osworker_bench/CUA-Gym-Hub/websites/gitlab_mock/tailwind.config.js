/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        xitlab: {
          orange: '#FC6D26',
          dark: '#292961',
          sidebar: '#1f1e24', // Darker sidebar
          gray: '#f0f0f0',
          border: '#e5e5e5',
          text: '#333333',
          muted: '#666666',
          success: '#108548',
          warning: '#d97706',
          danger: '#db3b21',
          info: '#1f75cb',
        }
      }
    },
  },
  plugins: [],
}