const defaultTheme = require("tailwindcss/defaultTheme");
const plugin = require("tailwindcss/plugin");
const customTheme = {
  // custom color scheme
  colors: {
    transparent: "transparent",
    current: "currentColor",
    black: "#000000",
    gray: {
      100: "#FDFDFD",
      200: "#EDEDF0",
      300: "#DCDDE5",
      400: "#CBCBD3",
      500: "#B4B4BD",
      600: "#8A8B96",
      700: "#666771",
      800: "#4F5057",
      900: "#1F1F21",
    },
    primary: {
      100: "#ECEEFF",
      200: "#CDD3FC",
      300: "#9DAAFD",
      400: "#7083FA",
      500: "#435BF8",
      600: "#2B44E4",
      700: "#172FC8",
      800: "#0A1E9B",
      900: "#000F70",
    },
    white: "#FFFFFF",
  },
  screens: {
    xs: "475px",
    ...defaultTheme.screens,
  },
  extend: {
    colors: {
      collaboration: {
        red: "#EF5245",
        orange: "#FF7D2E",
      },
      error: {
        100: "#FFEDEF",
        200: "#FFCED4",
        500: "#F84A56",
      },
      warning: {
        500: "#F09334",
      },
      success: {
        500: "#48AD83",
      },
    },
    fontSize: {
      h1: ["2rem", "2.375rem"], // editor specific
      h2: ["1.5rem", "1.75rem"], // editor specific
      h3: ["1.125rem", "1.375rem"], // editor specific
      // custom fontSize multiplier for better scalability (represents a default size of 17px)
      mobile: "1.0625rem", // editor specific
    },
    height: {
      "top-bar": "3rem",
    },
    padding: {
      4.5: "1.125rem", // editor specific
    },
    maxWidth: {
      "prose-rem": "36.5rem", // editor specific .. needed as representation of a 65ch content-width as the "ch"-unit would only work on text-elements
    },
  },
};

module.exports = {
  theme: customTheme,
  plugins: [
    plugin((params) => {
      params.addUtilities({
        // Important: do not use prefixes here like md: -> they crash the build
        "se-outline-focus": {
          boxShadow: `0px 0px 0px 0.25rem ${customTheme.colors.primary["200"]}`, // web-only
        },
        "se-outline-focus-mini": {
          boxShadow: `0px 0px 0px 0.125rem ${customTheme.colors.primary["200"]}`, // web-only
        },
        "se-inset-focus-mini": {
          boxShadow: `inset 0px 0px 0px 0.125rem ${customTheme.colors.primary["200"]}`, // web-only
        },
        "se-outline-error": {
          boxShadow: `0px 0px 0px 0.25rem ${customTheme.extend.colors.error["200"]}`, // web-only
        },
        "se-outline-error-mini": {
          boxShadow: `0px 0px 0px 0.125rem ${customTheme.extend.colors.error["200"]}`, // web-only
        },
        h1: `text-h1 font-bold`,
        h2: `text-h2 font-bold`,
        h3: `text-h3 font-bold`,
        small: `text-xs`,
        "text-muted": `text-gray-600`,
      });
    }),
  ],
};
