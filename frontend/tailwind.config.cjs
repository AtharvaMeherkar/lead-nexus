/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#10141b",
        cyan: "#00f5d4",
        magenta: "#c000ff",
        slate: {
          950: "#05070c",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "Inter", "sans-serif"],
      },
      backdropBlur: {
        panel: "18px",
      },
    },
  },
  plugins: [],
};

