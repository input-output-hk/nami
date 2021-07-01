import { getNetwork, getUtxos, signTx, submitTx } from '.';
import { ERROR, EVENT, SENDER, TARGET } from '../../config/config';
import provider from '../../config/provider';
import Loader from '../loader';
import CoinSelection from '../../lib/coinSelection';
import {
  TransactionUnspentOutput,
  Value,
} from '@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';
import { blockfrostRequest } from '../util';
import AssetFingerprint from '@emurgo/cip14-js';
import { hexToAscii } from '../util';

export const onAccountChange = (callback) => {
  window.addEventListener('message', function responseHandler(e) {
    const response = e.data;
    if (
      typeof response !== 'object' ||
      response === null ||
      !response.target ||
      response.target !== TARGET ||
      !response.event ||
      response.event !== EVENT.accountChange ||
      !response.sender ||
      response.sender !== SENDER.extension
    )
      return;
    callback(response.data);
  });
};

export const initTx = async () => {
  const latest_block = await blockfrostRequest('/blocks/latest');

  const p = await blockfrostRequest(`/epochs/${latest_block.epoch}/parameters`);

  return {
    linearFee: Loader.Cardano.LinearFee.new(
      Loader.Cardano.BigNum.from_str(p.min_fee_a.toString()),
      Loader.Cardano.BigNum.from_str(p.min_fee_b.toString())
    ),
    minUtxo: Loader.Cardano.BigNum.from_str(p.min_utxo),
    poolDeposit: Loader.Cardano.BigNum.from_str(p.pool_deposit),
    keyDeposit: Loader.Cardano.BigNum.from_str(p.key_deposit),
    maxTxSize: p.max_tx_size,
  };
};

// convert blockfrost type to cbor data structure
export const utxoToStructure = async (output, address) => {
  await Loader.load();
  return Loader.Cardano.TransactionUnspentOutput.new(
    Loader.Cardano.TransactionInput.new(
      Loader.Cardano.TransactionHash.from_bytes(
        Buffer.from(output.tx_hash, 'hex')
      ),
      output.output_index
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
 */
export const sumUtxos = async (utxos) => {
  await Loader.load();
  let value = Loader.Cardano.Value.new(Loader.Cardano.BigNum.from_str('0'));
  utxos.forEach((utxo) => (value = value.checked_add(utxo.output().amount())));
  return value;
};

// convert cbor data structure to blockfrost type
export const structureToUtxo = async (structure) => {
  await Loader.load();
  const assets = await valueToAssets(structure.output().amount());
  return {
    txHash: Buffer.from(
      structure.input().transaction_id().to_bytes(),
      'hex'
    ).toString('hex'),
    txId: structure.input().index(),
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

export const buildTx = async (account, utxos, outputs, protocolParameters) => {
  await Loader.load();
  const selection = CoinSelection.randomImprove(
    utxos,
    outputs,
    20 + outputs[0].amount.length,
    protocolParameters.minUtxo.to_str()
  );
  const inputs = selection.input;
  const txBuilder = Loader.Cardano.TransactionBuilder.new(
    protocolParameters.linearFee,
    protocolParameters.minUtxo,
    protocolParameters.poolDeposit,
    protocolParameters.keyDeposit
  );

  await Promise.all(
    inputs.map(async (input) =>
      txBuilder.add_input(
        Loader.Cardano.Address.from_bech32(account.paymentAddr),
        Loader.Cardano.TransactionInput.new(
          Loader.Cardano.TransactionHash.from_bytes(
            Buffer.from(input.txHash, 'hex')
          ),
          input.txId
        ),
        await assetsToValue(input.amount)
      )
    )
  );

  await Promise.all(
    outputs.map(async (output) =>
      txBuilder.add_output(
        Loader.Cardano.TransactionOutput.new(
          Loader.Cardano.Address.from_bech32(output.address),
          await assetsToValue(output.amount)
        )
      )
    )
  );
  const change = selection.change;
  // hard coded for now. about 300 assets fit into a single output
  if (change.length > 300) {
    const lovelace = (BigInt(change[0].quantity) / BigInt(2)).toString();
    const partialChange = change.slice(1, 300);
    partialChange.unshift({ unit: 'lovelace', quantity: lovelace });
    txBuilder.add_output(
      Loader.Cardano.TransactionOutput.new(
        Loader.Cardano.Address.from_bech32(account.paymentAddr),
        await assetsToValue(partialChange)
      )
    );
  }

  txBuilder.add_change_if_needed(
    Loader.Cardano.Address.from_bech32(account.paymentAddr)
  );

  const transaction = Loader.Cardano.Transaction.new(
    txBuilder.build(),
    Loader.Cardano.TransactionWitnessSet.new()
  );

  const size = transaction.to_bytes().length * 2;
  if (size > protocolParameters.maxTxSize) throw ERROR.txTooBig;

  return transaction;
};

export const signAndSubmit = async (
  tx,
  { keyHashes, accountIndex },
  password
) => {
  await Loader.load();
  const witnessSet = await signTx(
    Buffer.from(tx.to_bytes(), 'hex').toString('hex'),
    keyHashes,
    password,
    accountIndex
  );
  const transaction = Loader.Cardano.Transaction.new(tx.body(), witnessSet);

  const txHash = await submitTx(
    Buffer.from(transaction.to_bytes(), 'hex').toString('hex')
  );
  return txHash;
};

export const delegationTx = async (account, delegation, protocolParameters) => {
  await Loader.load();
  const utxos = await getUtxos(undefined, undefined, true);
  const selection = CoinSelection.randomImprove(
    utxos,
    [
      {
        address: '',
        amount: [
          {
            unit: 'lovelace',
            quantity: protocolParameters.keyDeposit.to_str(),
          },
        ],
      },
    ],
    20,
    protocolParameters.minUtxo.to_str()
  );

  const inputs = selection.input;
  const txBuilder = Loader.Cardano.TransactionBuilder.new(
    protocolParameters.linearFee,
    protocolParameters.minUtxo,
    protocolParameters.poolDeposit,
    protocolParameters.keyDeposit
  );

  await Promise.all(
    inputs.map(async (input) =>
      txBuilder.add_input(
        Loader.Cardano.Address.from_bech32(account.paymentAddr),
        Loader.Cardano.TransactionInput.new(
          Loader.Cardano.TransactionHash.from_bytes(
            Buffer.from(input.txHash, 'hex')
          ),
          input.txId
        ),
        await assetsToValue(input.amount)
      )
    )
  );

  const certificates = Loader.Cardano.Certificates.new();
  if (!delegation.active)
    certificates.add(
      Loader.Cardano.Certificate.new_stake_registration(
        Loader.Cardano.StakeRegistration.new(
          Loader.Cardano.StakeCredential.from_keyhash(
            Loader.Cardano.Ed25519KeyHash.from_bytes(
              Buffer.from(account.stakeKeyHash, 'hex')
            )
          )
        )
      )
    );
  const poolKeyHash =
    '2a748e3885f6f73320ad16a8331247b81fe01b8d39f57eec9caa5091'; //BERRY
  certificates.add(
    Loader.Cardano.Certificate.new_stake_delegation(
      Loader.Cardano.StakeDelegation.new(
        Loader.Cardano.StakeCredential.from_keyhash(
          Loader.Cardano.Ed25519KeyHash.from_bytes(
            Buffer.from(account.stakeKeyHash, 'hex')
          )
        ),
        Loader.Cardano.Ed25519KeyHash.from_bytes(
          Buffer.from(poolKeyHash, 'hex')
        )
      )
    )
  );
  txBuilder.set_certs(certificates);

  const change = selection.change;
  // hard coded for now. about 300 assets fit into a single output
  if (change.length > 300) {
    const lovelace = (BigInt(change[0].quantity) / BigInt(2)).toString();
    const partialChange = change.slice(1, 300);
    partialChange.unshift({ unit: 'lovelace', quantity: lovelace });
    txBuilder.add_output(
      Loader.Cardano.TransactionOutput.new(
        Loader.Cardano.Address.from_bech32(account.paymentAddr),
        await assetsToValue(partialChange)
      )
    );
  }

  txBuilder.add_change_if_needed(
    Loader.Cardano.Address.from_bech32(account.paymentAddr)
  );

  const transaction = Loader.Cardano.Transaction.new(
    txBuilder.build(),
    Loader.Cardano.TransactionWitnessSet.new()
  );

  const size = transaction.to_bytes().length * 2;
  if (size > protocolParameters.maxTxSize) throw ERROR.txTooBig;

  return transaction;
};

export const withdrawalTx = async (account, delegation, protocolParameters) => {
  await Loader.load();
  const txBuilder = Loader.Cardano.TransactionBuilder.new(
    protocolParameters.linearFee,
    protocolParameters.minUtxo,
    protocolParameters.poolDeposit,
    protocolParameters.keyDeposit
  );

  const withdrawals = Loader.Cardano.Withdrawals.new();
  withdrawals.insert(
    Loader.Cardano.RewardAddress.from_address(
      Loader.Cardano.Address.from_bech32(account.rewardAddr)
    ),
    Loader.Cardano.BigNum.from_str(delegation.rewards)
  );

  txBuilder.set_withdrawals(withdrawals);

  txBuilder.add_change_if_needed(
    Loader.Cardano.Address.from_bech32(account.paymentAddr)
  );

  const transaction = Loader.Cardano.Transaction.new(
    txBuilder.build(),
    Loader.Cardano.TransactionWitnessSet.new()
  );

  const size = transaction.to_bytes().length * 2;
  if (size > protocolParameters.maxTxSize) throw ERROR.txTooBig;

  return transaction;
};
