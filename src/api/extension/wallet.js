import { getNetwork, signTx, submitTx } from '.';
import { EVENT, SENDER, TARGET } from '../../config/config';
import provider from '../../config/provider';
import Loader from '../loader';
import CoinSelection from '../../lib/coinSelection';

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
  const network = await getNetwork();
  const latest_block = await fetch(
    provider.api.base(network) + '/blocks/latest',
    { headers: provider.api.key(network) }
  ).then((res) => res.json());

  const p = await fetch(
    provider.api.base(network) + `/epochs/${latest_block.epoch}/parameters`,
    { headers: provider.api.key(network) }
  ).then((res) => res.json());

  return {
    linearFee: Loader.Cardano.LinearFee.new(
      Loader.Cardano.BigNum.from_str(p.min_fee_a.toString()),
      Loader.Cardano.BigNum.from_str(p.min_fee_b.toString())
    ),
    minUtxo: Loader.Cardano.BigNum.from_str(p.min_utxo),
    poolDeposit: Loader.Cardano.BigNum.from_str(p.pool_deposit),
    keyDeposit: Loader.Cardano.BigNum.from_str(p.key_deposit),
  };
};

export const utxoToCbor = async (output) => {
  await Loader.load();
  return {
    input: Buffer.from(
      Loader.Cardano.TransactionInput.new(
        Loader.Cardano.TransactionHash.from_bytes(
          Buffer.from(output.tx_hash, 'hex')
        ),
        output.output_index
      ).to_bytes(),
      'hex'
    ).toString('hex'),
    value: Buffer.from(
      (await assetsToValue(output.amount)).to_bytes(),
      'hex'
    ).toString('hex'),
  };
};

export const cborToUtxo = async (cborObject) => {
  await Loader.load();
  const input = Loader.Cardano.TransactionInput.from_bytes(
    cborObject.input,
    'hex'
  );
  const assets = await valueToAssets(
    Loader.Cardano.Value.from_bytes(cborObject.value)
  );
  return {
    txHash: Buffer.from(input.transaction_id().to_bytes(), 'hex').toString(
      'hex'
    ),
    txId: input.index(),
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
  value.set_multiasset(multiAsset);
  return value;
};

export const valueToAssets = async (value) => {
  const assets = [];
  assets.push({ unit: 'lovelace', quantity: value.coin().to_str() });
  if (value.multiasset()) {
    for (let j = 0; j < value.multiasset().keys().len(); j++) {
      const policy = value.multiasset().keys().get(j);
      const policyAssets = value.multiasset().get(policy);
      for (let k = 0; k < policyAssets.keys().len(); k++) {
        const policyAsset = policyAssets.keys().get(k);
        const quantity = policyAssets.get(policyAsset);
        const asset =
          Buffer.from(policy.to_bytes(), 'hex').toString('hex') +
          Buffer.from(policyAsset.name(), 'hex').toString('hex');
        assets.push({ unit: asset, quantity });
      }
    }
  }
  return assets;
};

export const minRequiredAda = async (value, utxoVal) => {
  await Loader.load();
  return Loader.Cardano.min_ada_required(value, utxoVal);
};

export const buildTx = async (account, utxos, outputs, protocolParameters) => {
  await Loader.load();
  const inputs = CoinSelection.randomImprove(utxos, outputs, 20).input;
  const txBuilder = Loader.Cardano.TransactionBuilder.new(
    protocolParameters.linearFee,
    protocolParameters.minUtxo,
    protocolParameters.poolDeposit,
    protocolParameters.keyDeposit
  );

  console.log(inputs);
  console.log(account.paymentAddr);

  await Promise.all(
    inputs.map(async (input) => {
      txBuilder.add_input(
        Loader.Cardano.Address.from_bech32(account.paymentAddr),
        Loader.Cardano.TransactionInput.new(
          Loader.Cardano.TransactionHash.from_bytes(
            Buffer.from(input.txHash, 'hex')
          ),
          input.txId
        ),
        await assetsToValue(input.amount)
      );
    })
  );

  await Promise.all(
    outputs.map(async (output) => {
      txBuilder.add_output(
        Loader.Cardano.TransactionOutput.new(
          Loader.Cardano.Address.from_bech32(output.address),
          await assetsToValue(output.amount)
        )
      );
    })
  );

  txBuilder.add_change_if_needed(
    Loader.Cardano.Address.from_bech32(account.paymentAddr)
  );

  const transaction = Loader.Cardano.Transaction.new(
    txBuilder.build(),
    Loader.Cardano.TransactionWitnessSet.new()
  );

  return transaction;
};

export const signAndSubmit = async (account, tx) => {
  const signedTx = await signTx(
    Buffer.from(tx.to_bytes(), 'hex').toString('hex'),
    [account.paymentKeyHash],
    '12345678',
    account.index
  );
  const txHash = await submitTx(signedTx);
  return txHash;
};
