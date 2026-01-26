/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Noto Sans TC'", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        glass: "0 25px 60px -35px rgba(15, 23, 42, 0.9)",
      },
    },
  },
  plugins: [],
};
