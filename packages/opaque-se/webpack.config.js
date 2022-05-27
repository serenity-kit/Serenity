const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const InlineChunkHtmlPlugin = require("react-dev-utils/InlineChunkHtmlPlugin");

module.exports = {
  mode: "development",
  entry: "./src/index",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  experiments: {
    asyncWebAssembly: true,
    syncWebAssembly: true,
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    compress: true,
    port: 9000,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
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
    new webpack.IgnorePlugin({
      resourceRegExp: /^crypto$/,
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^path$/,
    }),
    new HtmlWebpackPlugin({
      title: "Serenity Opaque",
      template: "template.html",
      filename: "index.html",
      inject: "body",
    }),
    new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/.*/]),
  ],
};
