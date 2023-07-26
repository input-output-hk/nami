const migration = {
  version: '3.0.0',
  up: async () => {},
  down: async () => {},
  info: [
    {
      title: '$handle support',
      detail:
        '$handle address resolution is now supported under the send screen.',
    },
    {
      title: 'NFT as avatar',
      detail: 'You can now use your NFT/collectible as avatar in each account.',
    },
    {
      title: 'Wallet creation in separate tab',
      detail:
        'The wallet creation and importing section is now under a seperate tab.',
    },
  ],
  pwdRequired: false,
};

export default migration;
