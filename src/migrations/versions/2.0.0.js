const migration = {
  version: '2.0.0',
  up: async () => {},
  down: async () => {},
  info: [
    {
      title: 'Added collateral',
      detail:
        'A new option "Collateral" was added to the menu. You can enable it in order to interact with smart contracts.',
    },
    {
      title: 'Bug fix: ADA input amount',
      detail:
        'Input box is highlighted in red correctly again, when amount is below minimum or above account balance.',
    },
    {
      title: 'Bug fix: Coin selection',
      detail: 'Fixed bug, where small amounts could not be sent.',
    },
  ],
  pwdRequired: false,
};

export default migration;
