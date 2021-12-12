/* @flow */

// Cardano method parameters types
import type {
    HDNodeType,
    CardanoAddressType,
    CardanoCertificateType,
    CardanoNativeScriptType,
    CardanoNativeScriptHashDisplayFormat,
    CardanoPoolRelayType,
    CardanoTxAuxiliaryDataSupplementType,
    CardanoTxSigningMode,
    CardanoTxWitnessType,
    CardanoDerivationType,
} from '../trezor/protobuf';

// GetPublicKey

export type CardanoGetPublicKey = {
    path: string | number[],
    showOnTrezor?: boolean,
    derivationType?: CardanoDerivationType,
};

export type CardanoPublicKey = {
    path: number[],
    serializedPath: string,
    publicKey: string,
    node: HDNodeType,
};

// GetAddress
export type CardanoCertificatePointer = {
    blockIndex: number,
    txIndex: number,
    certificateIndex: number,
};

export type CardanoAddressParameters = {
    addressType: CardanoAddressType,
    path?: string | number[],
    stakingPath?: string | number[],
    stakingKeyHash?: string,
    certificatePointer?: CardanoCertificatePointer,
    paymentScriptHash?: string,
    stakingScriptHash?: string,
};

export type CardanoGetAddress = {
    addressParameters: CardanoAddressParameters,
    protocolMagic: number,
    networkId: number,
    address?: string,
    showOnTrezor?: boolean,
    derivationType?: CardanoDerivationType,
};

export type CardanoAddress = {
    addressParameters: CardanoAddressParameters,
    protocolMagic: number,
    networkId: number,
    serializedPath: string,
    serializedStakingPath: string,
    address: string,
};

// GetNativeScriptHash

export type CardanoNativeScript = {
    type: CardanoNativeScriptType,
    scripts?: CardanoNativeScript[],
    keyHash?: string,
    keyPath?: string | number[],
    requiredSignaturesCount?: number,
    invalidBefore?: string,
    invalidHereafter?: string,
};

export type CardanoGetNativeScriptHash = {
    script: CardanoNativeScript,
    displayFormat: CardanoNativeScriptHashDisplayFormat,
    derivationType?: CardanoDerivationType,
};

export type CardanoNativeScriptHash = {
    scriptHash: string,
};

// Sign transaction

export type CardanoInput = {
    path?: string | number[],
    prev_hash: string,
    prev_index: number,
};

export type CardanoToken = {
    assetNameBytes: string,
    amount?: string,
    mintAmount?: string,
};

export type CardanoAssetGroup = {
    policyId: string,
    tokenAmounts: CardanoToken[],
};

export type CardanoOutput =
    | {
          addressParameters: CardanoAddressParameters,
          amount: string,
          tokenBundle?: CardanoAssetGroup[],
      }
    | {
          address: string,
          amount: string,
          tokenBundle?: CardanoAssetGroup[],
      };

export type CardanoPoolOwner = {
    stakingKeyPath?: string | number[],
    stakingKeyHash?: string,
};

export type CardanoPoolRelay = {
    type: CardanoPoolRelayType,
    ipv4Address?: string,
    ipv6Address?: string,
    port?: number,
    hostName?: string,
};

export type CardanoPoolMetadata = {
    url: string,
    hash: string,
};

export type CardanoPoolMargin = {
    numerator: string,
    denominator: string,
};

export type CardanoPoolParameters = {
    poolId: string,
    vrfKeyHash: string,
    pledge: string,
    cost: string,
    margin: CardanoPoolMargin,
    rewardAccount: string,
    owners: CardanoPoolOwner[],
    relays: CardanoPoolRelay[],
    metadata: CardanoPoolMetadata,
};

export type CardanoCertificate = {
    type: CardanoCertificateType,
    path?: string | number[],
    pool?: string,
    poolParameters?: CardanoPoolParameters,
    scriptHash?: string,
};

export type CardanoWithdrawal = {
    path?: string | number[],
    amount: string,
    scriptHash?: string,
};

export type CardanoMint = CardanoAssetGroup[];

export type CardanoCatalystRegistrationParameters = {
    votingPublicKey: string,
    stakingPath: string | number[],
    rewardAddressParameters: CardanoAddressParameters,
    nonce: string,
};

export type CardanoAuxiliaryData = {
    hash?: string,
    catalystRegistrationParameters?: CardanoCatalystRegistrationParameters,
};

export type CardanoSignTransaction = {
    inputs: CardanoInput[],
    outputs: CardanoOutput[],
    fee: string,
    ttl?: string,
    certificates?: CardanoCertificate[],
    withdrawals?: CardanoWithdrawal[],
    validityIntervalStart?: string,
    auxiliaryData?: CardanoAuxiliaryData,
    mint?: CardanoMint,
    additionalWitnessRequests?: (string | number[])[],
    protocolMagic: number,
    networkId: number,
    signingMode: CardanoTxSigningMode,
    derivationType?: CardanoDerivationType,
};

export type CardanoSignedTxWitness = {
    type: CardanoTxWitnessType,
    pubKey: string,
    signature: string,
    chainCode?: string,
};

export type CardanoAuxiliaryDataSupplement = {
    type: CardanoTxAuxiliaryDataSupplementType,
    auxiliaryDataHash: string,
    catalystSignature?: string,
};

export type CardanoSignedTxData = {
    hash: string,
    witnesses: CardanoSignedTxWitness[],
    auxiliaryDataSupplement?: CardanoAuxiliaryDataSupplement,
};

export {
    Enum_CardanoAddressType as CardanoAddressType,
    Enum_CardanoCertificateType as CardanoCertificateType,
    Enum_CardanoNativeScriptType as CardanoNativeScriptType,
    Enum_CardanoNativeScriptHashDisplayFormat as CardanoNativeScriptHashDisplayFormat,
    Enum_CardanoPoolRelayType as CardanoPoolRelayType,
    Enum_CardanoTxSigningMode as CardanoTxSigningMode,
    Enum_CardanoTxWitnessType as CardanoTxWitnessType,
} from '../trezor/protobuf';
