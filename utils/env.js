// tiny wrapper with default env vars
module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  //Blockfrost
  PROJECT_ID_MAINNET:
    process.env.PROJECT_ID_MAINNET || '3Ojodngr06BReeSN9lhsow0hypKf8gu5',
  PROJECT_ID_TESTNET:
    process.env.PROJECT_ID_TESTNET || 'rbkrp5hOr3khPAWNo3x47t6CP7qKFyA5',
};
