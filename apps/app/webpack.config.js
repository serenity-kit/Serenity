const path = require("path");
const fs = require("fs");
const createExpoWebpackConfigAsync = require("@expo/webpack-config");
const webpack = require("webpack");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          // Ensure the shared packages are transpiled.
          resolveApp("../../packages/editor"),
          resolveApp("../../packages/editor-file-extension"),
          resolveApp("../../packages/ui"),
          resolveApp("../../packages/secsync"),
          resolveApp("../../packages/workspace-chain"),
          resolveApp("../../packages/user-chain"),
          resolveApp("../../packages/document-chain"),
          resolveApp("../../packages/common"),
          resolveApp("../../packages/workspace-member-devices-proof"),
          resolveApp("../../packages/folder-tree"),
          "@gorhom/bottom-sheet", // needed due a bug in https://github.com/software-mansion/react-native-reanimated/issues/2994#issuecomment-1216482813
        ],
      },
    },
    argv
  );
  config.resolve.symlinks = true;

  // needed for sql.js to not throw an errors and warnings
  config.resolve.fallback = {
    fs: false,
    path: false,
    crypto: false,
  };

  // needed since NativeBase uses API referencing normalize-css-color
  config.resolve.alias["normalize-css-color"] = "@react-native/normalize-color";

  if (process.env.EXPO_ELECTRON_MODE) {
    config.resolve.extensions.unshift(".electron.tsx");
    config.resolve.extensions.unshift(".electron.ts");
  }

  return config;
};
