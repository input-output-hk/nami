/* @flow */
// Ethereum types
// https://github.com/ethereumjs/ethereumjs-tx

// get address

export type EthereumGetAddress = {
    path: string | number[],
    address?: string,
    showOnTrezor?: boolean,
};

export type EthereumAddress = {
    address: string,
    path: number[],
    serializedPath: string,
};

// get public key

export type EthereumGetPublicKey = {
    path: string | number[],
    showOnTrezor?: boolean,
};

// sign transaction

export type EthereumTransaction = {
    to: string,
    value: string,
    gasPrice: string,
    gasLimit: string,
    maxFeePerGas?: typeof undefined,
    maxPriorityFeePerGas?: typeof undefined,
    nonce: string,
    data?: string,
    chainId: number,
    txType?: number,
};

export type EthereumAccessList = {
    address: string,
    storageKeys: string[],
};

export type EthereumTransactionEIP1559 = {
    to: string,
    value: string,
    gasPrice?: typeof undefined,
    gasLimit: string,
    maxFeePerGas: string,
    maxPriorityFeePerGas: string,
    nonce: string,
    data?: string,
    chainId: number,
    accessList?: EthereumAccessList[],
};

export type EthereumSignTransaction = {
    path: string | number[],
    transaction: EthereumTransaction | EthereumTransactionEIP1559,
};

export type EthereumSignedTx = {
    v: string,
    r: string,
    s: string,
};

// sign message

export type EthereumSignMessage = {
    path: string | number[],
    message: string,
    hex?: boolean,
};

// verify message

export type EthereumVerifyMessage = {
    address: string,
    message: string,
    hex?: boolean,
    signature: string,
};
