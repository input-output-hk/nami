/* @flow */

import EventEmitter from 'events';

import PopupManager from '../../popup/PopupManager';
import * as iframe from '../../iframe/builder';
import webUSBButton from '../../webusb/button';

import { parseMessage, errorMessage } from '../../message';
import { UiMessage } from '../../message/builder';
import { parse as parseSettings } from '../../data/ConnectSettings';
import { initLog } from '../../utils/debug';

import {
    UI_EVENT,
    DEVICE_EVENT,
    RESPONSE_EVENT,
    TRANSPORT_EVENT,
    BLOCKCHAIN_EVENT,
    POPUP,
    IFRAME,
    UI,
    ERRORS,
    TRANSPORT,
} from '../../constants';

import * as $T from '../../types';

export const eventEmitter = new EventEmitter();
const _log = initLog('[trezor-connect.js]');

let _settings = parseSettings();
let _popupManager: ?PopupManager;

const initPopupManager = (): PopupManager => {
    const pm = new PopupManager(_settings);
    pm.on(POPUP.CLOSED, (error?: string) => {
        iframe.postMessage(
            {
                type: POPUP.CLOSED,
                payload: error ? { error } : null,
            },
            false,
        );
    });
    return pm;
};

export const manifest = (data: $T.Manifest) => {
    _settings = parseSettings({
        ..._settings,
        manifest: data,
    });
};

export const dispose = () => {
    eventEmitter.removeAllListeners();
    iframe.dispose();
    _settings = parseSettings();
    if (_popupManager) {
        _popupManager.close();
    }
};

export const cancel = (error?: string) => {
    if (_popupManager) {
        _popupManager.emit(POPUP.CLOSED, error);
    }
};

// handle message received from iframe
const handleMessage = (messageEvent: $T.PostMessageEvent) => {
    // ignore messages from domain other then iframe origin
    if (messageEvent.origin !== iframe.origin) return;

    const message = parseMessage(messageEvent.data);
    const { event, type, payload } = message;
    const id = message.id || 0;

    _log.log('handleMessage', message);

    switch (event) {
        case RESPONSE_EVENT:
            if (iframe.messagePromises[id]) {
                // resolve message promise (send result of call method)
                iframe.messagePromises[id].resolve({
                    id,
                    success: message.success,
                    payload,
                });
                delete iframe.messagePromises[id];
            } else {
                _log.warn(`Unknown message id ${id}`);
            }
            break;

        case DEVICE_EVENT:
            // pass DEVICE event up to html
            eventEmitter.emit(event, message);
            eventEmitter.emit(type, payload); // DEVICE_EVENT also emit single events (connect/disconnect...)
            break;

        case TRANSPORT_EVENT:
            eventEmitter.emit(event, message);
            eventEmitter.emit(type, payload);
            break;

        case BLOCKCHAIN_EVENT:
            eventEmitter.emit(event, message);
            eventEmitter.emit(type, payload);
            break;

        case UI_EVENT:
            if (type === IFRAME.BOOTSTRAP) {
                iframe.clearTimeout();
                break;
            }
            if (type === IFRAME.LOADED) {
                iframe.initPromise.resolve();
            }
            if (type === IFRAME.ERROR) {
                iframe.initPromise.reject(payload.error);
            }

            // pass UI event up
            eventEmitter.emit(event, message);
            eventEmitter.emit(type, payload);
            break;

        default:
            _log.log('Undefined message', event, messageEvent);
    }
};

export const init = async (settings: $Shape<$T.ConnectSettings> = {}): Promise<void> => {
    if (iframe.instance) {
        throw ERRORS.TypedError('Init_AlreadyInitialized');
    }

    _settings = parseSettings({ ..._settings, ...settings });

    if (!_settings.manifest) {
        throw ERRORS.TypedError('Init_ManifestMissing');
    }

    if (_settings.lazyLoad) {
        // reset "lazyLoad" after first use
        _settings.lazyLoad = false;
        return;
    }

    if (!_popupManager) {
        _popupManager = initPopupManager();
    }

    _log.enabled = !!_settings.debug;

    window.addEventListener('message', handleMessage);
    window.addEventListener('unload', dispose);

    await iframe.init(_settings);
};

export const call = async (params: any): Promise<any> => {
    if (!iframe.instance && !iframe.timeout) {
        // init popup with lazy loading before iframe initialization
        _settings = parseSettings(_settings);

        if (!_settings.manifest) {
            return errorMessage(ERRORS.TypedError('Init_ManifestMissing'));
        }

        if (!_popupManager) {
            _popupManager = initPopupManager();
        }
        _popupManager.request(true);

        // auto init with default settings
        try {
            await init(_settings);
        } catch (error) {
            if (_popupManager) {
                // Catch fatal iframe errors (not loading)
                if (['Init_IframeBlocked', 'Init_IframeTimeout'].includes(error.code)) {
                    _popupManager.postMessage(UiMessage(UI.IFRAME_FAILURE));
                } else {
                    _popupManager.close();
                }
            }
            return errorMessage(error);
        }
    }

    if (iframe.timeout) {
        // this.init was called, but iframe doesn't return handshake yet
        return errorMessage(ERRORS.TypedError('Init_ManifestMissing'));
    }
    if (iframe.error) {
        // iframe was initialized with error
        return errorMessage(iframe.error);
    }

    // request popup window it might be used in the future
    if (_settings.popup && _popupManager) {
        _popupManager.request();
    }

    // post message to iframe
    try {
        const response: ?Object = await iframe.postMessage({ type: IFRAME.CALL, payload: params });
        if (response) {
            if (
                !response.success &&
                response.payload.code !== 'Device_CallInProgress' &&
                _popupManager
            ) {
                _popupManager.unlock();
            }
            return response;
        }
        if (_popupManager) {
            _popupManager.unlock();
        }
        return errorMessage(ERRORS.TypedError('Method_NoResponse'));
    } catch (error) {
        _log.error('__call error', error);
        if (_popupManager) {
            _popupManager.close();
        }
        return errorMessage(error);
    }
};

const customMessageResponse = (payload: ?{ message: string, params?: any }) => {
    iframe.postMessage({
        event: UI_EVENT,
        type: UI.CUSTOM_MESSAGE_RESPONSE,
        payload,
    });
};

export const uiResponse = (response: $T.UiResponse) => {
    if (!iframe.instance) {
        throw ERRORS.TypedError('Init_NotInitialized');
    }
    const { type, payload } = response;
    iframe.postMessage({ event: UI_EVENT, type, payload });
};

export const renderWebUSBButton = (className: ?string) => {
    webUSBButton(className, _settings.webusbSrc, iframe.origin);
};

export const getSettings = (): $T.Response<$T.ConnectSettings> => {
    if (!iframe.instance) {
        return Promise.resolve(errorMessage(ERRORS.TypedError('Init_NotInitialized')));
    }
    return call({ method: 'getSettings' });
};

export const customMessage: $PropertyType<$T.API, 'customMessage'> = async params => {
    if (!iframe.instance) {
        throw ERRORS.TypedError('Init_NotInitialized');
    }
    if (typeof params.callback !== 'function') {
        return errorMessage(ERRORS.TypedError('Method_CustomMessage_Callback'));
    }

    // TODO: set message listener only if iframe is loaded correctly
    const { callback } = params;
    const customMessageListener = async (event: $T.PostMessageEvent) => {
        const { data } = event;
        if (data && data.type === UI.CUSTOM_MESSAGE_REQUEST) {
            const payload = await callback(data.payload);
            if (payload) {
                customMessageResponse(payload);
            } else {
                customMessageResponse({ message: 'release' });
            }
        }
    };
    window.addEventListener('message', customMessageListener, false);

    const response = await call({ method: 'customMessage', ...params, callback: null });
    window.removeEventListener('message', customMessageListener);
    return response;
};

export const requestLogin: $PropertyType<$T.API, 'requestLogin'> = async params => {
    if (!iframe.instance) {
        throw ERRORS.TypedError('Init_NotInitialized');
    }
    if (typeof params.callback === 'function') {
        const { callback } = params;

        // TODO: set message listener only if iframe is loaded correctly
        const loginChallengeListener = async (event: $T.PostMessageEvent) => {
            const { data } = event;
            if (data && data.type === UI.LOGIN_CHALLENGE_REQUEST) {
                try {
                    const payload = await callback();
                    iframe.postMessage({
                        event: UI_EVENT,
                        type: UI.LOGIN_CHALLENGE_RESPONSE,
                        payload,
                    });
                } catch (error) {
                    iframe.postMessage({
                        event: UI_EVENT,
                        type: UI.LOGIN_CHALLENGE_RESPONSE,
                        payload: error.message,
                    });
                }
            }
        };

        window.addEventListener('message', loginChallengeListener, false);

        const response = await call({
            method: 'requestLogin',
            ...params,
            asyncChallenge: true,
            callback: null,
        });
        window.removeEventListener('message', loginChallengeListener);
        return response;
    }
    return call({ method: 'requestLogin', ...params });
};

export const disableWebUSB = () => {
    if (!iframe.instance) {
        throw ERRORS.TypedError('Init_NotInitialized');
    }
    iframe.postMessage({
        event: UI_EVENT,
        type: TRANSPORT.DISABLE_WEBUSB,
    });
};
