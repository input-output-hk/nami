const migration = {
  version: '1.1.7',
  up: async () => {},
  down: async () => {},
  info: [
    {
      title: 'Bug fix: Inconsistent Balance',
      detail:
        'Balance was reported many times to be out of sync, even with the latest fix. The logic to decide whether an update is needed or not has been reworked.',
    },
    {
      title: 'Bug fix: Coin Selection',
      detail:
        'The Coin Selection algorithm failed calculating properly requirements for some UTxO set, thus making impossible to send amount within a certain range.',
    },
    {
      title: 'Bug fix: Blank Screen',
      detail:
        'A blank screen was reported a few times. The causing issue was being able to press the Confirm button multiple times.',
    },
  ],
  pwdRequired: false,
};

export default migration;
