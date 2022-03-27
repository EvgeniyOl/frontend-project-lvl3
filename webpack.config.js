import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import pkg from "webpack";

const { SourceMapDevToolPlugin } = pkg;

export default {
  mode: process.env.NODE_ENV || "development",
  entry: "./src/index.js",
  devServer: {
    historyApiFallback: true,
    static: {
      directory: path.join(path.resolve(), "dist"),
    },
    open: true,
    compress: true,
    hot: true,
    port: 8080,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader", "postcss-loader"],
      },
    ],
  },
  plugins: [
    new SourceMapDevToolPlugin({
      filename: "[file].map",
    }),
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
  ],
};
