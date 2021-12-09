/* @flow */
import type {
    PrevInput,
    TxInput as OrigTxInputType,
    TxInputType,
    TxOutputType,
    TxOutputBinType,
    Address as ProtobufAddress,
} from '../trezor/protobuf';

// getAddress params
export type GetAddress = {
    path: string | number[],
    address?: string,
    showOnTrezor?: boolean,
    coin?: string,
    crossChain?: boolean,
};

// getAddress response
export type Address = ProtobufAddress & {
    path: number[],
    serializedPath: string,
};

// getPublicKey params
export type GetPublicKey = {
    path: string | number[],
    coin?: string,
    crossChain?: boolean,
};

// combined Bitcoin.PublicKey and Bitcoin.HDNode
export type HDNodeResponse = {
    path: number[],
    serializedPath: string,
    childNum: number,
    xpub: string,
    xpubSegwit?: string,
    chainCode: string,
    publicKey: string,
    fingerprint: number,
    depth: number,
};

// based on PROTO.TransactionType, with required fields
export type RefTransaction =
    | {
          hash: string,
          version: number,
          inputs: PrevInput[],
          bin_outputs: TxOutputBinType[],
          outputs?: typeof undefined,
          lock_time: number,
          extra_data?: string,
          expiry?: number,
          overwintered?: boolean,
          version_group_id?: number,
          timestamp?: number,
          branch_id?: number,
      }
    | {
          hash: string,
          version: number,
          inputs: OrigTxInputType[],
          bin_outputs?: typeof undefined,
          outputs: TxOutputType[],
          lock_time: number,
          extra_data?: string,
          expiry?: number,
          overwintered?: boolean,
          version_group_id?: number,
          timestamp?: number,
          branch_id?: number,
      };

// based on PROTO.SignTx, only optional fields
export type TransactionOptions = {|
    version?: number,
    lock_time?: number,
    expiry?: number,
    overwintered?: boolean,
    version_group_id?: number,
    timestamp?: number,
    branch_id?: number,
    decred_staking_ticket?: boolean,
|};

// signTransaction params
export type SignTransaction = {
    inputs: TxInputType[],
    outputs: TxOutputType[],
    refTxs?: RefTransaction[],
    account?: {
        // Partial account (addresses)
        addresses: {
            used: { path: string, address: string }[],
            unused: { path: string, address: string }[],
            change: { path: string, address: string }[],
        },
    },
    coin: string,
    locktime?: number,
    timestamp?: number,
    version?: number,
    expiry?: number,
    overwintered?: boolean,
    versionGroupId?: number,
    branchId?: number,
    decredStakingTicket?: boolean,
    push?: boolean,
};
export type SignedTransaction = {
    signatures: string[],
    serializedTx: string,
    txid?: string,
};

// push transaction params
export type PushTransaction = {
    tx: string,
    coin: string,
};

// push transaction response
export type PushedTransaction = {
    txid: string,
};

export type SignMessage = {
    path: string | number[],
    coin: string,
    message: string,
    hex?: boolean,
};

export type VerifyMessage = {
    address: string,
    signature: string,
    message: string,
    coin: string,
    hex?: boolean,
};

export type { TxInputType, TxOutputType } from '../trezor/protobuf';
