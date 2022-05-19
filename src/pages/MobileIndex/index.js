const existsLocalStorage = function () { 
  var test = "test";
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch(e) {
    return false;
  }
};

var shimStorage = {};
if (existsLocalStorage()) {
	shimStorage.get = function(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    }
    catch (e) {
      return localStorage.getItem(key);
    }
  };
	shimStorage.set = function(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  };
	shimStorage.toObject = function() {
    var obj = {};
    for (let i = 0;i < localStorage.length;i++) {
      const key = localStorage.key[i];
      obj[key] = shimStorage.get(key);
    }
    return obj;
  };
}
else {
	shimStorage.get = function(key) {
    return this[key];
  };
	shimStorage.set = function(key, value) {
    this[key] = value;
  };
	shimStorage.toObject = function() {
    var obj = {...shimStorage};
    return obj;
  };
}

let injectPage = function(page) {
  let head = document.head;
  let script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = `/${page}.bundle.js`;
  head.appendChild(script);
};

let removePage = function(page) {
  let head = document.head;
  head.querySelectorAll('script').forEach((node) => {
    if (node.src.endsWith(`/${page}.bundle.js`)) head.removeChild(node);
  });
};

let openUrl = function(url) {
  window.history.pushState('', '', url);

  let file = url.split('?')[0].split('/').pop().replace('.html', '');
  document.body.innerHTML = `<div id="${file}"></div>`;
  injectPage(file);

  return window;
};

window.close = function() {
  removePage('internalPopup');
  const modal = document.getElementById('internalPopupModal');
  if (modal) {
    modal.innerHTML = '';
    window.history.back();
  }
  else {
    openUrl(window.origin + '/mainPopup.html');
  }
};

var startupListener;
var connectListener;
var messageListener;
var removedListener;

var port;

var tabs = [];

var chrome = {
  app: true,
	storage: {
		local: {
			set: function(items, callback) {
				Object.entries(items).map(item => shimStorage.set(item[0], item[1]));
				if (typeof callback !== "undefined") {
					callback();
				}
			},
			get: function(keys, callback) {
				var results = {};
				if (keys == null) {
					results = shimStorage.toObject();
				} else if (typeof keys == "string") {
					let value = shimStorage.get(keys);
					if (typeof value !== "undefined") {
						results[keys] = value;
					}
				} else if (Array.isArray(keys)) {
					for (var key in keys) {
						let value = shimStorage.get(key);
						if (typeof value !== "undefined") {
							results[key] = value;
						}
					}
				} else if (keys instanceof Object) {
					for (let key in keys) {
						let value = shimStorage.get(key);
						if (typeof value !== "undefined") {
							results[key] = value;
						} else {
							results[key] = keys[key];
						}
					}
				}
				callback(results);
			}
		}
	},
	runtime: {
    onStartup: {
      addListener: function(callback) {
        startupListener = callback;
      },
      removeListener: function() {
        startupListener = undefined;
      },
    },
    onConnect: {
      addListener: function(callback) {
        connectListener = callback;
        if (port) callback(port.receiverPort);
      },
      removeListener: function() {
        connectListener = undefined;
      },
    },
    onMessage: {
      addListener: function(callback) {
        if (!messageListener) messageListener = callback;
      },
      removeListener: function() {
        messageListener = undefined;
      },
    },
    connect: function({ name }) {
      port = {
        name,
        senderListener: undefined,
        senderMessage: undefined,
        receiverListener: undefined,
        receiverMessage: undefined,
      };
      port.sendMessage = function(sender, message) {
        if (sender) {
          if (port.receiverListener) port.receiverListener(message);
          else port.receiverMessage = message;
        }
        else {
          if (port.senderListener) port.senderListener(message);
          else port.senderMessage = message;
        }
      };
      port.senderPort = {
        postMessage: (message) => {
          port.sendMessage(true, message);
        },
        onMessage: {
          addListener: function(callback) {
            port.senderListener = callback;
            if (port.senderMessage) {
              port.senderListener(port.sendMessage);
              port.senderMessage = undefined;
            }
          },
          removeListener: function() {
            port.senderListener = () => {};
          },
        },
      };
      port.receiverPort = {
        postMessage: (message) => {
          port.sendMessage(false, message);
        },
        onMessage: {
          addListener: function(callback) {
            port.receiverListener = callback;
            if (port.receiverMessage) {
              port.receiverListener(port.receiverMessage);
              port.receiverMessage = undefined;
            }
          },
          removeListener: function() {
            port.receiverListener = () => {};
          },
        },
      };
      if (connectListener) connectListener(port.receiverPort);
      return port.senderPort;
    },
    sendMessage: function(message, callback) {
      messageListener(message, null, callback);
    },
    getURL: function(resource) {
      return window.location.origin + '/' + resource;
    },
	},
	tabs: {
    onRemoved: {
      addListener: function(callback) {
        removedListener = callback;
      },
      removeListener() {
        removedListener = undefined;
      },
    },
		query: function(queryInfo, callback) {
      const tabs = [
        {
          id: 0,
          url: window.origin,
          favIconUrl: window.origin + '/favicon.ico',
        }
      ];
      callback(tabs);
		},
		create: function(createProperties, callback) {
      const id = tabs.length;
      createProperties.id = id;
      const tab = createProperties;
      tabs.push(tab);
      if (!callback) {
        openUrl(createProperties.url);
      }
      else callback(tab);
		},
		update: function(tabId, updateProperties, callback = () => {}) {
      tabs[tabId] = { ...tabs[tabId], updateProperties };
      callback();
		},
		remove: function(tabId, callback = () => {}) {
      tabs[tabId] = {};
		},
    getCurrent: function(callback) {
      callback(tabs[tabs.length - 1]);
		},
    get: function() {
    },
    sendMessage: function(tabId, message, callback = () => {}) {
    },
	},
  windows: {
    create: function(options, callback) {
      const url = tabs[options.tabId].url;
      openUrl(url);
      if (callback) callback(window);
      else return window;
    },
    update: function(windowId, options, callback) {
      if (callback) callback();
      else return;
    },
    getCurrent: function(windowId, callback) {
      callback(window);
    },
    getLastFocused: function(callback) {
      callback(window);
    },
  },
};