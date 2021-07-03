import CoinSelection from '../lib/coinSelection.js';
import Loader from '../api/loader';
import {
  Address,
  TransactionUnspentOutput,
  Value,
} from '@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';
import { utxoToStructure } from '../api/extension/wallet';
import { getUtxos } from '../api/extension/index';
import { assetsToValue } from '../api/extension/wallet';

let reqOutputs = [
  {
    address:
      'addr_test1qp8znjn7vn2vymnrkvlj2thfj45n7ncs9w9hahe7yj5n7fu0rg3ll6e9du5vqajcfa2y3udecptl9n7d2qlvgrpngvvsr0273w',
    amount: [{ unit: 'lovelace', quantity: '100000000' }],
  },
  {
    address:
      'addr_test1qp8znjn7vn2vymnrkvlj2thfj45n7ncs9w9hahe7yj5n7fu0rg3ll6e9du5vqajcfa2y3udecptl9n7d2qlvgrpngvvsr0273w',
    amount: [
      { unit: 'lovelace', quantity: '50000000' },
      { unit: '09809090.SpaceBudz_00001', quantity: '1' },
      { unit: '82828271.berrycoin', quantity: '25000000000' },
    ],
  },
];

let utxoList = [
  {
    tx_hash: '524e441fd5d890ebcddda1ed740a6c313c4bed45853dd10035d3819d593af915',
    tx_index: 0,
    output_index: 0,
    amount: [
      { unit: 'lovelace', quantity: '1000000' },
      { unit: '09809090.SpaceBudz_00004', quantity: '1' },
    ],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash: 'af84e14238ee97dbe3f7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [{ unit: 'lovelace', quantity: '876543' }],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash: 'af84e14238ee97dbe3f7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [
      { unit: 'lovelace', quantity: '1000000' },
      { unit: '82828271.berrycoin', quantity: '115000432' },
    ],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash: 'af84e14238ee97dbe3f7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [{ unit: 'lovelace', quantity: '1000000000' }],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash: 'af84e14238ee97dbe3f7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [
      { unit: 'lovelace', quantity: '350000000' },
      { unit: '09809090.SpaceBudz_00002', quantity: '1' },
    ],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(5)af84e14238ee97dbe3f7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [
      { unit: 'lovelace', quantity: '10000000' },
      { unit: '82828271.berrycoin', quantity: '10000000000' },
    ],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash: 'af84e14238ee97dbe3f7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [
      { unit: 'lovelace', quantity: '1000000' },
      { unit: '82828271.berrycoin', quantity: '1000000000' },
    ],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash: 'af84e14238ee97dbe3f7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [{ unit: 'lovelace', quantity: '800000000' }],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash: 'af84e14238ee97dbe3f7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [{ unit: 'lovelace', quantity: '4000000000' }],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash: 'af84e14238ee97dbe3f7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [
      { unit: 'lovelace', quantity: '1000000' },
      { unit: '09809090.SpaceBudz_00003', quantity: '1' },
      { unit: '82828271.berrycoin', quantity: '500000000' },
    ],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash: 'af84e14238ee97dbef7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [
      { unit: 'lovelace', quantity: '5043032' },
      { unit: '09809090.SpaceBudz_00001', quantity: '1' },
    ],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(11)af84e14238ee97dbef7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [
      { unit: 'lovelace', quantity: '10000000' },
      { unit: '82828271.berrycoin', quantity: '15987987654' },
    ],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(12)af84e14238ee97dbef7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [
      { unit: 'lovelace', quantity: '15000000' },
      { unit: '82828271.berrycoin', quantity: '1598987654' },
    ],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(13)af84e14238ee97dbef7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [{ unit: 'lovelace', quantity: '5000000' }],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(14)af84e14238ee97dbef7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [
      { unit: 'lovelace', quantity: '1746352' },
      { unit: '82828271.berrycoin', quantity: '987654' },
    ],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(15)af84e14238ee97dbef7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [
      { unit: 'lovelace', quantity: '1000000' },
      { unit: '09809090.SpaceBudz_00005', quantity: '1' },
    ],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(16)af84e14238ee97dbef7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [{ unit: 'lovelace', quantity: '250000000' }],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(17)af84e14238ee97dbef7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [{ unit: 'lovelace', quantity: '800000000' }],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(18)af84e14238ee97dbef7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [{ unit: 'lovelace', quantity: '1250000000' }],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(19)af84e14238ee97dbef7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [{ unit: 'lovelace', quantity: '35000000' }],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(20)af84e14238ee97dbef7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [{ unit: 'lovelace', quantity: '330000000000' }],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(21)af84e14238ee97dbef7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [{ unit: 'lovelace', quantity: '100000000' }],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(22)af84e14238ee97dbef7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [{ unit: 'lovelace', quantity: '125000000' }],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(23)af84e14238ee97dbef7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [{ unit: 'lovelace', quantity: '10456456' }],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(24)af84e14238ee97dbef7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [{ unit: 'lovelace', quantity: '10123123' }],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(25)af84e14238ee97dbef7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [{ unit: 'lovelace', quantity: '10987654' }],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(26)af84e14238ee97dbef7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [{ unit: 'lovelace', quantity: '10123456' }],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
];

const utxos = [
  {
    txHash: 'ab19f49bfa03fa14cc9d58b169c5547da59f8135f871e19962a4777d4040db27',
    txId: 0,
    amount: [
      {
        unit: 'lovelace',
        quantity: '998930164',
      },
      {
        unit: '1e852216c006c55490cd85b6e0ba523a37c2be3526f479e61cca41eb436f6f6c',
        quantity: '10',
      },
      {
        unit: '1e852216c006c55490cd85b6e0ba523a37c2be3526f479e61cca41eb4e616d69',
        quantity: '1',
      },
    ],
  },
  {
    txHash: 'ab19f49bfa03fa14cc9d58b169c5547da59f8135f871e19962a4777d4040db27',
    txId: 0,
    amount: [
      {
        unit: 'lovelace',
        quantity: '998930164',
      },
      {
        unit: '1e852216c006c55490cd85b6e0ba523a37c2be3526f479e61cca41eb436f6f6c',
        quantity: '10',
      },
      {
        unit: '1e852216c006c55490cd85b6e0ba523a37c2be3526f479e61cca41eb4e616d69',
        quantity: '1',
      },
    ],
  },
];

const receiver = [
  {
    address:
      'addr_test1qq90qrxyw5qtkex0l7mc86xy9a6xkn5t3fcwm6wq33c38t8nhh356yzp7k3qwmhe4fk0g5u6kx5ka4rz5qcq4j7mvh2sts2cfa',
    amount: [{ unit: 'lovelace', quantity: '80000000' }],
  },
];

// let result1 = CoinSelection.randomImprove(utxoList, reqOutputs, 20, 1000000);
// let result2 = CoinSelection.randomImprove(utxos, receiver, 20, 1000000);
//
// console.log(result1, result2);

export const test = async () => {
  // let inputs = await getUtxos(undefined, undefined, false);
  //
  // let outputs = Loader.Cardano.TransactionOutputs.new();
  // outputs.add(
  //   new Loader.Cardano.TransactionOutput(
  //     new Loader.Cardano.Address.from_bech32(
  //       'addr_test1qp8znjn7vn2vymnrkvlj2thfj45n7ncs9w9hahe7yj5n7fu0rg3ll6e9du5vqajcfa2y3udecptl9n7d2qlvgrpngvvsr0273w',
  //       assetsToValue(reqOutputs.amount)
  //     )
  //   )
  // );
  //
  // let result3 = CoinSelection.randomImprove(inputs, outputs, 20, 1000000);
  // console.log(result3);
};
