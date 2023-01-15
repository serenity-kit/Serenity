const path = require("path");
const fs = require("fs");

module.exports = {
  name: "Serenity",
  appBundleId: "re.serenity.desktop-app",
  // asar: true,
  packagerConfig: {
    executableName: "serenity-desktop-app",
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
  rebuildConfig: {},
  hooks: {
    packageAfterPrune: async (forgeConfig, buildPath) => {
      const sqliteBuildPath = path.join(
        buildPath,
        "node_modules",
        "sqlite3",
        "build"
      );
      // console.log("Sqlite BuildPath: ", sqliteBuildPath);
      // needs to be deleted otherwise macos codesign will fail
      fs.rmSync(sqliteBuildPath, {
        recursive: true,
        force: true,
      });
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
