export default {
  expo: {
    name: "serenity",
    slug: "serenity",
    version: "0.0.1",
    orientation: "portrait",
    plugins: [["react-native-sodium-expo-plugin", {}]],
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    updates: {
      // disable over-the-air JS updates https://docs.expo.io/guides/configuring-ota-updates/#disabling-updates
      enabled: false,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "re.serenity.app",
    },
    android: {
      package: "re.serenity.app",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      favicon: "./assets/images/favicon.png",
    },
    extra: {
      apiUrl:
        process.env.API_URL ||
        "https://serenity-staging-api.herokuapp.com/graphql",
    },
  },
};
