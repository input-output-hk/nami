export default {
  api: {
    base: 'https://cardano-mainnet.blockfrost.io/api/v0',
    key: { project_id: '3Ojodngr06BReeSN9lhsow0hypKf8gu5' },
    price: (currency = 'usd') =>
      fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=${currency}`
      )
        .then((res) => res.json())
        .then((res) => res.cardano[currency]),
  },
};
