let reqOutputs = [
  {
    address: 'addr_test1qpndlx95xlnn8t(...)9n7d2qlvgrpngvvsggsysr',
    amount: [{ unit: 'lovelace', quantity: 100000000 }],
  },
  {
    address: 'addr_test1qpndlx95xlnn8t(...)9n7d2qlvgrpngvvsggsysr',
    amount: [
      { unit: 'lovelace', quantity: 50000000 },
      { unit: '09809090.SpaceBudz_00001', quantity: 1 },
      { unit: '82828271.berrycoin', quantity: 25000000000 },
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
    amount: [
      { unit: 'lovelace', quantity: '1000000' },
      { unit: '82828271.berrycoin', quantity: 115000432 },
    ],
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
      { unit: 'lovelace', quantity: '10000000' },
      { unit: '82828271.berrycoin', quantity: 10000000000 },
    ],
    block: '94180eb052c054584ff54fbdc2f09649744c3cbe055fb7d28140b51467f33ba3',
  },
  {
    tx_hash:
      '(6)af84e14238ee97dbe3f7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [
      { unit: 'lovelace', quantity: '1000000' },
      { unit: '82828271.berrycoin', quantity: 1000000000 },
    ],
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
      { unit: '82828271.berrycoin', quantity: 500000000 },
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
  {
    tx_hash:
      '(11)af84e14238ee97dbef7a3cc4dd8d0b2d23bade99a2e07e54f54f5f99f1424e5',
    tx_index: 0,
    output_index: 0,
    amount: [
      { unit: 'lovelace', quantity: '10000000' },
      { unit: '82828271.berrycoin', quantity: 15987987654 },
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
      { unit: '82828271.berrycoin', quantity: 1598987654 },
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
      { unit: '82828271.berrycoin', quantity: 987654 },
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

const CoinSelection = require('./CoinSelection');

let result = CoinSelection.randomImprove(utxoList, reqOutputs, 20);

console.log(result);
