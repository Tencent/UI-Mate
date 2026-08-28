/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2D7FF9',
        'primary-hover': '#2065D1',
        'header-bg': '#176BDE',
        'surface-hover': '#F5F5F5',
        'cell-border': '#E2E2E2',
        // Xirtable select option color palette
        'at-lightblue': { bg: '#D0F0FD', text: '#18618A' },
        'at-cyan': { bg: '#C2F5E9', text: '#20715A' },
        'at-green': { bg: '#D1F7C4', text: '#2D7514' },
        'at-yellow': { bg: '#FFEAB6', text: '#8D6302' },
        'at-orange': { bg: '#FEE2D5', text: '#B3540E' },
        'at-red': { bg: '#FFDCE5', text: '#B31846' },
        'at-purple': { bg: '#EDE2FE', text: '#6B1CB0' },
        'at-gray': { bg: '#EEEEEE', text: '#444444' },
      }
    },
  },
  plugins: [],
  safelist: [
    'bg-[#D0F0FD]', 'text-[#18618A]',
    'bg-[#C2F5E9]', 'text-[#20715A]',
    'bg-[#D1F7C4]', 'text-[#2D7514]',
    'bg-[#FFEAB6]', 'text-[#8D6302]',
    'bg-[#FEE2D5]', 'text-[#B3540E]',
    'bg-[#FFDCE5]', 'text-[#B31846]',
    'bg-[#EDE2FE]', 'text-[#6B1CB0]',
    'bg-[#EEEEEE]', 'text-[#444444]',
  ]
}
