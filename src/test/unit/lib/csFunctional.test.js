test('', () => {});
// import Loader from '../../../api/loader';
// import { utxoFromJson } from '../../../api/util';
// import manyMinValue from './utxo/manyMinValue.json';
// import singleSet from './utxo/singleUtxo.json';
// import manySmallSet from './utxo/manySmall.json';
// import smallSet from './utxo/smallSet.json';
// import mediumSet from './utxo/manySmall.json';
// import largeSet from './utxo/largeSet.json';
// import CoinSelection from '../../../lib/coinSelection';

// const protocolParameters = {
//   linearFee: {
//     minFeeA: '44',
//     minFeeB: '155381',
//   },
//   coinsPerUtxoWord: '34482',
//   maxTxSize: '16384',
// };

// const PRESETS = {
//   coinSelectionLimit: 20,
//   minimalAmount: '1',
//   address:
//     '01e7d6272a3fd204337a371bbe051be60fa0e98ef66142ffc9bc43a0e408ee0af4719df41c3d78b9439ea41cfff4574159b49c0c49ef50c6b3',
// };

// /**
//  * Uncomment UTxO set to have them tested
//  * Larger UTxO set are commented on purpose to speed up the test suite
//  */
// const UTxO_SETS = {
//   'Single UTxO Set': getUTxOSet(singleSet),
//   'Small UTxO Set': getUTxOSet(smallSet),
//   'Medium UTxO Set': getUTxOSet(mediumSet),
//   'Many Min Value UTxO Set': getUTxOSet(manyMinValue),
//   'Many small UTxO Set': getUTxOSet(manySmallSet),
//   // 'Large UTxO Set': getUTxOSet(largeSet)
// };

// beforeAll(async () => {
//   Loader.load();
//   return CoinSelection.setProtocolParameters(
//     protocolParameters.coinsPerUtxoWord,
//     protocolParameters.linearFee.minFeeA,
//     protocolParameters.linearFee.minFeeB,
//     protocolParameters.maxTxSize.toString()
//   );
// });

// async function getOutputs(uTxOSet) {
//   return {
//     min: generateMinAdaOutputs(),
//     max: generateMaxAdaOutputs(uTxOSet),
//     every: generateAssetsOuputs(uTxOSet),
//     allAssets: generateMaxAssetsOutputs(uTxOSet),
//     many: generateManyOutputs(uTxOSet),
//   };
// }

// describe('Minimal ADA without assets', () => {
//   for (const utxoType in UTxO_SETS) {
//     test(utxoType, async () => {
//       const utxo = await UTxO_SETS[utxoType];
//       const outputs = await getOutputs(utxo);

//       const minimumValue = Loader.Cardano.min_ada_required(
//         Loader.Cardano.Value.new(
//           Loader.Cardano.BigNum.from_str(PRESETS.minimalAmount)
//         ),
//         false,
//         Loader.Cardano.BigNum.from_str(protocolParameters.coinsPerUtxoWord)
//       ).to_str();

//       const selection = await CoinSelection.randomImprove(
//         utxo,
//         outputs.min,
//         PRESETS.coinSelectionLimit
//       );

//       expect(selection.input).toBeDefined();
//       expect(selection.output).toBeDefined();
//       expect(selection.remaining).toBeDefined();
//       expect(selection.amount).toBeDefined();
//       expect(selection.change).toBeDefined();

//       // Test selection.input
//       expect(selection.input.length).toBeGreaterThanOrEqual(1);
//       // Test selection.remaining
//       if (utxo.length > 1) {
//         expect(selection.remaining.length).toBeGreaterThanOrEqual(1);
//       } else {
//         expect(selection.remaining.length).toBe(0);
//       }
//       // Test selection.amount
//       expect(BigInt(selection.amount.coin().to_str())).toBeGreaterThanOrEqual(
//         BigInt(minimumValue)
//       );
//       // Test selection.change
//       expect(BigInt(selection.change.coin().to_str())).toBeGreaterThanOrEqual(
//         BigInt(minimumValue)
//       );
//     });
//   }
// });

// describe('Maximal ADA without assets', () => {
//   for (const utxoType in UTxO_SETS) {
//     test(utxoType, async () => {
//       const utxo = await UTxO_SETS[utxoType];
//       const outputs = await getOutputs(utxo);

//       const selection = await CoinSelection.randomImprove(
//         utxo,
//         outputs.max,
//         PRESETS.coinSelectionLimit
//       );

//       expect(selection.input).toBeDefined();
//       expect(selection.output).toBeDefined();
//       expect(selection.remaining).toBeDefined();
//       expect(selection.amount).toBeDefined();
//       expect(selection.change).toBeDefined();

//       // Test selection.input
//       expect(selection.input.length).toBeGreaterThanOrEqual(1);
//       // Test selection.remaining
//       expect(selection.remaining.length).toBe(0);
//       // Test selection.amount
//       expect(BigInt(selection.amount.coin().to_str())).toBe(
//         BigInt(outputs.max.get(0).amount().coin().to_str())
//       );
//       // Test selection.change
//       expect(selection.change.coin().to_str()).toBe('0');
//     });
//   }
// });

// describe('Every single assets in isolation', () => {
//   for (const utxoType in UTxO_SETS) {
//     test(utxoType, async () => {
//       const utxo = await UTxO_SETS[utxoType];
//       const outputs = await getOutputs(utxo);

//       for (let i = 0; i < outputs.every.len(); i++) {
//         const testOutput = outputs.every.get(i);
//         const testOutputs = Loader.Cardano.TransactionOutputs.new();
//         testOutputs.add(testOutput);

//         const selection = await CoinSelection.randomImprove(
//           utxo,
//           testOutputs,
//           PRESETS.coinSelectionLimit
//         );

//         expect(selection.input).toBeDefined();
//         expect(selection.output).toBeDefined();
//         expect(selection.remaining).toBeDefined();
//         expect(selection.amount).toBeDefined();
//         expect(selection.change).toBeDefined();

//         // Test selection.input
//         expect(selection.input.length).toBeGreaterThanOrEqual(1);
//         // Test selection.remaining
//         if (utxo.length > 1) {
//           expect(selection.remaining.length).toBeGreaterThanOrEqual(1);
//         } else {
//           expect(selection.remaining.length).toBe(0);
//         }
//         // Test selection.amount
//         expect(
//           CoinSelection.compare(selection.amount, testOutput.amount())
//         ).toBeGreaterThanOrEqual(0);
//         // Test selection.change
//         expect(BigInt(selection.change.coin().to_str())).toBeGreaterThan(
//           BigInt(0)
//         );
//       }
//     });
//   }
// });

// describe('CoinSelection with all assets w/o ADA', () => {
//   for (const utxoType in UTxO_SETS) {
//     test(utxoType, async () => {
//       const utxo = await UTxO_SETS[utxoType];
//       const outputs = await getOutputs(utxo);

//       const selection = await CoinSelection.randomImprove(
//         utxo,
//         outputs.allAssets,
//         PRESETS.coinSelectionLimit
//       );

//       expect(selection.input).toBeDefined();
//       expect(selection.output).toBeDefined();
//       expect(selection.remaining).toBeDefined();
//       expect(selection.amount).toBeDefined();
//       expect(selection.change).toBeDefined();

//       // Test selection.input
//       expect(selection.input.length).toBeGreaterThanOrEqual(1);
//       // Test selection.remaining
//       if (utxo.length > 1) {
//         expect(selection.remaining.length).toBeGreaterThanOrEqual(1);
//       } else {
//         expect(selection.remaining.length).toBe(0);
//       }
//       // Test selection.amount
//       expect(selection.amount.multiasset().len()).toEqual(
//         outputs.allAssets.get(0).amount().multiasset().len()
//       );
//       // Test selection.change
//       expect(BigInt(selection.change.coin().to_str())).toBeGreaterThan(
//         BigInt(0)
//       );
//     });
//   }
// });

// describe('CoinSelection with many requested outputs', () => {
//   for (const utxoType in UTxO_SETS) {
//     test(utxoType, async () => {
//       const utxo = await UTxO_SETS[utxoType];
//       const outputs = await getOutputs(utxo);

//       const selection = await CoinSelection.randomImprove(
//         utxo,
//         outputs.many,
//         PRESETS.coinSelectionLimit
//       );

//       expect(selection.input).toBeDefined();
//       expect(selection.output).toBeDefined();
//       expect(selection.remaining).toBeDefined();
//       expect(selection.amount).toBeDefined();
//       expect(selection.change).toBeDefined();

//       // Test selection.input
//       expect(selection.input.length).toBeGreaterThanOrEqual(1);
//       // Test selection.remaining
//       expect(selection.remaining.length).toBe(0);
//       // Test selection.amount
//       expect(BigInt(selection.amount.coin().to_str())).toBeGreaterThan(
//         BigInt(0)
//       );
//       expect(selection.amount.multiasset()).toBeDefined();
//       // Test selection.change
//       expect(BigInt(selection.change.coin().to_str())).toBe(BigInt(BigInt(0)));
//     });
//   }
// });

// async function getUTxOSet(utxoSet) {
//   return await Promise.all(
//     utxoSet.map(async (utxo) => await utxoFromJson(utxo, PRESETS.address))
//   );
// }

// function generateMinAdaOutputs() {
//   const outputs = Loader.Cardano.TransactionOutputs.new();
//   const output = Loader.Cardano.TransactionOutput.new(
//     Loader.Cardano.Address.from_bytes(Buffer.from(PRESETS.address, 'hex')),
//     Loader.Cardano.Value.new(
//       Loader.Cardano.min_ada_required(
//         Loader.Cardano.Value.new(
//           Loader.Cardano.BigNum.from_str(PRESETS.minimalAmount)
//         ),
//         false,
//         Loader.Cardano.BigNum.from_str(protocolParameters.coinsPerUtxoWord)
//       )
//     )
//   );
//   outputs.add(output);

//   return outputs;
// }

// function generateMaxAdaOutputs(uTxOSet) {
//   const compiledAmount = compileUTxOAmount(uTxOSet);
//   const outputs = Loader.Cardano.TransactionOutputs.new();
//   const emptyMultiAsset = Loader.Cardano.MultiAsset.new();
//   const output = Loader.Cardano.TransactionOutput.new(
//     Loader.Cardano.Address.from_bytes(Buffer.from(PRESETS.address, 'hex')),
//     compiledAmount
//   );
//   output.amount().set_multiasset(emptyMultiAsset);
//   outputs.add(output);

//   return outputs;
// }

// function generateMaxAssetsOutputs(uTxOSet) {
//   const compiledAmount = compileUTxOAmount(uTxOSet);
//   const outputs = Loader.Cardano.TransactionOutputs.new();
//   compiledAmount.set_coin(Loader.Cardano.BigNum.from_str('0'));
//   const output = Loader.Cardano.TransactionOutput.new(
//     Loader.Cardano.Address.from_bytes(Buffer.from(PRESETS.address, 'hex')),
//     compiledAmount
//   );
//   outputs.add(output);

//   return outputs;
// }

// function generateAssetsOuputs(uTxOSet) {
//   const compiledAmount = compileUTxOAmount(uTxOSet);
//   const split = CoinSelection.splitAmounts(compiledAmount);
//   const outputs = Loader.Cardano.TransactionOutputs.new();

//   for (const amount of split) {
//     if (amount.multiasset() && amount.multiasset().len()) {
//       const output = Loader.Cardano.TransactionOutput.new(
//         Loader.Cardano.Address.from_bytes(Buffer.from(PRESETS.address, 'hex')),
//         amount
//       );
//       outputs.add(output);
//     }
//   }

//   return outputs;
// }

// function generateManyOutputs(uTxOSet) {
//   const compiledAmount = compileUTxOAmount(uTxOSet);
//   const split = CoinSelection.splitAmounts(compiledAmount);
//   const outputs = Loader.Cardano.TransactionOutputs.new();

//   for (const amount of split) {
//     const output = Loader.Cardano.TransactionOutput.new(
//       Loader.Cardano.Address.from_bytes(Buffer.from(PRESETS.address, 'hex')),
//       amount
//     );
//     outputs.add(output);
//   }

//   return outputs;
// }

// function compileUTxOAmount(utxoList) {
//   let compiledAmount = Loader.Cardano.Value.new(
//     Loader.Cardano.BigNum.from_str('0')
//   );
//   let emptyMultiasset = Loader.Cardano.MultiAsset.new();
//   compiledAmount.set_multiasset(emptyMultiasset);
//   for (const utxo of utxoList) {
//     compiledAmount = compiledAmount.checked_add(utxo.output().amount());
//   }
//   return compiledAmount;
// }
