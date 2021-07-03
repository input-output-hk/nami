import CoinSelection from '../lib/coinSelection.js';
import Loader from '../api/loader';
import {
  Address,
  TransactionUnspentOutput,
  Value,
} from '@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';
import { getUtxos } from '../api/extension/index';

export const test = async () => {
  let inputs = await getUtxos(undefined, undefined, false);

  let outputs = Loader.Cardano.TransactionOutputs.new();

  outputs.add(
    Loader.Cardano.TransactionOutput.new(
      Loader.Cardano.Address.from_bech32(
        'addr_test1qp8znjn7vn2vymnrkvlj2thfj45n7ncs9w9hahe7yj5n7fu0rg3ll6e9du5vqajcfa2y3udecptl9n7d2qlvgrpngvvsr0273w'
      ),
      Loader.Cardano.Value.new(Loader.Cardano.BigNum.from_str('100000000'))
    )
  );

  let changeIndexToFindMultiasset = 1;
  let haveMultiasset =
    inputs[changeIndexToFindMultiasset].output().amount().multiasset() &&
    inputs[changeIndexToFindMultiasset].output().amount().multiasset().len() >
      0;

  console.log(
    haveMultiasset
      ? `Index ${changeIndexToFindMultiasset} have multiassets`
      : `Sorry, index ${changeIndexToFindMultiasset} don't have any multiassets`
  );

  outputs.add(inputs[1].output());

  let result3 = await CoinSelection.randomImprove(inputs, outputs, 20, 1000000);
  let requestedLovelace = (
    BigInt(result3.amount.coin().to_str()) -
    BigInt(result3.change.coin().to_str())
  ).toString();
  console.log(
    result3,
    'accumulated:' + result3.amount.coin().to_str(),
    'change: ' + result3.change.coin().to_str(),
    'requested lovelace: ' + requestedLovelace
  );
};
