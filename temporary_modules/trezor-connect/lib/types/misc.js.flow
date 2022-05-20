/* @flow */

import type { Proxy } from './params';

export type CipherKeyValue = {
    path: string | number[],
    key: string,
    value: string | Buffer,
    encrypt?: boolean,
    askOnEncrypt?: boolean,
    askOnDecrypt?: boolean,
    iv?: string,
};

export type CipheredValue = {
    value: string,
};

export type LoginChallenge = {
    challengeHidden: string,
    challengeVisual: string,
    callback?: typeof undefined,
    asyncChallenge?: typeof undefined,
};

export type RequestLoginAsync = { callback: () => LoginChallenge, asyncChallenge?: boolean };

export type Login = {
    address: string,
    publicKey: string,
    signature: string,
};

export type CustomMessage = {
    messages?: JSON | Object,
    message: string,
    params: JSON | Object,
    callback: (request: any) => Promise<{ message: string, params?: Object }>,
};

export type SetProxy = {
    proxy?: Proxy,
    useOnionLinks?: boolean,
};
