import { getNetwork } from './extension';
import provider from '../config/provider';
import Loader from './loader';
import { NETWORK_ID } from '../config/config';
import {
  BaseAddress,
  TransactionUnspentOutput,
  Value,
  MultiAsset,
} from '@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';
import AssetFingerprint from '@emurgo/cip14-js';

export const blockfrostRequest = async (endpoint, headers, body) => {
  const network = await getNetwork();

  return await new Promise(async (res, rej) => {
    const result = await fetch(provider.api.base(network.node) + endpoint, {
      headers: {
        ...provider.api.key(network.id),
        ...headers,
        'User-Agent': 'nami-wallet',
      },
      method: body ? 'POST' : 'GET',
      body,
    }).then((res) => res.json());
    // in case blockfrost throws error 500 => loop until result in 100ms interval
    if (result.status_code === 500) {
      const interval = setInterval(async () => {
        const result = await fetch(provider.api.base(network.node) + endpoint, {
          headers: {
            ...provider.api.key(network.id),
            ...headers,
            'User-Agent': 'nami-wallet',
          },
          method: body ? 'POST' : 'GET',
          body,
        }).then((res) => res.json());
        if (result.status_code !== 500) {
          clearInterval(interval);
          return res(result);
        }
      }, 100);
    } else {
      res(result);
    }
  });
};

/**
 *
 * @param {string} currency - eg. usd
 * @returns
 */
export const currencyToSymbol = (currency) => {
  const currencyMap = { usd: '$', ada: '₳', eur: '€' };
  return currencyMap[currency];
};

/**
 *
 * @param {string} hex
 * @returns
 */
export const hexToAscii = (hex) => {
  var _hex = hex.toString();
  var str = '';
  for (var i = 0; i < _hex.length && _hex.substr(i, 2) !== '00'; i += 2)
    str += String.fromCharCode(parseInt(_hex.substr(i, 2), 16));
  return str;
};

export const networkNameToId = (name) => {
  const names = { [NETWORK_ID.mainnet]: 1, [NETWORK_ID.testnet]: 0 };
  return names[name];
};

/**
 *
 * @param {MultiAsset} multiAsset
 * @returns
 */
export const multiAssetCount = async (multiAsset) => {
  await Loader.load();
  if (!multiAsset) return 0;
  let count = 0;
  const policies = multiAsset.keys();
  for (let j = 0; j < multiAsset.len(); j++) {
    const policy = policies.get(j);
    const policyAssets = multiAsset.get(policy);
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

/** Cardano metadata properties can hold a max of 64 bytes. The alternative is to use an array of strings. */
export const convertMetadataPropToString = (src) => {
  if (typeof src === 'string') return src;
  else if (Array.isArray(src)) return src.join('');
  return null;
};

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
  else if (
    (link.startsWith('Qm') && link.length === 46) ||
    (link.startsWith('baf') && link.length === 59)
  ) {
    return provider.api.ipfs + '/' + link;
  } else if (base64 && base64regex.test(link))
    return 'data:image/png;base64,' + link;
  else if (link.startsWith('data:image')) return link;
  return null;
};

/**
 *
 * @param {JSON} output
 * @param {BaseAddress} address
 * @returns
 */
export const utxoFromJson = async (output, address) => {
  await Loader.load();
  return Loader.Cardano.TransactionUnspentOutput.new(
    Loader.Cardano.TransactionInput.new(
      Loader.Cardano.TransactionHash.from_bytes(
        Buffer.from(output.tx_hash || output.txHash, 'hex')
      ),
      output.output_index || output.txId
    ),
    Loader.Cardano.TransactionOutput.new(
      Loader.Cardano.Address.from_bytes(Buffer.from(address, 'hex')),
      await assetsToValue(output.amount)
    )
  );
};

/**
 *
 * @param {TransactionUnspentOutput[]} utxos
 * @returns
 */
export const sumUtxos = async (utxos) => {
  await Loader.load();
  let value = Loader.Cardano.Value.new(Loader.Cardano.BigNum.from_str('0'));
  utxos.forEach((utxo) => (value = value.checked_add(utxo.output().amount())));
  return value;
};

/**
 *
 *
 *
 * @param {TransactionUnspentOutput} utxo
 * @returns
 */
export const utxoToJson = async (utxo) => {
  await Loader.load();
  const assets = await valueToAssets(utxo.output().amount());
  return {
    txHash: Buffer.from(
      utxo.input().transaction_id().to_bytes(),
      'hex'
    ).toString('hex'),
    txId: utxo.input().index(),
    amount: assets,
  };
};

export const assetsToValue = async (assets) => {
  await Loader.load();
  const multiAsset = Loader.Cardano.MultiAsset.new();
  const lovelace = assets.find((asset) => asset.unit === 'lovelace');
  const policies = [
    ...new Set(
      assets
        .filter((asset) => asset.unit !== 'lovelace')
        .map((asset) => asset.unit.slice(0, 56))
    ),
  ];
  policies.forEach((policy) => {
    const policyAssets = assets.filter(
      (asset) => asset.unit.slice(0, 56) === policy
    );
    const assetsValue = Loader.Cardano.Assets.new();
    policyAssets.forEach((asset) => {
      assetsValue.insert(
        Loader.Cardano.AssetName.new(Buffer.from(asset.unit.slice(56), 'hex')),
        Loader.Cardano.BigNum.from_str(asset.quantity)
      );
    });
    multiAsset.insert(
      Loader.Cardano.ScriptHash.from_bytes(Buffer.from(policy, 'hex')),
      assetsValue
    );
  });
  const value = Loader.Cardano.Value.new(
    Loader.Cardano.BigNum.from_str(lovelace ? lovelace.quantity : '0')
  );
  if (assets.length > 1 || !lovelace) value.set_multiasset(multiAsset);
  return value;
};

/**
 *
 * @param {Value} value
 */
export const valueToAssets = async (value) => {
  await Loader.load();
  const assets = [];
  assets.push({ unit: 'lovelace', quantity: value.coin().to_str() });
  if (value.multiasset()) {
    const multiAssets = value.multiasset().keys();
    for (let j = 0; j < multiAssets.len(); j++) {
      const policy = multiAssets.get(j);
      const policyAssets = value.multiasset().get(policy);
      const assetNames = policyAssets.keys();
      for (let k = 0; k < assetNames.len(); k++) {
        const policyAsset = assetNames.get(k);
        const quantity = policyAssets.get(policyAsset);
        const asset =
          Buffer.from(policy.to_bytes(), 'hex').toString('hex') +
          Buffer.from(policyAsset.name(), 'hex').toString('hex');
        const _policy = asset.slice(0, 56);
        const _name = asset.slice(56);
        const fingerprint = new AssetFingerprint(
          Buffer.from(_policy, 'hex'),
          Buffer.from(_name, 'hex')
        ).fingerprint();
        assets.push({
          unit: asset,
          quantity: quantity.to_str(),
          policy: _policy,
          name: hexToAscii(_name),
          fingerprint,
        });
      }
    }
  }
  return assets;
};

export const minAdaRequired = async (value, utxoVal) => {
  await Loader.load();
  return Loader.Cardano.min_ada_required(value, utxoVal).to_str();
};
