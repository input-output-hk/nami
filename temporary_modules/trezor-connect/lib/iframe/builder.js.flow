/* @flow */

import { create as createDeferred } from '../utils/deferred';
import { IFRAME, ERRORS } from '../constants';
import { getOrigin } from '../utils/urlUtils';
import css from './inline-styles';
import type { ConnectSettings, Deferred } from '../types';

/* eslint-disable import/no-mutable-exports */
export let instance: HTMLIFrameElement | null;
export let origin: string;
export let initPromise: Deferred<void> = createDeferred();
export let timeout: number = 0;
export let error: ?ERRORS.TrezorError;
/* eslint-enable import/no-mutable-exports */

let _messageID: number = 0;
// every postMessage to iframe has its own promise to resolve
export const messagePromises: { [key: number]: Deferred<any> } = {};

export const init = async (settings: ConnectSettings) => {
    initPromise = createDeferred();
    const existedFrame: HTMLIFrameElement = (document.getElementById('trezorconnect'): any);
    if (existedFrame) {
        instance = existedFrame;
    } else {
        instance = document.createElement('iframe');
        instance.frameBorder = '0';
        instance.width = '0px';
        instance.height = '0px';
        instance.style.position = 'absolute';
        instance.style.display = 'none';
        instance.style.border = '0px';
        instance.style.width = '0px';
        instance.style.height = '0px';
        instance.id = 'trezorconnect';
    }

    let src: string;
    if (settings.env === 'web') {
        const manifestString = settings.manifest ? JSON.stringify(settings.manifest) : 'undefined'; // note: btoa(undefined) === btoa('undefined') === "dW5kZWZpbmVk"
        const manifest = `version=${settings.version}&manifest=${encodeURIComponent(
            btoa(JSON.stringify(manifestString)),
        )}`;
        src = `${settings.iframeSrc}?${manifest}`;
    } else {
        src = settings.iframeSrc;
    }

    instance.setAttribute('src', src);
    if (settings.webusb) {
        instance.setAttribute('allow', 'usb');
    }

    origin = getOrigin(instance.src);
    timeout = window.setTimeout(() => {
        initPromise.reject(ERRORS.TypedError('Init_IframeTimeout'));
    }, 10000);

    const onLoad = () => {
        if (!instance) {
            initPromise.reject(ERRORS.TypedError('Init_IframeBlocked'));
            return;
        }
        try {
            // if hosting page is able to access cross-origin location it means that the iframe is not loaded
            const iframeOrigin = instance.contentWindow.location.origin;
            if (!iframeOrigin || iframeOrigin === 'null') {
                // eslint-disable-next-line no-use-before-define
                handleIframeBlocked();
                return;
            }
        } catch (e) {
            // empty
        }

        let extension: ?string;
        // $FlowIssue chrome is not declared outside
        if (
            typeof chrome !== 'undefined' &&
            chrome.runtime &&
            typeof chrome.runtime.onConnect !== 'undefined'
        ) {
            chrome.runtime.onConnect.addListener(() => {});
            extension = chrome.runtime.id;
        }

        instance.contentWindow.postMessage(
            {
                type: IFRAME.INIT,
                payload: {
                    settings,
                    extension,
                },
            },
            origin,
        );

        instance.onload = undefined;
    };

    // IE hack
    if (instance.attachEvent) {
        instance.attachEvent('onload', onLoad);
    } else {
        instance.onload = onLoad;
    }
    // inject iframe into host document body
    if (document.body) {
        document.body.appendChild(instance);
        // eslint-disable-next-line no-use-before-define
        injectStyleSheet();
    }

    try {
        await initPromise.promise;
    } catch (e) {
        // reset state to allow initialization again
        if (instance) {
            if (instance.parentNode) {
                instance.parentNode.removeChild(instance);
            }
            instance = null;
        }
        throw e;
    } finally {
        window.clearTimeout(timeout);
        timeout = 0;
    }
};

const injectStyleSheet = () => {
    if (!instance) {
        throw ERRORS.TypedError('Init_IframeBlocked');
    }
    const doc = instance.ownerDocument;
    const head = doc.head || doc.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('id', 'TrezorConnectStylesheet');

    // $FlowIssue
    if (style.styleSheet) {
        // IE
        // $FlowIssue
        style.styleSheet.cssText = css;
        head.appendChild(style);
    } else {
        style.appendChild(document.createTextNode(css));
        head.append(style);
    }
};

const handleIframeBlocked = () => {
    window.clearTimeout(timeout);

    error = ERRORS.TypedError('Init_IframeBlocked');
    // eslint-disable-next-line no-use-before-define
    dispose();
    initPromise.reject(error);
};

// post messages to iframe
export const postMessage = (message: any, usePromise: boolean = true) => {
    if (!instance) {
        throw ERRORS.TypedError('Init_IframeBlocked');
    }
    if (usePromise) {
        _messageID++;
        message.id = _messageID;
        messagePromises[_messageID] = createDeferred();
        const { promise } = messagePromises[_messageID];
        instance.contentWindow.postMessage(message, origin);
        return promise;
    }

    instance.contentWindow.postMessage(message, origin);
    return null;
};

export const dispose = () => {
    if (instance && instance.parentNode) {
        try {
            instance.parentNode.removeChild(instance);
        } catch (e) {
            // do nothing
        }
    }
    instance = null;
    timeout = 0;
};

export const clearTimeout = () => {
    window.clearTimeout(timeout);
};
