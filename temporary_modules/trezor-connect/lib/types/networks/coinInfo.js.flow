/* @flow */
type Network = {
    messagePrefix: string,
    bech32: ?string,
    bip32: {
        public: number,
        private: number,
    },
    pubKeyHash: number,
    scriptHash: number,
    wif: number,
    dustThreshold: number,
    coin: string,
    consensusBranchId?: { [key: string]: number },
};

type CoinSupport = {
    connect: boolean,
    trezor1: string,
    trezor2: string,
};

type BlockchainLink = {
    type: string,
    url: string[],
};

type BitcoinDefaultFees = { [level: 'High' | 'Normal' | 'Economy' | 'Low']: number };

type Common = {
    label: string, // Human readable format, label != name
    name: string, // Trezor readable format
    shortcut: string,
    slip44: number,
    support: CoinSupport,
    decimals: number,
    blockchainLink?: BlockchainLink,
    blocktime: number,
    minFee: number,
    maxFee: number,
};

export type BitcoinNetworkInfo = Common & {
    type: 'bitcoin',
    cashAddrPrefix?: string,
    curveName: string,
    dustLimit: number,
    forceBip143: boolean,
    forkid?: number,
    hashGenesisBlock: string,
    maxAddressLength: number,
    maxFeeSatoshiKb: number,
    minAddressLength: number,
    minFeeSatoshiKb: number,
    defaultFees: BitcoinDefaultFees,
    segwit: boolean,

    xPubMagic: number,
    xPubMagicSegwitNative?: number,
    xPubMagicSegwit?: number,

    // custom
    network: Network,
    isBitcoin: boolean,
    hasTimestamp: boolean,
    // used in backend
    blocks?: number,
};

export type EthereumNetworkInfo = Common & {
    type: 'ethereum',
    chain: string,
    chainId: number,
    rskip60: boolean,
    defaultFees: {
        label: 'high' | 'normal' | 'low',
        feePerUnit: string,
        feeLimit: string,
    }[],
    network: typeof undefined,
};

export type MiscNetworkInfo = Common & {
    type: 'misc' | 'nem',
    curve: string,
    defaultFees: BitcoinDefaultFees,
    network: typeof undefined,
};

export type CoinInfo = BitcoinNetworkInfo | EthereumNetworkInfo | MiscNetworkInfo;

export type GetCoinInfo = {
    coin: string,
};
