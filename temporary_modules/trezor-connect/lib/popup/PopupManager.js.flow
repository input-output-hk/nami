/* @flow */

import EventEmitter from 'events';
import * as POPUP from '../constants/popup';
import * as IFRAME from '../constants/iframe';
import * as UI from '../constants/ui';
import { showPopupRequest } from './showPopupRequest';
import type { ConnectSettings, CoreMessage, Deferred } from '../types';
import { getOrigin } from '../utils/urlUtils';
import { create as createDeferred } from '../utils/deferred';

// const POPUP_REQUEST_TIMEOUT = 602;
const POPUP_REQUEST_TIMEOUT = 850;
const POPUP_CLOSE_INTERVAL = 500;
const POPUP_OPEN_TIMEOUT = 3000;

export default class PopupManager extends EventEmitter {
    _window: any; // Window

    settings: ConnectSettings;

    origin: string;

    locked: boolean;

    requestTimeout: number = 0;

    openTimeout: number;

    closeInterval: number = 0;

    iframeHandshake: Deferred<boolean>;

    popupPromise: Deferred<void> | typeof undefined;

    handleMessage: (event: MessageEvent) => void;

    handleExtensionConnect: () => void;

    handleExtensionMessage: () => void;

    // $FlowIssue chrome not declared outside
    extensionPort: ?ChromePort;

    extensionTabId: number = 0;

    constructor(settings: ConnectSettings) {
        super();
        this.settings = settings;
        this.origin = getOrigin(settings.popupSrc);
        this.handleMessage = this.handleMessage.bind(this);
        this.iframeHandshake = createDeferred(IFRAME.LOADED);

        if (this.settings.env === 'webextension' && false) {
            this.handleExtensionConnect = this.handleExtensionConnect.bind(this);
            this.handleExtensionMessage = this.handleExtensionMessage.bind(this);
            // $FlowIssue chrome not declared outside
            chrome.runtime.onConnect.addListener(this.handleExtensionConnect);
        }

        window.addEventListener('message', this.handleMessage, false);
    }

    request(lazyLoad: boolean = false) {
        // popup request
        // TODO: ie - open immediately and hide it but post handshake after timeout

        // bring popup window to front
        if (this.locked) {
            if (this._window) {
                if (this.settings.env === 'webextension' && false) {
                    // $FlowIssue chrome not declared outside
                    chrome.tabs.update(this._window.id, { active: true });
                } else {
                    this._window.focus();
                }
            }
            return;
        }

        const openFn: Function = this.open.bind(this);
        this.locked = true;
        if (!this.settings.supportedBrowser) {
            openFn();
        } else {
            const timeout =
                lazyLoad || (this.settings.env === 'webextension' && false)
                    ? 1
                    : POPUP_REQUEST_TIMEOUT;
            this.requestTimeout = window.setTimeout(() => {
                this.requestTimeout = 0;
                openFn(lazyLoad);
            }, timeout);
        }
    }

    cancel() {
        this.close();
    }

    unlock() {
        this.locked = false;
    }

    open(lazyLoad?: boolean) {
        const src = this.settings.popupSrc;
        if (!this.settings.supportedBrowser) {
            this.openWrapper(`${src}#unsupported`);
            return;
        }

        this.popupPromise = createDeferred(POPUP.LOADED);
        this.openWrapper(lazyLoad ? `${src}#loading` : src);

        this.closeInterval = window.setInterval(() => {
            if (!this._window) return;
            if (this.settings.env === 'webextension' && false) {
                // $FlowIssue chrome not declared outside
                chrome.tabs.get(this._window.id, tab => {
                    if (!tab) {
                        this.close();
                        this.emit(POPUP.CLOSED);
                    }
                });
            } else if (this._window.closed) {
                this.close();
                this.emit(POPUP.CLOSED);
            }
        }, POPUP_CLOSE_INTERVAL);

        // open timeout will be cancelled by POPUP.BOOTSTRAP message
        this.openTimeout = window.setTimeout(() => {
            this.close();
            showPopupRequest(this.open.bind(this), () => {
                this.emit(POPUP.CLOSED);
            });
        }, POPUP_OPEN_TIMEOUT);
    }

    openWrapper(url: string) {
        if (this.settings.env === 'webextension' && false) {
            // $FlowIssue chrome not declared outside
            chrome.windows.getCurrent(null, currentWindow => {
                // Request coming from extension popup,
                // create new window above instead of opening new tab
                if (currentWindow.type !== 'normal') {
                    // $FlowIssue chrome not declared outside
                    chrome.windows.create({ url }, newWindow => {
                        // $FlowIssue chrome not declared outside
                        chrome.tabs.query(
                            {
                                windowId: newWindow.id,
                                active: true,
                            },
                            tabs => {
                                // eslint-disable-next-line prefer-destructuring
                                this._window = tabs[0];
                            },
                        );
                    });
                } else {
                    // $FlowIssue chrome not declared outside
                    chrome.tabs.query(
                        {
                            currentWindow: true,
                            active: true,
                        },
                        tabs => {
                            this.extensionTabId = tabs[0].id;
                            // $FlowIssue chrome not declared outside
                            chrome.tabs.create(
                                {
                                    url,
                                    index: tabs[0].index + 1,
                                },
                                tab => {
                                    this._window = tab;
                                },
                            );
                        },
                    );
                }
            });
        } else if (this.settings.env === 'electron') {
            this._window = window.open(url, 'modal');
        } else {
            const f = document.getElementById('trezorPopupNami');
            f.src = url;
            this._window = f.contentWindow;
            // if (this._window) {
            //     this._window.location.href = url; // otherwise android/chrome loose window.opener reference
            // }
        }
    }

    handleExtensionConnect(port: ChromePort) {
        if (port.name !== 'trezor-connect') return;
        if (!this._window || (this._window && this._window.id !== port.sender.tab.id)) {
            port.disconnect();
            return;
        }
        // since POPUP.BOOTSTRAP will not be handled by "handleMessage" we need to threat "content-script" connection as the same event
        // popup is opened properly, now wait for POPUP.LOADED message (in this case handled by "handleExtensionMessage")
        window.clearTimeout(this.openTimeout);

        this.extensionPort = port;
        // $FlowIssue need to update ChromePort definition
        this.extensionPort.onMessage.addListener(this.handleExtensionMessage);
    }

    handleExtensionMessage(message: MessageEvent) {
        if (!this.extensionPort) return;
        const port = this.extensionPort;
        const { data } = message;
        if (!data || typeof data !== 'object') return;

        if (data.type === POPUP.ERROR) {
            // handle popup error
            const errorMessage =
                data.payload && typeof data.payload.error === 'string' ? data.payload.error : null;
            this.emit(POPUP.CLOSED, errorMessage ? `Popup error: ${errorMessage}` : null);
            this.close();
        } else if (data.type === POPUP.LOADED) {
            if (this.popupPromise) {
                this.popupPromise.resolve();
            }
            this.iframeHandshake.promise.then(useBroadcastChannel => {
                port.postMessage({
                    type: POPUP.INIT,
                    payload: {
                        settings: this.settings,
                        useBroadcastChannel,
                    },
                });
            });
        } else if (data.type === POPUP.EXTENSION_USB_PERMISSIONS) {
            // $FlowIssue chrome not declared outside
            chrome.tabs.query(
                {
                    currentWindow: true,
                    active: true,
                },
                tabs => {
                    // $FlowIssue chrome not declared outside
                    chrome.tabs.create(
                        {
                            url: 'trezor-usb-permissions.html',
                            index: tabs[0].index + 1,
                        },
                        _tab => {
                            // do nothing
                        },
                    );
                },
            );
        } else if (data.type === POPUP.CLOSE_WINDOW) {
            this.emit(POPUP.CLOSED);
            this.close();
        }
    }

    handleMessage(message: MessageEvent) {
        // ignore messages from domain other then popup origin and without data
        // const data: CoreMessage = message.data;
        const { data } = message;
        if (getOrigin(message.origin) !== this.origin || !data || typeof data !== 'object') return;

        if (data.type === IFRAME.LOADED) {
            const useBroadcastChannel =
                data.payload && typeof data.payload.useBroadcastChannel === 'boolean'
                    ? data.payload.useBroadcastChannel
                    : false;
            this.iframeHandshake.resolve(useBroadcastChannel);
        } else if (data.type === POPUP.BOOTSTRAP) {
            // popup is opened properly, now wait for POPUP.LOADED message
            window.clearTimeout(this.openTimeout);
        } else if (data.type === POPUP.ERROR && this._window) {
            const errorMessage =
                data.payload && typeof data.payload.error === 'string' ? data.payload.error : null;
            this.emit(POPUP.CLOSED, errorMessage ? `Popup error: ${errorMessage}` : null);
            this.close();
        } else if (data.type === POPUP.LOADED) {
            if (this.popupPromise) {
                this.popupPromise.resolve();
            }
            // popup is successfully loaded
            this.iframeHandshake.promise.then(useBroadcastChannel => {
                this._window.postMessage(
                    {
                        type: POPUP.INIT,
                        payload: {
                            settings: this.settings,
                            useBroadcastChannel,
                        },
                    },
                    this.origin,
                );
            });
            // send ConnectSettings to popup
            // note this settings and iframe.ConnectSettings could be different (especially: origin, popup, webusb, debug)
            // now popup is able to load assets
        } else if (data.type === POPUP.CANCEL_POPUP_REQUEST || data.type === UI.CLOSE_UI_WINDOW) {
            this.close();
        }
    }

    close() {
        this.locked = false;
        this.popupPromise = undefined;

        if (this.requestTimeout) {
            window.clearTimeout(this.requestTimeout);
            this.requestTimeout = 0;
        }

        if (this.openTimeout) {
            window.clearTimeout(this.openTimeout);
            this.openTimeout = 0;
        }
        if (this.closeInterval) {
            window.clearInterval(this.closeInterval);
            this.closeInterval = 0;
        }

        if (this.extensionPort) {
            this.extensionPort.disconnect();
            this.extensionPort = null;
        }

        // switch to previously focused tab
        if (this.extensionTabId) {
            // $FlowIssue chrome not declared outside
            chrome.tabs.update(this.extensionTabId, { active: true });
            this.extensionTabId = 0;
        }

        if (this._window) {
            if (this.settings.env === 'webextension' && false) {
                // eslint-disable-next-line no-unused-vars
                let _e = chrome.runtime.lastError;
                // $FlowIssue chrome not declared outside
                chrome.tabs.remove(this._window.id, () => {
                    // eslint-disable-next-line no-unused-vars
                    _e = chrome.runtime.lastError;
                });
            } else {
                this._window.close();
            }
            this._window = null;
        }
    }

    async postMessage(message: CoreMessage) {
        // device needs interaction but there is no popup/ui
        // maybe popup request wasn't handled
        // ignore "ui_request_window" type
        if (!this._window && message.type !== UI.REQUEST_UI_WINDOW && this.openTimeout) {
            this.close();
            showPopupRequest(this.open.bind(this), () => {
                this.emit(POPUP.CLOSED);
            });
            return;
        }

        // post message before popup request finalized
        if (this.popupPromise) {
            await this.popupPromise.promise;
        }
        // post message to popup window
        if (this._window) {
            this._window.postMessage(message, this.origin);
        }
    }
}
