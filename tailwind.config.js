/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/assets/**/*.{html,js}",
    "./*.{html,js}",
  ],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        'white': '#ffffff',
        'black': '#000000',
      },
    },
  },
  plugins: [],
}
