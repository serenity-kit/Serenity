const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const InlineChunkHtmlPlugin = require("react-dev-utils/InlineChunkHtmlPlugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HTMLInlineCSSWebpackPlugin =
  require("html-inline-css-webpack-plugin").default;
const webpack = require("webpack");

module.exports = {
  mode: "development",
  devtool: "source-map",
  entry: {
    prosemirror: "./standalone",
  },
  output: {
    globalObject: "self",
    path: path.resolve(__dirname, "./dist/"),
    filename: "[name].bundle.js",
    publicPath: "/prosemirror/dist/",
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
    alias: {
      "react-native$": "react-native-web",
      "normalize-css-color": "@react-native/normalize-color",
    },
    fallback: {
      crypto: false,
    },
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
      // react-native-animatable includes raw JSX and therefor needs to be compiled
      {
        test: /\.(js|jsx|ts|tsx)$/,
        include: /node_modules\/react-native-animatable/,
        use: {
          loader: "babel-loader",
        },
      },
      // react-native-reanimated includes raw JSX and therefor needs to be compiled
      {
        test: /\.(js|jsx|ts|tsx)$/,
        include: /node_modules\/react-native-reanimated/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Serenity Editor",
      template: "template.html",
      filename: "index.html",
      inject: "body",
    }),
    new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/.*/]),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
    new HTMLInlineCSSWebpackPlugin(),
    new webpack.DefinePlugin({
      // needed since react-native uses it internally
      __DEV__: JSON.stringify(false),
      process: { env: {} }, // needed for react-native-reanimated
    }),
    new webpack.EnvironmentPlugin({ JEST_WORKER_ID: null }), // needed for react-native-reanimated
  ],
};
