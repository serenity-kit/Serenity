module.exports = {
  content: [
    "./**/*.{tsx,html}",
    "../editor*/**/*.{html,tsx}", // also include other editor-packages like the editor-file-extension
  ],
  presets: [require("../../tailwind.config")],
  plugins: [require("@tailwindcss/typography")],
};
