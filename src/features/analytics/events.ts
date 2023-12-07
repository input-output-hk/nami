export enum Events {
  PageView = '$pageview',

  // create wallet
  OnboardingCreateClick = 'onboarding | new wallet | create | click',
  OnboardingCreateWritePassphraseNextClick = 'onboarding | new wallet | write passphrase | next | click',
  OnboardingCreateEnterPassphraseNextClick = 'onboarding | new wallet | enter passphrase | next | click',
  OnboardingCreateEnterPassphraseSkipClick = 'onboarding | new wallet | enter passphrase | skip | click',
  OnboardingCreateWalletNamePasswordNextClick = 'onboarding | new wallet | wallet name & password | next | click',

  // import wallet
  OnboardingRestoreClick = 'onboarding | restore wallet | click',
  OnboardingRestoreEnterPassphraseNextClick = 'onboarding | restore wallet | enter passphrase | next | click',
  OnboardingRestoreWalletNamePasswordNextClick = 'onboarding | restore wallet | wallet name & password | next | click',

  // receive
  ReceiveClick = 'receive | receive | click',
  ReceiveCopyAddressIconClick = 'receive | receive | copy address icon | click',

  // send
  SendClick = 'send | send | click',
  SendTransactionDataReviewTransactionClick = 'send | transaction data | review transaction | click',
  SendTransactionConfirmationConfirmClick = 'send | transaction confirmation | confirm | click',
  SendTransactionConfirmed = 'send | transaction confirmed',

  // settings
  SettingsNetworkPreviewClick = 'settings | network | preview | click',
  SettingsNetworkPreprodClick = 'settings | network | preprod | click',
  SettingsNetworkMainnetClick = 'settings | network | mainnet | click',
  SettingsNetworkTestnetClick = 'settings | network | testnet | click',
  SettingsNetworkCustomNodeClick = 'settings | network | custom node | click',

  SettingsRemoveWalletClick = 'settings | remove wallet | click',
  SettingsHoldUpRemoveWalletClick = 'settings | hold up | remove wallet | click',
  SettingsHoldUpBackClick = 'settings | hold up | back | click',

  SettingsThemeLightModeClick = 'settings | theme | light mode | click',
  SettingsThemeDarkModeClick = 'settings | theme | dark mode | click',

  SettingsChangePasswordClick = 'settings | change password | click',
  SettingsChangePasswordConfirm = 'settings | change password | confirm',

  SettingsChangeAvatarClick = 'settings | change avatar | click',

  SettingsCollateralClick = 'settings | collateral | click',
  SettingsCollateralConfirmClick = 'settings | collateral | confirm | click',
  SettingsCollateralReclaimCollateralClick = 'settings | collateral | reclaim collateral | click',
  SettingsCollateralXClick = 'settings | collateral | x | click',

  SettingsTermsAndConditionsClick = 'settings | terms and conditions | click',
  SettingsTermsAndConditionsXClick = 'settings | terms and conditions | x | click',

  SettingsNewAccountClick = 'settings | new account | click',
  SettingsNewAccountConfirmClick = 'settings | new account | confirm | click',
  SettingsNewAccountXClick = 'settings | new account | x | click',

  SettingsAuthorizedDappsClick = 'settings | authorized dapps | click',
  SettingsAuthorizedDappsTrashBinIconClick = 'settings | authorized dapps | trash bin icon | click',

  // dapp
  DappConnectorAuthorizeDappAuthorizeClick = 'dapp connector | authorize dapp | authorize | click',
  DappConnectorAuthorizeDappCancelClick = 'dapp connector | authorize dapp | cancel | click',
  DappConnectorDappTxSignClick = 'dapp connector | tx | sign | click',
  DappConnectorDappTxConfirmClick = 'dapp connector | tx | confirm | click',
  DappConnectorDappTxCancelClick = 'dapp connector | tx | cancel | click',
  DappConnectorDappDataSignClick = 'dapp connector | data | sign | click',
  DappConnectorDappDataConfirmClick = 'dapp connector | data | confirm | click',
  DappConnectorDappDataCancelClick = 'dapp connector | data | cancel | click',

  // hw
  HWConnectClick = 'hardware wallet | connect | click',
  HWConnectNextClick = 'hardware wallet | connect hw | next | click',
  HWSelectAccountNextClick = 'hardware wallet | select hw account | next | click',
  HWDoneGoToWallet = 'onboarding | hardware wallet | all done | go to my wallet | click',

  // nfts
  NFTsClick = 'nft | nfts | click',
  NFTsImageClick = 'nft | nfts | nft image | click',

  // activity
  ActivityActivityClick = 'activity | activity | click',
  ActivityActivityActivityRowClick = 'activity | activity | activity row | click',
  ActivityActivityDetailTransactionHashClick = 'activity | activity detail | transaction hash | click',
}

export type Property =
  | string
  | boolean
  | Record<string, any>
  | Array<Record<string, any>>;
export type Properties = Record<string, Property>;
