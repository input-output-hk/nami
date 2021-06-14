import { NODE, NETWORK_ID } from './config';

export default {
  api: {
    ipfs: 'https://ipfs.blockfrost.dev/ipfs',
    base: (node = NODE.mainnet) => node,
    key: (network = 'mainnet') => ({
      project_id:
        network === NETWORK_ID.mainnet
          ? '3Ojodngr06BReeSN9lhsow0hypKf8gu5'
          : 'rbkrp5hOr3khPAWNo3x47t6CP7qKFyA5',
    }),
    price: (currency = 'usd') =>
      fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=${currency}`
      )
        .then((res) => res.json())
        .then((res) => res.cardano[currency]),
  },
};
