import {
  enable,
  getAddress,
  getBalance,
  getCollateral,
  getNetworkId,
  getRewardAddress,
  getUtxos,
  isEnabled,
  on,
  signData,
  signTx,
  submitTx,
} from '../../api/webpage';
import { EVENT } from '../../config/config';

//dApp connector API follows https://github.com/cardano-foundation/CIPs/pull/88

//Initial version
window.cardano = {
  ...(window.cardano || {}),
  enable: () => enable(),
  isEnabled: () => isEnabled(),
  getBalance: () => getBalance(),
  signData: (address, payload) => signData(address, payload),
  signTx: (tx, partialSign) => signTx(tx, partialSign),
  submitTx: (tx) => submitTx(tx),
  getUtxos: (amount, paginate) => getUtxos(amount, paginate),
  getCollateral: () => getCollateral(),
  getUsedAddresses: async () => [await getAddress()],
  getUnusedAddresses: async () => [],
  getChangeAddress: () => getAddress(),
  getRewardAddress: () => getRewardAddress(),
  getNetworkId: () => getNetworkId(),
  onAccountChange: (callback) => on(EVENT.accountChange, callback),
  onNetworkChange: (callback) => on(EVENT.networkChange, callback),
  _events: {},
};

// const logDeprecated = () => {
//   console.warn(
//     'This Nami API implementation is deprecated soon. Please follow the API under the window.cardano.nami namespace. For more information check out CIP-30: https://github.com/cardano-foundation/CIPs/tree/master/CIP-0030'
//   );
//   return true;
// };

// // depecrated soon
// window.cardano = {
//   ...(window.cardano || {}),
//   enable: () => logDeprecated() && enable(),
//   isEnabled: () => logDeprecated() && isEnabled(),
//   getBalance: () => logDeprecated() && getBalance(),
//   signData: (address, payload) => logDeprecated() && signData(address, payload),
//   signTx: (tx, partialSign) => logDeprecated() && signTx(tx, partialSign),
//   submitTx: (tx) => logDeprecated() && submitTx(tx),
//   getUtxos: (amount, paginate) => logDeprecated() && getUtxos(amount, paginate),
//   getCollateral: () => logDeprecated() && getCollateral(),
//   getUsedAddresses: async () => logDeprecated() && [await getAddress()],
//   getUnusedAddresses: async () => logDeprecated() && [],
//   getChangeAddress: () => logDeprecated() && getAddress(),
//   getRewardAddress: () => logDeprecated() && getRewardAddress(),
//   getNetworkId: () => logDeprecated() && getNetworkId(),
//   onAccountChange: (callback) => logDeprecated() && onAccountChange(callback),
//   onNetworkChange: (callback) => logDeprecated() && onNetworkChange(callback),
// };

// // CIP-30

// window.cardano = {
//   ...(window.cardano || {}),
//   nami: {
//     enable: async () => {
//       if (await enable()) {
//         return {
//           getBalance: () => getBalance(),
//           signData: (address, payload) => signData(address, payload),
//           signTx: (tx, partialSign) => signTx(tx, partialSign),
//           submitTx: (tx) => submitTx(tx),
//           getUtxos: (amount, paginate) => getUtxos(amount, paginate),
//           getCollateral: () => getCollateral(),
//           getUsedAddresses: async () => [await getAddress()],
//           getUnusedAddresses: async () => [],
//           getChangeAddress: () => getAddress(),
//           getRewardAddresses: async () => [await getRewardAddress()],
//           getNetworkId: () => getNetworkId(),
//           onAccountChange: (callback) => onAccountChange(callback),
//           onNetworkChange: (callback) => onNetworkChange(callback),
//         };
//       }
//     },
//     isEnabled: () => isEnabled(),
//     apiVersion: '0.1.0',
//     name: 'Nami',
//     icon: 'https://raw.githubusercontent.com/Berry-Pool/nami-wallet/main/src/assets/img/logo.svg',
//   },
// };
