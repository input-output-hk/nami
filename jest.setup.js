const fetch = require('node-fetch');
Object.assign(global, require('jest-chrome'));

global.fetch = fetch;

// mocking the chrome.storage.local API
global.mockStore = {};
global.chrome.storage.local.get = (key, callback) =>
  callback(key ? { [key]: global.mockStore[key] } : global.mockStore);
global.chrome.storage.local.set = (item, callback) => {
  global.mockStore = { ...global.mockStore, ...item };
  callback();
};
global.chrome.storage.local.clear = () => (global.mockStore = {});
