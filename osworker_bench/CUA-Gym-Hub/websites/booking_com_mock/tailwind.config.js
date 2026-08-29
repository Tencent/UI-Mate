
    /** @type {import('tailwindcss').Config} */
    export default {
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
      ],
      theme: {
        extend: {
          colors: {
            primary: '#003580', // Xooking.com Blue
            secondary: '#00224f', // Xooking.com Dark Blue
          }
        },
      },
      plugins: [],
    }
  