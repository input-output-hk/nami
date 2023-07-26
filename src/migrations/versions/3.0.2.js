const migration = {
  version: '3.0.2',
  up: async () => {},
  down: async () => {},
  info: [
    {
      title: 'Sending screen reworked',
      detail:
        'Little UX and layout redesign. There is now a confirmation screen when clicking on send. An optional message can also be appended now to the transaction (CIP-0020).',
    },
    {
      title: 'Milkomeda support',
      detail:
        'Assets can now be moved to the Milkomeda sidechain. This functionality is available under the send screen (only testnet for now).',
    },
    {
      title: 'ADA as asset',
      detail: 'ADA is shown now under assets on the main screen.',
    },
  ],
  pwdRequired: false,
};

export default migration;
