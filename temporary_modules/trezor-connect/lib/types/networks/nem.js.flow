/* @flow */
// NEM types from nem-sdk
// https://nemproject.github.io/#transferTransaction

import type { UintType } from '../trezor/protobuf';

type MosaicID = {
    namespaceId: string,
    name: string,
};

type MosaicDefinition = {
    levy?: {
        type?: number,
        fee?: number,
        recipient?: string,
        mosaicId?: MosaicID,
    },
    id: MosaicID,
    description: string,
    properties?: Array<{
        name: 'divisibility' | 'initialSupply' | 'supplyMutable' | 'transferable',
        value: string,
    }>,
};

export type NEMMosaic = {
    mosaicId: MosaicID,
    quantity: number,
};

type Modification = {
    modificationType: number,
    cosignatoryAccount: string,
};

type Message = {
    payload?: string,
    type?: number,
    publicKey?: string, // not present in sdk
};

type TransactionCommon = {
    version: number,
    timeStamp: number,
    fee: number,
    deadline: number,
    signer?: string,
};

export type NEMTransferTransaction = TransactionCommon & {
    type: 0x0101,
    recipient: string,
    amount: UintType,
    mosaics?: NEMMosaic[],
    message?: Message,
};

export type NEMImportanceTransaction = TransactionCommon & {
    type: 0x0801,
    importanceTransfer: {
        mode: number,
        publicKey: string,
    },
};

export type NEMAggregateModificationTransaction = TransactionCommon & {
    type: 0x1001,
    modifications?: Modification[],
    minCosignatories: {
        relativeChange: number,
    },
};

export type NEMProvisionNamespaceTransaction = TransactionCommon & {
    type: 0x2001,
    newPart: string,
    parent?: string,
    rentalFeeSink: string,
    rentalFee: number,
};

export type NEMMosaicCreationTransaction = TransactionCommon & {
    type: 0x4001,
    mosaicDefinition: MosaicDefinition,
    creationFeeSink: string,
    creationFee: number,
};

export type NEMSupplyChangeTransaction = TransactionCommon & {
    type: 0x4002,
    mosaicId: MosaicID,
    supplyType: number,
    delta: number,
};

type Transaction =
    | NEMTransferTransaction
    | NEMImportanceTransaction
    | NEMAggregateModificationTransaction
    | NEMProvisionNamespaceTransaction
    | NEMMosaicCreationTransaction
    | NEMSupplyChangeTransaction;

export type NEMMultisigTransaction = TransactionCommon & {
    type: 0x0102 | 0x1002 | 0x1004,
    otherTrans: Transaction,
};

export type NEMTransaction = Transaction | NEMMultisigTransaction;

// get address

export type NEMGetAddress = {
    path: string | number[],
    address?: string,
    network: number,
    showOnTrezor?: boolean,
    useEventListener?: boolean, // set automatically if UI.ADDRESS_VALIDATION listener is used
};

export type NEMAddress = {
    address: string,
    path: number[],
    serializedPath: string,
};

// sign transaction

export type NEMSignTransaction = {
    path: string | number[],
    transaction: NEMTransaction,
};
