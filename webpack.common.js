const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const ModuleFederationPlugin =
//   require("webpack").container.ModuleFederationPlugin;
const path = require("path");
// const deps = require("./package.json").dependencies;

const mode = process.env.NODE_ENV || "development";
const prod = mode === "production";

module.exports = {
  entry: {
    main: "./src/modal-dialog",
  },
  devtool: 'inline-source-map',
  mode,
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    port: 3000,
    historyApiFallback: true,
  },
  output: {
    publicPath: "auto",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      {
        test: /\.css$/,
        use: [
          /**
           * MiniCssExtractPlugin doesn't support HMR.
           * For developing, use 'style-loader' instead.
           * */
          prod ? MiniCssExtractPlugin.loader : "style-loader",
          "css-loader",
        ],
      },
    ],
  },
  plugins: [
    // new ModuleFederationPlugin({
    //   name: "webpack5_poc_zeisslet",
    //   filename: "remoteEntry.js",
    //   exposes: {
    //     "Tile": "./src/components/Tile",
    //   },
    //   shared: {
    //     "styled-components": {
    //       singleton: true,
    //     },
    //     'react': {
    //       singleton: true,
    //     }
    //   }
    // }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};
