import {
  getCurrentAccount,
  getNetwork,
  getUtxos,
  signTx,
  signTxHW,
  submitTx,
} from '.';
import { ERROR, EVENT, HW, SENDER, TARGET, TX } from '../../config/config';
import Loader from '../loader';
import CoinSelection from '../../lib/coinSelection';
import {
  blockfrostRequest,
  multiAssetCount,
  txToLedger,
  utxoToJson,
} from '../util';
import { HARDENED } from '@cardano-foundation/ledgerjs-hw-app-cardano';

export const initTx = async () => {
  const latest_block = await blockfrostRequest('/blocks/latest');
  const p = await blockfrostRequest(`/epochs/${latest_block.epoch}/parameters`);

  return {
    linearFee: {
      minFeeA: p.min_fee_a.toString(),
      minFeeB: p.min_fee_b.toString(),
    },
    minUtxo: '1000000', //p.min_utxo, minUTxOValue protocol paramter has been removed since Alonzo HF. Calulation of minADA works differently now, but 1 minADA still sufficient for now
    poolDeposit: p.pool_deposit,
    keyDeposit: p.key_deposit,
    coinsPerUtxoWord: '34482',
    maxValSize: 5000,
    priceMem: 5.77e-2,
    priceStep: 7.21e-5,
    maxTxSize: parseInt(p.max_tx_size),
    slot: parseInt(latest_block.slot),
  };
};

export const buildTx = async (account, utxos, outputs, protocolParameters) => {
  await Loader.load();

  const totalAssets = await multiAssetCount(
    outputs.get(0).amount().multiasset()
  );
  CoinSelection.setProtocolParameters(
    protocolParameters.coinsPerUtxoWord,
    protocolParameters.linearFee.minFeeA,
    protocolParameters.linearFee.minFeeB,
    protocolParameters.maxTxSize.toString()
  );
  const selection = await CoinSelection.randomImprove(
    utxos,
    outputs,
    20 + totalAssets
  );
  const inputs = selection.input;

  const txBuilder = Loader.Cardano.TransactionBuilder.new(
    Loader.Cardano.LinearFee.new(
      Loader.Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeA),
      Loader.Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeB)
    ),
    Loader.Cardano.BigNum.from_str(protocolParameters.poolDeposit),
    Loader.Cardano.BigNum.from_str(protocolParameters.keyDeposit),
    protocolParameters.maxValSize,
    protocolParameters.maxTxSize,
    Loader.Cardano.BigNum.from_str(protocolParameters.coinsPerUtxoWord)
  );

  for (let i = 0; i < inputs.length; i++) {
    const utxo = inputs[i];
    txBuilder.add_input(
      utxo.output().address(),
      utxo.input(),
      utxo.output().amount()
    );
  }

  txBuilder.add_output(outputs.get(0));

  const change = selection.change;
  const changeMultiAssets = change.multiasset();

  // check if change value is too big for single output
  // TODO: bring split function into serialization-lib
  if (
    changeMultiAssets &&
    change.to_bytes().length * 3 > protocolParameters.maxValSize
  ) {
    const partialChange = Loader.Cardano.Value.new(
      Loader.Cardano.BigNum.from_str('0')
    );

    let partialMultiAssets = Loader.Cardano.MultiAsset.new();
    const policies = changeMultiAssets.keys();
    for (let j = 0; j < changeMultiAssets.len(); j++) {
      const policy = policies.get(j);
      const policyAssets = changeMultiAssets.get(policy);
      const assetNames = policyAssets.keys();
      let assets = Loader.Cardano.Assets.new();
      let isFull = false;
      for (let k = 0; k < assetNames.len(); k++) {
        isFull = false;
        const policyAsset = assetNames.get(k);
        const quantity = policyAssets.get(policyAsset);
        assets.insert(policyAsset, quantity);
        //check size
        const checkMultiAssets = Loader.Cardano.MultiAsset.from_bytes(
          partialMultiAssets.to_bytes()
        );
        checkMultiAssets.insert(policy, assets);
        const checkValue = Loader.Cardano.Value.new(
          Loader.Cardano.BigNum.from_str('0')
        );
        checkValue.set_multiasset(checkMultiAssets);
        if (checkValue.to_bytes().length * 3 >= protocolParameters.maxValSize) {
          partialMultiAssets.insert(policy, assets);

          partialChange.set_multiasset(partialMultiAssets);
          const minAda = Loader.Cardano.min_ada_required(
            partialChange,
            false,
            Loader.Cardano.BigNum.from_str(protocolParameters.coinsPerUtxoWord)
          );
          partialChange.set_coin(minAda);

          txBuilder.add_output(
            Loader.Cardano.TransactionOutput.new(
              Loader.Cardano.Address.from_bech32(account.paymentAddr),
              partialChange
            )
          );

          assets = Loader.Cardano.Assets.new();
          partialMultiAssets = Loader.Cardano.MultiAsset.new();
          isFull = true;
        }
      }
      if (!isFull) partialMultiAssets.insert(policy, assets);
    }
    if (partialMultiAssets.len() > 0) {
      partialChange.set_multiasset(partialMultiAssets);
      const minAda = Loader.Cardano.min_ada_required(
        partialChange,
        false,
        Loader.Cardano.BigNum.from_str(protocolParameters.coinsPerUtxoWord)
      );
      partialChange.set_coin(minAda);

      txBuilder.add_output(
        Loader.Cardano.TransactionOutput.new(
          Loader.Cardano.Address.from_bech32(account.paymentAddr),
          partialChange
        )
      );
    }
  }

  txBuilder.set_ttl(protocolParameters.slot + TX.invalid_hereafter);
  txBuilder.add_change_if_needed(
    Loader.Cardano.Address.from_bech32(account.paymentAddr)
  );

  const transaction = Loader.Cardano.Transaction.new(
    txBuilder.build(),
    Loader.Cardano.TransactionWitnessSet.new()
  );

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

export const signAndSubmitHW = async (
  tx,
  { keyHashes, account, hw, partialSign }
) => {
  await Loader.load();

  const witnessSet = await signTxHW(
    Buffer.from(tx.to_bytes(), 'hex').toString('hex'),
    keyHashes,
    account,
    hw,
    partialSign
  );

  const transaction = Loader.Cardano.Transaction.new(tx.body(), witnessSet);

  try {
    const txHash = await submitTx(
      Buffer.from(transaction.to_bytes(), 'hex').toString('hex')
    );
    return txHash;
  } catch (e) {
    throw ERROR.submit;
  }
};

export const delegationTx = async (account, delegation, protocolParameters) => {
  await Loader.load();
  const utxos = await getUtxos();

  const outputs = Loader.Cardano.TransactionOutputs.new();
  outputs.add(
    Loader.Cardano.TransactionOutput.new(
      Loader.Cardano.Address.from_bech32(account.paymentAddr),
      Loader.Cardano.Value.new(
        Loader.Cardano.BigNum.from_str(protocolParameters.keyDeposit)
      )
    )
  );
  CoinSelection.setProtocolParameters(
    protocolParameters.coinsPerUtxoWord,
    protocolParameters.linearFee.minFeeA,
    protocolParameters.linearFee.minFeeB,
    protocolParameters.maxTxSize.toString()
  );
  const selection = await CoinSelection.randomImprove(utxos, outputs, 20);

  const inputs = selection.input;
  const txBuilder = Loader.Cardano.TransactionBuilder.new(
    Loader.Cardano.LinearFee.new(
      Loader.Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeA),
      Loader.Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeB)
    ),
    Loader.Cardano.BigNum.from_str(protocolParameters.poolDeposit),
    Loader.Cardano.BigNum.from_str(protocolParameters.keyDeposit),
    protocolParameters.maxValSize,
    protocolParameters.maxTxSize,
    Loader.Cardano.BigNum.from_str(protocolParameters.coinsPerUtxoWord)
  );
  for (let i = 0; i < inputs.length; i++) {
    const utxo = inputs[i];
    txBuilder.add_input(
      utxo.output().address(),
      utxo.input(),
      utxo.output().amount()
    );
  }

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
  const changeMultiAssets = change.multiasset();

  // check if change value is too big for single output
  // TODO: bring split function into serialization-lib
  if (
    changeMultiAssets &&
    change.to_bytes().length * 3 > protocolParameters.maxValSize
  ) {
    const partialChange = Loader.Cardano.Value.new(
      Loader.Cardano.BigNum.from_str('0')
    );

    let partialMultiAssets = Loader.Cardano.MultiAsset.new();
    const policies = changeMultiAssets.keys();
    for (let j = 0; j < changeMultiAssets.len(); j++) {
      const policy = policies.get(j);
      const policyAssets = changeMultiAssets.get(policy);
      const assetNames = policyAssets.keys();
      let assets = Loader.Cardano.Assets.new();
      let isFull = false;
      for (let k = 0; k < assetNames.len(); k++) {
        isFull = false;
        const policyAsset = assetNames.get(k);
        const quantity = policyAssets.get(policyAsset);
        assets.insert(policyAsset, quantity);
        //check size
        const checkMultiAssets = Loader.Cardano.MultiAsset.from_bytes(
          partialMultiAssets.to_bytes()
        );
        checkMultiAssets.insert(policy, assets);
        const checkValue = Loader.Cardano.Value.new(
          Loader.Cardano.BigNum.from_str('0')
        );
        checkValue.set_multiasset(checkMultiAssets);
        if (checkValue.to_bytes().length * 3 >= protocolParameters.maxValSize) {
          partialMultiAssets.insert(policy, assets);

          partialChange.set_multiasset(partialMultiAssets);
          const minAda = Loader.Cardano.min_ada_required(
            partialChange,
            false,
            Loader.Cardano.BigNum.from_str(protocolParameters.coinsPerUtxoWord)
          );
          partialChange.set_coin(minAda);

          txBuilder.add_output(
            Loader.Cardano.TransactionOutput.new(
              Loader.Cardano.Address.from_bech32(account.paymentAddr),
              partialChange
            )
          );

          assets = Loader.Cardano.Assets.new();
          partialMultiAssets = Loader.Cardano.MultiAsset.new();
          isFull = true;
        }
      }
      if (!isFull) partialMultiAssets.insert(policy, assets);
    }
    if (partialMultiAssets.len() > 0) {
      partialChange.set_multiasset(partialMultiAssets);
      const minAda = Loader.Cardano.min_ada_required(
        partialChange,
        false,
        Loader.Cardano.BigNum.from_str(protocolParameters.coinsPerUtxoWord)
      );
      partialChange.set_coin(minAda);

      txBuilder.add_output(
        Loader.Cardano.TransactionOutput.new(
          Loader.Cardano.Address.from_bech32(account.paymentAddr),
          partialChange
        )
      );
    }
  }

  txBuilder.set_ttl(protocolParameters.slot + TX.invalid_hereafter);
  txBuilder.add_change_if_needed(
    Loader.Cardano.Address.from_bech32(account.paymentAddr)
  );

  const transaction = Loader.Cardano.Transaction.new(
    txBuilder.build(),
    Loader.Cardano.TransactionWitnessSet.new()
  );

  return transaction;
};

export const withdrawalTx = async (account, delegation, protocolParameters) => {
  await Loader.load();

  const utxos = await getUtxos();

  const outputs = Loader.Cardano.TransactionOutputs.new();
  outputs.add(
    Loader.Cardano.TransactionOutput.new(
      Loader.Cardano.Address.from_bech32(account.paymentAddr),
      Loader.Cardano.Value.new(
        Loader.Cardano.BigNum.from_str(protocolParameters.minUtxo)
      )
    )
  );
  CoinSelection.setProtocolParameters(
    protocolParameters.coinsPerUtxoWord,
    protocolParameters.linearFee.minFeeA,
    protocolParameters.linearFee.minFeeB,
    protocolParameters.maxTxSize.toString()
  );
  const selection = await CoinSelection.randomImprove(utxos, outputs, 20);
  const inputs = selection.input;
  const txBuilder = Loader.Cardano.TransactionBuilder.new(
    Loader.Cardano.LinearFee.new(
      Loader.Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeA),
      Loader.Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeB)
    ),
    Loader.Cardano.BigNum.from_str(protocolParameters.poolDeposit),
    Loader.Cardano.BigNum.from_str(protocolParameters.keyDeposit),
    protocolParameters.maxValSize,
    protocolParameters.maxTxSize,
    Loader.Cardano.BigNum.from_str(protocolParameters.coinsPerUtxoWord)
  );

  for (let i = 0; i < inputs.length; i++) {
    const utxo = inputs[i];
    txBuilder.add_input(
      utxo.output().address(),
      utxo.input(),
      utxo.output().amount()
    );
  }

  const withdrawals = Loader.Cardano.Withdrawals.new();
  withdrawals.insert(
    Loader.Cardano.RewardAddress.from_address(
      Loader.Cardano.Address.from_bech32(account.rewardAddr)
    ),
    Loader.Cardano.BigNum.from_str(delegation.rewards)
  );

  txBuilder.set_withdrawals(withdrawals);

  const change = selection.change;
  const changeMultiAssets = change.multiasset();

  // check if change value is too big for single output
  // TODO: bring split function into serialization-lib
  if (
    changeMultiAssets &&
    change.to_bytes().length * 3 > protocolParameters.maxValSize
  ) {
    const partialChange = Loader.Cardano.Value.new(
      Loader.Cardano.BigNum.from_str('0')
    );

    let partialMultiAssets = Loader.Cardano.MultiAsset.new();
    const policies = changeMultiAssets.keys();
    for (let j = 0; j < changeMultiAssets.len(); j++) {
      const policy = policies.get(j);
      const policyAssets = changeMultiAssets.get(policy);
      const assetNames = policyAssets.keys();
      let assets = Loader.Cardano.Assets.new();
      let isFull = false;
      for (let k = 0; k < assetNames.len(); k++) {
        isFull = false;
        const policyAsset = assetNames.get(k);
        const quantity = policyAssets.get(policyAsset);
        assets.insert(policyAsset, quantity);
        //check size
        const checkMultiAssets = Loader.Cardano.MultiAsset.from_bytes(
          partialMultiAssets.to_bytes()
        );
        checkMultiAssets.insert(policy, assets);
        const checkValue = Loader.Cardano.Value.new(
          Loader.Cardano.BigNum.from_str('0')
        );
        checkValue.set_multiasset(checkMultiAssets);
        if (checkValue.to_bytes().length * 3 >= protocolParameters.maxValSize) {
          partialMultiAssets.insert(policy, assets);

          partialChange.set_multiasset(partialMultiAssets);
          const minAda = Loader.Cardano.min_ada_required(
            partialChange,
            false,
            Loader.Cardano.BigNum.from_str(protocolParameters.coinsPerUtxoWord)
          );
          partialChange.set_coin(minAda);

          txBuilder.add_output(
            Loader.Cardano.TransactionOutput.new(
              Loader.Cardano.Address.from_bech32(account.paymentAddr),
              partialChange
            )
          );

          assets = Loader.Cardano.Assets.new();
          partialMultiAssets = Loader.Cardano.MultiAsset.new();
          isFull = true;
        }
      }
      if (!isFull) partialMultiAssets.insert(policy, assets);
    }
    if (partialMultiAssets.len() > 0) {
      partialChange.set_multiasset(partialMultiAssets);
      const minAda = Loader.Cardano.min_ada_required(
        partialChange,
        false,
        Loader.Cardano.BigNum.from_str(protocolParameters.coinsPerUtxoWord)
      );
      partialChange.set_coin(minAda);

      txBuilder.add_output(
        Loader.Cardano.TransactionOutput.new(
          Loader.Cardano.Address.from_bech32(account.paymentAddr),
          partialChange
        )
      );
    }
  }

  txBuilder.set_ttl(protocolParameters.slot + TX.invalid_hereafter);
  txBuilder.add_change_if_needed(
    Loader.Cardano.Address.from_bech32(account.paymentAddr)
  );

  const transaction = Loader.Cardano.Transaction.new(
    txBuilder.build(),
    Loader.Cardano.TransactionWitnessSet.new()
  );

  return transaction;
};

export const undelegateTx = async (account, delegation, protocolParameters) => {
  await Loader.load();
  const utxos = await getUtxos();

  const outputs = Loader.Cardano.TransactionOutputs.new();
  outputs.add(
    Loader.Cardano.TransactionOutput.new(
      Loader.Cardano.Address.from_bech32(account.paymentAddr),
      Loader.Cardano.Value.new(Loader.Cardano.BigNum.from_str('0'))
    )
  );
  CoinSelection.setProtocolParameters(
    protocolParameters.coinsPerUtxoWord,
    protocolParameters.linearFee.minFeeA,
    protocolParameters.linearFee.minFeeB,
    protocolParameters.maxTxSize.toString()
  );
  const selection = await CoinSelection.randomImprove(utxos, outputs, 20);

  const inputs = selection.input;
  const txBuilder = Loader.Cardano.TransactionBuilder.new(
    Loader.Cardano.LinearFee.new(
      Loader.Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeA),
      Loader.Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeB)
    ),
    Loader.Cardano.BigNum.from_str(protocolParameters.poolDeposit),
    Loader.Cardano.BigNum.from_str(protocolParameters.keyDeposit),
    protocolParameters.maxValSize,
    protocolParameters.maxTxSize,
    Loader.Cardano.BigNum.from_str(protocolParameters.coinsPerUtxoWord)
  );
  for (let i = 0; i < inputs.length; i++) {
    const utxo = inputs[i];
    txBuilder.add_input(
      utxo.output().address(),
      utxo.input(),
      utxo.output().amount()
    );
  }

  if (delegation.rewards > 0) {
    const withdrawals = Loader.Cardano.Withdrawals.new();
    withdrawals.insert(
      Loader.Cardano.RewardAddress.from_address(
        Loader.Cardano.Address.from_bech32(account.rewardAddr)
      ),
      Loader.Cardano.BigNum.from_str(delegation.rewards)
    );

    txBuilder.set_withdrawals(withdrawals);
  }

  const certificates = Loader.Cardano.Certificates.new();

  certificates.add(
    Loader.Cardano.Certificate.new_stake_deregistration(
      Loader.Cardano.StakeDeregistration.new(
        Loader.Cardano.StakeCredential.from_keyhash(
          Loader.Cardano.Ed25519KeyHash.from_bytes(
            Buffer.from(account.stakeKeyHash, 'hex')
          )
        )
      )
    )
  );

  txBuilder.set_certs(certificates);

  const change = selection.change;
  const changeMultiAssets = change.multiasset();

  // check if change value is too big for single output
  // TODO: bring split function into serialization-lib
  if (
    changeMultiAssets &&
    change.to_bytes().length * 3 > protocolParameters.maxValSize
  ) {
    const partialChange = Loader.Cardano.Value.new(
      Loader.Cardano.BigNum.from_str('0')
    );

    let partialMultiAssets = Loader.Cardano.MultiAsset.new();
    const policies = changeMultiAssets.keys();
    for (let j = 0; j < changeMultiAssets.len(); j++) {
      const policy = policies.get(j);
      const policyAssets = changeMultiAssets.get(policy);
      const assetNames = policyAssets.keys();
      let assets = Loader.Cardano.Assets.new();
      let isFull = false;
      for (let k = 0; k < assetNames.len(); k++) {
        isFull = false;
        const policyAsset = assetNames.get(k);
        const quantity = policyAssets.get(policyAsset);
        assets.insert(policyAsset, quantity);
        //check size
        const checkMultiAssets = Loader.Cardano.MultiAsset.from_bytes(
          partialMultiAssets.to_bytes()
        );
        checkMultiAssets.insert(policy, assets);
        const checkValue = Loader.Cardano.Value.new(
          Loader.Cardano.BigNum.from_str('0')
        );
        checkValue.set_multiasset(checkMultiAssets);
        if (checkValue.to_bytes().length * 3 >= protocolParameters.maxValSize) {
          partialMultiAssets.insert(policy, assets);

          partialChange.set_multiasset(partialMultiAssets);
          const minAda = Loader.Cardano.min_ada_required(
            partialChange,
            false,
            Loader.Cardano.BigNum.from_str(protocolParameters.coinsPerUtxoWord)
          );
          partialChange.set_coin(minAda);

          txBuilder.add_output(
            Loader.Cardano.TransactionOutput.new(
              Loader.Cardano.Address.from_bech32(account.paymentAddr),
              partialChange
            )
          );

          assets = Loader.Cardano.Assets.new();
          partialMultiAssets = Loader.Cardano.MultiAsset.new();
          isFull = true;
        }
      }
      if (!isFull) partialMultiAssets.insert(policy, assets);
    }
    if (partialMultiAssets.len() > 0) {
      partialChange.set_multiasset(partialMultiAssets);
      const minAda = Loader.Cardano.min_ada_required(
        partialChange,
        false,
        Loader.Cardano.BigNum.from_str(protocolParameters.coinsPerUtxoWord)
      );
      partialChange.set_coin(minAda);

      txBuilder.add_output(
        Loader.Cardano.TransactionOutput.new(
          Loader.Cardano.Address.from_bech32(account.paymentAddr),
          partialChange
        )
      );
    }
  }

  txBuilder.set_ttl(protocolParameters.slot + TX.invalid_hereafter);
  txBuilder.add_change_if_needed(
    Loader.Cardano.Address.from_bech32(account.paymentAddr)
  );

  const transaction = Loader.Cardano.Transaction.new(
    txBuilder.build(),
    Loader.Cardano.TransactionWitnessSet.new()
  );

  return transaction;
};
