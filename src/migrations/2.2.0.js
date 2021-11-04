const migration = {
  version: '2.2.0',
  up: async () => {},
  down: async () => {},
  info: [
    {
      title: 'HW support',
      detail:
        'Nami has now full hardware wallet support for Ledger and Trezor.',
    },
  ],
  pwdRequired: false,
};

export default migration;
