export interface State {
  encryptedPrivateKey: string;
  accounts: Account[];
  hardwareWallets: HarwareWallet[];
  dapps: string[];
  currency: 'usd' | 'eur';
  analytics: Analytics;
  themeColor: string;
}

export interface Account {
  index: number;
  name: string;
  extendedAccountPublicKey: string;
  collaterals: Record<Networks, Collateral | undefined>;
  paymentAddresses: Record<Networks, string>;
}

export interface HarwareWallet extends Account {
  vendor: 'ledger' | 'trezor';
}

export interface Collateral {
  lovelace: string;
  tx: {
    hash: string;
    index: number;
  };
}

export type Networks = 'mainnet' | 'preview' | 'preprod';

export interface Analytics {
  enabled: boolean;
  userId: string;
}
