<p align="center"><img width="200px" src="./src/assets/img/bannerBlack.svg"></img></p>

# Nami Wallet

Nami Wallet is a browser based wallet extension to interact with the Cardano blockchain. It's an open-source project and built by [**Berry Pool**](https://pipool.online).

### Injected API

Since Nami is a browser extension, it can inject content inside the web context, which means you can connect the wallet to any website.
The exposed API follows for most parts this proposed [CIP](https://github.com/cardano-foundation/CIPs/pull/88). The returned types are in `cbor`/`bytes` format. A helpful library for serializing and de-serializing these low-level data structures is the [serialization-lib](https://github.com/Emurgo/cardano-serialization-lib). To verify a signature returned from the `dataSign` endpoint the [message-signing](https://github.com/Emurgo/message-signing) library helps.

#### Basic Usage

- Detect the Cardano provider (`window.cardano`)
- Detect which Cardano network the user is connected to (ID 1 = Mainnet, ID 0 = Testnet)
- Get the user's Cardano account

#### Methods

##### cardano.enable()

Will ask the user to give access to requested website. If access is given, this function will return `true`, otherwise throws an `error`.
If the user calls this function again with already having permission to requested website, it will simply return `true`.

##### cardano.isEnabled()

```
cardano.isEnabled() : boolean
```

Returns `true` if wallet has access to requested website, `false` otherwise.

##### cardano.getBlance()

```
cardano.getBalance() : Value
```

`Value` is a hex encoded cbor string.

##### cardano.getUtxos(amount, paginate)

```
cardano.getUtxos(amount?: Value, paginate?: {}) : Value
```

TODO

##### cardano.getUsedAddresses()

```
cardano.getUsedAddresses() : [BaseAddress]
```

`BaseAddress` is a hex encoded bytes string.

**Note** Nami Wallet doesn't utilize the concpet of multipe address per wallet. This function will return an array of length `1` and will always return the same single address. Just to follow the standards of the proposed [CIP](https://github.com/cardano-foundation/CIPs/pull/88), it will return the address in an array.

##### cardano.getUnusedAddresses()

```
cardano.getUnusedAddresses() : [BaseAddress]
```

**Note** This endpoint will return an empty array []. Same reason as above, simply to follow the standards.

##### cardano.getChangeAddress()

```
cardano.getUnusedAddresses() : BaseAddress
```

Will return the same address as the one in `cardano.getUsedAddresses()`.

##### cardano.getRewardAddress()

```
cardano.getUnusedAddresses() : RewardAddress
```

`RewardAddress` is a hex encoded bytes string.

##### cardano.getNetworkId()

```
cardano.getNetworkId() : Number
```

Returns `0` if on `testnet`, otherwise `1` if on `mainnet`.

##### cardano.signData(address, payload)

```
cardano.signData(address: BaseAddress|RewardAddress, payload: string) : CoseSign1
```

`paylod` is a hex encoded utf8 string.
`CoseSign1` is a hex encoded bytes string.
TODO

##### cardano.signTx(tx, partialSign)

```
cardano.signTx(tx: Transaction, partialSign?: boolean) : TransactionWitnessSet
```

`Transaction` is a hex encoded cbor string.
`TransactionWitnessSet` is a hex encoded cbor string.

`partialSign` is by default `false` and optional. The wallet needs to provide all required signatures. If it can't an `error` is thrown, otherwise the `TransactionWitnessSet` is returned.

If `partialSign` is `true`, the wallet doesn't need to provide all required signatures.

##### cardano.submitTx(tx)

#### Events

##### cardano.onAccountChange()

#### Develop

Start development server

```
npm start
```

Create a build

```
npm run build
```

#### Website

Vist [namiwallet.io](https://namiwallet.io)
Vist [Berry Pool](https://pipool.online)
