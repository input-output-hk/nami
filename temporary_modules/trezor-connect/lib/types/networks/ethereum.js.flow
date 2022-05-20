/* @flow */
// Ethereum types
// https://github.com/ethereumjs/ethereumjs-tx

// get address

export type EthereumGetAddress = {
    path: string | number[],
    address?: string,
    showOnTrezor?: boolean,
    useEventListener?: boolean, // set automatically if UI.ADDRESS_VALIDATION listener is used
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

// sign typed message (eip-712)

type EthereumSignTypedDataTypeProperty = {
    name: string,
    type: string,
};

export type EthereumSignTypedDataTypes = {
    EIP712Domain: EthereumSignTypedDataTypeProperty[],
    [additionalProperties: string]: EthereumSignTypedDataTypeProperty[],
};

type EthereumSignTypedDataMessage<T: EthereumSignTypedDataTypes> = {
    types: T,
    primaryType: $Keys<T>,
    domain: {
        name?: string,
        version?: string,
        chainId?: number,
        verifyingContract?: string,
        salt?: ArrayBuffer,
    },
    message: { [fieldName: string]: any },
};

/**
 * Used for full EIP-712 signing
 * (currently only supported on Trezor Model T)
 */
export type EthereumSignTypedData = {
    path: string | number[],
    metamask_v4_compat: boolean,
    data: EthereumSignTypedDataMessage<EthereumSignTypedDataTypes>,
};

/**
 * Used for EIP-712 blind signing on Trezor Model 1 only
 */
export type EthereumSignTypedHash = {
    path: string | number[],
    domain_separator_hash: string,
    /** Optional for domain-only hashes (when EIP712Domain is the primaryType) */
    message_hash?: string,
};

/**
 * Used for full EIP-712 signing or blind signing.
 * Supports both Trezor Model T and Trezor Model 1
 */
export type EthereumSignTypedHashAndData = {
    ...$Exact<EthereumSignTypedData>,
    ...$Exact<EthereumSignTypedHash>,
};

// verify message

export type EthereumVerifyMessage = {
    address: string,
    message: string,
    hex?: boolean,
    signature: string,
};
