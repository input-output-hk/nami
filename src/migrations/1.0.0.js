const migration = {
  version: '1.0.0',
  up: (pwd) => {
    // Upgrade logic here
  },
  down: (pwd) => {
    // Downgrade logic here
  },
  info: [
    {
      title: 'Feature #1',
      detail: 'This new feature allow the user to see the Feature #1',
    },
    { title: 'Bug fix: Feature #2', detail: null },
    {
      title: 'Feature #3',
      detail: 'Allow to send feature #3 assets to multiple addresses',
    },
    { title: 'Feature #2', detail: null },
    {
      title: 'Feature #3 - Suspendisse eget nibh',
      detail:
        'Donec consectetur enim in urna consectetur fringilla rhoncus mattis quam.',
    },
  ],
  pwdRequired: true,
};

export default migration;
