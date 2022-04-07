const path = require("path");
const fs = require("fs");
const createExpoWebpackConfigAsync = require("@expo/webpack-config");

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
          resolveApp("../../packages/ui"),
          resolveApp("../../packages/naisho-core"),
          resolveApp("../../packages/opaque"),
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

  return config;
};
