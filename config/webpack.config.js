const path = require('path');
const fs = require('fs');
const config = require('./site.config');
const loaders = require('./webpack.loaders');
const plugins = require('./webpack.plugins');
const commonFunctions = require('./commonFunctions');

const htmlFilePaths = commonFunctions.list('./src/*.html');

const getIOPaths = () => {
  const inputPaths = {};
  htmlFilePaths.map((filePath) => {
    const respectiveDirectory = filePath.substring(6).slice(0, -5);
    const jsPath = path.join(config.root, config.paths.src, 'javascripts', respectiveDirectory, 'index.js');
    const cssPath = path.join(config.root, config.paths.src, 'stylesheets', respectiveDirectory, 'style.scss');
    const assetsPresent = [fs.existsSync(jsPath) && jsPath, fs.existsSync(cssPath) && cssPath].filter(Boolean);
    if (assetsPresent.length) {
      inputPaths[respectiveDirectory] = assetsPresent;
    }
  });
  return inputPaths;
};

const inputPaths = getIOPaths();

const ASSET_PATH = '/';

module.exports = {
  context: path.join(config.root, config.paths.src),
  entry: inputPaths,
  output: {
    path: path.join(config.root, config.paths.dist),
    filename: 'build/[name].[contenthash].js',
    publicPath: ASSET_PATH,
  },
  mode: ['production', 'development'].includes(config.env) ? config.env : 'development',
  devtool: config.env === 'production' ? 'hidden-source-map' : 'eval-cheap-source-map',
  devServer: {
    static: {
      directory: path.join(config.root, config.paths.src),
    },
    client: {
      overlay: false,
      logging: 'error',
    },
    watchFiles: ['src/**/*'],
    hot: true,
    open: true,
    port: config.port,
    host: config.dev_host,
    historyApiFallback: {
      rewrites: [
        { from: /^\/classes$/, to: '/classes.html' },
        { from: /^\/class$/, to: '/class.html' },
        { from: /^\/status$/, to: '/status.html' },
        { from: /^\/index$/, to: '/index.html' },
        { from: /^\/zen-class-admin$/, to: '/zen-class-admin.html' },
        { from: /^\/integration$/, to: '/integration.html' },
        { from: /^\/meet-dashboard-new$/, to: '/meet-dashboard-new.html' },
        { from: /^\/meet-video$/, to: '/meet-video.html' },
        { from: /^\/status$/, to: '/status.html' },
        { from: /^\/open-integration$/, to: '/open-integration.html' },
        { from: /^\/forgot-password$/, to: '/forgot-password.html' },
      ],
    },
  },
  resolve: {
    extensions: ['.js', '.html', '.mjs'],
  },
  module: {
    rules: [
      ...loaders,
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                useBuiltIns: 'entry',
                corejs: 3,
              }],
            ],
            plugins: [
              ['@babel/plugin-transform-runtime', {
                regenerator: true,
              }],
            ],
          },
        },
      },
    ],
  },
  plugins,
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: false, // Can be false, a string, or a function in webpack 5
      maxInitialRequests: 25,
      maxAsyncRequests: 25,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
