const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  theme: {
    // custom color scheme
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#FFFFFF",
      gray: {
        100: "#F8F8F8",
        200: "#E4E5ED",
        400: "#CBCBD3",
        600: "#8A8B96",
        800: "#4F5057",
        900: "#1F1F1F",
      },
      primary: {
        400: "#91A0FF",
        500: "#435BF8",
        600: "#180177",
      },
      emerald: "#48AD83",
      amber: "#F09334",
      red: "#EC3153",
    },
    screens: {
      xs: "475px",
      ...defaultTheme.screens,
    },
    extend: {
      // custom fontSize multiplier for better scalability (represents a default size of 17px)
      fontSize: {
        mobile: "1.0625rem",
      },
    },
  },
  plugins: [],
};
