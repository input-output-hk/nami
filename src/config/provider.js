import { NODE, NETWORK_ID } from './config';
import secrets from 'secrets';

export default {
  api: {
    ipfs: 'https://ipfs.blockfrost.dev/ipfs',
    base: (node = NODE.mainnet) => node,
    key: (network = 'mainnet') => ({
      project_id:
        network === NETWORK_ID.mainnet
          ? secrets.PROJECT_ID_MAINNET
          : secrets.PROJECT_ID_TESTNET,
    }),
    price: (currency = 'usd') =>
      fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=${currency}`
      )
        .then((res) => res.json())
        .then((res) => res.cardano[currency]),
  },
};
