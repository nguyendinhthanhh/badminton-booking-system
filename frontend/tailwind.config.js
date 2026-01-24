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
        "primary": "#13ec49",
        "primary-dark": "#0fb839",
        "background-light": "#f6f8f6",
        "background-dark": "#102215",
        "card-light": "#ffffff",
        "card-dark": "#1a2e21",
        "text-main": "#0d1b11",
        "text-muted": "#4c9a5f",
      },
      fontFamily: {
        "display": ["Lexend", "sans-serif"],
        "body": ["Noto Sans", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.375rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
