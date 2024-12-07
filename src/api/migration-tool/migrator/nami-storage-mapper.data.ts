import * as Nami from './nami-storage.data';
import {
  Account,
  Collateral,
  HarwareWallet,
  Networks,
  State,
} from './migration-data.data';

const mapCollateral = (network: Nami.NetworkInfo): Collateral | undefined => {
  if (!network.collateral) return undefined;
  return {
    lovelace: network.collateral.lovelace!,
    tx: {
      hash: network.collateral.txHash!,
      index: network.collateral.txId!,
    },
  };
};

export const map = (namiState: Partial<Nami.State>): State => {
  if (namiState.encryptedKey === undefined || namiState.userId === undefined) {
    throw new Error('provided nami state is not correct');
  }
  const namiAccounts = Object.entries(namiState.accounts!);

  const accounts: Account[] = [];
  const hardwareWallets: HarwareWallet[] = [];

  while (namiAccounts.length > 0) {
    const [key, account] = namiAccounts.pop()!;

    const collaterals: Record<Networks, Collateral | undefined> = {
      mainnet: mapCollateral(account.mainnet),
      preview: mapCollateral(account.preview),
      preprod: mapCollateral(account.preprod),
    };

    const paymentAddresses: Record<Networks, string> = {
      mainnet: account.mainnet.paymentAddr,
      preview: account.preview.paymentAddr,
      preprod: account.preprod.paymentAddr,
    };

    if (key.startsWith('ledger') || key.startsWith('trezor')) {
      const [type, _, index] = key.split('-');
      hardwareWallets.push({
        index: parseInt(index),
        name: account.name,
        extendedAccountPublicKey: account.publicKey,
        collaterals,
        vendor: type === 'ledger' ? 'ledger' : 'trezor',
        paymentAddresses,
      });
    } else {
      accounts.push({
        index: parseInt(key),
        name: account.name,
        extendedAccountPublicKey: account.publicKey,
        collaterals,
        paymentAddresses,
      });
    }
  }

  accounts.sort((a, b) => a.index - b.index);
  hardwareWallets.sort((a, b) => a.index - b.index);

  return {
    encryptedPrivateKey: namiState.encryptedKey,
    accounts,
    hardwareWallets,
    dapps: namiState.whitelisted || [],
    currency: namiState.currency === 'usd' ? 'usd' : 'eur',
    analytics: {
      enabled: Boolean(namiState.analytics),
      userId: namiState.userId,
    },
    themeColor: namiState.themeColor || 'light',
  };
};
