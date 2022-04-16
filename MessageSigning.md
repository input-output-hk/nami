```js
const S = require('@emurgo/cardano-serialization-lib-nodejs'); //serialization-lib: https://github.com/Emurgo/cardano-serialization-lib
const MS = require('./message-signing/rust/pkg/emurgo_message_signing'); //message-signing: https://github.com/Emurgo/message-signing/blob/master/examples/rust/src/main.rs

// Example runs in Node.js (to verify in a browser, the libraries need to be imported asynchronously)

/**
 *
 * @param {string} address - hex encoded
 * @param {string} payload - hex encoded
 * @param {string} coseSign1Hex - hex encoded
 */
const verify = (address, payload, coseSign1Hex) => {
  const coseSign1 = MS.COSESign1.from_bytes(Buffer.from(coseSign1Hex, 'hex'));
  const payloadCose = coseSign1.payload();

  if (verifyPayload(payload, payloadCose))
    throw new Error('Payload does not match');

  const protectedHeaders = coseSign1
    .headers()
    .protected()
    .deserialized_headers();
  const addressCose = S.Address.from_bytes(
    protectedHeaders.header(MS.Label.new_text('address')).as_bytes()
  );

  // Commented out the below line in favor of CIP-30, only use if you are using the deprecated window.cardano.signedData(address, payload)
  //const publicKeyCose = S.PublicKey.from_bytes(protectedHeaders.key_id());
  const key = MS.COSEKey.from_bytes(
          Buffer.from(coseKey, 'hex')
      );
  const publicKeyBytes = key
      .header(
          MS.Label.new_int(
              MS.Int.new_negative(
                  MS.BigNum.from_str('2')
              )
          )
      )
      .as_bytes();
  const publicKeyCose =
      APILoader.Cardano.PublicKey.from_bytes(publicKeyBytes);

  if (!verifyAddress(address, addressCose, publicKeyCose))
    throw new Error('Could not verify because of address mismatch');

  const signature = S.Ed25519Signature.from_bytes(coseSign1.signature());
  const data = coseSign1.signed_data().to_bytes();
  return publicKeyCose.verify(data, signature);
};

const verifyPayload = (payload, payloadCose) => {
  return Buffer.from(payloadCose, 'hex').compare(Buffer.from(payload, 'hex'));
};

const verifyAddress = (address, addressCose, publicKeyCose) => {
  const checkAddress = S.Address.from_bytes(Buffer.from(address, 'hex'));
  if (addressCose.to_bech32() !== checkAddress.to_bech32()) return false;
  // check if BaseAddress
  try {
    const baseAddress = S.BaseAddress.from_address(addressCose);
    //reconstruct address
    const paymentKeyHash = publicKeyCose.hash();
    const stakeKeyHash = baseAddress.stake_cred().to_keyhash();
    const reconstructedAddress = S.BaseAddress.new(
      checkAddress.network_id(),
      S.StakeCredential.from_keyhash(paymentKeyHash),
      S.StakeCredential.from_keyhash(stakeKeyHash)
    );
    if (
      checkAddress.to_bech32() !== reconstructedAddress.to_address().to_bech32()
    )
      return false;

    return true;
  } catch (e) {}
  // check if RewardAddress
  try {
    //reconstruct address
    const stakeKeyHash = publicKeyCose.hash();
    const reconstructedAddress = S.RewardAddress.new(
      checkAddress.network_id(),
      S.StakeCredential.from_keyhash(stakeKeyHash)
    );
    if (
      checkAddress.to_bech32() !== reconstructedAddress.to_address().to_bech32()
    )
      return false;

    return true;
  } catch (e) {}
  return false;
};

//test
verify(<address>, <payload>, <cose>) //: true or false

```
