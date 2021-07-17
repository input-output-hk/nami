import { getNetwork } from './extension';
import provider from '../config/provider';
import Loader from './loader';

export const blockfrostRequest = async (endpoint, headers, body) => {
  const network = await getNetwork();
  return await fetch(provider.api.base(network.node) + endpoint, {
    headers: {
      ...provider.api.key(network.id),
      ...headers,
      'User-Agent': 'nami-wallet',
    },
    method: body ? 'POST' : 'GET',
    body,
  }).then((res) => res.json());
};

export const currencyToSymbol = (currency) => {
  const currencyMap = { usd: '$', ada: '₳', eur: '€' };
  return currencyMap[currency];
};

export const hexToAscii = (hex) => {
  var _hex = hex.toString();
  var str = '';
  for (var i = 0; i < _hex.length && _hex.substr(i, 2) !== '00'; i += 2)
    str += String.fromCharCode(parseInt(_hex.substr(i, 2), 16));
  return str;
};

//returns the total amount of assets included in Value (excluding ADA)
export const valueLength = async (multiAssets) => {
  await Loader.load();
  if (!multiAssets) return 0;
  let count = 0;
  const policies = multiAssets.keys();
  for (let j = 0; j < multiAssets.len(); j++) {
    const policy = policies.get(j);
    const policyAssets = multiAssets.get(policy);
    const assetNames = policyAssets.keys();
    for (let k = 0; k < assetNames.len(); k++) {
      count++;
    }
  }
  return count;
};

/**
 * @typedef {Object} Amount - Unit/Quantity pair
 * @property {string} unit - Token Type
 * @property {int} quantity - Token Amount
 */

/**
 * @typedef {Amount[]} AmountList - List of unit/quantity pair
 */

/**
 * @typedef {Output[]} OutputList - List of Output
 */

/**
 * @typedef {Object} Output - Outputs Format
 * @property {string} address - Address Output
 * @property {AmountList} amount - Amount (lovelace & Native Token)
 */

/**
 * Compile all required output to a flat amount list
 * @param {OutputList} outputList - The set of outputs requested for payment.
 * @return {AmountList} - The compiled set of amounts requested for payment.
 */
export const compileOutputs = (outputList) => {
  let compiledAmountList = [];

  outputList.forEach((output) => addAmounts(output.amount, compiledAmountList));

  return compiledAmountList;
};

/**
 * Add up an AmountList values to an other AmountList
 * @param {AmountList} amountList - Set of amounts to be added.
 * @param {AmountList} compiledAmountList - The compiled set of amounts.
 */
function addAmounts(amountList, compiledAmountList) {
  amountList.forEach((amount) => {
    let entry = compiledAmountList.find(
      (compiledAmount) => compiledAmount.unit === amount.unit
    );

    // 'Add to' or 'insert' in compiledOutputList
    const am = JSON.parse(JSON.stringify(amount)); // Deep Copy
    entry
      ? (entry.quantity = (
          BigInt(entry.quantity) + BigInt(amount.quantity)
        ).toString())
      : compiledAmountList.push(am);
  });
}

export const linkToSrc = (link, base64 = false) => {
  const base64regex =
    /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  if (link.startsWith('https://')) return link;
  else if (link.startsWith('ipfs://'))
    return (
      provider.api.ipfs +
      '/' +
      link.split('ipfs://')[1].split('ipfs/').slice(-1)[0]
    );
  else if (link.startsWith('Qm') && link.length === 46) {
    return provider.api.ipfs + '/' + link;
  } else if (base64 && base64regex.test(link))
    return 'data:image/png;base64,' + link;
  return null;
};
