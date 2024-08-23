import {
  assetsToValue,
  convertMetadataPropToString,
  linkToSrc,
  valueToAssets,
} from '../../../api/util';
import Loader from '../../../api/loader';
import provider from '../../../config/provider';

beforeAll(() => {
  Loader.load();
});

test('expect correct assets to value conversion', async () => {
  const assetId = '2a286ad895d091f2b3d168a6091ad2627d30a72761a5bc36eef0074074657374313233';
  const policyId = assetId.slice(0, 56);
  const assetName = assetId.slice(56);
  const assets = [
    { unit: 'lovelace', quantity: '1000000' },
    {
      unit: assetId,
      quantity: '10',
    },
  ];
  const value = await assetsToValue(assets);

  expect(value.coin()).toBe(1000000n);
  const multiAsset = value.multi_asset();
  expect(multiAsset.keys().len()).toBe(1);
  const scriptHash = multiAsset.keys().get(0);
  expect(scriptHash.to_hex()).toBe(policyId);
  const assetsMap = multiAsset.get_assets(scriptHash);
  expect(assetsMap.len()).toBe(1);
  const cmlAssetName = assetsMap.keys().get(0);
  expect(cmlAssetName.to_hex()).toBe(assetName);
  expect(assetsMap.get(cmlAssetName)).toBe(10n)
});

test('expect correct value to assets conversion', async () => {
  const multiAsset = Loader.Cardano.MultiAsset.new();
  const value = Loader.Cardano.Value.new(
    BigInt('1000000'), multiAsset
  );
  const assetsSet = Loader.Cardano.MapAssetNameToCoin.new();
  assetsSet.insert(
    Loader.Cardano.AssetName.from_raw_bytes(Buffer.from('74657374313233', 'hex')),
    BigInt('10')
  );
  multiAsset.insert_assets(
    Loader.Cardano.ScriptHash.from_raw_bytes(
      Buffer.from(
        '2a286ad895d091f2b3d168a6091ad2627d30a72761a5bc36eef00740',
        'hex'
      )
    ),
    assetsSet
  );
  const assets = await valueToAssets(value);
  const testAssets = [
    { unit: 'lovelace', quantity: '1000000' },
    {
      unit: '2a286ad895d091f2b3d168a6091ad2627d30a72761a5bc36eef0074074657374313233',
      quantity: '10',
    },
  ];
  assets.forEach((asset, i) => {
    const testAsset = testAssets[i];
    expect(asset.unit).toEqual(testAsset.unit);
    expect(asset.quantity).toEqual(testAsset.quantity);
  });
});

describe('test linkToSrc', () => {
  test('expect right source from ipfs link', () => {
    const testLink = 'ipfs://QmVSameQt9i37hdrLwMSfoAg1aVKrjtBtuDHeQTgyVhUXC';
    const testLink1 =
      'ipfs://ipfs/QmVSameQt9i37hdrLwMSfoAg1aVKrjtBtuDHeQTgyVhUXC';
    const httpsLink = linkToSrc(testLink);
    const httpsLink1 = linkToSrc(testLink1);
    expect(httpsLink).toEqual(
      provider.api.ipfs + '/' + 'QmVSameQt9i37hdrLwMSfoAg1aVKrjtBtuDHeQTgyVhUXC'
    );
    expect(httpsLink1).toEqual(
      provider.api.ipfs + '/' + 'QmVSameQt9i37hdrLwMSfoAg1aVKrjtBtuDHeQTgyVhUXC'
    );
  });
  test('expect right source from https', () => {
    const testLink =
      'https://ipfs.io/ipfs/QmVSameQt9i37hdrLwMSfoAg1aVKrjtBtuDHeQTgyVhUXC';
    const httpsLink = linkToSrc(testLink);
    expect(httpsLink).toEqual(testLink);
  });
  test('expect no source', () => {
    const testLink = 'invalid src';
    const httpsLink = linkToSrc(testLink);
    expect(httpsLink).toBe(null);
  });
  test('expect data uri for png', () => {
    const testLink = 'YWJj';
    const httpsLink = linkToSrc(testLink, true);
    expect(httpsLink).toBe('data:image/png;base64,YWJj');
  });
  test('expect data uri', () => {
    const link =
      'data:image/png;base64,iVB\
    ORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEU\
    AAAD///+l2Z/dAAAAM0lEQVR4nGP4/5/h/1+G/58ZDrAz3D/McH8\
    yw83NDDeNGe4Ug9C9zwz3gVLMDA/A6P9/AFGGFyjOXZtQAAAAAEl\
    FTkSuQmCC';
    const testLink = linkToSrc(link);
    expect(testLink).toEqual(link);
  });
  test('expect correct array to string conversion', () => {
    const normalString = 'metadatateststring';
    const array = ['meta', 'data', 'teststring'];

    const convertedString = convertMetadataPropToString(normalString);
    const convertedArray = convertMetadataPropToString(array);
    expect(convertedArray).toEqual(normalString);
    expect(convertedArray).toEqual(convertedString);
  });
});
