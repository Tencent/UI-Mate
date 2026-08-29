
    /** @type {import('tailwindcss').Config} */
    export default {
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
      ],
      theme: {
        extend: {
          colors: {
            xithub: {
              bg: '#0d1117',
              card: '#161b22',
              border: '#30363d',
              text: '#c9d1d9',
              muted: '#8b949e',
              accent: '#58a6ff',
              success: '#238636',
              danger: '#da3633',
              header: '#010409'
            }
          }
        },
      },
      plugins: [],
    }
  