import Loader from '../../../api/loader';
import { utxoFromJson } from '../../../api/util';
import largeSet from './utxo/large-set.json';
import singleSet from './utxo/single-utxo.json';
import manySmallSet from './utxo/many-small.json';
import mediumSet from './utxo/many-small.json';
import CoinSelection from '../../../lib/coinSelection';

const protocolParameters = {
  linearFee: {
    minFeeA: '44',
    minFeeB: '155381',
  },
  coinsPerUtxoWord: '34482',
  maxTxSize: '16384',
};

const PRESETS = {
  coinSelectionLimit: 20,
  minimalAmount: '1',
  address:
    '01e7d6272a3fd204337a371bbe051be60fa0e98ef66142ffc9bc43a0e408ee0af4719df41c3d78b9439ea41cfff4574159b49c0c49ef50c6b3',
};

const UTxO_SETS = {
  'Single UTxO Set': getSingleUTxO,
  'Medium UTxO Set': getMediumUTxO,
  'Large UTxO Set': getLargeUTxO,
  'Many small UTxO Set': getManySmallUTxO,
};

beforeAll(async () => {
  Loader.load();
  return CoinSelection.setProtocolParameters(
    protocolParameters.coinsPerUtxoWord,
    protocolParameters.linearFee.minFeeA,
    protocolParameters.linearFee.minFeeB,
    protocolParameters.maxTxSize.toString()
  );
});

describe('Minimal ADA without assets', () => {
  for (const utxoType in UTxO_SETS) {
    test(utxoType, async () => {
      const utxo = await UTxO_SETS[utxoType]();
      const outputs = await getOutputs(utxo);

      const selection = await CoinSelection.randomImprove(
        utxo,
        outputs.min,
        PRESETS.coinSelectionLimit
      );

      const minimumValue = Loader.Cardano.min_ada_required(
        Loader.Cardano.Value.new(
          Loader.Cardano.BigNum.from_str(PRESETS.minimalAmount)
        ),
        false,
        Loader.Cardano.BigNum.from_str(protocolParameters.coinsPerUtxoWord)
      ).to_str();

      expect(selection.input).toBeDefined();
      expect(selection.output).toBeDefined();
      expect(selection.remaining).toBeDefined();
      expect(selection.amount).toBeDefined();
      expect(selection.change).toBeDefined();
      expect(selection.input.length).toBeGreaterThanOrEqual(1);
      expect(BigInt(selection.amount.coin().to_str())).toBeGreaterThanOrEqual(
        BigInt(minimumValue)
      );
      expect(BigInt(selection.change.coin().to_str())).toBeGreaterThanOrEqual(
        BigInt(minimumValue)
      );
    });
  }
});

describe('Maximal ADA without assets', () => {});

describe('Every single assets in isolation (1 per UTxO)', () => {});

describe('CoinSelection with all assets', () => {});

async function getSingleUTxO() {
  return await Promise.all(
    singleSet.map(async (utxo) => await utxoFromJson(utxo, PRESETS.address))
  );
}

async function getMediumUTxO() {
  return await Promise.all(
    mediumSet.map(async (utxo) => await utxoFromJson(utxo, PRESETS.address))
  );
}

async function getLargeUTxO() {
  return await Promise.all(
    largeSet.map(async (utxo) => await utxoFromJson(utxo, PRESETS.address))
  );
}

async function getManySmallUTxO() {
  return await Promise.all(
    manySmallSet.map(async (utxo) => await utxoFromJson(utxo, PRESETS.address))
  );
}

async function getOutputs(uTxOSet) {
  return {
    min: await generateMinOutput(),
  };
}

async function generateMinOutput() {
  const outputs = Loader.Cardano.TransactionOutputs.new();
  const output = Loader.Cardano.TransactionOutput.new(
    Loader.Cardano.Address.from_bytes(Buffer.from(PRESETS.address, 'hex')),
    Loader.Cardano.Value.new(
      Loader.Cardano.min_ada_required(
        Loader.Cardano.Value.new(
          Loader.Cardano.BigNum.from_str(PRESETS.minimalAmount)
        ),
        false,
        Loader.Cardano.BigNum.from_str(protocolParameters.coinsPerUtxoWord)
      )
    )
  );
  outputs.add(output);

  return outputs;
}
