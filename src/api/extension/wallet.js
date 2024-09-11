import { getBlazeProvider, getUtxos, signTx, signTxHW, submitTx } from '.';
import { ERROR, TX } from '../../config/config';
import Loader from '../loader';
import { blockfrostRequest } from '../util';
import { decodeTx, encodeTx, transformTx } from 'cardano-hw-interop-lib';
import { TransactionOutput, AuxiliaryData, Address, Credential, PoolId, RewardAccount } from '@blaze-cardano/core';

const RETRIES = 5;

export const initTx = async () => {
  const latest_block = await blockfrostRequest('/blocks/latest');
  const p = await blockfrostRequest(`/epochs/latest/parameters`);

  return {
    linearFee: {
      minFeeA: p.min_fee_a.toString(),
      minFeeB: p.min_fee_b.toString(),
    },
    minUtxo: '1000000', //p.min_utxo, minUTxOValue protocol parameter has been removed since Alonzo HF. Calculation of minADA works differently now, but 1 minADA still sufficient for now
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

/**
 * Makes sure the transaction is CIP-0021 compliant.
 *
 * @param tx The transaction to transform to canonical form (if needed).
 *
 * @return {Transaction} the new canonical transaction
 */
const toCanonicalTx = (tx) => {
  const canonicalCbor = encodeTx(transformTx(decodeTx(tx.to_cbor_bytes())));
  return Loader.Cardano.Transaction.from_cbor_bytes(canonicalCbor);
}

export const buildTx = async (
  account,
  utxos,
  outputs,
  protocolParameters,
  auxiliaryData = null
) => {
  try {
    await Loader.load();

    const blaze = await getBlazeProvider();

    const tx = blaze
      .newTransaction()
      .addOutput(TransactionOutput.fromCbor(outputs.get(0).to_cbor_hex()));

    if (auxiliaryData) tx.setAuxiliaryData(AuxiliaryData.fromCbor(auxiliaryData.to_cbor_hex()));

    tx.setValidUntil(BigInt(
      (protocolParameters.slot + TX.invalid_hereafter).toString()
    ));

    tx.setChangeAddress(Address.fromBech32(account.paymentAddr));

    const result = await tx.complete();

    return toCanonicalTx(Loader.Cardano.Transaction.from_cbor_hex(result.toCbor()));
  } catch (e) {
    console.error(e);
    throw e;
  }
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
  try {
    await Loader.load();

    const blaze = await getBlazeProvider();
    const tx = blaze.newTransaction();

    if (!delegation.active)
      tx.addRegisterStake(Credential.fromCore({
        type: 0,
        hash: account.stakeKeyHash
      }));

    tx.addDelegation(Credential.fromCore({
        type: 0,
        hash: account.stakeKeyHash
      }),
      PoolId.fromKeyHash(poolKeyHash)
    );

    tx.setValidUntil(BigInt(
      (protocolParameters.slot + TX.invalid_hereafter).toString()
    ));

    tx.setChangeAddress(Address.fromBech32(account.paymentAddr));

    const result = await tx.complete();

    return toCanonicalTx(Loader.Cardano.Transaction.from_cbor_hex(result.toCbor()));
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const withdrawalTx = async (account, delegation, protocolParameters) => {
  try {
    await Loader.load();

    const blaze = await getBlazeProvider();
    const tx = blaze.newTransaction();

    if (delegation.rewards > 0) {
      tx.addWithdrawal(RewardAccount(account.rewardAddr), delegation.rewards);
    }

    tx.setValidUntil(BigInt(
      (protocolParameters.slot + TX.invalid_hereafter).toString()
    ));

    tx.setChangeAddress(Address.fromBech32(account.paymentAddr));

    const result = await tx.complete();

    return toCanonicalTx(Loader.Cardano.Transaction.from_cbor_hex(result.toCbor()));
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const undelegateTx = async (account, delegation, protocolParameters) => {
  await Loader.load();

  let isTxBuilt = false;
  let selectionRetries = RETRIES;

  while (!isTxBuilt && selectionRetries > 0) {
    try {
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

      const changeAddress = Loader.Cardano.Address.from_bech32(account.paymentAddr);

      // We need to add one output for input selection to work.
      txBuilder.add_output(
        Loader.Cardano.TransactionOutputBuilder.new()
          .with_address(changeAddress)
          .next()
          .with_value(Loader.Cardano.Value.new(BigInt(protocolParameters.minUtxo), Loader.Cardano.MultiAsset.new()))
          .build()
      );

      utxos.forEach((utxo) => {
        const input = Loader.Cardano.SingleInputBuilder
          .from_transaction_unspent_output(utxo)
          .payment_key();

        txBuilder.add_utxo(input);
      });

      txBuilder.select_utxos(Loader.Cardano.CoinSelectionStrategyCIP2.RandomImproveMultiAsset);
      txBuilder.add_change_if_needed(changeAddress, false);

      return toCanonicalTx(
        txBuilder.build(Loader.Cardano.ChangeSelectionAlgo.Default, changeAddress).build_unchecked()
      );
    }
    catch (e) {
      console.error(e);

      if (selectionRetries > 0) {
        --selectionRetries;
        continue;
      }

      throw e;
    }
  }
};
