const migration = {
  version: '2.1.0',
  up: async () => {},
  down: async () => {},
  info: [
    {
      title: 'Bug fix: Collateral',
      detail:
        'Fixed issue with setting collateral amount, where user had to try it multiple times.',
    },
    {
      title: 'Enhancement: Mempool checking',
      detail:
        'Checking now if the mempool is full and letting the user know if he needs to resubmit the transaction.',
    },
    {
      title: 'Enhancement: Coin selection',
      detail: 'Allowing now to send a lot of small UTxOs.',
    },
    {
      title: 'Enhancement: Addresses',
      detail:
        'Preventing users from sending to a contract address. Improved checking, if the user interacts with a contract under the sign screen.',
    },
  ],
  pwdRequired: false,
};

export default migration;
