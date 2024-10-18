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
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');

require('dotenv').config();

const ASSET_PATH = process.env.ASSET_PATH || '/';

var alias = {};

// load the secrets
var secretsPath = path.join(__dirname, 'secrets.' + env.NODE_ENV + '.js');

require('dotenv-defaults').config({
  path: './.env',
  encoding: 'utf8',
});

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

const hasSentryConfig =
  !!process.env.SENTRY_AUTH_TOKEN &&
  !!process.env.SENTRY_ORG &&
  !!process.env.SENTRY_PROJECT &&
  !!process.env.SENTRY_DSN;

const withMaybeSentry = (p) =>
  hasSentryConfig
    ? [path.join(__dirname, 'src', 'features', 'sentry.js'), p]
    : p;

const envsToExpose = ['NODE_ENV'];
if (hasSentryConfig) envsToExpose.push('SENTRY_DSN');

var options = {
  devtool: 'source-map',
  experiments: {
    asyncWebAssembly: true,
  },
  mode: process.env.NODE_ENV || 'development',
  entry: {
    mainPopup: withMaybeSentry(
      path.join(__dirname, 'src', 'ui', 'indexMain.jsx')
    ),
    internalPopup: withMaybeSentry(
      path.join(__dirname, 'src', 'ui', 'indexInternal.jsx')
    ),
    hwTab: withMaybeSentry(
      path.join(__dirname, 'src', 'ui', 'app', 'tabs', 'hw.jsx')
    ),
    createWalletTab: withMaybeSentry(
      path.join(__dirname, 'src', 'ui', 'app', 'tabs', 'createWallet.jsx')
    ),
    trezorTx: withMaybeSentry(
      path.join(__dirname, 'src', 'ui', 'app', 'tabs', 'trezorTx.jsx')
    ),
    background: path.join(__dirname, 'src', 'pages', 'Background', 'index.js'),
    contentScript: withMaybeSentry(
      path.join(__dirname, 'src', 'pages', 'Content', 'index.js')
    ),
    injected: withMaybeSentry(
      path.join(__dirname, 'src', 'pages', 'Content', 'injected.js')
    ),
    trezorContentScript: withMaybeSentry(
      path.join(__dirname, 'src', 'pages', 'Content', 'trezorContentScript.js')
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
        exclude: [
          /node_modules/,
          path.resolve(__dirname, 'src', 'ui', 'lace-migration'),
        ],
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/i,
        issuer: /\.jsx?$/,
        include: path.resolve(__dirname, 'src', 'ui', 'lace-migration'),
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              icon: true,
              exportType: 'named',
            },
          },
        ],
      },
      {
        test: /\.png$/i,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
        include: path.resolve(__dirname, 'src', 'ui', 'lace-migration'),
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
    ...(hasSentryConfig
      ? [
          sentryWebpackPlugin({
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            telemetry: false,
            include: './build',
            url: 'https://sentry.io/',
            ignore: ['node_modules', 'webpack.config.js'],
          }),
        ]
      : []),
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
    new webpack.EnvironmentPlugin(envsToExpose),
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

if (!isDevelopment) {
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
