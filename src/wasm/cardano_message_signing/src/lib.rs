// This library was partially code-generated using an experimental CDDL to rust tool:
// https://github.com/Emurgo/cddl-codegen

use linked_hash_map::LinkedHashMap;
use std::io::{BufRead, Write};

#[cfg(not(all(target_arch = "wasm32", not(target_os = "emscripten"))))]
use noop_proc_macro::wasm_bindgen;

#[cfg(all(target_arch = "wasm32", not(target_os = "emscripten")))]
use wasm_bindgen::prelude::wasm_bindgen;

use cbor_event::{
    self,
    de::Deserializer,
    se::{Serialize, Serializer},
};

pub mod builders;
pub mod cbor;
mod crypto;
pub mod error;
mod serialization;
#[macro_use]
pub mod utils;

use builders::*;
use cbor::*;
use error::*;
use utils::*;

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct ProtectedHeaderMap(Vec<u8>);

to_from_bytes!(ProtectedHeaderMap);

#[wasm_bindgen]
impl ProtectedHeaderMap {
    pub fn new_empty() -> Self {
        Self(Vec::new())
    }

    // COSE spec specifies that we SHOULD encode 0 length as 0 byte string rather than 0 length map
    pub fn new(header_map: &HeaderMap) -> Self {
        if header_map.keys().len() == 0 {
            Self::new_empty()
        } else {
            Self(header_map.to_bytes())
        }
    }

    pub fn deserialized_headers(&self) -> HeaderMap {
        if self.0.is_empty() {
            HeaderMap::new()
        } else {
            HeaderMap::from_bytes(self.0.clone())
                .expect("ProtectedHeaderMap shouldn't be able to be constructed without being valid HeaderMap bytes")
        }
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug, Eq, Ord, PartialEq, PartialOrd)]
pub enum LabelKind {
    Int,
    Text,
}

#[derive(Clone, Debug, Hash, Eq, Ord, PartialEq, PartialOrd)]
enum LabelEnum {
    Int(Int),
    Text(String),
}

#[wasm_bindgen]
#[derive(Clone, Debug, Eq, Hash, Ord, PartialEq, PartialOrd)]
pub struct Label(LabelEnum);

to_from_bytes!(Label);

#[wasm_bindgen]
impl Label {
    pub fn new_int(int: &Int) -> Self {
        Self(LabelEnum::Int(int.clone()))
    }

    pub fn new_text(text: String) -> Self {
        Self(LabelEnum::Text(text))
    }

    pub fn kind(&self) -> LabelKind {
        match &self.0 {
            LabelEnum::Int(_) => LabelKind::Int,
            LabelEnum::Text(_) => LabelKind::Text,
        }
    }

    pub fn as_int(&self) -> Option<Int> {
        match &self.0 {
            LabelEnum::Int(x) => Some(x.clone()),
            _ => None,
        }
    }

    pub fn as_text(&self) -> Option<String> {
        match &self.0 {
            LabelEnum::Text(x) => Some(x.clone()),
            _ => None,
        }
    }

    // we need to put these here instead of the label enum macros due to rust
    // restrictions on concat_idents!

    pub fn from_algorithm_id(id: AlgorithmId) -> Self {
        id.into()
    }

    pub fn from_key_type(key_type: KeyType) -> Self {
        key_type.into()
    }

    pub fn from_ec_key(ec_key: ECKey) -> Self {
        ec_key.into()
    }

    pub fn from_curve_type(curve_type: CurveType) -> Self {
        curve_type.into()
    }

    pub fn from_key_operation(key_op: KeyOperation) -> Self {
        key_op.into()
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug, Eq, Hash, Ord, PartialEq, PartialOrd)]
pub struct Labels(Vec<Label>);

to_from_bytes!(Labels);

#[wasm_bindgen]
impl Labels {
    pub fn new() -> Self {
        Self(Vec::new())
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn get(&self, index: usize) -> Label {
        self.0[index].clone()
    }

    pub fn add(&mut self, elem: &Label) {
        self.0.push(elem.clone());
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct COSESignatures(Vec<COSESignature>);

to_from_bytes!(COSESignatures);

#[wasm_bindgen]
impl COSESignatures {
    pub fn new() -> Self {
        Self(Vec::new())
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn get(&self, index: usize) -> COSESignature {
        self.0[index].clone()
    }

    pub fn add(&mut self, elem: &COSESignature) {
        self.0.push(elem.clone());
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct CounterSignature(COSESignatures);

to_from_bytes!(CounterSignature);

#[wasm_bindgen]
impl CounterSignature {
    pub fn new_single(cose_signature: &COSESignature) -> Self {
        let mut sigs = COSESignatures::new();
        sigs.add(cose_signature);
        Self(sigs)
    }

    pub fn new_multi(cose_signatures: &COSESignatures) -> Self {
        Self(cose_signatures.clone())
    }

    pub fn signatures(&self) -> COSESignatures {
        self.0.clone()
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct HeaderMap {
    // INT(1) key type
    algorithm_id: Option<Label>,
    // INT(2) key type
    criticality: Option<Labels>,
    // INT(3) key type
    content_type: Option<Label>,
    // INT(4) key type
    key_id: Option<Vec<u8>>,
    // INT(5) key type
    init_vector: Option<Vec<u8>>,
    // INT(6) key type
    partial_init_vector: Option<Vec<u8>>,
    // INT(7) key type
    counter_signature: Option<Box<CounterSignature>>,
    // all other headers not listed above. Does NOT contian the above, but the accessor functions do
    other_headers: LinkedHashMap<Label, CBORValue>,
}

to_from_bytes!(HeaderMap);

#[wasm_bindgen]
impl HeaderMap {
    pub fn set_algorithm_id(&mut self, algorithm_id: &Label) {
        self.algorithm_id = Some(algorithm_id.clone())
    }

    pub fn algorithm_id(&self) -> Option<Label> {
        self.algorithm_id.clone()
    }

    pub fn set_criticality(&mut self, criticality: &Labels) {
        self.criticality = Some(criticality.clone())
    }

    pub fn criticality(&self) -> Option<Labels> {
        self.criticality.clone()
    }

    pub fn set_content_type(&mut self, content_type: &Label) {
        self.content_type = Some(content_type.clone())
    }

    pub fn content_type(&self) -> Option<Label> {
        self.content_type.clone()
    }

    pub fn set_key_id(&mut self, key_id: Vec<u8>) {
        self.key_id = Some(key_id)
    }

    pub fn key_id(&self) -> Option<Vec<u8>> {
        self.key_id.clone()
    }

    pub fn set_init_vector(&mut self, init_vector: Vec<u8>) {
        self.init_vector = Some(init_vector)
    }

    pub fn init_vector(&self) -> Option<Vec<u8>> {
        self.init_vector.clone()
    }

    pub fn set_partial_init_vector(&mut self, partial_init_vector: Vec<u8>) {
        self.partial_init_vector = Some(partial_init_vector)
    }

    pub fn partial_init_vector(&self) -> Option<Vec<u8>> {
        self.partial_init_vector.clone()
    }

    pub fn set_counter_signature(&mut self, counter_signature: &CounterSignature) {
        self.counter_signature = Some(Box::new(counter_signature.clone()))
    }

    pub fn counter_signature(&self) -> Option<CounterSignature> {
        use std::ops::Deref;
        self.counter_signature
            .as_ref()
            .map(|sig| sig.deref().clone())
    }

    pub fn header(&self, label: &Label) -> Option<CBORValue> {
        match label.0 {
            LabelEnum::Int(Int(1)) => self.algorithm_id.as_ref().map(label_to_value),
            LabelEnum::Int(Int(2)) => self.criticality.as_ref().map(labels_to_value),
            LabelEnum::Int(Int(3)) => self.content_type.as_ref().map(label_to_value),
            LabelEnum::Int(Int(4)) => self
                .key_id
                .as_ref()
                .map(|kid| CBORValue::new_bytes(kid.clone())),
            LabelEnum::Int(Int(5)) => self
                .init_vector
                .as_ref()
                .map(|iv| CBORValue::new_bytes(iv.clone())),
            LabelEnum::Int(Int(6)) => self
                .partial_init_vector
                .as_ref()
                .map(|piv| CBORValue::new_bytes(piv.clone())),
            LabelEnum::Int(Int(7)) => {
                let bytes = self.counter_signature.as_ref()?.to_bytes();
                let mut raw = Deserializer::from(std::io::Cursor::new(bytes));
                Some(CBORValue::deserialize(&mut raw).unwrap())
            }
            _ => self.other_headers.get(label).map(|val| val.clone()),
        }
    }

    pub fn set_header(&mut self, label: &Label, value: &CBORValue) -> Result<(), JsError> {
        match label.0 {
            LabelEnum::Int(Int(1)) => {
                self.algorithm_id = Some(value_to_label(value)?);
            }
            LabelEnum::Int(Int(2)) => {
                let labels = match &value.0 {
                    CBORValueEnum::Array(vals) => vals,
                    _ => {
                        return Err(JsError::from_str(&format!(
                            "Expected array of labels, found: {:?}",
                            value
                        )))
                    }
                }
                .values
                .iter()
                .map(value_to_label)
                .collect::<Result<_, JsError>>()?;
                self.criticality = Some(Labels(labels));
            }
            LabelEnum::Int(Int(3)) => {
                self.content_type = Some(value_to_label(value)?);
            }
            LabelEnum::Int(Int(4)) => {
                self.key_id = Some(value_to_bytes(value)?);
            }
            LabelEnum::Int(Int(5)) => {
                self.init_vector = Some(value_to_bytes(value)?);
            }
            LabelEnum::Int(Int(6)) => {
                self.partial_init_vector = Some(value_to_bytes(value)?);
            }
            LabelEnum::Int(Int(7)) => {
                let mut buf = Serializer::new_vec();
                value.serialize(&mut buf).unwrap();
                let bytes = buf.finalize();
                self.counter_signature = Some(Box::new(CounterSignature::from_bytes(bytes)?));
            }
            _ => {
                self.other_headers.insert(label.clone(), value.clone());
            }
        }
        Ok(())
    }

    pub fn keys(&self) -> Labels {
        let mut keys = self
            .other_headers
            .keys()
            .into_iter()
            .map(|k| k.clone())
            .collect::<Vec<Label>>();
        if self.algorithm_id.is_some() {
            keys.push(Label::new_int(&Int::new_i32(1)));
        }
        if self.criticality.is_some() {
            keys.push(Label::new_int(&Int::new_i32(2)));
        }
        if self.content_type.is_some() {
            keys.push(Label::new_int(&Int::new_i32(3)));
        }
        if self.key_id.is_some() {
            keys.push(Label::new_int(&Int::new_i32(4)));
        }
        if self.init_vector.is_some() {
            keys.push(Label::new_int(&Int::new_i32(5)));
        }
        if self.partial_init_vector.is_some() {
            keys.push(Label::new_int(&Int::new_i32(6)));
        }
        if self.counter_signature.is_some() {
            keys.push(Label::new_int(&Int::new_i32(7)));
        }
        Labels(keys)
    }

    pub fn new() -> Self {
        Self {
            algorithm_id: None,
            criticality: None,
            content_type: None,
            key_id: None,
            init_vector: None,
            partial_init_vector: None,
            counter_signature: None,
            other_headers: LinkedHashMap::new(),
        }
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Headers {
    protected: ProtectedHeaderMap,
    unprotected: HeaderMap,
}

to_from_bytes!(Headers);

#[wasm_bindgen]
impl Headers {
    pub fn protected(&self) -> ProtectedHeaderMap {
        self.protected.clone()
    }

    pub fn unprotected(&self) -> HeaderMap {
        self.unprotected.clone()
    }

    pub fn new(protected_: &ProtectedHeaderMap, unprotected_: &HeaderMap) -> Self {
        Self {
            protected: protected_.clone(),
            unprotected: unprotected_.clone(),
        }
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct COSESignature {
    headers: Headers,
    signature: Vec<u8>,
}

to_from_bytes!(COSESignature);

#[wasm_bindgen]
impl COSESignature {
    pub fn headers(&self) -> Headers {
        self.headers.clone()
    }

    pub fn signature(&self) -> Vec<u8> {
        self.signature.clone()
    }

    pub fn new(headers: &Headers, signature: Vec<u8>) -> Self {
        Self {
            headers: headers.clone(),
            signature: signature,
        }
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct COSESign1 {
    headers: Headers,
    payload: Option<Vec<u8>>,
    signature: Vec<u8>,
}

to_from_bytes!(COSESign1);

#[wasm_bindgen]
impl COSESign1 {
    pub fn headers(&self) -> Headers {
        self.headers.clone()
    }

    pub fn payload(&self) -> Option<Vec<u8>> {
        self.payload.clone()
    }

    pub fn signature(&self) -> Vec<u8> {
        self.signature.clone()
    }

    /// For verifying, we will want to reverse-construct this SigStructure to check the signature against
    /// # Arguments
    /// * `external_aad` - External application data - see RFC 8152 section 4.3. Set to None if not using this.
    pub fn signed_data(
        &self,
        external_aad: Option<Vec<u8>>,
        external_payload: Option<Vec<u8>>,
    ) -> Result<SigStructure, JsError> {
        let payload = match external_payload {
            Some(p) => p.clone(),
            None => self.payload.clone().ok_or_else(|| {
                JsError::from_str("Payload was not present but no external payload supplied")
            })?,
        };
        Ok(SigStructure::new(
            SigContext::Signature1,
            &self.headers.protected,
            external_aad.clone().unwrap_or(vec![]),
            payload,
        ))
    }

    pub fn new(headers: &Headers, payload: Option<Vec<u8>>, signature: Vec<u8>) -> Self {
        Self {
            headers: headers.clone(),
            payload: payload,
            signature: signature,
        }
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct COSESign {
    headers: Headers,
    payload: Option<Vec<u8>>,
    signatures: COSESignatures,
}

to_from_bytes!(COSESign);

#[wasm_bindgen]
impl COSESign {
    pub fn headers(&self) -> Headers {
        self.headers.clone()
    }

    pub fn payload(&self) -> Option<Vec<u8>> {
        self.payload.clone()
    }

    pub fn signatures(&self) -> COSESignatures {
        self.signatures.clone()
    }

    pub fn new(headers: &Headers, payload: Option<Vec<u8>>, signatures: &COSESignatures) -> Self {
        Self {
            headers: headers.clone(),
            payload: payload,
            signatures: signatures.clone(),
        }
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug, Eq, Ord, PartialEq, PartialOrd)]
pub enum SignedMessageKind {
    COSESIGN,
    COSESIGN1,
}

#[derive(Clone, Debug)]
enum SignedMessageEnum {
    COSESIGN(COSESign),
    COSESIGN1(COSESign1),
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct SignedMessage(SignedMessageEnum);

to_from_bytes!(SignedMessage);

#[wasm_bindgen]
impl SignedMessage {
    pub fn new_cose_sign(cose_sign: &COSESign) -> Self {
        Self(SignedMessageEnum::COSESIGN(cose_sign.clone()))
    }

    pub fn new_cose_sign1(cose_sign1: &COSESign1) -> Self {
        Self(SignedMessageEnum::COSESIGN1(cose_sign1.clone()))
    }

    pub fn from_user_facing_encoding(s: &str) -> Result<SignedMessage, JsError> {
        use byteorder::{BigEndian, ReadBytesExt};
        use std::io::Cursor;

        if !s.starts_with("cms_") {
            return Err(JsError::from_str(
                "SignedMessage user facing encoding must start with \"cms_\"",
            ));
        }
        let without_prefix = &s[4..];
        // we need to (potentialy) strip the padding, if it exists on the checksum, in order to
        // figure out which parts of the string are from the base64url of the checksum as this
        // could be either 6 (no padding) or 8 (padding) to get the 4 bytes in the checksum
        let without_checksum_padding = without_prefix.trim_end_matches('=');
        // 6 for checksum base64url (4 bytes) + at least 2 for body base64url (at least 1 byte)
        if without_checksum_padding.len() < 8 {
            return Err(JsError::from_str("insufficient length - missing checksum"));
        }
        let (body_base64, checksum_base64) =
            without_checksum_padding.split_at(without_checksum_padding.len() - 6);
        let body_bytes = base64_url::decode(body_base64).map_err(|e| {
            JsError::from_str(&format!("Could not decode body from base64url: {:?}", e))
        })?;
        let checksum_bytes = base64_url::decode(checksum_base64).map_err(|e| {
            JsError::from_str(&format!(
                "Could not decode checksum from base64url: {:?}",
                e
            ))
        })?;
        let expected_checksum = Cursor::new(checksum_bytes).read_u32::<BigEndian>().unwrap();
        let computed_checksum = crypto::fnv32a(&body_bytes);
        if expected_checksum != computed_checksum {
            return Err(JsError::from_str(&format!(
                "checksum does not match body. shown: {}, computed from body: {}",
                expected_checksum, computed_checksum
            )));
        }
        Self::from_bytes(body_bytes)
            .map_err(|e| JsError::from_str(&format!("Invalid body: {:?}", e)))
    }

    pub fn to_user_facing_encoding(&self) -> String {
        use byteorder::{BigEndian, WriteBytesExt};

        let body_bytes = self.to_bytes();
        let checksum = crypto::fnv32a(&body_bytes);
        let mut checksum_bytes = vec![];
        checksum_bytes.write_u32::<BigEndian>(checksum).unwrap();
        format!(
            "cms_{}{}",
            base64_url::encode(&body_bytes),
            base64_url::encode(&checksum_bytes)
        )
    }

    pub fn kind(&self) -> SignedMessageKind {
        match &self.0 {
            SignedMessageEnum::COSESIGN(_) => SignedMessageKind::COSESIGN,
            SignedMessageEnum::COSESIGN1(_) => SignedMessageKind::COSESIGN1,
        }
    }

    pub fn as_cose_sign(&self) -> Option<COSESign> {
        match &self.0 {
            SignedMessageEnum::COSESIGN(x) => Some(x.clone()),
            _ => None,
        }
    }

    pub fn as_cose_sign1(&self) -> Option<COSESign1> {
        match &self.0 {
            SignedMessageEnum::COSESIGN1(x) => Some(x.clone()),
            _ => None,
        }
    }
}

#[wasm_bindgen]
#[derive(Clone, Copy, Debug, Eq, Ord, PartialEq, PartialOrd)]
pub enum SigContext {
    Signature,
    Signature1,
    CounterSignature,
}

// We sign this structure's to_bytes() serialization instead of signing of messages directly
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct SigStructure {
    context: SigContext,
    body_protected: ProtectedHeaderMap,
    sign_protected: Option<ProtectedHeaderMap>,
    external_aad: Vec<u8>,
    payload: Vec<u8>,
}

to_from_bytes!(SigStructure);

#[wasm_bindgen]
impl SigStructure {
    pub fn context(&self) -> SigContext {
        self.context.clone()
    }

    pub fn body_protected(&self) -> ProtectedHeaderMap {
        self.body_protected.clone()
    }

    pub fn sign_protected(&self) -> Option<ProtectedHeaderMap> {
        self.sign_protected.clone()
    }

    pub fn external_aad(&self) -> Vec<u8> {
        self.external_aad.clone()
    }

    pub fn payload(&self) -> Vec<u8> {
        self.payload.clone()
    }

    pub fn set_sign_protected(&mut self, sign_protected: &ProtectedHeaderMap) {
        self.sign_protected = Some(sign_protected.clone());
    }

    pub fn new(
        context: SigContext,
        body_protected: &ProtectedHeaderMap,
        external_aad: Vec<u8>,
        payload: Vec<u8>,
    ) -> Self {
        Self {
            context,
            body_protected: body_protected.clone(),
            sign_protected: None,
            external_aad,
            payload,
        }
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct COSEEncrypt0 {
    headers: Headers,
    ciphertext: Option<Vec<u8>>,
}

to_from_bytes!(COSEEncrypt0);

#[wasm_bindgen]
impl COSEEncrypt0 {
    pub fn headers(&self) -> Headers {
        self.headers.clone()
    }

    pub fn ciphertext(&self) -> Option<Vec<u8>> {
        self.ciphertext.clone()
    }

    pub fn new(headers: &Headers, ciphertext: Option<Vec<u8>>) -> Self {
        Self {
            headers: headers.clone(),
            ciphertext: ciphertext,
        }
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct PasswordEncryption(COSEEncrypt0);

to_from_bytes!(PasswordEncryption);

#[wasm_bindgen]
impl PasswordEncryption {
    pub fn new(data: &COSEEncrypt0) -> Self {
        Self(data.clone())
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct COSERecipients(Vec<COSERecipient>);

to_from_bytes!(COSERecipients);

#[wasm_bindgen]
impl COSERecipients {
    pub fn new() -> Self {
        Self(Vec::new())
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn get(&self, index: usize) -> COSERecipient {
        self.0[index].clone()
    }

    pub fn add(&mut self, elem: &COSERecipient) {
        self.0.push(elem.clone());
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct COSEEncrypt {
    headers: Headers,
    ciphertext: Option<Vec<u8>>,
    recipients: COSERecipients,
}

to_from_bytes!(COSEEncrypt);

#[wasm_bindgen]
impl COSEEncrypt {
    pub fn headers(&self) -> Headers {
        self.headers.clone()
    }

    pub fn ciphertext(&self) -> Option<Vec<u8>> {
        self.ciphertext.clone()
    }

    pub fn recipients(&self) -> COSERecipients {
        self.recipients.clone()
    }

    pub fn new(
        headers: &Headers,
        ciphertext: Option<Vec<u8>>,
        recipients: &COSERecipients,
    ) -> Self {
        Self {
            headers: headers.clone(),
            ciphertext: ciphertext,
            recipients: recipients.clone(),
        }
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct COSERecipient {
    headers: Headers,
    ciphertext: Option<Vec<u8>>,
}

to_from_bytes!(COSERecipient);

#[wasm_bindgen]
impl COSERecipient {
    pub fn headers(&self) -> Headers {
        self.headers.clone()
    }

    pub fn ciphertext(&self) -> Option<Vec<u8>> {
        self.ciphertext.clone()
    }

    pub fn new(headers: &Headers, ciphertext: Option<Vec<u8>>) -> Self {
        Self {
            headers: headers.clone(),
            ciphertext: ciphertext,
        }
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct PubKeyEncryption(COSEEncrypt);

to_from_bytes!(PubKeyEncryption);

#[wasm_bindgen]
impl PubKeyEncryption {
    pub fn new(data: &COSEEncrypt) -> Self {
        Self(data.clone())
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct COSEKey {
    // INT(1) key type, See KeyType enum (OKP, ECS, etc)
    key_type: Label,
    // INT(2)
    key_id: Option<Vec<u8>>,
    // INT(3) algorithm identifier. See AlgorithmIds enum (EdDSA, ChaChaPoly, etc)
    algorithm_id: Option<Label>,
    // INT(4) opertions that this key is valid for if this field exists
    key_ops: Option<Labels>,
    // INT(5)
    base_init_vector: Option<Vec<u8>>,
    // all other headers not listed above. Does NOT contian the above, but the accessor functions do
    other_headers: LinkedHashMap<Label, CBORValue>,
}

to_from_bytes!(COSEKey);

#[wasm_bindgen]
impl COSEKey {
    pub fn set_key_type(&mut self, key_type: &Label) {
        self.key_type = key_type.clone()
    }

    pub fn key_type(&self) -> Label {
        self.key_type.clone()
    }

    pub fn set_key_id(&mut self, key_id: Vec<u8>) {
        self.key_id = Some(key_id)
    }

    pub fn key_id(&self) -> Option<Vec<u8>> {
        self.key_id.clone()
    }

    pub fn set_algorithm_id(&mut self, algorithm_id: &Label) {
        self.algorithm_id = Some(algorithm_id.clone())
    }

    pub fn algorithm_id(&self) -> Option<Label> {
        self.algorithm_id.clone()
    }

    pub fn set_key_ops(&mut self, key_ops: &Labels) {
        self.key_ops = Some(key_ops.clone())
    }

    pub fn key_ops(&self) -> Option<Labels> {
        self.key_ops.clone()
    }

    pub fn set_base_init_vector(&mut self, base_init_vector: Vec<u8>) {
        self.base_init_vector = Some(base_init_vector)
    }

    pub fn base_init_vector(&self) -> Option<Vec<u8>> {
        self.base_init_vector.clone()
    }

    pub fn header(&self, label: &Label) -> Option<CBORValue> {
        fn label_to_value(label: &Label) -> CBORValue {
            match &label.0 {
                LabelEnum::Int(x) => CBORValue::new_int(x),
                LabelEnum::Text(x) => CBORValue::new_text(x.to_string()),
            }
        }
        match label.0 {
            LabelEnum::Int(Int(1)) => Some(label_to_value(&self.key_type)),
            LabelEnum::Int(Int(2)) => self
                .key_id
                .as_ref()
                .map(|kid| CBORValue::new_bytes(kid.clone())),
            LabelEnum::Int(Int(3)) => self.algorithm_id.as_ref().map(label_to_value),
            LabelEnum::Int(Int(4)) => self.key_ops.as_ref().map(labels_to_value),
            LabelEnum::Int(Int(5)) => self
                .base_init_vector
                .as_ref()
                .map(|biv| CBORValue::new_bytes(biv.clone())),
            _ => self.other_headers.get(label).map(|val| val.clone()),
        }
    }

    pub fn set_header(&mut self, label: &Label, value: &CBORValue) -> Result<(), JsError> {
        match label.0 {
            LabelEnum::Int(Int(1)) => {
                self.key_type = value_to_label(value)?;
            }
            LabelEnum::Int(Int(2)) => {
                self.key_id = Some(value_to_bytes(value)?);
            }
            LabelEnum::Int(Int(3)) => {
                self.algorithm_id = Some(value_to_label(value)?);
            }
            LabelEnum::Int(Int(4)) => {
                let labels = match &value.0 {
                    CBORValueEnum::Array(vals) => vals,
                    _ => {
                        return Err(JsError::from_str(&format!(
                            "Expected array of labels, found: {:?}",
                            value
                        )))
                    }
                }
                .values
                .iter()
                .map(value_to_label)
                .collect::<Result<_, JsError>>()?;
                self.key_ops = Some(Labels(labels));
            }
            LabelEnum::Int(Int(5)) => {
                self.base_init_vector = Some(value_to_bytes(value)?);
            }
            _ => {
                self.other_headers.insert(label.clone(), value.clone());
            }
        }
        Ok(())
    }

    pub fn new(key_type: &Label) -> Self {
        Self {
            key_type: key_type.clone(),
            key_id: None,
            algorithm_id: None,
            key_ops: None,
            base_init_vector: None,
            other_headers: LinkedHashMap::new(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn label_int(x: i32) -> Label {
        Label::new_int(&Int::new_i32(x))
    }

    fn label_str(s: &str) -> Label {
        Label::new_text(String::from(s))
    }

    #[test]
    fn cose_key_other_headers_overlap() {
        let kty1 = label_str("key type 1");
        let kid1 = vec![1u8, 2u8, 5u8, 10u8, 20u8, 40u8, 50u8];
        let alg1 = label_int(-10);
        let mut ops1 = Labels::new();
        ops1.add(&label_str("dfdsfds"));
        ops1.add(&label_int(-130));
        let biv1 = vec![0u8; 128];

        let kty1_value = CBORValue::new_text(String::from("key type 1"));
        let kid1_value = CBORValue::new_bytes(kid1.clone());
        let alg1_value = CBORValue::new_int(&Int::new_i32(-10));
        let ops1_value = CBORValue::new_array(
            &vec![
                CBORValue::new_text(String::from("dfdsfds")),
                CBORValue::new_int(&Int::new_i32(-130)),
            ]
            .into(),
        );
        let biv1_value = CBORValue::new_bytes(biv1.clone());

        let kty2 = label_int(352);
        let kid2 = vec![7u8; 23];
        let alg2 = label_str("algorithm 2");
        let mut ops2 = Labels::new();
        ops2.add(&label_str("89583249384"));
        let biv2 = vec![10u8, 0u8, 5u8, 9u8, 50u8, 100u8, 30u8];

        let kty2_value = CBORValue::new_int(&Int::new_i32(352));
        let kid2_value = CBORValue::new_bytes(kid2.clone());
        let alg2_value = CBORValue::new_text(String::from("algorithm 2"));
        let ops2_value =
            CBORValue::new_array(&vec![CBORValue::new_text(String::from("89583249384"))].into());
        let biv2_value = CBORValue::new_bytes(biv2.clone());

        let mut ck = COSEKey::new(&kty1);
        ck.set_key_id(kid1.clone());
        ck.set_algorithm_id(&alg1);
        ck.set_key_ops(&ops1);
        ck.set_base_init_vector(biv1.clone());

        assert_eq!(ck.header(&label_int(1)), Some(kty1_value));
        assert_eq!(ck.header(&label_int(2)), Some(kid1_value));
        assert_eq!(ck.header(&label_int(3)), Some(alg1_value));
        assert_eq!(ck.header(&label_int(4)), Some(ops1_value));
        assert_eq!(ck.header(&label_int(5)), Some(biv1_value));

        ck.set_header(&label_int(1), &kty2_value).unwrap();
        ck.set_header(&label_int(2), &kid2_value).unwrap();
        ck.set_header(&label_int(3), &alg2_value).unwrap();
        ck.set_header(&label_int(4), &ops2_value).unwrap();
        ck.set_header(&label_int(5), &biv2_value).unwrap();

        assert_eq!(ck.key_type(), kty2);
        assert_eq!(ck.key_id(), Some(kid2));
        assert_eq!(ck.algorithm_id(), Some(alg2));
        assert_eq!(ck.key_ops(), Some(ops2));
        assert_eq!(ck.base_init_vector(), Some(biv2));
    }

    #[test]
    fn signed_message_user_facing_encoding() {
        // round-trip testing
        let mut header_map = HeaderMap::new();
        header_map.set_content_type(&Label::new_int(&Int::new_i32(-1000)));
        let headers = Headers::new(&ProtectedHeaderMap::new_empty(), &header_map);
        let signed_message = SignedMessage::new_cose_sign1(&COSESign1::new(
            &headers,
            Some(vec![64u8; 39]),
            vec![1u8, 2u8, 100u8],
        ));
        let user_facing_encoding = signed_message.to_user_facing_encoding();
        let from_ufe = SignedMessage::from_user_facing_encoding(&user_facing_encoding).unwrap();
        assert_eq!(from_ufe.to_bytes(), signed_message.to_bytes());
        // test acceptance of padding or lack thereof in data and/or checksum
        let pad1 = SignedMessage::from_user_facing_encoding(
            "cms_hEChAzkD51gnQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQwECZACyaZmw==",
        )
        .unwrap();
        let pad2 = SignedMessage::from_user_facing_encoding(
            "cms_hEChAzkD51gnQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQwECZA==CyaZmw",
        )
        .unwrap();
        let pad3 = SignedMessage::from_user_facing_encoding(
            "cms_hEChAzkD51gnQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQwECZA==CyaZmw==",
        )
        .unwrap();
        assert_eq!(signed_message.to_bytes(), pad1.to_bytes());
        assert_eq!(pad1.to_bytes(), pad2.to_bytes());
        assert_eq!(pad2.to_bytes(), pad3.to_bytes());
    }
}
