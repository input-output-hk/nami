const migration = {
  version: '2.3.2',
  up: async () => {},
  down: async () => {},
  info: [
    {
      title: 'Deregistration of stake keys',
    },
    {
      title: 'Improved Inputs',
      detail: 'Number inputs are automatically formatted now.',
    },
  ],
  pwdRequired: false,
};

export default migration;
