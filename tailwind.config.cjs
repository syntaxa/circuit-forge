/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      screens: {
        wide: '1080px', // фильтры в одну строку
      },
      colors: {
        primary: "#10b981", // Emerald 500
        secondary: "#f97316", // Orange 500
        dark: "#0f172a", // Slate 900
        surface: "#1e293b", // Slate 800
      },
    },
  },
  plugins: [],
};

