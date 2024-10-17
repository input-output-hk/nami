import { map } from './nami-storage-mapper.data';
import { fixture } from './nami-storage.fixture';

test('map nami storage to migration payload', async () => {
  const migrationPayload = map(fixture);

  expect(migrationPayload).toEqual({
    encryptedPrivateKey:
      'da7af7c22eeaf4bb460c02b426792d556a9242a7e8dca47e7628350f4290d97a0078f3dad5812606f4fa993772dc1c0fc5b7941dc91796a111a8d789b8d3f473eb9c67b32f89f5a2518ff02bb5595a00638e99e7799858b42a639edab14d1bd997eeb8ebe518939ca0522a527219062d1585bfd34434dd84c2a3f895d34863158fce54c1c2c2ab8e8fd3d23d70bc3114fd302badca2c850160597443',
    accounts: [
      {
        index: 0,
        name: 'Nami',
        extendedAccountPublicKey:
          'a5f18f73dde7b6f11df448913d60a86bbb397a435269e5024193b293f28892fd33d1225d468aac8f5a9d3cfedceacabe80192fcf0beb5c5c9b7988151f3353cc',
        collaterals: {
          mainnet: undefined,
          preview: undefined,
          preprod: undefined,
        },
        paymentAddresses: {
          mainnet:
            'addr1qymlvzkhufx0f94vqtfsmfa7yzxtwql8ga8aq5yk6u98gn593a82g73tm9n0l6vehusxn3fxwwxhrssgmvnwnlaa6p4qw7srzg',
          preprod:
            'addr_test1qqmlvzkhufx0f94vqtfsmfa7yzxtwql8ga8aq5yk6u98gn593a82g73tm9n0l6vehusxn3fxwwxhrssgmvnwnlaa6p4qdgdrwh',
          preview:
            'addr_test1qqmlvzkhufx0f94vqtfsmfa7yzxtwql8ga8aq5yk6u98gn593a82g73tm9n0l6vehusxn3fxwwxhrssgmvnwnlaa6p4qdgdrwh',
        },
      },
      {
        index: 1,
        name: 'xxx',
        extendedAccountPublicKey:
          '5280ef1287dfa35605891eb788590dbfe43b59682ada939ee111f8667d4a0847b43c08b5dce7aab937e860626e95f05ef6cc12758fa9ee16a4fc394bd9f684e4',
        collaterals: {
          mainnet: undefined,
          preview: undefined,
          preprod: undefined,
        },
        paymentAddresses: {
          mainnet:
            'addr1qxaqtjxrdnaxm2a74r0xtd0a5jkg3nd9zdzuvy7yc5a67qgte8c6lysmrq57uy7hgq9daj5sylgttehecjjrmgn0n2nsgwaxqs',
          preprod:
            'addr_test1qzaqtjxrdnaxm2a74r0xtd0a5jkg3nd9zdzuvy7yc5a67qgte8c6lysmrq57uy7hgq9daj5sylgttehecjjrmgn0n2nstcqxv0',
          preview:
            'addr_test1qzaqtjxrdnaxm2a74r0xtd0a5jkg3nd9zdzuvy7yc5a67qgte8c6lysmrq57uy7hgq9daj5sylgttehecjjrmgn0n2nstcqxv0',
        },
      },
    ],
    hardwareWallets: [
      {
        index: 0,
        name: 'Ledger 1',
        extendedAccountPublicKey:
          '7eefc2120ec17dc280f7f7adba233bcd75c00d59d9442ded45e44e00745e28d4d06673111ee5aad359f25fafbb787c55f1f80e0d9f0b567959d0a3587276210c',
        collaterals: {
          mainnet: undefined,
          preview: {
            lovelace: '5000000',
            tx: {
              hash: '5aeae083cceb3a930f3402d367096d2d524d03abf915fd9452cc59b3063a6aad',
              index: 0,
            },
          },
          preprod: undefined,
        },
        paymentAddresses: {
          mainnet:
            'addr1q85g8x8lpu6ydhe5ytggl6vrlt6prtdzzk7nljh6uf23ktknjausjhrf7f92l3ze9pp5njhkwrv45phhryjxjhtmq7rqnmrrjv',
          preprod:
            'addr_test1qr5g8x8lpu6ydhe5ytggl6vrlt6prtdzzk7nljh6uf23ktknjausjhrf7f92l3ze9pp5njhkwrv45phhryjxjhtmq7rqsd7r7n',
          preview:
            'addr_test1qr5g8x8lpu6ydhe5ytggl6vrlt6prtdzzk7nljh6uf23ktknjausjhrf7f92l3ze9pp5njhkwrv45phhryjxjhtmq7rqsd7r7n',
        },
        vendor: 'ledger',
      },
      {
        index: 1,
        name: 'Ledger 2',
        extendedAccountPublicKey:
          '18b35d8e07c1dd096ce359f4ce5ac669a27c8ac23583f9e6a53b7508efd28c849a7b1eda5ac98ed02d6048d0cbe84f91570b9f0cc3acff935cf229cd798da730',
        collaterals: {
          mainnet: undefined,
          preview: undefined,
          preprod: undefined,
        },
        paymentAddresses: {
          mainnet:
            'addr1qyhxhljsyfuzv4f2dyaxpn6why7eher90twkcyjvpyzmm27wxzqczmxjrtvpm39rjcqj4tqt2vjwt3a4t92ujuwes4jqxx3xgd',
          preprod:
            'addr_test1qqhxhljsyfuzv4f2dyaxpn6why7eher90twkcyjvpyzmm27wxzqczmxjrtvpm39rjcqj4tqt2vjwt3a4t92ujuwes4jq9svxyj',
          preview:
            'addr_test1qqhxhljsyfuzv4f2dyaxpn6why7eher90twkcyjvpyzmm27wxzqczmxjrtvpm39rjcqj4tqt2vjwt3a4t92ujuwes4jq9svxyj',
        },
        vendor: 'ledger',
      },
    ],
    dapps: ['https://preview.handle.me'],
    currency: 'usd',
    analytics: {
      enabled: true,
      userId:
        'b60f45ed66f596ebfd2ca19ff704cfee33e316795da50f295fc1f85d6ddf539c',
    },
    themeColor: 'light',
  });
});
