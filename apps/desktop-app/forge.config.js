const path = require("path");

module.exports = {
  name: "Serenity",
  executableName: "serenity",
  appBundleId: "re.serenity.desktop-app",
  // asar: true,
  packagerConfig: {
    icon: path.resolve(__dirname, "icons", "icon"),
    osxSign: {
      // "hardened-runtime": true,
      // "gatekeeper-assess": false,
    },
    osxNotarize: {
      tool: "notarytool",
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    },
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {},
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
};
