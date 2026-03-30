/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.js", "./src/**/*.{js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: "#22C55E",
        canvas: "#FFFFFF",
        surface: "#F7F9FC",
        ink: "#111827",
        muted: "#6B7280",
        danger: "#EF4444",
      },
    },
  },
  plugins: [],
};
