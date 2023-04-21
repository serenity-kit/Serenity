const defaultTheme = require("tailwindcss/defaultTheme");
const plugin = require("tailwindcss/plugin");

// custom colors extracted so we can export them seperately for typing
const customColors = {
  transparent: "transparent",
  current: "currentColor",
  black: "#000000",
  gray: {
    100: "#FDFDFD",
    120: "#FAFAFC",
    150: "#F5F5F7",
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
    150: "#DDE1FE",
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
  comment: {
    default: "#FFB92120", // collaboration-honey 20%
    hover: "#FFB92140", // collaboration-honey 40%
    active: "#FFB92180", // collaboration-honey 80%
  },
  muted: "#8A8B96", // gray 600
  backdrop: "#1F1F2140", // backdrop color including opacity
};

const customTheme = {
  // custom color scheme
  colors: {
    ...customColors,
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
      "3xl": [
        "1.75rem",
        {
          lineHeight: "2.125rem",
          letterSpacing: "-0.02rem",
        },
      ],
      "2xl": [
        "1.5rem",
        {
          lineHeight: "1.875rem",
          letterSpacing: "-0.02rem",
        },
      ],
      lg: [
        "1.125rem",
        {
          lineHeight: "1.375rem",
          letterSpacing: "-0.02rem",
        },
      ],
      xs: [
        "0.8125rem",
        {
          lineHeight: "1.125rem",
        },
      ],
      xxs: [
        "0.75rem",
        {
          lineHeight: "0.875rem",
        },
      ],
    },
    fontFamily: {
      button: "Inter_600SemiBold",
      input: "Inter_400Regular",
      "inter-regular": "Inter_400Regular",
      "inter-semi": "Inter_600SemiBold",
    },
    height: {
      "top-bar": "3rem",
      "form-element": "3rem",
      "editor-sidebar-header": "3.125rem",
    },
    margin: {
      4.5: "1.125rem",
    },
    padding: {
      4.5: "1.125rem", // editor specific
    },
    maxWidth: {
      "prose-rem": "36.5rem", // editor specific .. needed as representation of a 65ch content-width as the "ch"-unit would only work on text-elements
      "editor-content": "44rem",
      "navigation-drawer-modal": "61rem",
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
  customColors,
  theme: customTheme,
  plugins: [
    plugin((params) => {
      params.addUtilities({
        // Important: do not use prefixes here like md: -> they crash the build
        "se-outline-focus-input": {
          boxShadow: `0px 0px 0px 0.25rem ${customTheme.colors.primary["100"]}`,
        },
        "se-outline-focus": {
          boxShadow: `0px 0px 0px 0.25rem ${customTheme.colors.primary["200"]}`, // web-only
        },
        "se-outline-focus-mini": {
          boxShadow: `0px 0px 0px 0.125rem ${customTheme.colors.primary["200"]}`, // web-only
        },
        "se-outline-focus-submit": {
          boxShadow: `0px 0px 0px 0.1rem ${customTheme.colors.primary["700"]}`, // web-only
        },
        "se-inset-focus": {
          boxShadow: `inset 0px 0px 0px 0.25rem ${customTheme.colors.primary["200"]}`, // web-only
        },
        "se-inset-focus-mini": {
          boxShadow: `inset 0px 0px 0px 0.125rem ${customTheme.colors.primary["200"]}`, // web-only
        },
        "se-outline-error-input": {
          boxShadow: `0px 0px 0px 0.25rem ${customTheme.colors.error["100"]}`,
        },
        "se-outline-error": {
          boxShadow: `0px 0px 0px 0.25rem ${customTheme.colors.error["200"]}`, // web-only
        },
        "se-outline-error-mini": {
          boxShadow: `0px 0px 0px 0.125rem ${customTheme.colors.error["200"]}`, // web-only
        },
        "p-menu-item": {
          paddingVertical: 8,
          paddingHorizontal: 12,
        },
      });
    }),
  ],
};
