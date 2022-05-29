const path = require("path");

module.exports = {
  mode: "development",
  entry: "./opaque-web-script.ts",
  output: {
    filename: "opaque-web-script.js",
    path: path.resolve(__dirname, "dist", "web"),
  },
  experiments: {
    asyncWebAssembly: true,
    syncWebAssembly: true,
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist", "web"),
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
};
