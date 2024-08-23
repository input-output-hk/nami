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
    // might not be available for pre-conway networks; set to 0 in that case
    minFeeRefScriptCostPerByte: p.min_fee_ref_script_cost_per_byte || 0,
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
      BigInt(protocolParameters.coinsPerUtxoWord)
    )
    .fee_algo(
      Loader.Cardano.LinearFee.new(
        BigInt(protocolParameters.linearFee.minFeeA),
        BigInt(protocolParameters.linearFee.minFeeB),
        BigInt(protocolParameters.minFeeRefScriptCostPerByte)
      )
    )
    .key_deposit(BigInt(protocolParameters.keyDeposit))
    .pool_deposit(
      BigInt(protocolParameters.poolDeposit)
    )
    .max_tx_size(protocolParameters.maxTxSize)
    .max_value_size(protocolParameters.maxValSize)
    .ex_unit_prices(Loader.Cardano.ExUnitPrices.new(Loader.Cardano.Rational.new(0n, 1n), Loader.Cardano.Rational.new(0n, 1n)))
    .collateral_percentage(protocolParameters.collateralPercentage)
    .max_collateral_inputs(protocolParameters.maxCollateralInputs)
    .build();

  const txBuilder = Loader.Cardano.TransactionBuilder.new(txBuilderConfig);

  const output = outputs.get(0);
  txBuilder.add_output(
    Loader.Cardano.TransactionOutputBuilder.new()
      .with_address(output.address())
      .next()
      .with_value(output.amount())
      .build()
  );

  if (auxiliaryData) txBuilder.set_auxiliary_data(auxiliaryData);

  txBuilder.set_ttl(
    BigInt(
      (protocolParameters.slot + TX.invalid_hereafter).toString()
    )
  );

  utxos.forEach((utxo) => {
    txBuilder.add_input(
      Loader.Cardano.SingleInputBuilder.from_transaction_unspent_output(utxo).payment_key()
    )
  });

  return txBuilder.build(Loader.Cardano.ChangeSelectionAlgo.Default, Loader.Cardano.Address.from_bech32(account.paymentAddr)).build_unchecked();
};

export const signAndSubmit = async (
  tx,
  { keyHashes, accountIndex },
  password
) => {
  await Loader.load();
  const witnessSet = await signTx(
    Buffer.from(tx.to_cbor_bytes(), 'hex').toString('hex'),
    keyHashes,
    password,
    accountIndex
  );
  const transaction = Loader.Cardano.Transaction.new(
    tx.body(),
    witnessSet,
    true,
    tx.auxiliary_data()
  );

  const txHash = await submitTx(
    Buffer.from(transaction.to_cbor_bytes(), 'hex').toString('hex')
  );
  return txHash;
};

export const signAndSubmitHW = async (
  tx,
  { keyHashes, account, hw, partialSign }
) => {
  await Loader.load();

  const witnessSet = await signTxHW(
    Buffer.from(tx.to_cbor_bytes(), 'hex').toString('hex'),
    keyHashes,
    account,
    hw,
    partialSign
  );

  const transaction = Loader.Cardano.Transaction.new(
    tx.body(),
    witnessSet,
    true,
    tx.auxiliary_data()
  );

  try {
    const txHash = await submitTx(
      Buffer.from(transaction.to_cbor_bytes(), 'hex').toString('hex')
    );
    return txHash;
  } catch (e) {
    throw ERROR.submit;
  }
};

export const delegationTx = async (
  account,
  delegation,
  protocolParameters,
  poolKeyHash
) => {
  await Loader.load();

  const txBuilderConfig = Loader.Cardano.TransactionBuilderConfigBuilder.new()
    .coins_per_utxo_byte(
      BigInt(protocolParameters.coinsPerUtxoWord)
    )
    .fee_algo(
      Loader.Cardano.LinearFee.new(
        BigInt(protocolParameters.linearFee.minFeeA),
        BigInt(protocolParameters.linearFee.minFeeB),
        BigInt(protocolParameters.minFeeRefScriptCostPerByte)
      )
    )
    .key_deposit(BigInt(protocolParameters.keyDeposit))
    .pool_deposit(
      BigInt(protocolParameters.poolDeposit)
    )
    .max_tx_size(protocolParameters.maxTxSize)
    .max_value_size(protocolParameters.maxValSize)
    .ex_unit_prices(Loader.Cardano.ExUnitPrices.new(Loader.Cardano.Rational.new(0n, 1n), Loader.Cardano.Rational.new(0n, 1n)))
    .collateral_percentage(protocolParameters.collateralPercentage)
    .max_collateral_inputs(protocolParameters.maxCollateralInputs)
    .build();

  const txBuilder = Loader.Cardano.TransactionBuilder.new(txBuilderConfig);

  if (!delegation.active)
    txBuilder.add_cert(
      Loader.Cardano.SingleCertificateBuilder.new(
        Loader.Cardano.Certificate.new_stake_registration(
          Loader.Cardano.Credential.new_pub_key(
            Loader.Cardano.Ed25519KeyHash.from_raw_bytes(
              Buffer.from(account.stakeKeyHash, 'hex')
            )
          )
        )
      ).skip_witness()
    );

  txBuilder.add_cert(
    Loader.Cardano.SingleCertificateBuilder.new(
      Loader.Cardano.Certificate.new_stake_delegation(
        Loader.Cardano.Credential.new_pub_key(
          Loader.Cardano.Ed25519KeyHash.from_raw_bytes(
            Buffer.from(account.stakeKeyHash, 'hex')
          )
        ),
        Loader.Cardano.Ed25519KeyHash.from_raw_bytes(
          Buffer.from(poolKeyHash, 'hex')
        )
      )
    ).payment_key()
  );

  txBuilder.set_ttl(
    BigInt(
      (protocolParameters.slot + TX.invalid_hereafter).toString()
    )
  );

  const utxos = await getUtxos();

  utxos.forEach((utxo) => {
    txBuilder.add_input(
      Loader.Cardano.SingleInputBuilder.from_transaction_unspent_output(utxo).payment_key()
    )
  });

  return txBuilder.build(Loader.Cardano.ChangeSelectionAlgo.Default, Loader.Cardano.Address.from_bech32(account.paymentAddr)).build_unchecked();
};

export const withdrawalTx = async (account, delegation, protocolParameters) => {
  await Loader.load();

  const txBuilderConfig = Loader.Cardano.TransactionBuilderConfigBuilder.new()
    .coins_per_utxo_byte(
      BigInt(protocolParameters.coinsPerUtxoWord)
    )
    .fee_algo(
      Loader.Cardano.LinearFee.new(
        BigInt(protocolParameters.linearFee.minFeeA),
        BigInt(protocolParameters.linearFee.minFeeB),
        BigInt(protocolParameters.minFeeRefScriptCostPerByte)
      )
    )
    .key_deposit(BigInt(protocolParameters.keyDeposit))
    .pool_deposit(
      BigInt(protocolParameters.poolDeposit)
    )
    .max_tx_size(protocolParameters.maxTxSize)
    .max_value_size(protocolParameters.maxValSize)
    .ex_unit_prices(Loader.Cardano.ExUnitPrices.new(Loader.Cardano.Rational.new(0n, 1n), Loader.Cardano.Rational.new(0n, 1n)))
    .collateral_percentage(protocolParameters.collateralPercentage)
    .max_collateral_inputs(protocolParameters.maxCollateralInputs)
    .build();

  const txBuilder = Loader.Cardano.TransactionBuilder.new(txBuilderConfig);

  txBuilder.add_withdrawal(
    Loader.Cardano.SingleWithdrawalBuilder.new(
      Loader.Cardano.RewardAddress.from_address(
        Loader.Cardano.Address.from_bech32(account.rewardAddr)
      ),
      BigInt(delegation.rewards)
    ).payment_key()
  );

  txBuilder.set_ttl(
    BigInt(
      (protocolParameters.slot + TX.invalid_hereafter).toString()
    )
  );

  const utxos = await getUtxos();

  utxos.forEach((utxo) => {
    txBuilder.add_input(
      Loader.Cardano.SingleInputBuilder.from_transaction_unspent_output(utxo).payment_key()
    )
  });

  return txBuilder.build(Loader.Cardano.ChangeSelectionAlgo.Default, Loader.Cardano.Address.from_bech32(account.paymentAddr)).build_unchecked();
};

export const undelegateTx = async (account, delegation, protocolParameters) => {
  await Loader.load();

  const txBuilderConfig = Loader.Cardano.TransactionBuilderConfigBuilder.new()
    .coins_per_utxo_byte(
      BigInt(protocolParameters.coinsPerUtxoWord)
    )
    .fee_algo(
      Loader.Cardano.LinearFee.new(
        BigInt(protocolParameters.linearFee.minFeeA),
        BigInt(protocolParameters.linearFee.minFeeB),
        BigInt(protocolParameters.minFeeRefScriptCostPerByte)
      )
    )
    .key_deposit(BigInt(protocolParameters.keyDeposit))
    .pool_deposit(
      BigInt(protocolParameters.poolDeposit)
    )
    .max_tx_size(protocolParameters.maxTxSize)
    .max_value_size(protocolParameters.maxValSize)
    .ex_unit_prices(Loader.Cardano.ExUnitPrices.new(Loader.Cardano.Rational.new(0n, 1n), Loader.Cardano.Rational.new(0n, 1n)))
    .collateral_percentage(protocolParameters.collateralPercentage)
    .max_collateral_inputs(protocolParameters.maxCollateralInputs)
    .build();

  const txBuilder = Loader.Cardano.TransactionBuilder.new(txBuilderConfig);

  if (delegation.rewards > 0) {
    txBuilder.add_withdrawal(
      Loader.Cardano.SingleWithdrawalBuilder.new(
        Loader.Cardano.RewardAddress.from_address(
          Loader.Cardano.Address.from_bech32(account.rewardAddr)
        ),
        BigInt(delegation.rewards)
      ).payment_key()
    );
  }

  txBuilder.add_cert(
    Loader.Cardano.SingleCertificateBuilder.new(
      Loader.Cardano.Certificate.new_stake_deregistration(
        Loader.Cardano.Credential.new_pub_key(
          Loader.Cardano.Ed25519KeyHash.from_raw_bytes(
            Buffer.from(account.stakeKeyHash, 'hex')
          )
        )
      )
    ).payment_key()
  );

  txBuilder.set_ttl(
    BigInt(
      (protocolParameters.slot + TX.invalid_hereafter).toString()
    )
  );

  const utxos = await getUtxos();

  utxos.forEach((utxo) => {
    txBuilder.add_input(
      Loader.Cardano.SingleInputBuilder.from_transaction_unspent_output(utxo).payment_key()
    )
  });

  return txBuilder.build(Loader.Cardano.ChangeSelectionAlgo.Default, Loader.Cardano.Address.from_bech32(account.paymentAddr)).build_unchecked();
};
