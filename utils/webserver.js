// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
process.env.ASSET_PATH = '/';

var ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
var WebpackDevServer = require('webpack-dev-server'),
  webpack = require('webpack'),
  config = require('../webpack.config'),
  env = require('./env'),
  path = require('path');

var options = config.chromeExtensionBoilerplate || {};
var excludeEntriesToHotReload = options.notHotReload || [];

for (var entryName in config.entry) {
  if (excludeEntriesToHotReload.indexOf(entryName) === -1) {
    config.entry[entryName] = [
      'webpack-dev-server/client?http://localhost:' + env.PORT,
      'webpack/hot/dev-server',
    ].concat(config.entry[entryName]);
  }
}

config.plugins = [
  new webpack.HotModuleReplacementPlugin(),
  new ReactRefreshWebpackPlugin(),
].concat(config.plugins || []);

delete config.chromeExtensionBoilerplate;

var compiler = webpack(config);

var server = new WebpackDevServer(compiler, {
  https: false,
  hot: true,
  client: {
    overlay: false,
  },
  devMiddleware: {
    publicPath: `http://localhost:${env.PORT}/`,
    writeToDisk: true,
  },
  liveReload: false,
  port: env.PORT,
  static: {
    directory: path.join(__dirname, '../build'),
  },
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  allowedHosts: 'all',
});

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept();
}

server.listen(env.PORT);
