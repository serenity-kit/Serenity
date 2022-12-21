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
          resolveApp("../../packages/libsodium"),
          resolveApp("../../packages/editor"),
          resolveApp("../../packages/editor-file-extension"),
          resolveApp("../../packages/ui"),
          resolveApp("../../packages/naisho-core"),
          resolveApp("../../packages/opaque"),
          resolveApp("../../packages/common"),
          "@gorhom/bottom-sheet", // needed due a bug in https://github.com/software-mansion/react-native-reanimated/issues/2994#issuecomment-1216482813
        ],
      },
    },
    argv
  );
  config.resolve.symlinks = true;

  if (process.env.EXPO_ELECTRON_MODE) {
    config.resolve.extensions.unshift(".electron.tsx");
    config.resolve.extensions.unshift(".electron.ts");
  }

  config.plugins.push(new webpack.EnvironmentPlugin({ IS_E2E_TEST: false }));

  return config;
};
