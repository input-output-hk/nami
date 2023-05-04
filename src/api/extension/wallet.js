import { getUtxos, signTx, signTxHW, submitTx } from '.';
import { ERROR, TX } from '../../config/config';
import Loader from '../loader';
import { blockfrostRequest } from '../util';

const WEIGHTS = Uint32Array.from([
  200, // weight ideal > 100 inputs
  1000, // weight ideal < 100 inputs
  1500, // weight assets if plutus
  800, // weight assets if not plutus
  800, // weight distance if not plutus
  5000, // weight utxos
]);

export const initTx = async () => {
  const latest_block = await blockfrostRequest('/blocks/latest');
  const p = await blockfrostRequest(`/epochs/latest/parameters`);

  return {
    linearFee: {
      minFeeA: p.min_fee_a.toString(),
      minFeeB: p.min_fee_b.toString(),
    },
    minUtxo: '1000000', //p.min_utxo, minUTxOValue protocol paramter has been removed since Alonzo HF. Calulation of minADA works differently now, but 1 minADA still sufficient for now
    poolDeposit: p.pool_deposit,
    keyDeposit: p.key_deposit,
    coinsPerUtxoWord: p.coins_per_utxo_size.toString(),
    maxValSize: p.max_val_size,
    priceMem: p.price_mem,
    priceStep: p.price_step,
    maxTxSize: parseInt(p.max_tx_size),
    slot: parseInt(latest_block.slot),
    collateralPercentage: parseInt(p.collateral_percent),
    maxCollateralInputs: parseInt(p.max_collateral_inputs),
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

  const txBuilderConfig = Loader.Cardano.TransactionBuilderConfigBuilder.new()
    .coins_per_utxo_byte(
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
    .ex_unit_prices(Loader.Cardano.ExUnitPrices.from_float(0, 0))
    .collateral_percentage(protocolParameters.collateralPercentage)
    .max_collateral_inputs(protocolParameters.maxCollateralInputs)
    .build();

  const txBuilder = Loader.Cardano.TransactionBuilder.new(txBuilderConfig);

  txBuilder.add_output(outputs.get(0));

  if (auxiliaryData) txBuilder.set_auxiliary_data(auxiliaryData);

  txBuilder.set_ttl(
    Loader.Cardano.BigNum.from_str(
      (protocolParameters.slot + TX.invalid_hereafter).toString()
    )
  );

  const utxosCore = Loader.Cardano.TransactionUnspentOutputs.new();
  utxos.forEach((utxo) => utxosCore.add(utxo));

  txBuilder.add_inputs_from(
    utxosCore,
    Loader.Cardano.Address.from_bech32(account.paymentAddr),
    WEIGHTS
  );

  txBuilder.balance(Loader.Cardano.Address.from_bech32(account.paymentAddr));

  const transaction = await txBuilder.construct();

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

  const txBuilderConfig = Loader.Cardano.TransactionBuilderConfigBuilder.new()
    .coins_per_utxo_byte(
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
    .ex_unit_prices(Loader.Cardano.ExUnitPrices.from_float(0, 0))
    .collateral_percentage(protocolParameters.collateralPercentage)
    .max_collateral_inputs(protocolParameters.maxCollateralInputs)
    .build();

  const txBuilder = Loader.Cardano.TransactionBuilder.new(txBuilderConfig);

  if (!delegation.active)
    txBuilder.add_certificate(
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
  txBuilder.add_certificate(
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

  txBuilder.set_ttl(
    Loader.Cardano.BigNum.from_str(
      (protocolParameters.slot + TX.invalid_hereafter).toString()
    )
  );

  const utxos = await getUtxos();

  const utxosCore = Loader.Cardano.TransactionUnspentOutputs.new();
  utxos.forEach((utxo) => utxosCore.add(utxo));

  txBuilder.add_inputs_from(
    utxosCore,
    Loader.Cardano.Address.from_bech32(account.paymentAddr),
    WEIGHTS
  );

  txBuilder.balance(Loader.Cardano.Address.from_bech32(account.paymentAddr));

  const transaction = await txBuilder.construct();

  return transaction;
};

export const withdrawalTx = async (account, delegation, protocolParameters) => {
  await Loader.load();

  const txBuilderConfig = Loader.Cardano.TransactionBuilderConfigBuilder.new()
    .coins_per_utxo_byte(
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
    .ex_unit_prices(Loader.Cardano.ExUnitPrices.from_float(0, 0))
    .collateral_percentage(protocolParameters.collateralPercentage)
    .max_collateral_inputs(protocolParameters.maxCollateralInputs)
    .build();

  const txBuilder = Loader.Cardano.TransactionBuilder.new(txBuilderConfig);

  txBuilder.add_withdrawal(
    Loader.Cardano.RewardAddress.from_address(
      Loader.Cardano.Address.from_bech32(account.rewardAddr)
    ),
    Loader.Cardano.BigNum.from_str(delegation.rewards)
  );

  txBuilder.set_ttl(
    Loader.Cardano.BigNum.from_str(
      (protocolParameters.slot + TX.invalid_hereafter).toString()
    )
  );

  const utxos = await getUtxos();

  const utxosCore = Loader.Cardano.TransactionUnspentOutputs.new();
  utxos.forEach((utxo) => utxosCore.add(utxo));

  txBuilder.add_inputs_from(
    utxosCore,
    Loader.Cardano.Address.from_bech32(account.paymentAddr),
    WEIGHTS
  );

  txBuilder.balance(Loader.Cardano.Address.from_bech32(account.paymentAddr));

  const transaction = await txBuilder.construct();

  return transaction;
};

export const undelegateTx = async (account, delegation, protocolParameters) => {
  await Loader.load();

  const txBuilderConfig = Loader.Cardano.TransactionBuilderConfigBuilder.new()
    .coins_per_utxo_byte(
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
    .ex_unit_prices(Loader.Cardano.ExUnitPrices.from_float(0, 0))
    .collateral_percentage(protocolParameters.collateralPercentage)
    .max_collateral_inputs(protocolParameters.maxCollateralInputs)
    .build();

  const txBuilder = Loader.Cardano.TransactionBuilder.new(txBuilderConfig);

  if (delegation.rewards > 0) {
    txBuilder.add_withdrawal(
      Loader.Cardano.RewardAddress.from_address(
        Loader.Cardano.Address.from_bech32(account.rewardAddr)
      ),
      Loader.Cardano.BigNum.from_str(delegation.rewards)
    );
  }

  txBuilder.add_certificate(
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

  txBuilder.set_ttl(
    Loader.Cardano.BigNum.from_str(
      (protocolParameters.slot + TX.invalid_hereafter).toString()
    )
  );

  const utxos = await getUtxos();

  const utxosCore = Loader.Cardano.TransactionUnspentOutputs.new();
  utxos.forEach((utxo) => utxosCore.add(utxo));

  txBuilder.add_inputs_from(
    utxosCore,
    Loader.Cardano.Address.from_bech32(account.paymentAddr),
    WEIGHTS
  );

  txBuilder.balance(Loader.Cardano.Address.from_bech32(account.paymentAddr));

  const transaction = await txBuilder.construct();

  return transaction;
};
