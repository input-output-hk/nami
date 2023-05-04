import { getNetwork } from './extension';
import provider from '../config/provider';
import Loader from './loader';
import { NETWORK_ID } from '../config/config';
import {
  BaseAddress,
  TransactionUnspentOutput,
  Value,
  MultiAsset,
  Transaction,
} from '../../temporary_modules/@emurgo/cardano-message-signing-browser';
import AssetFingerprint from '@emurgo/cip14-js';
import {
  AddressType,
  CertificateType,
  DatumType,
  HARDENED,
  PoolKeyType,
  PoolOwnerType,
  PoolRewardAccountType,
  RelayType,
  StakeCredentialParamsType,
  TransactionSigningMode,
  TxAuxiliaryDataType,
  TxOutputDestinationType,
  TxOutputFormat,
  TxRequiredSignerType,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import {
  CardanoAddressType,
  CardanoCertificateType,
  CardanoPoolRelayType,
  CardanoTxSigningMode,
} from '../../temporary_modules/trezor-connect/';
import crc8 from 'crc/calculators/crc8';

export async function delay(delayInMs) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delayInMs);
  });
}

export async function blockfrostRequest(endpoint, headers, body, signal) {
  const network = await getNetwork();
  let result;

  while (!result || result.status_code === 500) {
    if (result) {
      await delay(100);
    }
    const rawResult = await fetch(provider.api.base(network.node) + endpoint, {
      headers: {
        ...provider.api.key(network.name || network.id),
        ...provider.api.header,
        ...headers,
        'Cache-Control': 'no-cache',
      },
      method: body ? 'POST' : 'GET',
      body,
      signal,
    });
    result = await rawResult.json();
  }

  return result;
}

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
export const hexToAscii = (hex) => Buffer.from(hex, 'hex').toString();

export const networkNameToId = (name) => {
  const names = {
    [NETWORK_ID.mainnet]: 1,
    [NETWORK_ID.testnet]: 0,
    [NETWORK_ID.preview]: 0,
    [NETWORK_ID.preprod]: 0,
  };
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
      Loader.Cardano.BigNum.from_str(
        (output.output_index ?? output.txId).toString()
      )
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
  // if (value.coin().to_str() == '0') return [];
  return assets;
};

export const minAdaRequired = async (output, coinsPerUtxoWord) => {
  await Loader.load();
  return Loader.Cardano.min_ada_required(output, coinsPerUtxoWord).to_str();
};

const outputsToTrezor = (outputs, address, index) => {
  const trezorOutputs = [];
  for (let i = 0; i < outputs.len(); i++) {
    const output = outputs.get(i);
    const multiAsset = output.amount().multiasset();
    let tokenBundle = null;
    if (multiAsset) {
      tokenBundle = [];
      for (let j = 0; j < multiAsset.keys().len(); j++) {
        const policy = multiAsset.keys().get(j);
        const assets = multiAsset.get(policy);
        const tokens = [];
        for (let k = 0; k < assets.keys().len(); k++) {
          const assetName = assets.keys().get(k);
          const amount = assets.get(assetName).to_str();
          tokens.push({
            assetNameBytes: Buffer.from(assetName.name()).toString('hex'),
            amount,
          });
        }
        // sort canonical
        tokens.sort((a, b) => {
          if (a.assetNameBytes.length == b.assetNameBytes.length) {
            return a.assetNameBytes > b.assetNameBytes ? 1 : -1;
          } else if (a.assetNameBytes.length > b.assetNameBytes.length)
            return 1;
          else return -1;
        });
        tokenBundle.push({
          policyId: Buffer.from(policy.to_bytes()).toString('hex'),
          tokenAmounts: tokens,
        });
      }
    }
    const outputAddress = Buffer.from(output.address().to_bytes()).toString(
      'hex'
    );

    const outputAddressHuman = (() => {
      try {
        return Loader.Cardano.BaseAddress.from_address(output.address())
          .to_address()
          .to_bech32();
      } catch (e) {}
      try {
        return Loader.Cardano.EnterpriseAddress.from_address(output.address())
          .to_address()
          .to_bech32();
      } catch (e) {}
      try {
        return Loader.Cardano.PointerAddress.from_address(output.address())
          .to_address()
          .to_bech32();
      } catch (e) {}
      return Loader.Cardano.ByronAddress.from_address(
        output.address()
      ).to_base58();
    })();

    const destination =
      outputAddress == address
        ? {
            addressParameters: {
              addressType: CardanoAddressType.BASE,
              path: `m/1852'/1815'/${index}'/0/0`,
              stakingPath: `m/1852'/1815'/${index}'/2/0`,
            },
          }
        : {
            address: outputAddressHuman,
          };
    const datumHash =
      output.datum() && output.datum().kind() === 0
        ? Buffer.from(output.datum().as_data_hash().to_bytes()).toString('hex')
        : null;
    const inlineDatum =
      output.datum() && output.datum().kind() === 1
        ? Buffer.from(output.datum().as_data().get().to_bytes()).toString('hex')
        : null;
    const referenceScript = output.script_ref()
      ? Buffer.from(output.script_ref().get().to_bytes()).toString('hex')
      : null;
    const outputRes = {
      amount: output.amount().coin().to_str(),
      tokenBundle,
      datumHash,
      format: output.format(),
      inlineDatum,
      referenceScript,
      ...destination,
    };
    if (!tokenBundle) delete outputRes.tokenBundle;
    if (!datumHash) delete outputRes.datumHash;
    if (!inlineDatum) delete outputRes.inlineDatum;
    if (!referenceScript) delete outputRes.referenceScript;
    trezorOutputs.push(outputRes);
  }
  return trezorOutputs;
};

/**
 *
 * @param {Transaction} tx
 */
export const txToTrezor = async (tx, network, keys, address, index) => {
  await Loader.load();

  let signingMode = CardanoTxSigningMode.ORDINARY_TRANSACTION;
  const inputs = tx.body().inputs();
  const trezorInputs = [];
  for (let i = 0; i < inputs.len(); i++) {
    const input = inputs.get(i);
    trezorInputs.push({
      prev_hash: Buffer.from(input.transaction_id().to_bytes()).toString('hex'),
      prev_index: parseInt(input.index().to_str()),
      path: keys.payment.path, // needed to include payment key witness if available
    });
  }

  const outputs = tx.body().outputs();
  const trezorOutputs = outputsToTrezor(outputs, address, index);

  let trezorCertificates = null;
  const certificates = tx.body().certs();
  if (certificates) {
    trezorCertificates = [];
    for (let i = 0; i < certificates.len(); i++) {
      const cert = certificates.get(i);
      const certificate = {};
      if (cert.kind() === 0) {
        const credential = cert.as_stake_registration().stake_credential();
        certificate.type = CardanoCertificateType.STAKE_REGISTRATION;
        if (credential.kind() === 0) {
          certificate.path = keys.stake.path;
        } else {
          const scriptHash = Buffer.from(
            credential.to_scripthash().to_bytes()
          ).toString('hex');
          certificate.scriptHash = scriptHash;
        }
      } else if (cert.kind() === 1) {
        const credential = cert.as_stake_deregistration().stake_credential();
        certificate.type = CardanoCertificateType.STAKE_DEREGISTRATION;
        if (credential.kind() === 0) {
          certificate.path = keys.stake.path;
        } else {
          const scriptHash = Buffer.from(
            credential.to_scripthash().to_bytes()
          ).toString('hex');
          certificate.scriptHash = scriptHash;
        }
      } else if (cert.kind() === 2) {
        const delegation = cert.as_stake_delegation();
        const credential = delegation.stake_credential();
        const poolKeyHashHex = Buffer.from(
          delegation.pool_keyhash().to_bytes()
        ).toString('hex');
        certificate.type = CardanoCertificateType.STAKE_DELEGATION;
        if (credential.kind() === 0) {
          certificate.path = keys.stake.path;
        } else {
          const scriptHash = Buffer.from(
            credential.to_scripthash().to_bytes()
          ).toString('hex');
          certificate.scriptHash = scriptHash;
        }
        certificate.pool = poolKeyHashHex;
      } else if (cert.kind() === 3) {
        const params = cert.as_pool_registration().pool_params();
        certificate.type = CardanoCertificateType.STAKE_POOL_REGISTRATION;
        const owners = params.pool_owners();
        const poolOwners = [];
        for (let i = 0; i < owners.len(); i++) {
          const keyHash = Buffer.from(owners.get(i).to_bytes()).toString('hex');
          if (keyHash == keys.stake.hash) {
            signingMode = CardanoTxSigningMode.POOL_REGISTRATION_AS_OWNER;
            poolOwners.push({
              stakingKeyPath: keys.stake.path,
            });
          } else {
            poolOwners.push({
              stakingKeyHash: keyHash,
            });
          }
        }
        const relays = params.relays();
        const trezorRelays = [];
        for (let i = 0; i < relays.len(); i++) {
          const relay = relays.get(i);
          if (relay.kind() === 0) {
            const singleHostAddr = relay.as_single_host_addr();
            const type = CardanoPoolRelayType.SINGLE_HOST_IP;
            const port = singleHostAddr.port();
            const ipv4Address = singleHostAddr.ipv4()
              ? bytesToIp(singleHostAddr.ipv4().ip())
              : null;
            const ipv6Address = singleHostAddr.ipv6()
              ? bytesToIp(singleHostAddr.ipv6().ip())
              : null;
            trezorRelays.push({ type, port, ipv4Address, ipv6Address });
          } else if (relay.kind() === 1) {
            const type = CardanoPoolRelayType.SINGLE_HOST_NAME;
            const singleHostName = relay.as_single_host_name();
            const port = singleHostName.port();
            const hostName = singleHostName.dns_name().record();
            trezorRelays.push({
              type,
              port,
              hostName,
            });
          } else if (relay.kind() === 2) {
            const type = CardanoPoolRelayType.MULTIPLE_HOST_NAME;
            const multiHostName = relay.as_multi_host_name();
            const hostName = multiHostName.dns_name();
            trezorRelays.push({
              type,
              hostName,
            });
          }
        }
        const cost = params.cost().to_str();
        const margin = params.margin();
        const pledge = params.pledge().to_str();
        const poolId = Buffer.from(params.operator().to_bytes()).toString(
          'hex'
        );
        const metadata = params.pool_metadata()
          ? {
              url: params.pool_metadata().url().url(),
              hash: Buffer.from(
                params.pool_metadata().pool_metadata_hash().to_bytes()
              ).toString('hex'),
            }
          : null;
        const rewardAccount = params.reward_account().to_address().to_bech32();
        const vrfKeyHash = Buffer.from(
          params.vrf_keyhash().to_bytes()
        ).toString('hex');

        certificate.poolParameters = {
          poolId,
          vrfKeyHash,
          pledge,
          cost,
          margin: {
            numerator: margin.numerator().to_str(),
            denominator: margin.denominator().to_str(),
          },
          rewardAccount,
          owners: poolOwners,
          relays: trezorRelays,
          metadata,
        };
      }
      trezorCertificates.push(certificate);
    }
  }
  const fee = tx.body().fee().to_str();
  const ttl = tx.body().ttl();
  const withdrawals = tx.body().withdrawals();
  let trezorWithdrawals = null;
  if (withdrawals) {
    trezorWithdrawals = [];
    for (let i = 0; i < withdrawals.keys().len(); i++) {
      const withdrawal = {};
      const rewardAddress = withdrawals.keys().get(i);
      if (rewardAddress.payment_cred().kind() === 0) {
        withdrawal.path = keys.stake.path;
      } else {
        withdrawal.scriptHash = Buffer.from(
          rewardAddress.payment_cred().to_scripthash().to_bytes()
        ).toString('hex');
      }
      withdrawal.amount = withdrawals.get(rewardAddress).to_str();
      trezorWithdrawals.push(withdrawal);
    }
  }
  const auxiliaryData = tx.body().auxiliary_data_hash()
    ? {
        hash: Buffer.from(tx.body().auxiliary_data_hash().to_bytes()).toString(
          'hex'
        ),
      }
    : null;
  const validityIntervalStart = tx.body().validity_start_interval()
    ? tx.body().validity_start_interval().to_str()
    : null;

  const mint = tx.body().mint();
  let additionalWitnessRequests = null;
  let mintBundle = null;
  if (mint) {
    mintBundle = [];
    for (let j = 0; j < mint.keys().len(); j++) {
      const policy = mint.keys().get(j);
      const assets = mint.get(policy);
      const tokens = [];
      for (let k = 0; k < assets.keys().len(); k++) {
        const assetName = assets.keys().get(k);
        const amount = assets.get(assetName);
        tokens.push({
          assetNameBytes: Buffer.from(assetName.name()).toString('hex'),
          mintAmount: amount.is_positive()
            ? amount.as_positive().to_str()
            : '-' + amount.as_negative().to_str(),
        });
      }
      // sort canonical
      tokens.sort((a, b) => {
        if (a.assetNameBytes.length == b.assetNameBytes.length) {
          return a.assetNameBytes > b.assetNameBytes ? 1 : -1;
        } else if (a.assetNameBytes.length > b.assetNameBytes.length) return 1;
        else return -1;
      });
      mintBundle.push({
        policyId: Buffer.from(policy.to_bytes()).toString('hex'),
        tokenAmounts: tokens,
      });
    }
    additionalWitnessRequests = [];
    if (keys.payment.path) additionalWitnessRequests.push(keys.payment.path);
    if (keys.stake.path) additionalWitnessRequests.push(keys.stake.path);
  }

  // Plutus
  const scriptDataHash = tx.body().script_data_hash()
    ? Buffer.from(tx.body().script_data_hash().to_bytes()).toString('hex')
    : null;

  let collateralInputs = null;
  if (tx.body().collateral()) {
    collateralInputs = [];
    const coll = tx.body().collateral();
    for (let i = 0; i < coll.len(); i++) {
      const input = coll.get(i);
      if (keys.payment.path) {
        collateralInputs.push({
          prev_hash: Buffer.from(input.transaction_id().to_bytes()).toString(
            'hex'
          ),
          prev_index: parseInt(input.index().to_str()),
          path: keys.payment.path, // needed to include payment key witness if available
        });
      } else {
        collateralInputs.push({
          prev_hash: Buffer.from(input.transaction_id().to_bytes()).toString(
            'hex'
          ),
          prev_index: parseInt(input.index().to_str()),
        });
      }
      signingMode = CardanoTxSigningMode.PLUTUS_TRANSACTION;
    }
  }

  let requiredSigners = null;
  if (tx.body().required_signers()) {
    requiredSigners = [];
    const r = tx.body().required_signers();
    for (let i = 0; i < r.len(); i++) {
      const signer = Buffer.from(r.get(i).to_bytes()).toString('hex');
      if (signer === keys.payment.hash) {
        requiredSigners.push({
          keyPath: keys.payment.path,
        });
      } else if (signer === keys.stake.hash) {
        requiredSigners.push({
          keyPath: keys.stake.path,
        });
      } else {
        requiredSigners.push({
          keyHash: signer,
        });
      }
    }
    signingMode = CardanoTxSigningMode.PLUTUS_TRANSACTION;
  }

  let referenceInputs = null;
  if (tx.body().reference_inputs()) {
    referenceInputs = [];
    const ri = tx.body().reference_inputs();
    for (let i = 0; i < ri.len(); i++) {
      referenceInputs.push({
        prev_hash: ri.get(i).transaction_id().to_hex(),
        prev_index: parseInt(ri.get(i).index().to_str()),
      });
    }
    signingMode = CardanoTxSigningMode.PLUTUS_TRANSACTION;
  }

  const totalCollateral = tx.body().total_collateral()
    ? tx.body().total_collateral().to_str()
    : null;

  let collateralReturn = (() => {
    if (tx.body().collateral_return()) {
      const outputs = Loader.Cardano.TransactionOutputs.new();
      outputs.add(tx.body().collateral_return());
      const [out] = outputsToTrezor(outputs, address, index);
      return out;
    }
    return null;
  })();

  const includeNetworkId = !!tx.body().network_id();

  const trezorTx = {
    signingMode,
    inputs: trezorInputs,
    outputs: trezorOutputs,
    fee,
    ttl: ttl ? ttl.to_str() : null,
    validityIntervalStart,
    certificates: trezorCertificates,
    withdrawals: trezorWithdrawals,
    auxiliaryData,
    mint: mintBundle,
    scriptDataHash,
    collateralInputs,
    requiredSigners,
    protocolMagic: network === 1 ? 764824073 : 42,
    networkId: network,
    includeNetworkId,
    additionalWitnessRequests,
    collateralReturn,
    totalCollateral,
    referenceInputs,
  };
  Object.keys(trezorTx).forEach(
    (key) => !trezorTx[key] && trezorTx[key] != 0 && delete trezorTx[key]
  );
  return trezorTx;
};

const outputsToLedger = (outputs, address, index) => {
  const ledgerOutputs = [];
  for (let i = 0; i < outputs.len(); i++) {
    const output = outputs.get(i);
    const multiAsset = output.amount().multiasset();
    let tokenBundle = null;
    if (multiAsset) {
      tokenBundle = [];
      for (let j = 0; j < multiAsset.keys().len(); j++) {
        const policy = multiAsset.keys().get(j);
        const assets = multiAsset.get(policy);
        const tokens = [];
        for (let k = 0; k < assets.keys().len(); k++) {
          const assetName = assets.keys().get(k);
          const amount = assets.get(assetName).to_str();
          tokens.push({
            assetNameHex: Buffer.from(assetName.name()).toString('hex'),
            amount,
          });
        }
        // sort canonical
        tokens.sort((a, b) => {
          if (a.assetNameHex.length == b.assetNameHex.length) {
            return a.assetNameHex > b.assetNameHex ? 1 : -1;
          } else if (a.assetNameHex.length > b.assetNameHex.length) return 1;
          else return -1;
        });
        tokenBundle.push({
          policyIdHex: Buffer.from(policy.to_bytes()).toString('hex'),
          tokens,
        });
      }
    }

    const outputAddress = Buffer.from(output.address().to_bytes()).toString(
      'hex'
    );
    const destination =
      outputAddress == address
        ? {
            type: TxOutputDestinationType.DEVICE_OWNED,
            params: {
              type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
              params: {
                spendingPath: [
                  HARDENED + 1852,
                  HARDENED + 1815,
                  HARDENED + index,
                  0,
                  0,
                ],
                stakingPath: [
                  HARDENED + 1852,
                  HARDENED + 1815,
                  HARDENED + index,
                  2,
                  0,
                ],
              },
            },
          }
        : {
            type: TxOutputDestinationType.THIRD_PARTY,
            params: {
              addressHex: outputAddress,
            },
          };
    const datum = output.datum();
    const refScript = output.script_ref();
    const isBabbage = output.format();
    const outputRes = isBabbage
      ? {
          format: TxOutputFormat.MAP_BABBAGE,
          amount: output.amount().coin().to_str(),
          tokenBundle,
          destination,
          datum: datum
            ? datum.kind() === 0
              ? {
                  type: DatumType.HASH,
                  datumHashHex: Buffer.from(
                    datum.as_data_hash().to_bytes()
                  ).toString('hex'),
                }
              : {
                  type: DatumType.INLINE,
                  datumHex: Buffer.from(
                    datum.as_data().get().to_bytes()
                  ).toString('hex'),
                }
            : null,
          referenceScriptHex: refScript
            ? Buffer.from(refScript.get().to_bytes()).toString('hex')
            : null,
        }
      : {
          format: TxOutputFormat.ARRAY_LEGACY,
          amount: output.amount().coin().to_str(),
          tokenBundle,
          destination,
          datumHashHex:
            datum && datum.kind() === 0
              ? Buffer.from(datum.as_data_hash().to_bytes()).toString('hex')
              : null,
        };
    Object.keys(outputRes).forEach((key) => {
      if (!outputRes[key]) delete outputRes[key];
    });
    ledgerOutputs.push(outputRes);
  }
  return ledgerOutputs;
};

/**
 *
 * @param {Transaction} tx
 */
export const txToLedger = async (tx, network, keys, address, index) => {
  await Loader.load();

  let signingMode = TransactionSigningMode.ORDINARY_TRANSACTION;
  const inputs = tx.body().inputs();
  const ledgerInputs = [];
  for (let i = 0; i < inputs.len(); i++) {
    const input = inputs.get(i);
    ledgerInputs.push({
      txHashHex: Buffer.from(input.transaction_id().to_bytes()).toString('hex'),
      outputIndex: parseInt(input.index().to_str()),
      path: keys.payment.path, // needed to include payment key witness if available
    });
  }

  const ledgerOutputs = outputsToLedger(tx.body().outputs(), address, index);

  let ledgerCertificates = null;
  const certificates = tx.body().certs();
  if (certificates) {
    ledgerCertificates = [];
    for (let i = 0; i < certificates.len(); i++) {
      const cert = certificates.get(i);
      const certificate = {};
      if (cert.kind() === 0) {
        const credential = cert.as_stake_registration().stake_credential();
        certificate.type = CertificateType.STAKE_REGISTRATION;
        if (credential.kind() === 0) {
          certificate.params = {
            stakeCredential: {
              type: StakeCredentialParamsType.KEY_PATH,
              keyPath: keys.stake.path,
            },
          };
        } else {
          const scriptHash = Buffer.from(
            credential.to_scripthash().to_bytes()
          ).toString('hex');
          certificate.params = {
            stakeCredential: {
              type: StakeCredentialParamsType.SCRIPT_HASH,
              scriptHash,
            },
          };
        }
      } else if (cert.kind() === 1) {
        const credential = cert.as_stake_deregistration().stake_credential();
        certificate.type = CertificateType.STAKE_DEREGISTRATION;
        if (credential.kind() === 0) {
          certificate.params = {
            stakeCredential: {
              type: StakeCredentialParamsType.KEY_PATH,
              keyPath: keys.stake.path,
            },
          };
        } else {
          const scriptHash = Buffer.from(
            credential.to_scripthash().to_bytes()
          ).toString('hex');
          certificate.params = {
            stakeCredential: {
              type: StakeCredentialParamsType.SCRIPT_HASH,
              scriptHash,
            },
          };
        }
      } else if (cert.kind() === 2) {
        const delegation = cert.as_stake_delegation();
        const credential = delegation.stake_credential();
        const poolKeyHashHex = Buffer.from(
          delegation.pool_keyhash().to_bytes()
        ).toString('hex');
        certificate.type = CertificateType.STAKE_DELEGATION;
        if (credential.kind() === 0) {
          certificate.params = {
            stakeCredential: {
              type: StakeCredentialParamsType.KEY_PATH,
              keyPath: keys.stake.path,
            },
          };
        } else {
          const scriptHash = Buffer.from(
            credential.to_scripthash().to_bytes()
          ).toString('hex');
          certificate.params = {
            stakeCredential: {
              type: StakeCredentialParamsType.SCRIPT_HASH,
              scriptHash,
            },
          };
        }
        certificate.params.poolKeyHashHex = poolKeyHashHex;
      } else if (cert.kind() === 3) {
        const params = cert.as_pool_registration().pool_params();
        certificate.type = CertificateType.STAKE_POOL_REGISTRATION;
        const owners = params.pool_owners();
        const poolOwners = [];
        for (let i = 0; i < owners.len(); i++) {
          const keyHash = Buffer.from(owners.get(i).to_bytes()).toString('hex');
          if (keyHash == keys.stake.hash) {
            signingMode = TransactionSigningMode.POOL_REGISTRATION_AS_OWNER;
            poolOwners.push({
              type: PoolOwnerType.DEVICE_OWNED,
              stakingPath: keys.stake.path,
            });
          } else {
            poolOwners.push({
              type: PoolOwnerType.THIRD_PARTY,
              stakingKeyHashHex: keyHash,
            });
          }
        }
        const relays = params.relays();
        const ledgerRelays = [];
        for (let i = 0; i < relays.len(); i++) {
          const relay = relays.get(i);
          if (relay.kind() === 0) {
            const singleHostAddr = relay.as_single_host_addr();
            const type = RelayType.SINGLE_HOST_IP_ADDR;
            const portNumber = singleHostAddr.port();
            const ipv4 = singleHostAddr.ipv4()
              ? bytesToIp(singleHostAddr.ipv4().ip())
              : null;
            const ipv6 = singleHostAddr.ipv6()
              ? bytesToIp(singleHostAddr.ipv6().ip())
              : null;
            ledgerRelays.push({ type, params: { portNumber, ipv4, ipv6 } });
          } else if (relay.kind() === 1) {
            const type = RelayType.SINGLE_HOST_HOSTNAME;
            const singleHostName = relay.as_single_host_name();
            const portNumber = singleHostName.port();
            const dnsName = singleHostName.dns_name().record();
            ledgerRelays.push({
              type,
              params: { portNumber, dnsName },
            });
          } else if (relay.kind() === 2) {
            const type = RelayType.MULTI_HOST;
            const multiHostName = relay.as_multi_host_name();
            const dnsName = multiHostName.dns_name();
            ledgerRelays.push({
              type,
              params: { dnsName },
            });
          }
        }
        const cost = params.cost().to_str();
        const margin = params.margin();
        const pledge = params.pledge().to_str();
        const operator = Buffer.from(params.operator().to_bytes()).toString(
          'hex'
        );
        let poolKey;
        if (operator == keys.stake.hash) {
          signingMode = TransactionSigningMode.POOL_REGISTRATION_AS_OPERATOR;
          poolKey = {
            type: PoolKeyType.DEVICE_OWNED,
            params: { path: keys.stake.path },
          };
        } else {
          poolKey = {
            type: PoolKeyType.THIRD_PARTY,
            params: { keyHashHex: operator },
          };
        }
        const metadata = params.pool_metadata()
          ? {
              metadataUrl: params.pool_metadata().url().url(),
              metadataHashHex: Buffer.from(
                params.pool_metadata().pool_metadata_hash().to_bytes()
              ).toString('hex'),
            }
          : null;
        const rewardAccountHex = Buffer.from(
          params.reward_account().to_address().to_bytes()
        ).toString('hex');
        let rewardAccount;
        if (rewardAccountHex == address) {
          rewardAccount = {
            type: PoolRewardAccountType.DEVICE_OWNED,
            params: { path: keys.stake.path },
          };
        } else {
          rewardAccount = {
            type: PoolRewardAccountType.THIRD_PARTY,
            params: { rewardAccountHex },
          };
        }
        const vrfKeyHashHex = Buffer.from(
          params.vrf_keyhash().to_bytes()
        ).toString('hex');

        certificate.params = {
          poolKey,
          vrfKeyHashHex,
          pledge,
          cost,
          margin: {
            numerator: margin.numerator().to_str(),
            denominator: margin.denominator().to_str(),
          },
          rewardAccount,
          poolOwners,
          relays: ledgerRelays,
          metadata,
        };
      }
      ledgerCertificates.push(certificate);
    }
  }
  const fee = tx.body().fee().to_str();
  const ttl = tx.body().ttl() ? tx.body().ttl().to_str() : null;
  const withdrawals = tx.body().withdrawals();
  let ledgerWithdrawals = null;
  if (withdrawals) {
    ledgerWithdrawals = [];
    for (let i = 0; i < withdrawals.keys().len(); i++) {
      const withdrawal = { stakeCredential: {} };
      const rewardAddress = withdrawals.keys().get(i);
      if (rewardAddress.payment_cred().kind() === 0) {
        withdrawal.stakeCredential.type = StakeCredentialParamsType.KEY_PATH;
        withdrawal.stakeCredential.keyPath = keys.stake.path;
      } else {
        withdrawal.stakeCredential.type = StakeCredentialParamsType.SCRIPT_HASH;
        withdrawal.stakeCredential.scriptHash = Buffer.from(
          rewardAddress.payment_cred().to_scripthash().to_bytes()
        ).toString('hex');
      }
      withdrawal.amount = withdrawals.get(rewardAddress).to_str();
      ledgerWithdrawals.push(withdrawal);
    }
  }
  const auxiliaryData = tx.body().auxiliary_data_hash()
    ? {
        type: TxAuxiliaryDataType.ARBITRARY_HASH,
        params: {
          hashHex: Buffer.from(
            tx.body().auxiliary_data_hash().to_bytes()
          ).toString('hex'),
        },
      }
    : null;
  const validityIntervalStart = tx.body().validity_start_interval()
    ? tx.body().validity_start_interval().to_str()
    : null;

  const mint = tx.body().mint();
  let additionalWitnessPaths = null;
  let mintBundle = null;
  if (mint) {
    mintBundle = [];
    for (let j = 0; j < mint.keys().len(); j++) {
      const policy = mint.keys().get(j);
      const assets = mint.get(policy);
      const tokens = [];
      for (let k = 0; k < assets.keys().len(); k++) {
        const assetName = assets.keys().get(k);
        const amount = assets.get(assetName);
        tokens.push({
          assetNameHex: Buffer.from(assetName.name()).toString('hex'),
          amount: amount.is_positive()
            ? amount.as_positive().to_str()
            : '-' + amount.as_negative().to_str(),
        });
      }
      // sort canonical
      tokens.sort((a, b) => {
        if (a.assetNameHex.length == b.assetNameHex.length) {
          return a.assetNameHex > b.assetNameHex ? 1 : -1;
        } else if (a.assetNameHex.length > b.assetNameHex.length) return 1;
        else return -1;
      });
      mintBundle.push({
        policyIdHex: Buffer.from(policy.to_bytes()).toString('hex'),
        tokens,
      });
    }
  }
  additionalWitnessPaths = [];
  if (keys.payment.path) additionalWitnessPaths.push(keys.payment.path);
  if (keys.stake.path) additionalWitnessPaths.push(keys.stake.path);

  // Plutus
  const scriptDataHashHex = tx.body().script_data_hash()
    ? Buffer.from(tx.body().script_data_hash().to_bytes()).toString('hex')
    : null;

  let collateralInputs = null;
  if (tx.body().collateral()) {
    collateralInputs = [];
    const coll = tx.body().collateral();
    for (let i = 0; i < coll.len(); i++) {
      const input = coll.get(i);
      if (keys.payment.path) {
        collateralInputs.push({
          txHashHex: Buffer.from(input.transaction_id().to_bytes()).toString(
            'hex'
          ),
          outputIndex: parseInt(input.index().to_str()),
          path: keys.payment.path, // needed to include payment key witness if available
        });
      } else {
        collateralInputs.push({
          txHashHex: Buffer.from(input.transaction_id().to_bytes()).toString(
            'hex'
          ),
          outputIndex: parseInt(input.index().to_str()),
        });
      }
      signingMode = TransactionSigningMode.PLUTUS_TRANSACTION;
    }
  }

  let collateralOutput = (() => {
    if (tx.body().collateral_return()) {
      const outputs = Loader.Cardano.TransactionOutputs.new();
      outputs.add(tx.body().collateral_return());
      const [out] = outputsToLedger(outputs, address, index);
      return out;
    }
    return null;
  })();

  const totalCollateral = tx.body().total_collateral()
    ? tx.body().total_collateral().to_str()
    : null;

  let referenceInputs = null;
  if (tx.body().reference_inputs()) {
    referenceInputs = [];
    const refInputs = tx.body().reference_inputs();
    for (let i = 0; i < refInputs.len(); i++) {
      const input = refInputs.get(i);
      referenceInputs.push({
        txHashHex: input.transaction_id().to_hex(),
        outputIndex: parseInt(input.index().to_str()),
        path: null,
      });
    }
  }

  let requiredSigners = null;
  if (tx.body().required_signers()) {
    requiredSigners = [];
    const r = tx.body().required_signers();
    for (let i = 0; i < r.len(); i++) {
      const signer = Buffer.from(r.get(i).to_bytes()).toString('hex');
      if (signer === keys.payment.hash) {
        requiredSigners.push({
          type: TxRequiredSignerType.PATH,
          path: keys.payment.path,
        });
      } else if (signer === keys.stake.hash) {
        requiredSigners.push({
          type: TxRequiredSignerType.PATH,
          path: keys.stake.path,
        });
      } else {
        requiredSigners.push({
          type: TxRequiredSignerType.HASH,
          hashHex: signer,
        });
      }
    }
    signingMode = TransactionSigningMode.PLUTUS_TRANSACTION;
  }

  const includeNetworkId = !!tx.body().network_id();

  const ledgerTx = {
    network: {
      protocolMagic: network === 1 ? 764824073 : 42,
      networkId: network,
    },
    inputs: ledgerInputs,
    outputs: ledgerOutputs,
    fee,
    ttl,
    certificates: ledgerCertificates,
    withdrawals: ledgerWithdrawals,
    auxiliaryData,
    validityIntervalStart,
    mint: mintBundle,
    scriptDataHashHex,
    collateralInputs,
    requiredSigners,
    includeNetworkId,
    collateralOutput,
    totalCollateral,
    referenceInputs,
  };

  Object.keys(ledgerTx).forEach(
    (key) => !ledgerTx[key] && ledgerTx[key] != 0 && delete ledgerTx[key]
  );

  const fullTx = {
    signingMode,
    tx: ledgerTx,
    additionalWitnessPaths,
  };
  Object.keys(fullTx).forEach(
    (key) => !fullTx[key] && fullTx[key] != 0 && delete fullTx[key]
  );

  return fullTx;
};

const bytesToIp = (bytes) => {
  if (!bytes) return null;
  if (bytes.length === 4) {
    return { ipv4: bytes.join('.') };
  } else if (bytes.length === 16) {
    let ipv6 = '';
    for (let i = 0; i < bytes.length; i += 2) {
      ipv6 += bytes[i].toString(16) + bytes[i + 1].toString(16) + ':';
    }
    ipv6 = ipv6.slice(0, -1);
    return { ipv6 };
  }
  return null;
};

function checksum(num) {
  return crc8(Buffer.from(num, 'hex')).toString(16).padStart(2, '0');
}

export function toLabel(num) {
  if (num < 0 || num > 65535) {
    throw new Error(
      `Label ${num} out of range: min label 1 - max label 65535.`
    );
  }
  const numHex = num.toString(16).padStart(4, '0');
  return '0' + numHex + checksum(numHex) + '0';
}

export function fromLabel(label) {
  if (label.length !== 8 || !(label[0] === '0' && label[7] === '0')) {
    return null;
  }
  const numHex = label.slice(1, 5);
  const num = parseInt(numHex, 16);
  const check = label.slice(5, 7);
  return check === checksum(numHex) ? num : null;
}

export function toAssetUnit(policyId, name, label) {
  const hexLabel = Number.isInteger(label) ? toLabel(label) : '';
  const n = name ? name : '';
  if ((n + hexLabel).length > 64) {
    throw new Error('Asset name size exceeds 32 bytes.');
  }
  if (policyId.length !== 56) {
    throw new Error(`Policy id invalid: ${policyId}.`);
  }
  return policyId + hexLabel + n;
}

export function fromAssetUnit(unit) {
  const policyId = unit.slice(0, 56);
  const label = fromLabel(unit.slice(56, 64));
  const name = (() => {
    const hexName = Number.isInteger(label) ? unit.slice(64) : unit.slice(56);
    return unit.length === 56 ? '' : hexName || null;
  })();
  return { policyId, name, label };
}

export class Constr {
  constructor(index, fields) {
    this.index = index;
    this.fields = fields;
  }
}

export class Data {
  /** Convert PlutusData to Cbor encoded data */
  static async to(plutusData) {
    await Loader.load();
    function serialize(data) {
      try {
        if (
          typeof data === 'bigint' ||
          typeof data === 'number' ||
          (typeof data === 'string' &&
            !isNaN(parseInt(data)) &&
            data.slice(-1) === 'n')
        ) {
          const bigint =
            typeof data === 'string' ? BigInt(data.slice(0, -1)) : data;
          return Loader.Cardano.PlutusData.new_integer(
            Loader.Cardano.BigInt.from_str(bigint.toString())
          );
        } else if (typeof data === 'string') {
          return Loader.Cardano.PlutusData.new_bytes(Buffer.from(data, 'hex'));
        } else if (data instanceof Uint8Array) {
          return Loader.Cardano.PlutusData.new_bytes(data);
        } else if (data instanceof Constr) {
          const { index, fields } = data;
          const plutusList = Loader.Cardano.PlutusList.new();

          fields.forEach((field) => plutusList.add(serialize(field)));

          return Loader.Cardano.PlutusData.new_constr_plutus_data(
            Loader.Cardano.ConstrPlutusData.new(
              Loader.Cardano.BigNum.from_str(index.toString()),
              plutusList
            )
          );
        } else if (data instanceof Array) {
          const plutusList = Loader.Cardano.PlutusList.new();

          data.forEach((arg) => plutusList.add(serialize(arg)));

          return Loader.Cardano.PlutusData.new_list(plutusList);
        } else if (data instanceof Map) {
          const plutusMap = Loader.Cardano.PlutusMap.new();

          for (const [key, value] of data.entries()) {
            plutusMap.insert(serialize(key), serialize(value));
          }

          return Loader.Cardano.PlutusData.new_map(plutusMap);
        }
        throw new Error('Unsupported type');
      } catch (error) {
        throw new Error('Could not serialize the data: ' + error);
      }
    }
    return toHex(serialize(plutusData).to_bytes());
  }

  /** Convert Cbor encoded data to PlutusData */
  static async from(data) {
    await Loader.load();
    const plutusData = Loader.Cardano.PlutusData.from_bytes(
      Buffer.from(data, 'hex')
    );
    function deserialize(data) {
      if (data.kind() === 0) {
        const constr = data.as_constr_plutus_data();
        const l = constr.data();
        const desL = [];
        for (let i = 0; i < l.len(); i++) {
          desL.push(deserialize(l.get(i)));
        }
        return new Constr(parseInt(constr.alternative().to_str()), desL);
      } else if (data.kind() === 1) {
        const m = data.as_map();
        const desM = new Map();
        const keys = m.keys();
        for (let i = 0; i < keys.len(); i++) {
          desM.set(deserialize(keys.get(i)), deserialize(m.get(keys.get(i))));
        }
        return desM;
      } else if (data.kind() === 2) {
        const l = data.as_list();
        const desL = [];
        for (let i = 0; i < l.len(); i++) {
          desL.push(deserialize(l.get(i)));
        }
        return desL;
      } else if (data.kind() === 3) {
        return BigInt(data.as_integer().to_str());
      } else if (data.kind() === 4) {
        return Buffer.from(data.as_bytes()).toString('hex');
      }
      throw new Error('Unsupported type');
    }
    return deserialize(plutusData);
  }

  /**
   * Convert conveniently a Json object (e.g. Metadata) to PlutusData.
   * Note: Constructor cannot be used here.
   */
  static fromJson(json) {
    function toPlutusData(json) {
      if (typeof json === 'string') {
        return Buffer.from(json);
      }
      if (typeof json === 'number') return BigInt(json);
      if (typeof json === 'bigint') return json;
      if (json instanceof Array) return json.map((v) => toPlutusData(v));
      if (json instanceof Object) {
        const tempMap = new Map();
        Object.entries(json).forEach(([key, value]) => {
          tempMap.set(toPlutusData(key), toPlutusData(value));
        });
        return tempMap;
      }
      throw new Error('Unsupported type');
    }
    return toPlutusData(json);
  }

  /**
   * Convert PlutusData to a Json object.
   * Note: Constructor cannot be used here, also only bytes/integers as Json keys.
   */
  static toJson(plutusData) {
    function fromPlutusData(data) {
      if (
        typeof data === 'bigint' ||
        typeof data === 'number' ||
        (typeof data === 'string' &&
          !isNaN(parseInt(data)) &&
          data.slice(-1) === 'n')
      ) {
        const bigint =
          typeof data === 'string' ? BigInt(data.slice(0, -1)) : data;
        return parseInt(bigint.toString());
      }
      if (typeof data === 'string') {
        return Buffer.from(data, 'hex').toString();
      }
      if (data instanceof Array) return data.map((v) => fromPlutusData(v));
      if (data instanceof Map) {
        const tempJson = {};
        data.forEach((value, key) => {
          const convertedKey = fromPlutusData(key);
          if (
            typeof convertedKey !== 'string' &&
            typeof convertedKey !== 'number'
          ) {
            throw new Error(
              'Unsupported type (Note: Only bytes or integers can be keys of a JSON object)'
            );
          }
          tempJson[convertedKey] = fromPlutusData(value);
        });
        return tempJson;
      }
      throw new Error(
        'Unsupported type (Note: Constructor cannot be converted to JSON)'
      );
    }
    return fromPlutusData(plutusData);
  }

  static empty() {
    return 'd87980';
  }
}
