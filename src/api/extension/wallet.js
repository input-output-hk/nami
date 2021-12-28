import { getUtxos, signTx, signTxHW, submitTx } from '.';
import { ERROR, TX } from '../../config/config';
import Loader from '../loader';
import CoinSelection from '../../lib/coinSelection';
import { blockfrostRequest, multiAssetCount } from '../util';

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
    coinsPerUtxoWord: p.coins_per_utxo_word,
    maxValSize: p.max_val_size,
    priceMem: p.price_mem,
    priceStep: p.price_step,
    maxTxSize: parseInt(p.max_tx_size),
    slot: parseInt(latest_block.slot),
  };
};

export const buildTx = async (
  account,
  utxos,
  outputs,
  protocolParameters,
  auxiliaryData = null
) => {
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

  const txBuilderConfig = Loader.Cardano.TransactionBuilderConfigBuilder.new()
    .coins_per_utxo_word(
      Loader.Cardano.BigNum.from_str(protocolParameters.coinsPerUtxoWord)
    )
    .fee_algo(
      Loader.Cardano.LinearFee.new(
        Loader.Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeA),
        Loader.Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeB)
      )
    )
    .key_deposit(Loader.Cardano.BigNum.from_str(protocolParameters.keyDeposit))
    .pool_deposit(
      Loader.Cardano.BigNum.from_str(protocolParameters.poolDeposit)
    )
    .max_tx_size(protocolParameters.maxTxSize)
    .max_value_size(protocolParameters.maxValSize)
    .prefer_pure_change(true)
    .build();

  const txBuilder = Loader.Cardano.TransactionBuilder.new(txBuilderConfig);

  for (let i = 0; i < inputs.length; i++) {
    const utxo = inputs[i];
    txBuilder.add_input(
      utxo.output().address(),
      utxo.input(),
      utxo.output().amount()
    );
  }

  txBuilder.add_output(outputs.get(0));

  if (auxiliaryData) txBuilder.set_auxiliary_data(auxiliaryData);

  txBuilder.set_ttl(protocolParameters.slot + TX.invalid_hereafter);
  txBuilder.add_change_if_needed(
    Loader.Cardano.Address.from_bech32(account.paymentAddr)
  );

  const transaction = Loader.Cardano.Transaction.new(
    txBuilder.build(),
    Loader.Cardano.TransactionWitnessSet.new(),
    txBuilder.get_auxiliary_data()
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
  const transaction = Loader.Cardano.Transaction.new(
    tx.body(),
    witnessSet,
    tx.auxiliary_data()
  );

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

  const transaction = Loader.Cardano.Transaction.new(
    tx.body(),
    witnessSet,
    tx.auxiliary_data()
  );

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
  const txBuilderConfig = Loader.Cardano.TransactionBuilderConfigBuilder.new()
    .coins_per_utxo_word(
      Loader.Cardano.BigNum.from_str(protocolParameters.coinsPerUtxoWord)
    )
    .fee_algo(
      Loader.Cardano.LinearFee.new(
        Loader.Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeA),
        Loader.Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeB)
      )
    )
    .key_deposit(Loader.Cardano.BigNum.from_str(protocolParameters.keyDeposit))
    .pool_deposit(
      Loader.Cardano.BigNum.from_str(protocolParameters.poolDeposit)
    )
    .max_tx_size(protocolParameters.maxTxSize)
    .max_value_size(protocolParameters.maxValSize)
    .prefer_pure_change(true)
    .build();

  const txBuilder = Loader.Cardano.TransactionBuilder.new(txBuilderConfig);
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
  const txBuilderConfig = Loader.Cardano.TransactionBuilderConfigBuilder.new()
    .coins_per_utxo_word(
      Loader.Cardano.BigNum.from_str(protocolParameters.coinsPerUtxoWord)
    )
    .fee_algo(
      Loader.Cardano.LinearFee.new(
        Loader.Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeA),
        Loader.Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeB)
      )
    )
    .key_deposit(Loader.Cardano.BigNum.from_str(protocolParameters.keyDeposit))
    .pool_deposit(
      Loader.Cardano.BigNum.from_str(protocolParameters.poolDeposit)
    )
    .max_tx_size(protocolParameters.maxTxSize)
    .max_value_size(protocolParameters.maxValSize)
    .prefer_pure_change(true)
    .build();

  const txBuilder = Loader.Cardano.TransactionBuilder.new(txBuilderConfig);

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
  const txBuilderConfig = Loader.Cardano.TransactionBuilderConfigBuilder.new()
    .coins_per_utxo_word(
      Loader.Cardano.BigNum.from_str(protocolParameters.coinsPerUtxoWord)
    )
    .fee_algo(
      Loader.Cardano.LinearFee.new(
        Loader.Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeA),
        Loader.Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeB)
      )
    )
    .key_deposit(Loader.Cardano.BigNum.from_str(protocolParameters.keyDeposit))
    .pool_deposit(
      Loader.Cardano.BigNum.from_str(protocolParameters.poolDeposit)
    )
    .max_tx_size(protocolParameters.maxTxSize)
    .max_value_size(protocolParameters.maxValSize)
    .prefer_pure_change(true)
    .build();

  const txBuilder = Loader.Cardano.TransactionBuilder.new(txBuilderConfig);
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
