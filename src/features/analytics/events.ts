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
}

export type Property =
  | string
  | boolean
  | Record<string, any>
  | Array<Record<string, any>>;
export type Properties = Record<string, Property>;
