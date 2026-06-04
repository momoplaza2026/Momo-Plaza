/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'momo-dark': '#110a04',
        'momo-darker': '#0a0501',
        'momo-gold': '#f59e0b',
        'momo-red': '#dc2626',
        'momo-accent': '#ffedd5',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
