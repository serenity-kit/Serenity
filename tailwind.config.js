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
    collaboration: {
      terracotta: "#EF5245",
      coral: "#FD7064",
      raspberry: "#F4216D",
      rose: "#FF91C9",
      honey: "#FFB921",
      orange: "#FF7D2E",
      emerald: "#47C07A",
      arctic: "#4ABAC1",
      sky: "#1E8EDE",
      serenity: "#435BF8", // primary 500
      lavender: "#515DCE",
      purple: "#9E36CF",
      slate: "#4F5D78",
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
  screens: {
    xs: "475px",
    ...defaultTheme.screens,
  },
  extend: {
    fontSize: {
      h1: ["2rem", "2.375rem"], // editor specific
      h2: ["1.5rem", "1.75rem"], // editor specific
      h3: ["1.125rem", "1.375rem"], // editor specific
      input: ["1rem", "1.25rem"], // iOS specific fix for vertical Alignment of Text inside input
      // custom fontSize multiplier for better scalability (represents a default size of 17px)
      mobile: "1.0625rem", // editor specific
      xs: "0.8125rem",
      xxs: "0.75rem",
    },
    fontFamily: {
      button: "Inter_600SemiBold",
      input: "Inter_400Regular",
      "inter-regular": "Inter_400Regular",
      "inter-semi": "Inter_600SemiBold",
    },
    height: {
      "top-bar": "3rem",
    },
    margin: {
      4.5: "1.125rem",
    },
    padding: {
      4.5: "1.125rem", // editor specific
    },
    maxWidth: {
      "prose-rem": "36.5rem", // editor specific .. needed as representation of a 65ch content-width as the "ch"-unit would only work on text-elements
    },
    width: {
      sidebar: "15rem",
    },
    borderWidth: {
      3: "3px",
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
        "se-inset-focus": {
          boxShadow: `inset 0px 0px 0px 0.25rem ${customTheme.colors.primary["200"]}`, // web-only
        },
        "se-inset-focus-mini": {
          boxShadow: `inset 0px 0px 0px 0.125rem ${customTheme.colors.primary["200"]}`, // web-only
        },
        "se-outline-error": {
          boxShadow: `0px 0px 0px 0.25rem ${customTheme.colors.error["200"]}`, // web-only
        },
        "se-outline-error-mini": {
          boxShadow: `0px 0px 0px 0.125rem ${customTheme.colors.error["200"]}`, // web-only
        },
        "se-shadow-lg": `shadow-black shadow-color-opacity-10 shadow-radius-2 shadow-offset-0/[1px]`,
        // TODO remove when heading declarations are done
        h1: `text-h1 font-bold`,
        h2: `text-h2 font-bold`,
        h3: `text-h3 font-bold`,
        "text-muted": `text-gray-600`,
        "form-element-height": "h-12",
        "p-menu-item": `py-2 px-3`,
      });
    }),
  ],
};
