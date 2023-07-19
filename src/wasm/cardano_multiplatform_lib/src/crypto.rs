use crate::chain_crypto as crypto;
use crate::impl_mockchain as chain;
use bech32::ToBase32;
use cbor_event::{de::Deserializer, se::Serializer};
use chain::key;
use crypto::bech32::Bech32 as _;
use rand_os::OsRng;
use std::io::{BufRead, Seek, Write};
use std::str::FromStr;

use cryptoxide::blake2b::Blake2b;

use super::*;

pub(crate) fn blake2b224(data: &[u8]) -> [u8; 28] {
    let mut out = [0; 28];
    Blake2b::blake2b(&mut out, data, &[]);
    out
}

pub(crate) fn blake2b256(data: &[u8]) -> [u8; 32] {
    let mut out = [0; 32];
    Blake2b::blake2b(&mut out, data, &[]);
    out
}

// All key structs were taken from js-chain-libs:
// https://github.com/Emurgo/js-chain-libs

#[wasm_bindgen]
pub struct Bip32PrivateKey(crypto::SecretKey<crypto::Ed25519Bip32>);

#[wasm_bindgen]
impl Bip32PrivateKey {
    /// derive this private key with the given index.
    ///
    /// # Security considerations
    ///
    /// * hard derivation index cannot be soft derived with the public key
    ///
    /// # Hard derivation vs Soft derivation
    ///
    /// If you pass an index below 0x80000000 then it is a soft derivation.
    /// The advantage of soft derivation is that it is possible to derive the
    /// public key too. I.e. derivation the private key with a soft derivation
    /// index and then retrieving the associated public key is equivalent to
    /// deriving the public key associated to the parent private key.
    ///
    /// Hard derivation index does not allow public key derivation.
    ///
    /// This is why deriving the private key should not fail while deriving
    /// the public key may fail (if the derivation index is invalid).
    ///
    pub fn derive(&self, index: u32) -> Bip32PrivateKey {
        Bip32PrivateKey(crypto::derive::derive_sk_ed25519(&self.0, index))
    }

    /// 128-byte xprv a key format in Cardano that some software still uses or requires
    /// the traditional 96-byte xprv is simply encoded as
    /// prv | chaincode
    /// however, because some software may not know how to compute a public key from a private key,
    /// the 128-byte inlines the public key in the following format
    /// prv | pub | chaincode
    /// so be careful if you see the term "xprv" as it could refer to either one
    /// our library does not require the pub (instead we compute the pub key when needed)
    pub fn from_128_xprv(bytes: &[u8]) -> Result<Bip32PrivateKey, JsError> {
        let mut buf = [0; 96];
        buf[0..64].clone_from_slice(&bytes[0..64]);
        buf[64..96].clone_from_slice(&bytes[96..128]);

        Bip32PrivateKey::from_bytes(&buf)
    }
    /// see from_128_xprv
    pub fn to_128_xprv(&self) -> Vec<u8> {
        let prv_key = self.to_raw_key().as_bytes();
        let pub_key = self.to_public().to_raw_key().as_bytes();
        let cc = self.chaincode();

        let mut buf = [0; 128];
        buf[0..64].clone_from_slice(&prv_key);
        buf[64..96].clone_from_slice(&pub_key);
        buf[96..128].clone_from_slice(&cc);
        buf.to_vec()
    }

    pub fn generate_ed25519_bip32() -> Result<Bip32PrivateKey, JsError> {
        OsRng::new()
            .map(crypto::SecretKey::<crypto::Ed25519Bip32>::generate)
            .map(Bip32PrivateKey)
            .map_err(|e| JsError::from_str(&format!("{}", e)))
    }

    pub fn to_raw_key(&self) -> PrivateKey {
        PrivateKey(key::EitherEd25519SecretKey::Extended(
            crypto::derive::to_raw_sk(&self.0),
        ))
    }

    pub fn to_public(&self) -> Bip32PublicKey {
        Bip32PublicKey(self.0.to_public().into())
    }

    pub fn from_bytes(bytes: &[u8]) -> Result<Bip32PrivateKey, JsError> {
        crypto::SecretKey::<crypto::Ed25519Bip32>::from_binary(bytes)
            .map_err(|e| JsError::from_str(&format!("{}", e)))
            .map(Bip32PrivateKey)
    }

    pub fn as_bytes(&self) -> Vec<u8> {
        self.0.as_ref().to_vec()
    }

    pub fn from_bech32(bech32_str: &str) -> Result<Bip32PrivateKey, JsError> {
        crypto::SecretKey::try_from_bech32_str(&bech32_str)
            .map(Bip32PrivateKey)
            .map_err(|_| JsError::from_str("Invalid secret key"))
    }

    pub fn to_bech32(&self) -> String {
        self.0.to_bech32_str()
    }

    pub fn from_bip39_entropy(entropy: &[u8], password: &[u8]) -> Bip32PrivateKey {
        Bip32PrivateKey(crypto::derive::from_bip39_entropy(&entropy, &password))
    }

    pub fn chaincode(&self) -> Vec<u8> {
        const ED25519_PRIVATE_KEY_LENGTH: usize = 64;
        const XPRV_SIZE: usize = 96;
        self.0.as_ref()[ED25519_PRIVATE_KEY_LENGTH..XPRV_SIZE].to_vec()
    }
}

#[wasm_bindgen]
pub struct Bip32PublicKey(crypto::PublicKey<crypto::Ed25519Bip32>);

#[wasm_bindgen]
impl Bip32PublicKey {
    /// derive this public key with the given index.
    ///
    /// # Errors
    ///
    /// If the index is not a soft derivation index (< 0x80000000) then
    /// calling this method will fail.
    ///
    /// # Security considerations
    ///
    /// * hard derivation index cannot be soft derived with the public key
    ///
    /// # Hard derivation vs Soft derivation
    ///
    /// If you pass an index below 0x80000000 then it is a soft derivation.
    /// The advantage of soft derivation is that it is possible to derive the
    /// public key too. I.e. derivation the private key with a soft derivation
    /// index and then retrieving the associated public key is equivalent to
    /// deriving the public key associated to the parent private key.
    ///
    /// Hard derivation index does not allow public key derivation.
    ///
    /// This is why deriving the private key should not fail while deriving
    /// the public key may fail (if the derivation index is invalid).
    ///
    pub fn derive(&self, index: u32) -> Result<Bip32PublicKey, JsError> {
        crypto::derive::derive_pk_ed25519(&self.0, index)
            .map(Bip32PublicKey)
            .map_err(|e| JsError::from_str(&format! {"{:?}", e}))
    }

    pub fn to_raw_key(&self) -> PublicKey {
        PublicKey(crypto::derive::to_raw_pk(&self.0))
    }

    pub fn from_bytes(bytes: &[u8]) -> Result<Bip32PublicKey, JsError> {
        crypto::PublicKey::<crypto::Ed25519Bip32>::from_binary(bytes)
            .map_err(|e| JsError::from_str(&format!("{}", e)))
            .map(Bip32PublicKey)
    }

    pub fn as_bytes(&self) -> Vec<u8> {
        self.0.as_ref().to_vec()
    }

    pub fn from_bech32(bech32_str: &str) -> Result<Bip32PublicKey, JsError> {
        crypto::PublicKey::try_from_bech32_str(&bech32_str)
            .map(Bip32PublicKey)
            .map_err(|e| JsError::from_str(&format!("{}", e)))
    }

    pub fn to_bech32(&self) -> String {
        self.0.to_bech32_str()
    }

    pub fn chaincode(&self) -> Vec<u8> {
        const ED25519_PUBLIC_KEY_LENGTH: usize = 32;
        const XPUB_SIZE: usize = 64;
        self.0.as_ref()[ED25519_PUBLIC_KEY_LENGTH..XPUB_SIZE].to_vec()
    }
}

#[wasm_bindgen]
pub struct PrivateKey(key::EitherEd25519SecretKey);

impl From<key::EitherEd25519SecretKey> for PrivateKey {
    fn from(secret_key: key::EitherEd25519SecretKey) -> PrivateKey {
        PrivateKey(secret_key)
    }
}

#[wasm_bindgen]
impl PrivateKey {
    pub fn to_public(&self) -> PublicKey {
        self.0.to_public().into()
    }

    pub fn generate_ed25519() -> Result<PrivateKey, JsError> {
        OsRng::new()
            .map(crypto::SecretKey::<crypto::Ed25519>::generate)
            .map(key::EitherEd25519SecretKey::Normal)
            .map(PrivateKey)
            .map_err(|e| JsError::from_str(&format!("{}", e)))
    }

    pub fn generate_ed25519extended() -> Result<PrivateKey, JsError> {
        OsRng::new()
            .map(crypto::SecretKey::<crypto::Ed25519Extended>::generate)
            .map(key::EitherEd25519SecretKey::Extended)
            .map(PrivateKey)
            .map_err(|e| JsError::from_str(&format!("{}", e)))
    }

    /// Get private key from its bech32 representation
    /// ```javascript
    /// PrivateKey.from_bech32(&#39;ed25519_sk1ahfetf02qwwg4dkq7mgp4a25lx5vh9920cr5wnxmpzz9906qvm8qwvlts0&#39;);
    /// ```
    /// For an extended 25519 key
    /// ```javascript
    /// PrivateKey.from_bech32(&#39;ed25519e_sk1gqwl4szuwwh6d0yk3nsqcc6xxc3fpvjlevgwvt60df59v8zd8f8prazt8ln3lmz096ux3xvhhvm3ca9wj2yctdh3pnw0szrma07rt5gl748fp&#39;);
    /// ```
    pub fn from_bech32(bech32_str: &str) -> Result<PrivateKey, JsError> {
        crypto::SecretKey::try_from_bech32_str(&bech32_str)
            .map(key::EitherEd25519SecretKey::Extended)
            .or_else(|_| {
                crypto::SecretKey::try_from_bech32_str(&bech32_str)
                    .map(key::EitherEd25519SecretKey::Normal)
            })
            .map(PrivateKey)
            .map_err(|_| JsError::from_str("Invalid secret key"))
    }

    pub fn to_bech32(&self) -> String {
        match self.0 {
            key::EitherEd25519SecretKey::Normal(ref secret) => secret.to_bech32_str(),
            key::EitherEd25519SecretKey::Extended(ref secret) => secret.to_bech32_str(),
        }
    }

    pub fn as_bytes(&self) -> Vec<u8> {
        match self.0 {
            key::EitherEd25519SecretKey::Normal(ref secret) => secret.as_ref().to_vec(),
            key::EitherEd25519SecretKey::Extended(ref secret) => secret.as_ref().to_vec(),
        }
    }

    pub fn from_extended_bytes(bytes: &[u8]) -> Result<PrivateKey, JsError> {
        crypto::SecretKey::from_binary(bytes)
            .map(key::EitherEd25519SecretKey::Extended)
            .map(PrivateKey)
            .map_err(|_| JsError::from_str("Invalid extended secret key"))
    }

    pub fn from_normal_bytes(bytes: &[u8]) -> Result<PrivateKey, JsError> {
        crypto::SecretKey::from_binary(bytes)
            .map(key::EitherEd25519SecretKey::Normal)
            .map(PrivateKey)
            .map_err(|_| JsError::from_str("Invalid normal secret key"))
    }

    pub fn sign(&self, message: &[u8]) -> Ed25519Signature {
        Ed25519Signature(self.0.sign(&message.to_vec()))
    }

    pub fn from_bytes(bytes: &[u8]) -> Result<PrivateKey, JsError> {
        let mut raw = cbor_event::de::Deserializer::from(std::io::Cursor::new(bytes.clone()));
        let bytes = raw.bytes().unwrap();
        PrivateKey::from_normal_bytes(&bytes).or_else(|_| PrivateKey::from_extended_bytes(&bytes))
    }

    pub fn to_bytes(&self) -> Vec<u8> {
        let mut serializer = cbor_event::se::Serializer::new_vec();
        serializer.write_bytes(self.as_bytes()).unwrap();
        serializer.finalize()
    }
}

/// ED25519 key used as public key
#[wasm_bindgen]
#[derive(Clone, PartialEq, Eq, Hash)]
pub struct PublicKey(crypto::PublicKey<crypto::Ed25519>);

impl From<crypto::PublicKey<crypto::Ed25519>> for PublicKey {
    fn from(key: crypto::PublicKey<crypto::Ed25519>) -> PublicKey {
        PublicKey(key)
    }
}

#[wasm_bindgen]
impl PublicKey {
    /// Get public key from its bech32 representation
    /// Example:
    /// ```javascript
    /// const pkey = PublicKey.from_bech32(&#39;ed25519_pk1dgaagyh470y66p899txcl3r0jaeaxu6yd7z2dxyk55qcycdml8gszkxze2&#39;);
    /// ```
    pub fn from_bech32(bech32_str: &str) -> Result<PublicKey, JsError> {
        crypto::PublicKey::try_from_bech32_str(&bech32_str)
            .map(PublicKey)
            .map_err(|_| JsError::from_str("Malformed public key"))
    }

    pub fn to_bech32(&self) -> String {
        self.0.to_bech32_str()
    }

    pub fn as_bytes(&self) -> Vec<u8> {
        self.0.as_ref().to_vec()
    }

    pub fn from_bytes(bytes: &[u8]) -> Result<PublicKey, JsError> {
        crypto::PublicKey::from_binary(bytes)
            .map_err(|e| JsError::from_str(&format!("{}", e)))
            .map(PublicKey)
    }

    pub fn verify(&self, data: &[u8], signature: &Ed25519Signature) -> bool {
        signature.0.verify_slice(&self.0, data) == crypto::Verification::Success
    }

    pub fn hash(&self) -> Ed25519KeyHash {
        Ed25519KeyHash::from(blake2b224(self.as_bytes().as_ref()))
    }
}

impl serde::Serialize for PublicKey {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_bech32())
    }
}

impl<'de> serde::de::Deserialize<'de> for PublicKey {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::de::Deserializer<'de>,
    {
        let s = <String as serde::de::Deserialize>::deserialize(deserializer)?;
        PublicKey::from_bech32(&s).map_err(|_e| {
            serde::de::Error::invalid_value(
                serde::de::Unexpected::Str(&s),
                &"bech32 public key string",
            )
        })
    }
}

impl JsonSchema for PublicKey {
    fn schema_name() -> String {
        String::from("PublicKey")
    }
    fn json_schema(gen: &mut schemars::gen::SchemaGenerator) -> schemars::schema::Schema {
        String::json_schema(gen)
    }
    fn is_referenceable() -> bool {
        String::is_referenceable()
    }
}

#[wasm_bindgen]
#[derive(Clone, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize, JsonSchema)]
pub struct Vkey(PublicKey);

to_from_bytes!(Vkey);

#[wasm_bindgen]
impl Vkey {
    pub fn new(pk: &PublicKey) -> Self {
        Self(pk.clone())
    }

    pub fn public_key(&self) -> PublicKey {
        self.0.clone()
    }
}

impl cbor_event::se::Serialize for Vkey {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_bytes(&self.0.as_bytes())
    }
}

impl Deserialize for Vkey {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        Ok(Self(PublicKey(crypto::PublicKey::from_binary(
            raw.bytes()?.as_ref(),
        )?)))
    }
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct Vkeys(Vec<Vkey>);

#[wasm_bindgen]
impl Vkeys {
    pub fn new() -> Self {
        Self(Vec::new())
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn get(&self, index: usize) -> Vkey {
        self.0[index].clone()
    }

    pub fn add(&mut self, elem: &Vkey) {
        self.0.push(elem.clone());
    }
}

impl cbor_event::se::Serialize for Vkeys {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for element in &self.0 {
            element.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for Vkeys {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut arr = Vec::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            while match len {
                cbor_event::Len::Len(n) => arr.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                arr.push(Vkey::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("Vkeys"))?;
        Ok(Self(arr))
    }
}

#[wasm_bindgen]
#[derive(Clone, serde::Serialize, serde::Deserialize, JsonSchema)]
pub struct Vkeywitness {
    vkey: Vkey,
    signature: Ed25519Signature,
}

to_from_bytes!(Vkeywitness);

to_from_json!(Vkeywitness);

#[wasm_bindgen]
impl Vkeywitness {
    pub fn new(vkey: &Vkey, signature: &Ed25519Signature) -> Self {
        Self {
            vkey: vkey.clone(),
            signature: signature.clone(),
        }
    }

    pub fn vkey(&self) -> Vkey {
        self.vkey.clone()
    }

    pub fn signature(&self) -> Ed25519Signature {
        self.signature.clone()
    }
}

impl cbor_event::se::Serialize for Vkeywitness {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.vkey.serialize(serializer)?;
        self.signature.serialize(serializer)
    }
}

impl Deserialize for Vkeywitness {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let vkey = (|| -> Result<_, DeserializeError> { Ok(Vkey::deserialize(raw)?) })()
                .map_err(|e| e.annotate("vkey"))?;
            let signature =
                (|| -> Result<_, DeserializeError> { Ok(Ed25519Signature::deserialize(raw)?) })()
                    .map_err(|e| e.annotate("signature"))?;
            let ret = Ok(Vkeywitness::new(&vkey, &signature));
            match len {
                cbor_event::Len::Len(n) => match n {
                    2 => (),
                    _ => {
                        return Err(DeserializeFailure::CBOR(cbor_event::Error::WrongLen(
                            2, len, "",
                        ))
                        .into())
                    }
                },
                cbor_event::Len::Indefinite => match raw.special()? {
                    cbor_event::Special::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("Vkeywitness"))
    }
}

#[wasm_bindgen]
#[derive(Clone, serde::Serialize, serde::Deserialize, JsonSchema)]
pub struct Vkeywitnesses(pub(crate) Vec<Vkeywitness>);

#[wasm_bindgen]
impl Vkeywitnesses {
    pub fn new() -> Self {
        Self(Vec::new())
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn get(&self, index: usize) -> Vkeywitness {
        self.0[index].clone()
    }

    pub fn add(&mut self, elem: &Vkeywitness) {
        self.0.push(elem.clone());
    }
}

impl cbor_event::se::Serialize for Vkeywitnesses {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for element in &self.0 {
            element.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for Vkeywitnesses {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut arr = Vec::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            while match len {
                cbor_event::Len::Len(n) => arr.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == cbor_event::Type::Special {
                    assert_eq!(raw.special()?, cbor_event::Special::Break);
                    break;
                }
                arr.push(Vkeywitness::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("Vkeywitnesses"))?;
        Ok(Self(arr))
    }
}

#[wasm_bindgen]
#[derive(Clone, serde::Serialize, serde::Deserialize, JsonSchema)]
pub struct BootstrapWitness {
    vkey: Vkey,
    signature: Ed25519Signature,
    chain_code: Vec<u8>,
    attributes: Vec<u8>,
}

to_from_bytes!(BootstrapWitness);

to_from_json!(BootstrapWitness);

#[wasm_bindgen]
impl BootstrapWitness {
    pub fn vkey(&self) -> Vkey {
        self.vkey.clone()
    }

    pub fn signature(&self) -> Ed25519Signature {
        self.signature.clone()
    }

    pub fn chain_code(&self) -> Vec<u8> {
        self.chain_code.clone()
    }

    pub fn attributes(&self) -> Vec<u8> {
        self.attributes.clone()
    }

    pub fn new(
        vkey: &Vkey,
        signature: &Ed25519Signature,
        chain_code: Vec<u8>,
        attributes: Vec<u8>,
    ) -> Self {
        Self {
            vkey: vkey.clone(),
            signature: signature.clone(),
            chain_code: chain_code,
            attributes: attributes,
        }
    }
}

impl cbor_event::se::Serialize for BootstrapWitness {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(4))?;
        self.vkey.serialize(serializer)?;
        self.signature.serialize(serializer)?;
        serializer.write_bytes(&self.chain_code)?;
        serializer.write_bytes(&self.attributes)?;
        Ok(serializer)
    }
}

impl Deserialize for BootstrapWitness {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let ret = Self::deserialize_as_embedded_group(raw, len);
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            ret
        })()
        .map_err(|e| e.annotate("BootstrapWitness"))
    }
}

impl DeserializeEmbeddedGroup for BootstrapWitness {
    fn deserialize_as_embedded_group<R: BufRead + Seek>(
        raw: &mut Deserializer<R>,
        _: cbor_event::Len,
    ) -> Result<Self, DeserializeError> {
        let vkey = (|| -> Result<_, DeserializeError> { Ok(Vkey::deserialize(raw)?) })()
            .map_err(|e| e.annotate("vkey"))?;
        let signature =
            (|| -> Result<_, DeserializeError> { Ok(Ed25519Signature::deserialize(raw)?) })()
                .map_err(|e| e.annotate("signature"))?;
        let chain_code = (|| -> Result<_, DeserializeError> { Ok(raw.bytes()?) })()
            .map_err(|e| e.annotate("chain_code"))?;
        let attributes = (|| -> Result<_, DeserializeError> { Ok(raw.bytes()?) })()
            .map_err(|e| e.annotate("attributes"))?;
        Ok(BootstrapWitness {
            vkey,
            signature,
            chain_code,
            attributes,
        })
    }
}

#[wasm_bindgen]
#[derive(Clone, serde::Serialize, serde::Deserialize, JsonSchema)]
pub struct BootstrapWitnesses(pub(crate) Vec<BootstrapWitness>);

#[wasm_bindgen]
impl BootstrapWitnesses {
    pub fn new() -> Self {
        Self(Vec::new())
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn get(&self, index: usize) -> BootstrapWitness {
        self.0[index].clone()
    }

    pub fn add(&mut self, elem: &BootstrapWitness) {
        self.0.push(elem.clone());
    }
}

impl cbor_event::se::Serialize for BootstrapWitnesses {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for element in &self.0 {
            element.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for BootstrapWitnesses {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut arr = Vec::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            while match len {
                cbor_event::Len::Len(n) => arr.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == cbor_event::Type::Special {
                    assert_eq!(raw.special()?, cbor_event::Special::Break);
                    break;
                }
                arr.push(BootstrapWitness::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("BootstrapWitnesses"))?;
        Ok(Self(arr))
    }
}

#[wasm_bindgen]
pub struct PublicKeys(Vec<PublicKey>);

#[wasm_bindgen]
impl PublicKeys {
    #[wasm_bindgen(constructor)]
    pub fn new() -> PublicKeys {
        PublicKeys(vec![])
    }

    pub fn size(&self) -> usize {
        self.0.len()
    }

    pub fn get(&self, index: usize) -> PublicKey {
        self.0[index].clone()
    }

    pub fn add(&mut self, key: &PublicKey) {
        self.0.push(key.clone());
    }
}

macro_rules! impl_signature {
    ($name:ident, $signee_type:ty, $verifier_type:ty) => {
        #[wasm_bindgen]
        #[derive(Clone)]
        pub struct $name(crypto::Signature<$signee_type, $verifier_type>);

        #[wasm_bindgen]
        impl $name {
            pub fn to_bytes(&self) -> Vec<u8> {
                self.0.as_ref().to_vec()
            }

            pub fn to_bech32(&self) -> String {
                self.0.to_bech32_str()
            }

            pub fn to_hex(&self) -> String {
                hex::encode(&self.0.as_ref())
            }

            pub fn from_bech32(bech32_str: &str) -> Result<$name, JsError> {
                crypto::Signature::try_from_bech32_str(&bech32_str)
                    .map($name)
                    .map_err(|e| JsError::from_str(&format!("{}", e)))
            }

            pub fn from_hex(input: &str) -> Result<$name, JsError> {
                crypto::Signature::from_str(input)
                    .map_err(|e| JsError::from_str(&format!("{:?}", e)))
                    .map($name)
            }
        }

        from_bytes!($name, bytes, {
            crypto::Signature::from_binary(bytes.as_ref())
                .map_err(|e| {
                    DeserializeError::new(stringify!($name), DeserializeFailure::SignatureError(e))
                })
                .map($name)
        });

        impl cbor_event::se::Serialize for $name {
            fn serialize<'se, W: std::io::Write>(
                &self,
                serializer: &'se mut Serializer<W>,
            ) -> cbor_event::Result<&'se mut Serializer<W>> {
                serializer.write_bytes(self.0.as_ref())
            }
        }

        impl Deserialize for $name {
            fn deserialize<R: std::io::BufRead>(
                raw: &mut Deserializer<R>,
            ) -> Result<Self, DeserializeError> {
                Ok(Self(crypto::Signature::from_binary(raw.bytes()?.as_ref())?))
            }
        }

        impl serde::Serialize for $name {
            fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
            where
                S: serde::Serializer,
            {
                serializer.serialize_str(&self.to_hex())
            }
        }

        impl<'de> serde::de::Deserialize<'de> for $name {
            fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
            where
                D: serde::de::Deserializer<'de>,
            {
                let s = <String as serde::de::Deserialize>::deserialize(deserializer)?;
                $name::from_hex(&s).map_err(|_e| {
                    serde::de::Error::invalid_value(
                        serde::de::Unexpected::Str(&s),
                        &"hex bytes for signature",
                    )
                })
            }
        }

        impl JsonSchema for $name {
            fn schema_name() -> String {
                String::from(stringify!($name))
            }
            fn json_schema(gen: &mut schemars::gen::SchemaGenerator) -> schemars::schema::Schema {
                String::json_schema(gen)
            }
            fn is_referenceable() -> bool {
                String::is_referenceable()
            }
        }
    };
}

impl_signature!(Ed25519Signature, Vec<u8>, crypto::Ed25519);
macro_rules! impl_hash_type {
    ($name:ident, $byte_count:expr) => {
        #[wasm_bindgen]
        #[derive(Debug, Clone, Eq, Hash, Ord, PartialEq, PartialOrd)]
        pub struct $name(pub(crate) [u8; $byte_count]);

        // hash types are the only types in this library to not expect the entire CBOR structure.
        // There is no CBOR binary tag here just the raw hash bytes.
        from_bytes!($name, bytes, {
            use std::convert::TryInto;
            match bytes.len() {
                $byte_count => Ok($name(bytes[..$byte_count].try_into().unwrap())),
                other_len => {
                    let cbor_error = cbor_event::Error::WrongLen(
                        $byte_count,
                        cbor_event::Len::Len(other_len as u64),
                        "hash length",
                    );
                    Err(DeserializeError::new(
                        stringify!($name),
                        DeserializeFailure::CBOR(cbor_error),
                    ))
                }
            }
        });

        #[wasm_bindgen]
        impl $name {
            // hash types are the only types in this library to not give the entire CBOR structure.
            // There is no CBOR binary tag here just the raw hash bytes.
            pub fn to_bytes(&self) -> Vec<u8> {
                self.0.to_vec()
            }

            pub fn to_bech32(&self, prefix: &str) -> Result<String, JsError> {
                bech32::encode(&prefix, self.to_bytes().to_base32())
                    .map_err(|e| JsError::from_str(&format! {"{:?}", e}))
            }

            pub fn from_bech32(bech_str: &str) -> Result<$name, JsError> {
                let (_hrp, u5data) =
                    bech32::decode(bech_str).map_err(|e| JsError::from_str(&e.to_string()))?;
                let data: Vec<u8> = bech32::FromBase32::from_base32(&u5data).unwrap();
                Ok(Self::from_bytes(data)?)
            }

            pub fn to_hex(&self) -> String {
                hex::encode(&self.0)
            }

            pub fn from_hex(hex: &str) -> Result<$name, JsError> {
                let bytes = hex::decode(hex)
                    .map_err(|e| JsError::from_str(&format!("hex decode failed: {}", e)))?;
                Self::from_bytes(bytes).map_err(|e| JsError::from_str(&format!("{:?}", e)))
            }
        }

        // associated consts are not supported in wasm_bindgen
        impl $name {
            pub const BYTE_COUNT: usize = $byte_count;
        }

        // can't expose [T; N] to wasm for new() but it's useful internally so we implement From trait
        impl From<[u8; $byte_count]> for $name {
            fn from(bytes: [u8; $byte_count]) -> Self {
                Self(bytes)
            }
        }

        impl cbor_event::se::Serialize for $name {
            fn serialize<'se, W: std::io::Write>(
                &self,
                serializer: &'se mut Serializer<W>,
            ) -> cbor_event::Result<&'se mut Serializer<W>> {
                serializer.write_bytes(self.0)
            }
        }

        impl Deserialize for $name {
            fn deserialize<R: std::io::BufRead>(
                raw: &mut Deserializer<R>,
            ) -> Result<Self, DeserializeError> {
                use std::convert::TryInto;
                (|| -> Result<Self, DeserializeError> {
                    let bytes = raw.bytes()?;
                    if bytes.len() != $byte_count {
                        return Err(DeserializeFailure::CBOR(cbor_event::Error::WrongLen(
                            $byte_count,
                            cbor_event::Len::Len(bytes.len() as u64),
                            "hash length",
                        ))
                        .into());
                    }
                    Ok($name(bytes[..$byte_count].try_into().unwrap()))
                })()
                .map_err(|e| e.annotate(stringify!($name)))
            }
        }

        impl serde::Serialize for $name {
            fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
            where
                S: serde::Serializer,
            {
                serializer.serialize_str(&self.to_hex())
            }
        }

        impl<'de> serde::de::Deserialize<'de> for $name {
            fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
            where
                D: serde::de::Deserializer<'de>,
            {
                let s = <String as serde::de::Deserialize>::deserialize(deserializer)?;
                $name::from_hex(&s).map_err(|_e| {
                    serde::de::Error::invalid_value(
                        serde::de::Unexpected::Str(&s),
                        &"hex bytes for hash",
                    )
                })
            }
        }

        impl JsonSchema for $name {
            fn schema_name() -> String {
                String::from(stringify!($name))
            }
            fn json_schema(gen: &mut schemars::gen::SchemaGenerator) -> schemars::schema::Schema {
                String::json_schema(gen)
            }
            fn is_referenceable() -> bool {
                String::is_referenceable()
            }
        }
    };
}

#[wasm_bindgen]
pub struct LegacyDaedalusPrivateKey(pub(crate) crypto::SecretKey<crypto::LegacyDaedalus>);

#[wasm_bindgen]
impl LegacyDaedalusPrivateKey {
    pub fn from_bytes(bytes: &[u8]) -> Result<LegacyDaedalusPrivateKey, JsError> {
        crypto::SecretKey::<crypto::LegacyDaedalus>::from_binary(bytes)
            .map_err(|e| JsError::from_str(&format!("{}", e)))
            .map(LegacyDaedalusPrivateKey)
    }

    pub fn as_bytes(&self) -> Vec<u8> {
        self.0.as_ref().to_vec()
    }

    pub fn chaincode(&self) -> Vec<u8> {
        const ED25519_PRIVATE_KEY_LENGTH: usize = 64;
        const XPRV_SIZE: usize = 96;
        self.0.as_ref()[ED25519_PRIVATE_KEY_LENGTH..XPRV_SIZE].to_vec()
    }
}

impl_hash_type!(Ed25519KeyHash, 28);
impl_hash_type!(ScriptHash, 28);
impl_hash_type!(TransactionHash, 32);
impl_hash_type!(GenesisDelegateHash, 28);
impl_hash_type!(GenesisHash, 28);
impl_hash_type!(AuxiliaryDataHash, 32);
impl_hash_type!(PoolMetadataHash, 32);
impl_hash_type!(VRFKeyHash, 32);
impl_hash_type!(BlockHash, 32);
impl_hash_type!(DataHash, 32);
impl_hash_type!(ScriptDataHash, 32);
// We might want to make these two vkeys normal classes later but for now it's just arbitrary bytes for us (used in block parsing)
// impl_hash_type!(VRFVKey, 32);
impl_hash_type!(KESVKey, 32);
// same for this signature
//impl_hash_type!(KESSignature, 448);
// TODO: when >32 size trait implementations are out of nightly and into stable
// remove the following manual struct definition and use the above macro again if we
// don't have proper crypto implementations for it.

#[wasm_bindgen]
#[derive(Clone, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize, JsonSchema)]
pub struct VRFVKey(Vec<u8>);

to_from_bytes!(VRFVKey);

#[wasm_bindgen]
impl VRFVKey {
    pub fn hash(&self) -> VRFKeyHash {
        VRFKeyHash::from(blake2b256(self.0.to_vec().as_ref()))
    }

    pub fn to_raw_key(&self) -> Vec<u8> {
        self.0.clone()
    }
}

impl cbor_event::se::Serialize for VRFVKey {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_bytes(&self.0.to_vec())
    }
}

impl Deserialize for VRFVKey {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        Ok(Self(raw.bytes()?))
    }
}

#[wasm_bindgen]
#[derive(Debug, Clone, Eq, Hash, Ord, PartialEq, PartialOrd)]
pub struct KESSignature(pub(crate) Vec<u8>);

#[wasm_bindgen]
impl KESSignature {
    pub fn to_bytes(&self) -> Vec<u8> {
        self.0.clone()
    }
}

// associated consts are not supported in wasm_bindgen
impl KESSignature {
    pub const BYTE_COUNT: usize = 448;
}

from_bytes!(KESSignature, bytes, {
    match bytes.len() {
        Self::BYTE_COUNT => Ok(KESSignature(bytes)),
        other_len => {
            let cbor_error = cbor_event::Error::WrongLen(
                Self::BYTE_COUNT as u64,
                cbor_event::Len::Len(other_len as u64),
                "hash length",
            );
            Err(DeserializeError::new(
                "KESSignature",
                DeserializeFailure::CBOR(cbor_error),
            ))
        }
    }
});

impl cbor_event::se::Serialize for KESSignature {
    fn serialize<'se, W: std::io::Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_bytes(&self.0)
    }
}

impl Deserialize for KESSignature {
    fn deserialize<R: std::io::BufRead>(
        raw: &mut Deserializer<R>,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<Self, DeserializeError> {
            let bytes = raw.bytes()?;
            if bytes.len() != Self::BYTE_COUNT {
                return Err(DeserializeFailure::CBOR(cbor_event::Error::WrongLen(
                    Self::BYTE_COUNT as u64,
                    cbor_event::Len::Len(bytes.len() as u64),
                    "hash length",
                ))
                .into());
            }
            Ok(KESSignature(bytes))
        })()
        .map_err(|e| e.annotate("KESSignature"))
    }
}

impl serde::Serialize for KESSignature {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&hex::encode(self.to_bytes()))
    }
}

impl<'de> serde::de::Deserialize<'de> for KESSignature {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::de::Deserializer<'de>,
    {
        let s = <String as serde::de::Deserialize>::deserialize(deserializer)?;
        if let Ok(hex_bytes) = hex::decode(s.clone()) {
            if let Ok(sig) = KESSignature::from_bytes(hex_bytes) {
                return Ok(sig);
            }
        }
        Err(serde::de::Error::invalid_value(
            serde::de::Unexpected::Str(&s),
            &"hex bytes for KESSignature",
        ))
    }
}

impl JsonSchema for KESSignature {
    fn schema_name() -> String {
        String::from("KESSignature")
    }
    fn json_schema(gen: &mut schemars::gen::SchemaGenerator) -> schemars::schema::Schema {
        String::json_schema(gen)
    }
    fn is_referenceable() -> bool {
        String::is_referenceable()
    }
}

// Evolving nonce type (used for Update's crypto)
#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct Nonce {
    hash: Option<[u8; 32]>,
}

to_from_bytes!(Nonce);

// can't export consts via wasm_bindgen
impl Nonce {
    pub const HASH_LEN: usize = 32;
}

#[wasm_bindgen]
impl Nonce {
    pub fn new_identity() -> Nonce {
        Self { hash: None }
    }

    pub fn new_from_hash(hash: Vec<u8>) -> Result<Nonce, JsError> {
        use std::convert::TryInto;
        match hash[..Self::HASH_LEN].try_into() {
            Ok(bytes_correct_size) => Ok(Self {
                hash: Some(bytes_correct_size),
            }),
            Err(e) => Err(JsError::from_str(&e.to_string())),
        }
    }

    pub fn get_hash(&self) -> Option<Vec<u8>> {
        Some(self.hash?.to_vec())
    }
}

impl cbor_event::se::Serialize for Nonce {
    fn serialize<'se, W: std::io::Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        match &self.hash {
            Some(hash) => {
                serializer.write_array(cbor_event::Len::Len(2))?;
                serializer.write_unsigned_integer(1)?;
                serializer.write_bytes(hash)
            }
            None => {
                serializer.write_array(cbor_event::Len::Len(1))?;
                serializer.write_unsigned_integer(0)
            }
        }
    }
}

impl Deserialize for Nonce {
    fn deserialize<R: std::io::BufRead>(
        raw: &mut Deserializer<R>,
    ) -> Result<Self, DeserializeError> {
        (|| -> Result<Self, DeserializeError> {
            let len = raw.array()?;
            let hash = match raw.unsigned_integer()? {
                0 => None,
                1 => {
                    let bytes = raw.bytes()?;
                    if bytes.len() != Self::HASH_LEN {
                        return Err(DeserializeFailure::CBOR(cbor_event::Error::WrongLen(
                            Self::HASH_LEN as u64,
                            cbor_event::Len::Len(bytes.len() as u64),
                            "hash length",
                        ))
                        .into());
                    }
                    Some(bytes[..Self::HASH_LEN].try_into().unwrap())
                }
                _ => return Err(DeserializeFailure::NoVariantMatched.into()),
            };
            match len {
                cbor_event::Len::Len(n) => {
                    let correct_len = match n {
                        1 => hash.is_none(),
                        2 => hash.is_some(),
                        _ => false,
                    };
                    if !correct_len {
                        return Err(DeserializeFailure::NoVariantMatched.into());
                    }
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            };
            Ok(Self { hash })
        })()
        .map_err(|e| e.annotate(stringify!($name)))
    }
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct VRFCert {
    output: Vec<u8>,
    proof: Vec<u8>,
}

impl VRFCert {
    pub const PROOF_LEN: usize = 80;
}

to_from_bytes!(VRFCert);

to_from_json!(VRFCert);

#[wasm_bindgen]
impl VRFCert {
    pub fn output(&self) -> Vec<u8> {
        self.output.clone()
    }

    pub fn proof(&self) -> Vec<u8> {
        self.proof.clone()
    }

    pub fn new(output: Vec<u8>, proof: Vec<u8>) -> Result<VRFCert, JsError> {
        if proof.len() != Self::PROOF_LEN {
            return Err(JsError::from_str(&format!(
                "proof len must be {} - found {}",
                Self::PROOF_LEN,
                proof.len()
            )));
        }
        Ok(Self {
            output: output,
            proof: proof,
        })
    }
}

impl cbor_event::se::Serialize for VRFCert {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        serializer.write_bytes(&self.output)?;
        serializer.write_bytes(&self.proof)?;
        Ok(serializer)
    }
}

impl Deserialize for VRFCert {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let output = (|| -> Result<_, DeserializeError> { Ok(raw.bytes()?) })()
                .map_err(|e| e.annotate("output"))?;
            let proof = (|| -> Result<_, DeserializeError> { Ok(raw.bytes()?) })()
                .map_err(|e| e.annotate("proof"))?;
            if proof.len() != Self::PROOF_LEN {
                return Err(DeserializeFailure::CBOR(cbor_event::Error::WrongLen(
                    Self::PROOF_LEN as u64,
                    cbor_event::Len::Len(proof.len() as u64),
                    "proof length",
                ))
                .into());
            }
            match len {
                cbor_event::Len::Len(_) =>
                /* TODO: check finite len somewhere */
                {
                    ()
                }
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break =>
                    /* it's ok */
                    {
                        ()
                    }
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            Ok(VRFCert { output, proof })
        })()
        .map_err(|e| e.annotate("VRFCert"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn nonce_identity() {
        let orig = Nonce::new_identity();
        let deser = Nonce::deserialize(&mut Deserializer::from(std::io::Cursor::new(
            orig.to_bytes(),
        )))
        .unwrap();
        assert_eq!(orig.to_bytes(), deser.to_bytes());
    }

    #[test]
    fn nonce_hash() {
        let orig = Nonce::new_from_hash(vec![
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
            24, 25, 26, 27, 28, 29, 30, 31,
        ])
        .unwrap();
        let deser = Nonce::deserialize(&mut Deserializer::from(std::io::Cursor::new(
            orig.to_bytes(),
        )))
        .unwrap();
        assert_eq!(orig.to_bytes(), deser.to_bytes());
    }

    #[test]
    fn xprv_128_test() {
        // art forum devote street sure rather head chuckle guard poverty release quote oak craft enemy
        let entropy = [
            0x0c, 0xcb, 0x74, 0xf3, 0x6b, 0x7d, 0xa1, 0x64, 0x9a, 0x81, 0x44, 0x67, 0x55, 0x22,
            0xd4, 0xd8, 0x09, 0x7c, 0x64, 0x12,
        ];
        let root_key = Bip32PrivateKey::from_bip39_entropy(&entropy, &[]);

        assert_eq!(hex::encode(&root_key.as_bytes()), "b8f2bece9bdfe2b0282f5bad705562ac996efb6af96b648f4445ec44f47ad95c10e3d72f26ed075422a36ed8585c745a0e1150bcceba2357d058636991f38a3791e248de509c070d812ab2fda57860ac876bc489192c1ef4ce253c197ee219a4");
        let xprv_128 = root_key.to_128_xprv();
        // test the 128 xprv is the right format
        assert_eq!(hex::encode(&xprv_128), "b8f2bece9bdfe2b0282f5bad705562ac996efb6af96b648f4445ec44f47ad95c10e3d72f26ed075422a36ed8585c745a0e1150bcceba2357d058636991f38a37cf76399a210de8720e9fa894e45e41e29ab525e30bc402801c076250d1585bcd91e248de509c070d812ab2fda57860ac876bc489192c1ef4ce253c197ee219a4");
        let root_key_copy = Bip32PrivateKey::from_128_xprv(&xprv_128).unwrap();

        // test converting to and back is equivalent to the identity function
        assert_eq!(root_key.to_bech32(), root_key_copy.to_bech32());
    }

    #[test]
    fn chaincode_gen() {
        // art forum devote street sure rather head chuckle guard poverty release quote oak craft enemy
        let entropy = [
            0x0c, 0xcb, 0x74, 0xf3, 0x6b, 0x7d, 0xa1, 0x64, 0x9a, 0x81, 0x44, 0x67, 0x55, 0x22,
            0xd4, 0xd8, 0x09, 0x7c, 0x64, 0x12,
        ];
        let root_key = Bip32PrivateKey::from_bip39_entropy(&entropy, &[]);

        let prv_chaincode = root_key.chaincode();
        assert_eq!(
            hex::encode(&prv_chaincode),
            "91e248de509c070d812ab2fda57860ac876bc489192c1ef4ce253c197ee219a4"
        );

        let pub_chaincode = root_key.to_public().chaincode();
        assert_eq!(
            hex::encode(&pub_chaincode),
            "91e248de509c070d812ab2fda57860ac876bc489192c1ef4ce253c197ee219a4"
        );
    }

    #[test]
    fn private_key_from_bech32() {
        let pk = PrivateKey::generate_ed25519().unwrap();
        let pk_ext = PrivateKey::generate_ed25519extended().unwrap();

        assert_eq!(
            PrivateKey::from_bech32(&pk.to_bech32()).unwrap().as_bytes(),
            pk.as_bytes(),
        );
        assert_eq!(
            PrivateKey::from_bech32(&pk_ext.to_bech32())
                .unwrap()
                .as_bytes(),
            pk_ext.as_bytes(),
        );

        let er = PrivateKey::from_bech32("qwe");
        assert!(er.is_err());
    }
}
