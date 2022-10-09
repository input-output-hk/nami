/* @flow */

// get address

export type TezosGetAddress = {
    path: string | number[],
    address?: string,
    showOnTrezor?: boolean,
    useEventListener?: boolean, // set automatically if UI.ADDRESS_VALIDATION listener is used
};

export type TezosAddress = {
    address: string,
    path: number[],
    serializedPath: string,
};

// get public key

export type TezosGetPublicKey = {
    path: string | number[],
    showOnTrezor?: boolean,
};

export type TezosPublicKey = {
    publicKey: string,
    path: number[],
    serializedPath: string,
};

// sign transaction

export type TezosRevealOperation = {
    source: string,
    fee: number,
    counter: number,
    gas_limit: number,
    storage_limit: number,
    public_key: string,
};

export type TezosManagerTransfer = {
    destination: string,
    amount: number,
};

export type TezosParametersManager = {
    set_delegate?: string,
    cancel_delegate?: boolean,
    transfer?: TezosManagerTransfer,
};

export type TezosTransactionOperation = {
    source: string,
    destination: string,
    amount: number,
    counter: number,
    fee: number,
    gas_limit: number,
    storage_limit: number,
    parameters?: number[],
    parameters_manager?: TezosParametersManager,
};

export type TezosOriginationOperation = {
    source: string,
    balance: number,
    delegate?: string,
    script: string | number[],
    fee: number,
    counter: number,
    gas_limit: number,
    storage_limit: number,
};

export type TezosDelegationOperation = {
    source: string,
    delegate: string,
    fee: number,
    counter: number,
    gas_limit: number,
    storage_limit: number,
};

export type TezosOperation = {
    reveal?: TezosRevealOperation,
    transaction?: TezosTransactionOperation,
    origination?: TezosOriginationOperation,
    delegation?: TezosDelegationOperation,
};

export type TezosSignTransaction = {
    path: string | number[],
    branch: string,
    operation: TezosOperation,
};
