interface Paginate {
  page: number;
  limit: number;
}

interface Cardano {
  enable: () => Promise<boolean>;
  isEnabled: () => Promise<boolean>;
  getBalance: () => Promise<string>;
  signData: (aaddress: string, payload: string) => Promise<string>;
  signTx: (tx: string, partialSign?: boolean) => Promise<string>;
  submitTx: (tx: string) => string;
  getUtxos: (amount?: string, paginage?: Paginate) => Promise<string[]>;
  getCollateral: () => Promise<string>;
  getUsedAddresses: () => Promise<string[]>;
  getUnusedAddresses: () => Promise<string[]>;
  getChangeAddress: () => Promise<string>;
  getRewardAddress: () => Promise<string>;
  getNetworkId: () => Promise<number>;
  onAccountChange: (cb: (addresses: string[]) => void) => void;
  onNetworkChange: (cb: (network: number) => void) => void;
}

declare module "cardano" {
  export = cardano;
}
declare var cardano: Cardano;