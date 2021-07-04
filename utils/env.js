// tiny wrapper with default env vars
module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  //Blockfrost
  PROJECT_ID_MAINNET: process.env.PROJECT_ID_MAINNET,
  PROJECT_ID_TESTNET: process.env.PROJECT_ID_TESTNET,
};
