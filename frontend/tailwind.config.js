/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#2463eb",
        "secondary": "#10B981",
        "background-light": "#f6f6f8",
        "background-dark": "#111621",
      },
      fontFamily: {
        "display": ["Lexend", "sans-serif"],
        "body": ["Noto Sans", "sans-serif"]
      },
    },
  },
  plugins: [],
}
