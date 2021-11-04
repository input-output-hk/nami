/* @flow */

import 'whatwg-fetch';

export const httpRequest = async (url: string, type: string = 'text'): any => {
    const response = await fetch(url, { credentials: 'same-origin' });
    if (response.ok) {
        if (type === 'json') {
            const txt = await response.text();
            return JSON.parse(txt);
        }
        if (type === 'binary') {
            return response.arrayBuffer();
        }
        return response.text();
    }
    throw new Error(`httpRequest error: ${url} ${response.statusText}`);
};

export const getOrigin = (url: string) => {
    if (url.indexOf('file://') === 0) return 'file://';
    // eslint-disable-next-line no-useless-escape
    const parts = url.match(/^.+\:\/\/[^\/]+/);
    return Array.isArray(parts) && parts.length > 0 ? parts[0] : 'unknown';
};
