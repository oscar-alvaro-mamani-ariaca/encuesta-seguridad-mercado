/ @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./App.js",
    "./components//*.{js,ts,jsx,tsx}",
    "./src//*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}