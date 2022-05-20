/* @flow */

export type Unsuccessful = {
    success: false,
    payload: { error: string, code?: string },
};

export type Success<T> = {
    success: true,
    id: number,
    payload: T,
};

export type Response<T> = Promise<Success<T> | Unsuccessful>;
export type BundledResponse<T> = Promise<Success<T[]> | Unsuccessful>;

export type DefaultMessage = {
    message: string,
};

export type Manifest = {
    appUrl: string,
    email: string,
};

export type Proxy =
    | string
    | {
          // Partial (useful) BlockchainLinkOptions.proxy
          protocol?: 'socks4' | 'socks4a' | 'socks' | 'socks5' | 'socks5h',
          host: string,
          port: string | number,
          username?: string,
          password?: string,
      };

export type ConnectSettings = {
    manifest: ?Manifest,
    connectSrc?: string,
    debug?: boolean,
    hostLabel?: string,
    hostIcon?: string,
    popup?: boolean,
    transportReconnect?: boolean,
    webusb?: boolean,
    pendingTransportEvent?: boolean,
    lazyLoad?: boolean,
    interactionTimeout?: number,
    // internal part, not to be accepted from .init()
    origin?: string,
    configSrc: string,
    iframeSrc: string,
    popupSrc: string,
    webusbSrc: string,
    version: string,
    priority: number,
    trustedHost: boolean,
    supportedBrowser?: boolean,
    extension?: string,
    env: 'node' | 'web' | 'webextension' | 'electron' | 'react-native',
    timestamp: number,
    proxy?: Proxy,
    useOnionLinks?: boolean,
};

export type CommonParams = {
    device?: {
        path: string,
        state?: ?string,
        instance?: ?number,
    },
    useEmptyPassphrase?: boolean,
    allowSeedlessDevice?: boolean,
    keepSession?: boolean,
    skipFinalReload?: boolean,
    useCardanoDerivaton?: boolean,
};

export type Bundle<T> = {
    bundle: T[],
};

export type NoBundle<T> = {
    ...T,
    bundle?: typeof undefined,
};

export type CoreMessage = {
    event: string,
    type: string,
    payload: any,

    id?: number, // response id in ResponseMessage
    success?: boolean, // response status in ResponseMessage
};

export type UiPromiseResponse = {
    event: string,
    payload: any,
};

// Override MessageEvent type to have access to "ports" field and typed "data"
export interface PostMessageEvent extends Event {
    origin: string;
    lastEventId: string;
    source: WindowProxy;
    ports: MessagePort[];
    data?: CoreMessage;
}

export type Deferred<T> = {
    id?: string,
    device?: any,
    promise: Promise<T>,
    resolve: (t: T) => void,
    reject: (e: Error) => void,
};
