
const path = require("path");
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { ModuleFederationPlugin } = require("webpack").container;

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    allowedHosts: 'all',
    port: 3000,
  },
});