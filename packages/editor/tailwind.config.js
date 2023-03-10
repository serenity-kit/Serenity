module.exports = {
  content: [
    "./**/*.{ts,tsx,html}",
    "../editor*/**/*.{html,ts,tsx}", // also include other editor-packages like the editor-file-extension
  ],
  presets: [require("../../tailwind.config")],
  plugins: [require("@tailwindcss/typography")],
};
