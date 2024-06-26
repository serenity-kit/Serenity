export default {
  expo: {
    name: "Serenity",
    owner: "naisho-gmbh",
    slug: "serenity",
    version: "0.0.7",
    orientation: "portrait",
    plugins: ["expo-font", "expo-secure-store", ["react-native-libsodium", {}]],
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
      bundleIdentifier: "page.serenityapp.ios",
      associatedDomains: ["applinks:serenity.li"],
      companyName: "Naisho GmbH",
    },
    android: {
      package: "page.serenityapp.ios",
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo_serenity_android.png",
        backgroundColor: "#FFF",
      },
      // permissions: [],
    },

    web: {
      favicon: "./assets/images/favicon.png",
    },
    extra: {
      serenityEnvironment: process.env.SERENITY_ENV || "development",
      eas: {
        projectId: "96bcac09-3fa9-4816-bcf6-5550f4edbd45",
      },
    },
  },
};
