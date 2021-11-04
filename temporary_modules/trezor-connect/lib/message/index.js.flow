/* @flow */

import type { CoreMessage } from '../types';

// parse MessageEvent .data into CoreMessage
export const parseMessage = (messageData: any): CoreMessage => {
    const message: CoreMessage = {
        event: messageData.event,
        type: messageData.type,
        payload: messageData.payload,
    };

    if (typeof messageData.id === 'number') {
        message.id = messageData.id;
    }

    if (typeof messageData.success === 'boolean') {
        message.success = messageData.success;
    }

    return message;
};

// common response used straight from npm index (not from Core)
export const errorMessage = (error: any) => ({
    success: false,
    payload: {
        error: error.message,
        code: error.code,
    },
});
