const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const config = require('./site.config');
const path = require('path');
const fs = require('fs');

// Define common loader constants
const sourceMap = config.env !== 'production';

const INCLUDE_PATTERN = /\<include src=\"(.+)\"\/?\>(?:\<\/include\>)?/gi;
const processNestedHtml = (content, loaderContext) => !INCLUDE_PATTERN.test(content) ?
  content : content.replace(INCLUDE_PATTERN, (m, src) => processNestedHtml(fs.readFileSync(path.resolve(loaderContext.context, src), 'utf8'), loaderContext));

// HTML loaders
const html = {
  test: /\.(html)$/,
  use: [
    {
      loader: 'html-loader',
      options: {
        preprocessor: processNestedHtml,
      },
    },
  ],
};

// Javascript loaders
const js = {
  test: /\.js(x)?$/,
  exclude: [
    /node_modules/,
    path.join(config.root, config.paths.src, 'javascripts/vendors/'),
  ],
  use: [
    {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env'],
      },
    },
    'eslint-loader',
  ],
};

// Style loaders
const styleLoader = {
  loader: 'style-loader'
};

const cssLoader = {
  loader: 'css-loader',
  options: {
    sourceMap,
  },
};

const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    plugins: [
      require('autoprefixer')(),
    ],
    sourceMap,
  },
};

const css = {
  test: /\.css$/,
  use: [
    config.env === 'production' ? MiniCssExtractPlugin.loader : styleLoader,
    cssLoader,
    postcssLoader,
  ],
};

const sass = {
  test: /\.s[c|a]ss$/,
  use: [
    config.env === 'production' ? MiniCssExtractPlugin.loader : styleLoader,
    cssLoader,
    postcssLoader,
    {
      loader: 'sass-loader',
      options: {
        sourceMap,
      },
    },
  ],
};

const less = {
  test: /\.less$/,
  use: [
    config.env === 'production' ? MiniCssExtractPlugin.loader : styleLoader,
    cssLoader,
    postcssLoader,
    {
      loader: 'less-loader',
      options: {
        sourceMap,
      },
    },
  ],
};

// Image loaders
const imageLoader = {
  loader: 'image-webpack-loader',
  options: {
    bypassOnDebug: true,
    gifsicle: {
      interlaced: false,
    },
    optipng: {
      optimizationLevel: 7,
    },
    pngquant: {
      quality: [0.65, 0.90],
      speed: 4,
    },
    mozjpeg: {
      progressive: true,
    },
  },
};

const images = {
  test: /\.(gif|png|jpe?g|svg|webp)$/i,
  exclude: /fonts/,
  use: [
    'file-loader?name=build/images/[name].[hash].[ext]',
    config.env === 'production' ? imageLoader : null,
  ].filter(Boolean),
};

// Font loaders
// Fonts loader
const fonts = {
  test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
  exclude: /images/,
  use: [
    {
      loader: 'file-loader',
      options: {
        name: '[name].[contenthash].[ext]', // Use contenthash instead of hash for better caching
        outputPath: 'build/fonts/',
      },
    },
  ],
};

// Video loaders
const videos = {
  test: /\.(mp4|webm)$/,
  use: [
    {
      loader: 'file-loader',
      options: {
        name: '[name].[contenthash].[ext]', // Use contenthash instead of hash for better caching
        outputPath: 'images/',
      },
    },
  ],
};


module.exports = [
  html,
  js,
  css,
  sass,
  less,
  images,
  fonts,
  videos,
];
