module.exports = {
  content: ["./**/*.{tsx,html}"],
  presets: [require("../../tailwind.config")],
  plugins: [require("@tailwindcss/typography")],
};
