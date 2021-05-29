let reqOutputs = [
  {
    address: 'addr_test1qpndlx95xlnn8t(...)9n7d2qlvgrpngvvsggsysr',
    amount: [{ unit: 'lovelace', quantity: 500000000 }],
  },
  {
    address: 'addr_test1qpndlx95xlnn8t(...)9n7d2qlvgrpngvvsggsysr',
    amount: [
      { unit: 'lovelace', quantity: 10000000 },
      { unit: '09809090.SpaceBudz_00001', quantity: 1 },
      { unit: '82828271.berrycoin', quantity: 25000000000 },
    ],
  },
  {
    address: 'addr_test1qpndlx95xlnn8t(...)9n7d2qlvgrpngvvsggsysr',
    amount: [
      { unit: 'lovelace', quantity: 3440000 },
      { unit: '82828271.berrycoin', quantity: 75000000000 },
      { unit: '09809090.SpaceBudz_00002', quantity: 1 },
    ],
  },
];

let utxoList = [
  {
    tx_hash:
      '(0)af84e14238ee97dbe3f7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [
      { unit: 'lovelace', quantity: '1000000' },
      { unit: '09809090.SpaceBudz_00004', quantity: 1 },
    ],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(1)af84e14238ee97dbe3f7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [{ unit: 'lovelace', quantity: '876543' }],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(2)af84e14238ee97dbe3f7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [{ unit: 'lovelace', quantity: '5000000000' }],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(3)af84e14238ee97dbe3f7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [{ unit: 'lovelace', quantity: '1000000000' }],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(4)af84e14238ee97dbe3f7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [
      { unit: 'lovelace', quantity: '350000000' },
      { unit: '09809090.SpaceBudz_00002', quantity: 1 },
    ],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(5)af84e14238ee97dbe3f7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [
      { unit: 'lovelace', quantity: '100000000' },
      { unit: '82828271.berrycoin', quantity: 100000000000 },
    ],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(6)af84e14238ee97dbe3f7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [{ unit: 'lovelace', quantity: '80000000' }],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(7)af84e14238ee97dbe3f7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [{ unit: 'lovelace', quantity: '800000000' }],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(8)af84e14238ee97dbe3f7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [{ unit: 'lovelace', quantity: '4000000000' }],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(9)af84e14238ee97dbe3f7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [
      { unit: 'lovelace', quantity: '1000000' },
      { unit: '09809090.SpaceBudz_00003', quantity: 1 },
    ],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(10)af84e14238ee97dbef7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [
      { unit: 'lovelace', quantity: '5043032' },
      { unit: '09809090.SpaceBudz_00001', quantity: 1 },
    ],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
];

const CoinSelection = require('./CoinSelection');

let result = CoinSelection.randomImprove(utxoList, reqOutputs, 20);

console.log(result);
