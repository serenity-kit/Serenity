// custom color scheme
// ?? should we define all the shades -> yes and we name them
// ?? are the overridden values still available ? (e.g. gray-500)
module.exports = {
  theme: {
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
    extend: {},
  },
  plugins: [],
};
