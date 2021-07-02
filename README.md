<p align="center"><img width="200px" src="./src/assets/img/bannerBlack.svg"></img></p>

# Nami Wallet

Nami Wallet is a browser based wallet extension to interact with the Cardano blockchain. It's an open-source project and is built by [**Berry Pool**](https://pipool.online).

### Injected API

Since Nami is a browser extension, it can inject content inside the web context, which means you can connect the wallet to any website.
The exposed API follows for most parts this proposed [CIP](https://github.com/cardano-foundation/CIPs/pull/88). The return types are in `cbor`/`bytes` format. A helpful library for serializing and de-serializing these low-level data structures is the [serialization-lib](https://github.com/Emurgo/cardano-serialization-lib) . To verify a signature returned from the `dataSign` endpoint the [message-signing](https://github.com/Emurgo/message-signing) library helps.

```
  TODO: Explanation for each funciton
  enable(),
  isEnabled(),
  getBlance(),
  signData(address, payload),
  signTx(tx, partialSign),
  submitTx(tx),
  getUtxos(amount, paginate),
  getUsedAddresses(),
  getUnusedAddresses()
  getChangeAddress(),
  getRewardAddress(),
  getNetworkId(),
  onAccountChange()
```

#### Develop

Start development server

```
npm start
```

Create a build

```
npm run build
```
