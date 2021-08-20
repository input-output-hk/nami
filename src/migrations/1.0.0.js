const migration = {
  version: '1.1.2',
  up: () => {
    console.log('UP!!!');
  },
  down: () => {
    console.log('DOWN!!!');
  },
  info: [],
  decrypt: true,
};

export default migration;
