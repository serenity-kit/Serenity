const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const InlineChunkHtmlPlugin = require("react-dev-utils/InlineChunkHtmlPlugin");

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: {
    opaque: "./standalone",
  },
  output: {
    globalObject: "self",
    path: path.resolve(__dirname, "./dist/static/js"),
    filename: "[name].bundle.js",
    publicPath: "/static/js/",
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
      publicPath: "/",
    },
    allowedHosts: "all",
  },
  resolve: {
    extensions: [
      // adding .web.* files for react-native web optimized files
      ".web.tsx",
      ".web.ts",
      ".web.jsx",
      ".web.js",
      ".tsx",
      ".ts",
      ".jsx",
      ".js",
      ".json",
    ],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Serenity Opaque",
      template: "template.html",
      filename: "index.html",
      inject: "body",
    }),
    // new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/.*/]),
  ],
  experiments: {
    asyncWebAssembly: true,
    syncWebAssembly: true,
  },
  stats: {
    errorDetails: true,
  },
};
