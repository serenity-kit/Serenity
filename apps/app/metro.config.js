// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const exclusionList = require("metro-config/src/defaults/exclusionList");

// Find the workspace root, this can be replaced with `find-yarn-workspace-root`
const workspaceRoot = path.resolve(__dirname, "../..");
const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];
// 2. Let Metro know where to resolve packages, and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// needed for yjs and lib0 since they use .cjs and .mjs files
config.resolver.sourceExts.push("cjs", "mjs");

// exclude the electron app since the electron app package.json is generated in the out folder
// and in addition we should never import the electron code in app anyway
config.resolver.blockList = exclusionList([new RegExp(`../desktop-app/.*`)]);

// config.resolver.assetExts.push("wasm");

module.exports = config;
