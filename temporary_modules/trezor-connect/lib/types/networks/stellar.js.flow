/* @flow */

// Stellar types from stellar-sdk
// https://github.com/stellar/js-stellar-base

import type {
    UintType,
    StellarAssetType,
    StellarSignerType,
    StellarMemoType,
    StellarPaymentOp,
    StellarCreateAccountOp,
    StellarPathPaymentStrictSendOp,
    StellarPathPaymentStrictReceiveOp,
    StellarCreatePassiveSellOfferOp,
    StellarManageBuyOfferOp,
    StellarManageSellOfferOp,
    StellarSetOptionsOp,
    StellarChangeTrustOp,
    StellarAllowTrustOp,
    StellarAccountMergeOp,
    StellarManageDataOp,
    StellarBumpSequenceOp,
} from '../trezor/protobuf';

export type StellarAsset = {
    type: StellarAssetType,
    code?: string,
    issuer?: string,
};

export type StellarCreateAccountOperation = {
    type: 'createAccount', // Proto: "StellarCreateAccountOp"
    source?: string, // Proto: "source_account"
    destination: string, // Proto: "new_account",
    startingBalance: string, // Proto: "starting_balance"
};

export type StellarPaymentOperation = {
    type: 'payment', // Proto: "StellarPaymentOp"
    source?: string, // Proto: "source_account"
    destination: string, // Proto: "destination_account"
    asset: StellarAsset, // Proto: ok
    amount: string, // Proto: ok
};

export type StellarPathPaymentStrictReceiveOperation = {
    type: 'pathPaymentStrictReceive', // Proto: "StellarPathPaymentStrictReceiveOp"
    source?: string, // Proto: "source_account"
    sendAsset: StellarAsset, // Proto: "send_asset"
    sendMax: string, // Proto: "send_max"
    destination: string, // Proto: "destination_account"
    destAsset: StellarAsset, // Proto: "destination_asset"
    destAmount: string, // Proto "destination_amount"
    path?: StellarAsset[], // Proto: "paths"
};

export type StellarPathPaymentStrictSendOperation = {
    type: 'pathPaymentStrictSend', // Proto: "StellarPathPaymentStrictSendOp"
    source?: string, // Proto: "source_account"
    sendAsset: StellarAsset, // Proto: "send_asset"
    sendAmount: string, // Proto: "send_amount"
    destination: string, // Proto: "destination_account"
    destAsset: StellarAsset, // Proto: "destination_asset"
    destMin: string, // Proto "destination_min"
    path?: StellarAsset[], // Proto: "paths"
};

export type StellarPassiveSellOfferOperation = {
    type: 'createPassiveSellOffer', // Proto: "StellarCreatePassiveSellOfferOp"
    source?: string, // Proto: "source_account"
    buying: StellarAsset, // Proto: "buying_asset"
    selling: StellarAsset, // Proto: "selling_asset"
    amount: string, // Proto: ok
    price: { n: number, d: number }, // Proto: "price_n" and "price_d"
};

export type StellarManageSellOfferOperation = {
    type: 'manageSellOffer', // Proto: "StellarManageSellOfferOp"
    source?: string, // Proto: "source_account"
    buying: StellarAsset, // Proto: "buying_asset"
    selling: StellarAsset, // Proto: "selling_asset"
    amount: string, // Proto: ok
    offerId?: string, // Proto: "offer_id" // not found in stellar-sdk
    price: { n: number, d: number }, // Proto: "price_n" and "price_d"
};

export type StellarManageBuyOfferOperation = {
    type: 'manageBuyOffer', // Proto: "StellarManageBuyOfferOp"
    source?: string, // Proto: "source_account"
    buying: StellarAsset, // Proto: "buying_asset"
    selling: StellarAsset, // Proto: "selling_asset"
    amount: string, // Proto: ok
    offerId?: string, // Proto: "offer_id" // not found in stellar-sdk
    price: { n: number, d: number }, // Proto: "price_n" and "price_d"
};

export type StellarSetOptionsOperation = {
    type: 'setOptions', // Proto: "StellarSetOptionsOp"
    source?: string, // Proto: "source_account"
    signer?: {
        type: StellarSignerType,
        key: string | Buffer,
        weight?: number,
    },
    inflationDest?: string, // Proto: "inflation_destination_account"
    clearFlags?: number, // Proto: "clear_flags"
    setFlags?: number, // Proto: "set_flags"
    masterWeight?: UintType, // Proto: "master_weight"
    lowThreshold?: UintType, // Proto: "low_threshold"
    medThreshold?: UintType, // Proto: "medium_threshold"
    highThreshold?: UintType, // Proto: "high_threshold"
    homeDomain?: string, // Proto: "home_domain"
};

export type StellarChangeTrustOperation = {
    type: 'changeTrust', // Proto: "StellarChangeTrustOp"
    source?: string, // Proto: "source_account"
    line: StellarAsset, // Proto: ok
    limit: string, // Proto: ok
};

export type StellarAllowTrustOperation = {
    type: 'allowTrust', // Proto: "StellarAllowTrustOp"
    source?: string, // Proto: "source_account"
    trustor: string, // Proto: "trusted_account"
    assetCode: string, // Proto: "asset_code"
    assetType: StellarAssetType, // Proto: "asset_type"
    authorize?: boolean | typeof undefined, // Proto: "is_authorized" > parse to number
};

export type StellarAccountMergeOperation = {
    type: 'accountMerge', // Proto: "StellarAccountMergeOp"
    source?: string, // Proto: "source_account"
    destination: string, // Proto: "destination_account"
};

export type StellarManageDataOperation = {
    type: 'manageData', // Proto: "StellarManageDataOp"
    source?: string, // Proto: "source_account"
    name: string, // Proto: "key"
    value?: Buffer | string, // Proto: "value"
};

// (?) Missing in stellar API but present in Proto messages
export type StellarBumpSequenceOperation = {
    type: 'bumpSequence', // Proto: "StellarBumpSequenceOp"
    source?: string, // Proto: "source_account"
    bumpTo: string, // Proto: "bump_to"
};

// (?) Missing in Proto messages, but present in Stellar API
export type StellarInflationOperation = {
    type: 'inflation',
    source?: string, // Proto: "source_account"
};

export type StellarOperation =
    | StellarCreateAccountOperation
    | StellarPaymentOperation
    | StellarPathPaymentStrictReceiveOperation
    | StellarPathPaymentStrictSendOperation
    | StellarPassiveSellOfferOperation
    | StellarManageSellOfferOperation
    | StellarManageBuyOfferOperation
    | StellarSetOptionsOperation
    | StellarChangeTrustOperation
    | StellarAllowTrustOperation
    | StellarAccountMergeOperation
    | StellarInflationOperation
    | StellarManageDataOperation
    | StellarBumpSequenceOperation;

export type StellarTransaction = {
    source: string, // Proto: "source_account"
    fee: number, // Proto: ok
    sequence: UintType, // Proto: "sequence_number"
    timebounds?: {
        minTime: number, // Proto: "timebounds_start"
        maxTime: number, // Proto: "timebounds_end"
    },
    memo?: {
        type: StellarMemoType, // Proto: "memo_type"
        id?: string, // Proto: "memo_id"
        text?: string, // Proto: "memo_text"
        hash?: string | Buffer, // Proto: "memo_hash"
    },
    operations: StellarOperation[], // Proto: calculated array length > "num_operations"
};

export type StellarSignTransaction = {
    path: string | number[],
    networkPassphrase: string,
    transaction: StellarTransaction,
};

export type StellarOperationMessage =
    | ({
          type: 'StellarCreateAccountOp',
      } & StellarCreateAccountOp)
    | ({
          type: 'StellarPaymentOp',
      } & StellarPaymentOp)
    | ({
          type: 'StellarPathPaymentStrictReceiveOp',
      } & StellarPathPaymentStrictReceiveOp)
    | ({
          type: 'StellarPathPaymentStrictSendOp',
      } & StellarPathPaymentStrictSendOp)
    | ({
          type: 'StellarManageSellOfferOp',
      } & StellarManageSellOfferOp)
    | ({
          type: 'StellarManageBuyOfferOp',
      } & StellarManageBuyOfferOp)
    | ({
          type: 'StellarCreatePassiveSellOfferOp',
      } & StellarCreatePassiveSellOfferOp)
    | ({
          type: 'StellarSetOptionsOp',
      } & StellarSetOptionsOp)
    | ({
          type: 'StellarChangeTrustOp',
      } & StellarChangeTrustOp)
    | ({
          type: 'StellarAllowTrustOp',
      } & StellarAllowTrustOp)
    | ({
          type: 'StellarAccountMergeOp',
      } & StellarAccountMergeOp)
    | ({
          type: 'StellarManageDataOp',
      } & StellarManageDataOp)
    | ({
          type: 'StellarBumpSequenceOp',
      } & StellarBumpSequenceOp);

export type StellarSignedTx = {
    publicKey: string,
    signature: string,
};

// get address

export type StellarGetAddress = {
    path: string | number[],
    address?: string,
    showOnTrezor?: boolean,
    useEventListener?: boolean, // set automatically if UI.ADDRESS_VALIDATION listener is used
};

export type StellarAddress = {
    address: string,
    path: number[],
    serializedPath: string,
};
