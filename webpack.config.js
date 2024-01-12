var webpack = require('webpack'),
  path = require('path'),
  fileSystem = require('fs-extra'),
  env = require('./utils/env'),
  { CleanWebpackPlugin } = require('clean-webpack-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  TerserPlugin = require('terser-webpack-plugin'),
  NodePolyfillPlugin = require('node-polyfill-webpack-plugin'),
  ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const ASSET_PATH = process.env.ASSET_PATH || '/';

var alias = {};

// load the secrets
var secretsPath = path.join(__dirname, 'secrets.' + env.NODE_ENV + '.js');

var fileExtensions = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'eot',
  'otf',
  'svg',
  'ttf',
  'woff',
  'woff2',
];

if (fileSystem.existsSync(secretsPath)) {
  alias['secrets'] = secretsPath;
}

const isDevelopment = process.env.NODE_ENV === 'development';

var options = {
  experiments: {
    asyncWebAssembly: true,
  },
  mode: process.env.NODE_ENV || 'development',
  entry: {
    mainPopup: path.join(__dirname, 'src', 'ui', 'indexMain.jsx'),
    internalPopup: path.join(__dirname, 'src', 'ui', 'indexInternal.jsx'),
    hwTab: path.join(__dirname, 'src', 'ui', 'app', 'tabs', 'hw.jsx'),
    createWalletTab: path.join(
      __dirname,
      'src',
      'ui',
      'app',
      'tabs',
      'createWallet.jsx'
    ),
    trezorTx: path.join(__dirname, 'src', 'ui', 'app', 'tabs', 'trezorTx.jsx'),
    background: path.join(__dirname, 'src', 'pages', 'Background', 'index.js'),
    contentScript: path.join(__dirname, 'src', 'pages', 'Content', 'index.js'),
    injected: path.join(__dirname, 'src', 'pages', 'Content', 'injected.js'),
    trezorContentScript: path.join(
      __dirname,
      'src',
      'pages',
      'Content',
      'trezorContentScript.js'
    ),
  },
  chromeExtensionBoilerplate: {
    notHotReload: ['contentScript', 'devtools', 'injected'],
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].bundle.js',
    publicPath: ASSET_PATH,
  },
  module: {
    rules: [
      {
        resourceQuery: /raw/,
        type: 'asset/source',
      },
      {
        test: /\.(js|jsx|ts|tsx)$/,
        loader: 'swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
              tsx: true,
            },
            target: 'es2019',
            loose: false,
            transform: {
              react: {
                development: isDevelopment,
                refresh: isDevelopment,
              },
            },
          },
        },
        resolve: {
          fullySpecified: false,
        },
      },
      {
        // look for .css or .scss files
        test: /\.(css|scss)$/,
        // in the `src` directory
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2)$/,
        loader: 'file-loader',
        options: { name: '[name].[ext]' },
      },
      {
        test: new RegExp('.(' + fileExtensions.join('|') + ')$'),
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias: alias,
    extensions: fileExtensions
      .map((extension) => '.' + extension)
      .concat(['.js', '.jsx', '.css', '.ts', '.tsx']),
  },
  plugins: [
    ...(isDevelopment ? [new ReactRefreshWebpackPlugin()] : []),
    new webpack.BannerPlugin({
      banner: () => {
        return 'globalThis.document={getElementsByTagName:()=>[],createElement:()=>({ setAttribute:()=>{}}),head:{appendChild:()=>{}}};';
      },
      test: /background.bundle.js/,
      raw: true,
    }),
    new NodePolyfillPlugin(),
    new webpack.ProgressPlugin(),
    // clean the build folder
    new CleanWebpackPlugin({
      verbose: true,
      cleanStaleWebpackAssets: true,
    }),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: path.join(__dirname, 'build'),
          force: true,
          transform: function (content, path) {
            // generates the manifest file using the package.json informations
            return Buffer.from(
              JSON.stringify({
                description: process.env.npm_package_description,
                version: process.env.npm_package_version,
                ...JSON.parse(content.toString()),
              })
            );
          },
        },
      ],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/assets/img/icon-128.png',
          to: path.join(__dirname, 'build'),
          force: true,
        },
      ],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/assets/img/icon-34.png',
          to: path.join(__dirname, 'build'),
          force: true,
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(
        __dirname,
        'src',
        'pages',
        'Popup',
        'internalPopup.html'
      ),
      filename: 'internalPopup.html',
      chunks: ['internalPopup'],
      cache: false,
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'pages', 'Popup', 'mainPopup.html'),
      filename: 'mainPopup.html',
      chunks: ['mainPopup'],
      cache: false,
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'pages', 'Tab', 'hwTab.html'),
      filename: 'hwTab.html',
      chunks: ['hwTab'],
      cache: false,
    }),
    new HtmlWebpackPlugin({
      template: path.join(
        __dirname,
        'src',
        'pages',
        'Tab',
        'createWalletTab.html'
      ),
      filename: 'createWalletTab.html',
      chunks: ['createWalletTab'],
      cache: false,
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'pages', 'Tab', 'trezorTx.html'),
      filename: 'trezorTx.html',
      chunks: ['trezorTx'],
      cache: false,
    }),
  ],
  infrastructureLogging: {
    level: 'info',
  },
};

if (env.NODE_ENV === 'development') {
  options.devtool = 'cheap-module-source-map';
} else {
  options.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  };
}

module.exports = options;
