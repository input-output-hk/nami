use super::*;
use linked_hash_map::LinkedHashMap;

const MD_MAX_LEN: usize = 64;

#[wasm_bindgen]
#[derive(Clone, Debug, Eq, Hash, Ord, PartialEq, PartialOrd)]
pub struct MetadataMap(LinkedHashMap<TransactionMetadatum, TransactionMetadatum>);

to_from_bytes!(MetadataMap);

#[wasm_bindgen]
impl MetadataMap {
    pub fn new() -> Self {
        Self(LinkedHashMap::new())
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn insert(
        &mut self,
        key: &TransactionMetadatum,
        value: &TransactionMetadatum,
    ) -> Option<TransactionMetadatum> {
        self.0.insert(key.clone(), value.clone())
    }

    // convenience function for inserting as a string key
    pub fn insert_str(
        &mut self,
        key: &str,
        value: &TransactionMetadatum,
    ) -> Result<Option<TransactionMetadatum>, JsError> {
        Ok(self.insert(&TransactionMetadatum::new_text(key.to_owned())?, value))
    }

    // convenience function for inserting 32-bit integers - for higher-precision integers use insert() with an Int struct
    pub fn insert_i32(
        &mut self,
        key: i32,
        value: &TransactionMetadatum,
    ) -> Option<TransactionMetadatum> {
        self.insert(&TransactionMetadatum::new_int(&Int::new_i32(key)), value)
    }

    pub fn get(&self, key: &TransactionMetadatum) -> Result<TransactionMetadatum, JsError> {
        self.0
            .get(key)
            .map(|v| v.clone())
            .ok_or_else(|| JsError::from_str(&format!("key {:?} not found", key)))
    }

    // convenience function for retrieving a string key
    pub fn get_str(&self, key: &str) -> Result<TransactionMetadatum, JsError> {
        self.get(&TransactionMetadatum::new_text(key.to_owned())?)
    }

    // convenience function for retrieving 32-bit integer keys - for higher-precision integers use get() with an Int struct
    pub fn get_i32(&self, key: i32) -> Result<TransactionMetadatum, JsError> {
        self.get(&TransactionMetadatum::new_int(&Int::new_i32(key)))
    }

    pub fn has(&self, key: &TransactionMetadatum) -> bool {
        self.0.contains_key(key)
    }

    pub fn keys(&self) -> MetadataList {
        MetadataList(
            self.0
                .iter()
                .map(|(k, _v)| k.clone())
                .collect::<Vec<TransactionMetadatum>>(),
        )
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug, Eq, Hash, Ord, PartialEq, PartialOrd)]
pub struct MetadataList(Vec<TransactionMetadatum>);

to_from_bytes!(MetadataList);

#[wasm_bindgen]
impl MetadataList {
    pub fn new() -> Self {
        Self(Vec::new())
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn get(&self, index: usize) -> TransactionMetadatum {
        self.0[index].clone()
    }

    pub fn add(&mut self, elem: &TransactionMetadatum) {
        self.0.push(elem.clone());
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug, Eq, Ord, PartialEq, PartialOrd)]
pub enum TransactionMetadatumKind {
    MetadataMap,
    MetadataList,
    Int,
    Bytes,
    Text,
}

#[derive(Clone, Debug, Eq, Hash, Ord, PartialEq, PartialOrd)]
enum TransactionMetadatumEnum {
    MetadataMap(MetadataMap),
    MetadataList(MetadataList),
    Int(Int),
    Bytes(Vec<u8>),
    Text(String),
}

#[wasm_bindgen]
#[derive(Clone, Debug, Eq, Hash, Ord, PartialEq, PartialOrd)]
pub struct TransactionMetadatum(TransactionMetadatumEnum);

to_from_bytes!(TransactionMetadatum);

#[wasm_bindgen]
impl TransactionMetadatum {
    pub fn new_map(map: &MetadataMap) -> Self {
        Self(TransactionMetadatumEnum::MetadataMap(map.clone()))
    }

    pub fn new_list(list: &MetadataList) -> Self {
        Self(TransactionMetadatumEnum::MetadataList(list.clone()))
    }

    pub fn new_int(int: &Int) -> Self {
        Self(TransactionMetadatumEnum::Int(int.clone()))
    }

    pub fn new_bytes(bytes: Vec<u8>) -> Result<TransactionMetadatum, JsError> {
        if bytes.len() > MD_MAX_LEN {
            Err(JsError::from_str(&format!(
                "Max metadata bytes too long: {}, max = {}",
                bytes.len(),
                MD_MAX_LEN
            )))
        } else {
            Ok(Self(TransactionMetadatumEnum::Bytes(bytes)))
        }
    }

    pub fn new_text(text: String) -> Result<TransactionMetadatum, JsError> {
        if text.len() > MD_MAX_LEN {
            Err(JsError::from_str(&format!(
                "Max metadata string too long: {}, max = {}",
                text.len(),
                MD_MAX_LEN
            )))
        } else {
            Ok(Self(TransactionMetadatumEnum::Text(text)))
        }
    }

    pub fn kind(&self) -> TransactionMetadatumKind {
        match &self.0 {
            TransactionMetadatumEnum::MetadataMap(_) => TransactionMetadatumKind::MetadataMap,
            TransactionMetadatumEnum::MetadataList(_) => TransactionMetadatumKind::MetadataList,
            TransactionMetadatumEnum::Int(_) => TransactionMetadatumKind::Int,
            TransactionMetadatumEnum::Bytes(_) => TransactionMetadatumKind::Bytes,
            TransactionMetadatumEnum::Text(_) => TransactionMetadatumKind::Text,
        }
    }

    pub fn as_map(&self) -> Result<MetadataMap, JsError> {
        match &self.0 {
            TransactionMetadatumEnum::MetadataMap(x) => Ok(x.clone()),
            _ => Err(JsError::from_str("not a map")),
        }
    }

    pub fn as_list(&self) -> Result<MetadataList, JsError> {
        match &self.0 {
            TransactionMetadatumEnum::MetadataList(x) => Ok(x.clone()),
            _ => Err(JsError::from_str("not a list")),
        }
    }

    pub fn as_int(&self) -> Result<Int, JsError> {
        match &self.0 {
            TransactionMetadatumEnum::Int(x) => Ok(x.clone()),
            _ => Err(JsError::from_str("not an int")),
        }
    }

    pub fn as_bytes(&self) -> Result<Vec<u8>, JsError> {
        match &self.0 {
            TransactionMetadatumEnum::Bytes(x) => Ok(x.clone()),
            _ => Err(JsError::from_str("not bytes")),
        }
    }

    pub fn as_text(&self) -> Result<String, JsError> {
        match &self.0 {
            TransactionMetadatumEnum::Text(x) => Ok(x.clone()),
            _ => Err(JsError::from_str("not text")),
        }
    }
}

impl serde::Serialize for TransactionMetadatum {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let json_str = decode_metadatum_to_json_str(self, MetadataJsonSchema::DetailedSchema)
            .map_err(|e| serde::ser::Error::custom(&format!("{:?}", e)))?;
        serializer.serialize_str(&json_str)
    }
}

impl<'de> serde::de::Deserialize<'de> for TransactionMetadatum {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::de::Deserializer<'de>,
    {
        let s = <String as serde::de::Deserialize>::deserialize(deserializer)?;
        encode_json_str_to_metadatum(s.clone(), MetadataJsonSchema::DetailedSchema).map_err(|e| {
            serde::de::Error::invalid_value(
                serde::de::Unexpected::Str(&s),
                &format!("{:?}", e).as_str(),
            )
        })
    }
}

// just for now we'll do json-in-json until I can figure this out better
// TODO: maybe not generate this? or how do we do this?
impl JsonSchema for TransactionMetadatum {
    fn schema_name() -> String {
        String::from("TransactionMetadatum")
    }
    fn json_schema(gen: &mut schemars::gen::SchemaGenerator) -> schemars::schema::Schema {
        String::json_schema(gen)
    }
    fn is_referenceable() -> bool {
        String::is_referenceable()
    }
}

pub type TransactionMetadatumLabel = BigNum;

#[wasm_bindgen]
#[derive(Clone, Debug, Eq, Ord, PartialEq, PartialOrd)]
pub struct TransactionMetadatumLabels(Vec<TransactionMetadatumLabel>);

to_from_bytes!(TransactionMetadatumLabels);

#[wasm_bindgen]
impl TransactionMetadatumLabels {
    pub fn new() -> Self {
        Self(Vec::new())
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn get(&self, index: usize) -> TransactionMetadatumLabel {
        self.0[index].clone()
    }

    pub fn add(&mut self, elem: &TransactionMetadatumLabel) {
        self.0.push(elem.clone());
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug, Eq, Ord, PartialEq, PartialOrd)]
pub struct GeneralTransactionMetadata(
    LinkedHashMap<TransactionMetadatumLabel, TransactionMetadatum>,
);

to_from_bytes!(GeneralTransactionMetadata);

to_from_json!(GeneralTransactionMetadata);

#[wasm_bindgen]
impl GeneralTransactionMetadata {
    pub fn new() -> Self {
        Self(LinkedHashMap::new())
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn insert(
        &mut self,
        key: &TransactionMetadatumLabel,
        value: &TransactionMetadatum,
    ) -> Option<TransactionMetadatum> {
        self.0.insert(key.clone(), value.clone())
    }

    pub fn get(&self, key: &TransactionMetadatumLabel) -> Option<TransactionMetadatum> {
        self.0.get(key).map(|v| v.clone())
    }

    pub fn keys(&self) -> TransactionMetadatumLabels {
        TransactionMetadatumLabels(
            self.0
                .iter()
                .map(|(k, _v)| k.clone())
                .collect::<Vec<TransactionMetadatumLabel>>(),
        )
    }
}

impl serde::Serialize for GeneralTransactionMetadata {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let map = self.0.iter().collect::<std::collections::BTreeMap<_, _>>();
        map.serialize(serializer)
    }
}

impl<'de> serde::de::Deserialize<'de> for GeneralTransactionMetadata {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::de::Deserializer<'de>,
    {
        let map = <std::collections::BTreeMap<_, _> as serde::de::Deserialize>::deserialize(
            deserializer,
        )?;
        Ok(Self(map.into_iter().collect()))
    }
}

impl JsonSchema for GeneralTransactionMetadata {
    fn schema_name() -> String {
        String::from("GeneralTransactionMetadata")
    }
    fn json_schema(gen: &mut schemars::gen::SchemaGenerator) -> schemars::schema::Schema {
        std::collections::BTreeMap::<TransactionMetadatumLabel, TransactionMetadatum>::json_schema(
            gen,
        )
    }
    fn is_referenceable() -> bool {
        std::collections::BTreeMap::<TransactionMetadatumLabel, TransactionMetadatum>::is_referenceable()
    }
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct AuxiliaryData {
    metadata: Option<GeneralTransactionMetadata>,
    native_scripts: Option<NativeScripts>,
    plutus_scripts: Option<PlutusScripts>,
    plutus_v2_scripts: Option<PlutusScripts>,
    plutus_v3_scripts: Option<PlutusScripts>,
}

to_from_bytes!(AuxiliaryData);

to_from_json!(AuxiliaryData);

#[wasm_bindgen]
impl AuxiliaryData {
    pub fn new() -> Self {
        Self {
            metadata: None,
            native_scripts: None,
            plutus_scripts: None,
            plutus_v2_scripts: None,
            plutus_v3_scripts: None,
        }
    }

    pub fn metadata(&self) -> Option<GeneralTransactionMetadata> {
        self.metadata.clone()
    }

    pub fn set_metadata(&mut self, metadata: &GeneralTransactionMetadata) {
        self.metadata = Some(metadata.clone());
    }

    pub fn native_scripts(&self) -> Option<NativeScripts> {
        self.native_scripts.clone()
    }

    pub fn set_native_scripts(&mut self, native_scripts: &NativeScripts) {
        self.native_scripts = Some(native_scripts.clone())
    }

    pub fn plutus_scripts(&self) -> Option<PlutusScripts> {
        self.plutus_scripts.clone()
    }

    pub fn plutus_v2_scripts(&self) -> Option<PlutusScripts> {
        self.plutus_v2_scripts.clone()
    }

    pub fn plutus_v3_scripts(&self) -> Option<PlutusScripts> {
        self.plutus_v3_scripts.clone()
    }

    pub fn set_plutus_scripts(&mut self, plutus_scripts: &PlutusScripts) {
        self.plutus_scripts = Some(plutus_scripts.clone())
    }

    pub fn set_plutus_v2_scripts(&mut self, plutus_scripts: &PlutusScripts) {
        self.plutus_v2_scripts = Some(plutus_scripts.clone())
    }

    pub fn set_plutus_v3_scripts(&mut self, plutus_scripts: &PlutusScripts) {
        self.plutus_v3_scripts = Some(plutus_scripts.clone())
    }
}

// encodes arbitrary bytes into chunks of 64 bytes (the limit for bytes) as a list to be valid Metadata
#[wasm_bindgen]
pub fn encode_arbitrary_bytes_as_metadatum(bytes: &[u8]) -> TransactionMetadatum {
    let mut list = MetadataList::new();
    for chunk in bytes.chunks(MD_MAX_LEN) {
        // this should never fail as we are already chunking it
        list.add(&TransactionMetadatum::new_bytes(chunk.to_vec()).unwrap());
    }
    TransactionMetadatum::new_list(&list)
}

// decodes from chunks of bytes in a list to a byte vector if that is the metadata format, otherwise returns None
#[wasm_bindgen]
pub fn decode_arbitrary_bytes_from_metadatum(
    metadata: &TransactionMetadatum,
) -> Result<Vec<u8>, JsError> {
    let mut bytes = Vec::new();
    for elem in metadata.as_list()?.0 {
        bytes.append(&mut elem.as_bytes()?);
    }
    Ok(bytes)
}

#[wasm_bindgen]
#[derive(Copy, Clone, Eq, PartialEq)]
// Different schema methods for mapping between JSON and the metadata CBOR.
// This conversion should match TxMetadataJsonSchema in cardano-node defined (at time of writing) here:
// https://github.com/input-output-hk/cardano-node/blob/master/cardano-api/src/Cardano/Api/MetaData.hs
// but has 2 additional schemas for more or less conversionse
// Note: Byte/Strings (including keys) in any schema must be at most 64 bytes in length
pub enum MetadataJsonSchema {
    // Does zero implicit conversions.
    // Round-trip conversions are 100% consistent
    // Treats maps DIRECTLY as maps in JSON in a natural way e.g. {"key1": 47, "key2": [0, 1]]}
    // From JSON:
    // * null/true/false NOT supported.
    // * keys treated as strings only
    // To JSON
    // * Bytes, non-string keys NOT supported.
    // Stricter than any TxMetadataJsonSchema in cardano-node but more natural for JSON -> Metadata
    NoConversions,
    // Does some implicit conversions.
    // Round-trip conversions MD -> JSON -> MD is NOT consistent, but JSON -> MD -> JSON is.
    // Without using bytes
    // Maps are treated as an array of k-v pairs as such: [{"key1": 47}, {"key2": [0, 1]}, {"key3": "0xFFFF"}]
    // From JSON:
    // * null/true/false NOT supported.
    // * Strings parseable as bytes (0x starting hex) or integers are converted.
    // To JSON:
    // * Non-string keys partially supported (bytes as 0x starting hex string, integer converted to string).
    // * Bytes are converted to hex strings starting with 0x for both values and keys.
    // Corresponds to TxMetadataJsonSchema's TxMetadataJsonNoSchema in cardano-node
    BasicConversions,
    // Supports the annotated schema presented in cardano-node with tagged values e.g. {"int": 7}, {"list": [0, 1]}
    // Round-trip conversions are 100% consistent
    // Maps are treated as an array of k-v pairs as such: [{"key1": {"int": 47}}, {"key2": {"list": [0, 1]}}, {"key3": {"bytes": "0xFFFF"}}]
    // From JSON:
    // * null/true/false NOT supported.
    // * Strings parseable as bytes (hex WITHOUT 0x prefix) or integers converted.
    // To JSON:
    // * Non-string keys are supported. Any key parseable as JSON is encoded as metadata instead of a string
    // Corresponds to TxMetadataJsonSchema's TxMetadataJsonDetailedSchema in cardano-node
    DetailedSchema,
}

fn supports_tagged_values(schema: MetadataJsonSchema) -> bool {
    match schema {
        MetadataJsonSchema::NoConversions | MetadataJsonSchema::BasicConversions => false,
        MetadataJsonSchema::DetailedSchema => true,
    }
}

fn hex_string_to_bytes(hex: &str) -> Option<Vec<u8>> {
    if hex.starts_with("0x") {
        hex::decode(&hex[2..]).ok()
    } else {
        None
    }
}

fn bytes_to_hex_string(bytes: &[u8]) -> String {
    format!("0x{}", hex::encode(bytes))
}

// Converts JSON to Metadata according to MetadataJsonSchema
#[wasm_bindgen]
pub fn encode_json_str_to_metadatum(
    json: String,
    schema: MetadataJsonSchema,
) -> Result<TransactionMetadatum, JsError> {
    let value = serde_json::from_str(&json).map_err(|e| JsError::from_str(&e.to_string()))?;
    encode_json_value_to_metadatum(value, schema)
}

pub fn encode_json_value_to_metadatum(
    value: serde_json::Value,
    schema: MetadataJsonSchema,
) -> Result<TransactionMetadatum, JsError> {
    use serde_json::Value;
    fn encode_number(x: serde_json::Number) -> Result<TransactionMetadatum, JsError> {
        if let Some(x) = x.as_u64() {
            Ok(TransactionMetadatum::new_int(&Int::new(&utils::to_bignum(
                x,
            ))))
        } else if let Some(x) = x.as_i64() {
            Ok(TransactionMetadatum::new_int(&Int::new_negative(
                &utils::to_bignum(-x as u64),
            )))
        } else {
            Err(JsError::from_str("floats not allowed in metadata"))
        }
    }
    fn encode_string(
        s: String,
        schema: MetadataJsonSchema,
    ) -> Result<TransactionMetadatum, JsError> {
        if schema == MetadataJsonSchema::BasicConversions {
            match hex_string_to_bytes(&s) {
                Some(bytes) => TransactionMetadatum::new_bytes(bytes),
                None => TransactionMetadatum::new_text(s),
            }
        } else {
            TransactionMetadatum::new_text(s)
        }
    }
    fn encode_array(
        json_arr: Vec<Value>,
        schema: MetadataJsonSchema,
    ) -> Result<TransactionMetadatum, JsError> {
        let mut arr = MetadataList::new();
        for value in json_arr {
            arr.add(&encode_json_value_to_metadatum(value, schema)?);
        }
        Ok(TransactionMetadatum::new_list(&arr))
    }
    match schema {
        MetadataJsonSchema::NoConversions | MetadataJsonSchema::BasicConversions => match value {
            Value::Null => Err(JsError::from_str("null not allowed in metadata")),
            Value::Bool(_) => Err(JsError::from_str("bools not allowed in metadata")),
            Value::Number(x) => encode_number(x),
            Value::String(s) => encode_string(s, schema),
            Value::Array(json_arr) => encode_array(json_arr, schema),
            Value::Object(json_obj) => {
                let mut map = MetadataMap::new();
                for (raw_key, value) in json_obj {
                    let key = if schema == MetadataJsonSchema::BasicConversions {
                        match raw_key.parse::<i128>() {
                            Ok(x) => TransactionMetadatum::new_int(&Int(x)),
                            Err(_) => encode_string(raw_key, schema)?,
                        }
                    } else {
                        TransactionMetadatum::new_text(raw_key)?
                    };
                    map.insert(&key, &encode_json_value_to_metadatum(value, schema)?);
                }
                Ok(TransactionMetadatum::new_map(&map))
            }
        },
        // we rely on tagged objects to control parsing here instead
        MetadataJsonSchema::DetailedSchema => match value {
            Value::Object(obj) if obj.len() == 1 => {
                let (k, v) = obj.into_iter().next().unwrap();
                fn tag_mismatch() -> JsError {
                    JsError::from_str("key does not match type")
                }
                match k.as_str() {
                    "int" => match v {
                        Value::Number(x) => encode_number(x),
                        _ => Err(tag_mismatch()),
                    },
                    "string" => {
                        encode_string(v.as_str().ok_or_else(tag_mismatch)?.to_owned(), schema)
                    }
                    "bytes" => match hex::decode(v.as_str().ok_or_else(tag_mismatch)?) {
                        Ok(bytes) => TransactionMetadatum::new_bytes(bytes),
                        Err(_) => Err(JsError::from_str(
                            "invalid hex string in tagged byte-object",
                        )),
                    },
                    "list" => encode_array(v.as_array().ok_or_else(tag_mismatch)?.clone(), schema),
                    "map" => {
                        let mut map = MetadataMap::new();
                        fn map_entry_err() -> JsError {
                            JsError::from_str("entry format in detailed schema map object not correct. Needs to be of form {\"k\": \"key\", \"v\": value}")
                        }
                        for entry in v.as_array().ok_or_else(tag_mismatch)? {
                            let entry_obj = entry.as_object().ok_or_else(map_entry_err)?;
                            let raw_key = entry_obj.get("k").ok_or_else(map_entry_err)?;
                            let value = entry_obj.get("v").ok_or_else(map_entry_err)?;
                            let key = encode_json_value_to_metadatum(raw_key.clone(), schema)?;
                            map.insert(
                                &key,
                                &encode_json_value_to_metadatum(value.clone(), schema)?,
                            );
                        }
                        Ok(TransactionMetadatum::new_map(&map))
                    }
                    invalid_key => Err(JsError::from_str(&format!(
                        "key '{}' in tagged object not valid",
                        invalid_key
                    ))),
                }
            }
            _ => Err(JsError::from_str(
                "DetailedSchema requires types to be tagged objects",
            )),
        },
    }
}

// Converts Metadata to JSON according to MetadataJsonSchema
#[wasm_bindgen]
pub fn decode_metadatum_to_json_str(
    metadatum: &TransactionMetadatum,
    schema: MetadataJsonSchema,
) -> Result<String, JsError> {
    let value = decode_metadatum_to_json_value(metadatum, schema)?;
    serde_json::to_string(&value).map_err(|e| JsError::from_str(&e.to_string()))
}

pub fn decode_metadatum_to_json_value(
    metadatum: &TransactionMetadatum,
    schema: MetadataJsonSchema,
) -> Result<serde_json::Value, JsError> {
    use serde_json::Value;
    use std::convert::TryFrom;
    fn decode_key(
        key: &TransactionMetadatum,
        schema: MetadataJsonSchema,
    ) -> Result<String, JsError> {
        match &key.0 {
            TransactionMetadatumEnum::Text(s) => Ok(s.clone()),
            TransactionMetadatumEnum::Bytes(b) if schema != MetadataJsonSchema::NoConversions => {
                Ok(bytes_to_hex_string(b.as_ref()))
            }
            TransactionMetadatumEnum::Int(i) if schema != MetadataJsonSchema::NoConversions => {
                let int_str = if i.0 >= 0 {
                    u64::try_from(i.0).map(|x| x.to_string())
                } else {
                    i64::try_from(i.0).map(|x| x.to_string())
                };
                int_str.map_err(|e| JsError::from_str(&e.to_string()))
            }
            TransactionMetadatumEnum::MetadataList(list)
                if schema == MetadataJsonSchema::DetailedSchema =>
            {
                decode_metadatum_to_json_str(&TransactionMetadatum::new_list(&list), schema)
            }
            TransactionMetadatumEnum::MetadataMap(map)
                if schema == MetadataJsonSchema::DetailedSchema =>
            {
                decode_metadatum_to_json_str(&TransactionMetadatum::new_map(&map), schema)
            }
            _ => Err(JsError::from_str(&format!(
                "key type {:?} not allowed in JSON under specified schema",
                key.0
            ))),
        }
    }
    let (type_key, value) = match &metadatum.0 {
        TransactionMetadatumEnum::MetadataMap(map) => match schema {
            MetadataJsonSchema::NoConversions | MetadataJsonSchema::BasicConversions => {
                // treats maps directly as JSON maps
                let mut json_map = serde_json::map::Map::with_capacity(map.len());
                for (key, value) in map.0.iter() {
                    json_map.insert(
                        decode_key(key, schema)?,
                        decode_metadatum_to_json_value(value, schema)?,
                    );
                }
                ("map", Value::from(json_map))
            }

            MetadataJsonSchema::DetailedSchema => (
                "map",
                Value::from(
                    map.0
                        .iter()
                        .map(|(key, value)| {
                            // must encode maps as JSON lists of objects with k/v keys
                            // also in these schemas we support more key types than strings
                            let k = decode_metadatum_to_json_value(key, schema)?;
                            let v = decode_metadatum_to_json_value(value, schema)?;
                            let mut kv_obj = serde_json::map::Map::with_capacity(2);
                            kv_obj.insert(String::from("k"), Value::from(k));
                            kv_obj.insert(String::from("v"), v);
                            Ok(Value::from(kv_obj))
                        })
                        .collect::<Result<Vec<_>, JsError>>()?,
                ),
            ),
        },
        TransactionMetadatumEnum::MetadataList(arr) => (
            "list",
            Value::from(
                arr.0
                    .iter()
                    .map(|e| decode_metadatum_to_json_value(e, schema))
                    .collect::<Result<Vec<_>, JsError>>()?,
            ),
        ),
        TransactionMetadatumEnum::Int(x) => (
            "int",
            if x.0 >= 0 {
                Value::from(u64::try_from(x.0).map_err(|e| JsError::from_str(&e.to_string()))?)
            } else {
                Value::from(i64::try_from(x.0).map_err(|e| JsError::from_str(&e.to_string()))?)
            },
        ),
        TransactionMetadatumEnum::Bytes(bytes) => (
            "bytes",
            match schema {
                MetadataJsonSchema::NoConversions => Err(JsError::from_str(
                    "bytes not allowed in JSON in specified schema",
                )),
                // 0x prefix
                MetadataJsonSchema::BasicConversions => {
                    Ok(Value::from(bytes_to_hex_string(bytes.as_ref())))
                }
                // no prefix
                MetadataJsonSchema::DetailedSchema => Ok(Value::from(hex::encode(bytes))),
            }?,
        ),
        TransactionMetadatumEnum::Text(s) => ("string", Value::from(s.clone())),
    };
    // potentially wrap value in a keyed map to represent more types
    if supports_tagged_values(schema) {
        let mut wrapper = serde_json::map::Map::with_capacity(1);
        wrapper.insert(String::from(type_key), value);
        Ok(Value::from(wrapper))
    } else {
        Ok(value)
    }
}

// serialization
impl cbor_event::se::Serialize for MetadataMap {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_map(cbor_event::Len::Len(self.0.len() as u64))?;
        for (key, value) in &self.0 {
            key.serialize(serializer)?;
            value.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for MetadataMap {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut table = LinkedHashMap::new();
        let mut entries: Vec<(TransactionMetadatum, TransactionMetadatum)> = Vec::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.map()?;
            while match len {
                cbor_event::Len::Len(n) => entries.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                let key = TransactionMetadatum::deserialize(raw)?;
                let value = TransactionMetadatum::deserialize(raw)?;
                entries.push((key.clone(), value));
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("MetadataMap"))?;
        entries.iter().for_each(|(k, v)| {
            if table.insert(k.clone(), v.clone()).is_some() {
                // Turns out this is totally possible on the actual blockchain
                // return Err(DeserializeFailure::DuplicateKey(Key::Str(String::from("some complicated/unsupported type"))).into());
            }
        });
        Ok(Self(table))
    }
}

impl cbor_event::se::Serialize for MetadataList {
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

impl Deserialize for MetadataList {
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
                arr.push(TransactionMetadatum::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("MetadataList"))?;
        Ok(Self(arr))
    }
}

impl cbor_event::se::Serialize for TransactionMetadatumEnum {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        match self {
            TransactionMetadatumEnum::MetadataMap(x) => x.serialize(serializer),
            TransactionMetadatumEnum::MetadataList(x) => x.serialize(serializer),
            TransactionMetadatumEnum::Int(x) => x.serialize(serializer),
            TransactionMetadatumEnum::Bytes(x) => serializer.write_bytes(&x),
            TransactionMetadatumEnum::Text(x) => serializer.write_text(&x),
        }
    }
}

impl Deserialize for TransactionMetadatumEnum {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        match raw.cbor_type()? {
            CBORType::Array => {
                MetadataList::deserialize(raw).map(TransactionMetadatumEnum::MetadataList)
            }
            CBORType::Map => {
                MetadataMap::deserialize(raw).map(TransactionMetadatumEnum::MetadataMap)
            }
            CBORType::Bytes => TransactionMetadatum::new_bytes(raw.bytes()?)
                .map(|m| m.0)
                .map_err(|e| DeserializeFailure::Metadata(e).into()),
            CBORType::Text => TransactionMetadatum::new_text(raw.text()?)
                .map(|m| m.0)
                .map_err(|e| DeserializeFailure::Metadata(e).into()),
            CBORType::UnsignedInteger | CBORType::NegativeInteger => {
                Int::deserialize(raw).map(TransactionMetadatumEnum::Int)
            }
            _ => Err(DeserializeError::new(
                "TransactionMetadatumEnum",
                DeserializeFailure::NoVariantMatched.into(),
            )),
        }
    }
}

impl cbor_event::se::Serialize for TransactionMetadatum {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        self.0.serialize(serializer)
    }
}

impl Deserialize for TransactionMetadatum {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        Ok(Self(TransactionMetadatumEnum::deserialize(raw)?))
    }
}

impl cbor_event::se::Serialize for TransactionMetadatumLabels {
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

impl Deserialize for TransactionMetadatumLabels {
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
                arr.push(TransactionMetadatumLabel::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("TransactionMetadatumLabels"))?;
        Ok(Self(arr))
    }
}

impl cbor_event::se::Serialize for GeneralTransactionMetadata {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_map(cbor_event::Len::Len(self.0.len() as u64))?;
        for (key, value) in &self.0 {
            key.serialize(serializer)?;
            value.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for GeneralTransactionMetadata {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut table = LinkedHashMap::new();
        (|| -> Result<_, DeserializeError> {
            let len = raw.map()?;
            while match len {
                cbor_event::Len::Len(n) => table.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                let key = TransactionMetadatumLabel::deserialize(raw)?;
                let value = TransactionMetadatum::deserialize(raw)?;
                if table.insert(key.clone(), value).is_some() {
                    return Err(DeserializeFailure::DuplicateKey(Key::Str(String::from(
                        "some complicated/unsupported type",
                    )))
                    .into());
                }
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("GeneralTransactionMetadata"))?;
        Ok(Self(table))
    }
}

impl cbor_event::se::Serialize for AuxiliaryData {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        // we still serialize using the shelley-mary era format as it is still supported
        // and it takes up less space on-chain so this should be better for scaling.
        // Plus the code was already written for shelley-mary anyway
        if self.metadata.is_some() && self.plutus_scripts.is_none() {
            match &self.native_scripts() {
                Some(native_scripts) => {
                    serializer.write_array(cbor_event::Len::Len(2))?;
                    self.metadata.as_ref().unwrap().serialize(serializer)?;
                    native_scripts.serialize(serializer)
                }
                None => self.metadata.as_ref().unwrap().serialize(serializer),
            }
        } else {
            // new format with plutus support
            serializer.write_tag(259u64)?;
            serializer.write_map(cbor_event::Len::Len(
                if self.metadata.is_some() { 1 } else { 0 }
                    + if self.native_scripts.is_some() { 1 } else { 0 }
                    + if self.plutus_scripts.is_some() { 1 } else { 0 }
                    + if self.plutus_v2_scripts.is_some() {
                        1
                    } else {
                        0
                    }
                    + if self.plutus_v3_scripts.is_some() {
                        1
                    } else {
                        0
                    },
            ))?;
            if let Some(metadata) = &self.metadata {
                serializer.write_unsigned_integer(0)?;
                metadata.serialize(serializer)?;
            }
            if let Some(native_scripts) = &self.native_scripts {
                serializer.write_unsigned_integer(1)?;
                native_scripts.serialize(serializer)?;
            }
            if let Some(plutus_scripts) = &self.plutus_scripts {
                serializer.write_unsigned_integer(2)?;
                plutus_scripts.serialize(serializer)?;
            }
            if let Some(plutus_v2_scripts) = &self.plutus_v2_scripts {
                serializer.write_unsigned_integer(3)?;
                plutus_v2_scripts.serialize(serializer)?;
            }
            if let Some(plutus_v3_scripts) = &self.plutus_v3_scripts {
                serializer.write_unsigned_integer(4)?;
                plutus_v3_scripts.serialize(serializer)?;
            }
            Ok(serializer)
        }
    }
}

impl Deserialize for AuxiliaryData {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            match raw.cbor_type()? {
                // alonzo format
                CBORType::Tag => {
                    let tag = raw.tag()?;
                    if tag != 259 {
                        return Err(DeserializeError::new(
                            "AuxiliaryData",
                            DeserializeFailure::TagMismatch {
                                found: tag,
                                expected: 259,
                            },
                        ));
                    }
                    let len = raw.map()?;
                    let mut read_len = CBORReadLen::new(len);
                    let mut metadata = None;
                    let mut native_scripts = None;
                    let mut plutus_scripts = None;
                    let mut plutus_v2_scripts = None;
                    let mut plutus_v3_scripts = None;
                    let mut read = 0;
                    while match len {
                        cbor_event::Len::Len(n) => read < n as usize,
                        cbor_event::Len::Indefinite => true,
                    } {
                        match raw.cbor_type()? {
                            CBORType::UnsignedInteger => match raw.unsigned_integer()? {
                                0 => {
                                    if metadata.is_some() {
                                        return Err(
                                            DeserializeFailure::DuplicateKey(Key::Uint(0)).into()
                                        );
                                    }
                                    metadata = Some(
                                        (|| -> Result<_, DeserializeError> {
                                            read_len.read_elems(1)?;
                                            Ok(GeneralTransactionMetadata::deserialize(raw)?)
                                        })()
                                        .map_err(|e| e.annotate("metadata"))?,
                                    );
                                }
                                1 => {
                                    if native_scripts.is_some() {
                                        return Err(
                                            DeserializeFailure::DuplicateKey(Key::Uint(1)).into()
                                        );
                                    }
                                    native_scripts = Some(
                                        (|| -> Result<_, DeserializeError> {
                                            read_len.read_elems(1)?;
                                            Ok(NativeScripts::deserialize(raw)?)
                                        })()
                                        .map_err(|e| e.annotate("native_scripts"))?,
                                    );
                                }
                                2 => {
                                    if plutus_scripts.is_some() {
                                        return Err(
                                            DeserializeFailure::DuplicateKey(Key::Uint(2)).into()
                                        );
                                    }
                                    plutus_scripts = Some(
                                        (|| -> Result<_, DeserializeError> {
                                            read_len.read_elems(1)?;
                                            Ok(PlutusScripts::deserialize(raw)?)
                                        })()
                                        .map_err(|e| e.annotate("plutus_scripts"))?,
                                    );
                                }
                                3 => {
                                    if plutus_v2_scripts.is_some() {
                                        return Err(
                                            DeserializeFailure::DuplicateKey(Key::Uint(3)).into()
                                        );
                                    }
                                    plutus_v2_scripts = Some(
                                        (|| -> Result<_, DeserializeError> {
                                            read_len.read_elems(1)?;
                                            Ok(PlutusScripts::deserialize(raw)?)
                                        })()
                                        .map_err(|e| e.annotate("plutus_v2_scripts"))?,
                                    );
                                }
                                3 => {
                                    if plutus_v3_scripts.is_some() {
                                        return Err(
                                            DeserializeFailure::DuplicateKey(Key::Uint(3)).into()
                                        );
                                    }
                                    plutus_v3_scripts = Some(
                                        (|| -> Result<_, DeserializeError> {
                                            read_len.read_elems(1)?;
                                            Ok(PlutusScripts::deserialize(raw)?)
                                        })()
                                        .map_err(|e| e.annotate("plutus_v3_scripts"))?,
                                    );
                                }
                                unknown_key => {
                                    return Err(DeserializeFailure::UnknownKey(Key::Uint(
                                        unknown_key,
                                    ))
                                    .into())
                                }
                            },
                            CBORType::Text => match raw.text()?.as_str() {
                                unknown_key => {
                                    return Err(DeserializeFailure::UnknownKey(Key::Str(
                                        unknown_key.to_owned(),
                                    ))
                                    .into())
                                }
                            },
                            CBORType::Special => match len {
                                cbor_event::Len::Len(_) => {
                                    return Err(DeserializeFailure::BreakInDefiniteLen.into())
                                }
                                cbor_event::Len::Indefinite => match raw.special()? {
                                    CBORSpecial::Break => break,
                                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                                },
                            },
                            other_type => {
                                return Err(DeserializeFailure::UnexpectedKeyType(other_type).into())
                            }
                        }
                        read += 1;
                    }
                    read_len.finish()?;
                    Ok(Self {
                        metadata,
                        native_scripts,
                        plutus_scripts,
                        plutus_v2_scripts,
                        plutus_v3_scripts,
                    })
                }
                // shelley mary format (still valid for alonzo)
                CBORType::Array => {
                    let len = raw.array()?;
                    let mut read_len = CBORReadLen::new(len);
                    read_len.read_elems(2)?;
                    let metadata = (|| -> Result<_, DeserializeError> {
                        Ok(GeneralTransactionMetadata::deserialize(raw)?)
                    })()
                    .map_err(|e| e.annotate("metadata"))?;
                    let native_scripts = (|| -> Result<_, DeserializeError> {
                        Ok(NativeScripts::deserialize(raw)?)
                    })()
                    .map_err(|e| e.annotate("native_scripts"))?;
                    match len {
                        cbor_event::Len::Len(_) => (),
                        cbor_event::Len::Indefinite => match raw.special()? {
                            CBORSpecial::Break => (),
                            _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                        },
                    }
                    Ok(Self {
                        metadata: Some(metadata),
                        native_scripts: Some(native_scripts),
                        plutus_scripts: None,
                        plutus_v2_scripts: None,
                        plutus_v3_scripts: None,
                    })
                }
                // shelley pre-mary format (still valid for alonzo + mary)
                CBORType::Map => Ok(Self {
                    metadata: Some(
                        GeneralTransactionMetadata::deserialize(raw)
                            .map_err(|e| e.annotate("metadata"))?,
                    ),
                    native_scripts: None,
                    plutus_scripts: None,
                    plutus_v2_scripts: None,
                    plutus_v3_scripts: None,
                }),
                _ => return Err(DeserializeFailure::NoVariantMatched)?,
            }
        })()
        .map_err(|e| e.annotate("AuxiliaryData"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn binary_encoding() {
        let input_bytes = (0..1000).map(|x| x as u8).collect::<Vec<u8>>();
        let metadata = encode_arbitrary_bytes_as_metadatum(input_bytes.as_ref());
        let output_bytes = decode_arbitrary_bytes_from_metadatum(&metadata).expect("decode failed");
        assert_eq!(input_bytes, output_bytes);
    }

    #[test]
    fn json_encoding_no_conversions() {
        let input_str = String::from("{\"receiver_id\": \"SJKdj34k3jjKFDKfjFUDfdjkfd\",\"sender_id\": \"jkfdsufjdk34h3Sdfjdhfduf873\",\"comment\": \"happy birthday\",\"tags\": [0, 264, -1024, 32]}");
        let metadata =
            encode_json_str_to_metadatum(input_str.clone(), MetadataJsonSchema::NoConversions)
                .expect("encode failed");
        let map = metadata.as_map().unwrap();
        assert_eq!(
            map.get_str("receiver_id").unwrap().as_text().unwrap(),
            "SJKdj34k3jjKFDKfjFUDfdjkfd"
        );
        assert_eq!(
            map.get_str("sender_id").unwrap().as_text().unwrap(),
            "jkfdsufjdk34h3Sdfjdhfduf873"
        );
        assert_eq!(
            map.get_str("comment").unwrap().as_text().unwrap(),
            "happy birthday"
        );
        let tags = map.get_str("tags").unwrap().as_list().unwrap();
        let tags_i32 = tags
            .0
            .iter()
            .map(|md| md.as_int().unwrap().as_i32_or_fail().unwrap())
            .collect::<Vec<i32>>();
        assert_eq!(tags_i32, vec![0, 264, -1024, 32]);
        let output_str = decode_metadatum_to_json_str(&metadata, MetadataJsonSchema::NoConversions)
            .expect("decode failed");
        let input_json: serde_json::Value = serde_json::from_str(&input_str).unwrap();
        let output_json: serde_json::Value = serde_json::from_str(&output_str).unwrap();
        assert_eq!(input_json, output_json);
    }

    #[test]
    fn json_encoding_basic() {
        let input_str = String::from(
            "{\"0x8badf00d\": \"0xdeadbeef\",\"9\": 5,\"obj\": {\"a\":[{\"5\": 2},{}]}}",
        );
        let metadata =
            encode_json_str_to_metadatum(input_str.clone(), MetadataJsonSchema::BasicConversions)
                .expect("encode failed");
        json_encoding_check_example_metadatum(&metadata);
        let output_str =
            decode_metadatum_to_json_str(&metadata, MetadataJsonSchema::BasicConversions)
                .expect("decode failed");
        let input_json: serde_json::Value = serde_json::from_str(&input_str).unwrap();
        let output_json: serde_json::Value = serde_json::from_str(&output_str).unwrap();
        assert_eq!(input_json, output_json);
    }

    #[test]
    fn json_encoding_detailed() {
        let input_str = String::from(
            "{\"map\":[
            {
                \"k\":{\"bytes\":\"8badf00d\"},
                \"v\":{\"bytes\":\"deadbeef\"}
            },
            {
                \"k\":{\"int\":9},
                \"v\":{\"int\":5}
            },
            {
                \"k\":{\"string\":\"obj\"},
                \"v\":{\"map\":[
                    {
                        \"k\":{\"string\":\"a\"},
                        \"v\":{\"list\":[
                        {\"map\":[
                            {
                                \"k\":{\"int\":5},
                                \"v\":{\"int\":2}
                            }
                            ]},
                            {\"map\":[
                            ]}
                        ]}
                    }
                ]}
            }
        ]}",
        );
        let metadata =
            encode_json_str_to_metadatum(input_str.clone(), MetadataJsonSchema::DetailedSchema)
                .expect("encode failed");
        json_encoding_check_example_metadatum(&metadata);
        let output_str =
            decode_metadatum_to_json_str(&metadata, MetadataJsonSchema::DetailedSchema)
                .expect("decode failed");
        let input_json: serde_json::Value = serde_json::from_str(&input_str).unwrap();
        let output_json: serde_json::Value = serde_json::from_str(&output_str).unwrap();
        assert_eq!(input_json, output_json);
    }

    fn json_encoding_check_example_metadatum(metadata: &TransactionMetadatum) {
        let map = metadata.as_map().unwrap();
        assert_eq!(
            map.get(&TransactionMetadatum::new_bytes(hex::decode("8badf00d").unwrap()).unwrap())
                .unwrap()
                .as_bytes()
                .unwrap(),
            hex::decode("deadbeef").unwrap()
        );
        assert_eq!(
            map.get_i32(9)
                .unwrap()
                .as_int()
                .unwrap()
                .as_i32_or_fail()
                .unwrap(),
            5
        );
        let inner_map = map.get_str("obj").unwrap().as_map().unwrap();
        let a = inner_map.get_str("a").unwrap().as_list().unwrap();
        let a1 = a.get(0).as_map().unwrap();
        assert_eq!(
            a1.get_i32(5)
                .unwrap()
                .as_int()
                .unwrap()
                .as_i32_or_fail()
                .unwrap(),
            2
        );
        let a2 = a.get(1).as_map().unwrap();
        assert_eq!(a2.keys().len(), 0);
    }

    #[test]
    fn json_encoding_detailed_complex_key() {
        let input_str = String::from(
            "{\"map\":[
            {
            \"k\":{\"list\":[
                {\"map\": [
                    {
                        \"k\": {\"int\": 5},
                        \"v\": {\"int\": -7}
                    },
                    {
                        \"k\": {\"string\": \"hello\"},
                        \"v\": {\"string\": \"world\"}
                    }
                ]},
                {\"bytes\": \"ff00ff00\"}
            ]},
            \"v\":{\"int\":5}
            }
        ]}",
        );
        let metadata =
            encode_json_str_to_metadatum(input_str.clone(), MetadataJsonSchema::DetailedSchema)
                .expect("encode failed");

        let map = metadata.as_map().unwrap();
        let key = map.keys().get(0);
        assert_eq!(
            map.get(&key)
                .unwrap()
                .as_int()
                .unwrap()
                .as_i32_or_fail()
                .unwrap(),
            5
        );
        let key_list = key.as_list().unwrap();
        assert_eq!(key_list.len(), 2);
        let key_map = key_list.get(0).as_map().unwrap();
        assert_eq!(
            key_map
                .get_i32(5)
                .unwrap()
                .as_int()
                .unwrap()
                .as_i32_or_fail()
                .unwrap(),
            -7
        );
        assert_eq!(
            key_map.get_str("hello").unwrap().as_text().unwrap(),
            "world"
        );
        let key_bytes = key_list.get(1).as_bytes().unwrap();
        assert_eq!(key_bytes, hex::decode("ff00ff00").unwrap());

        let output_str =
            decode_metadatum_to_json_str(&metadata, MetadataJsonSchema::DetailedSchema)
                .expect("decode failed");
        let input_json: serde_json::Value = serde_json::from_str(&input_str).unwrap();
        let output_json: serde_json::Value = serde_json::from_str(&output_str).unwrap();
        assert_eq!(input_json, output_json);
    }

    #[test]
    fn metadata_serialize() {
        let mut gmd = GeneralTransactionMetadata::new();
        let mdatum = TransactionMetadatum::new_text(String::from("string md")).unwrap();
        gmd.insert(&to_bignum(100), &mdatum);
        let mut aux_data = AuxiliaryData::new();
        // alonzo (empty)
        let ad0_deser = AuxiliaryData::from_bytes(aux_data.to_bytes()).unwrap();
        assert_eq!(aux_data.to_bytes(), ad0_deser.to_bytes());
        // pre-mary shelley
        aux_data.set_metadata(&gmd);
        let ad1_deser = AuxiliaryData::from_bytes(aux_data.to_bytes()).unwrap();
        assert_eq!(aux_data.to_bytes(), ad1_deser.to_bytes());
        // mary shelley
        let mut native_scripts = NativeScripts::new();
        native_scripts.add(&NativeScript::new_timelock_start(&TimelockStart::new(
            &20.into(),
        )));
        aux_data.set_native_scripts(&native_scripts);
        let ad2_deser = AuxiliaryData::from_bytes(aux_data.to_bytes()).unwrap();
        assert_eq!(aux_data.to_bytes(), ad2_deser.to_bytes());
        // alonzo
        let mut plutus_scripts = PlutusScripts::new();
        plutus_scripts.add(&PlutusScript::new([61u8; 29].to_vec()));
        aux_data.set_plutus_scripts(&plutus_scripts);
        let ad3_deser = AuxiliaryData::from_bytes(aux_data.to_bytes()).unwrap();
        assert_eq!(aux_data.to_bytes(), ad3_deser.to_bytes());
    }

    #[test]
    fn metadatum_map_duplicate_keys() {
        let bytes = hex::decode("a105a4781b232323232323232323232323232323232323232323232323232323827840232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323237840232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323236e232323232323232323232323232382a36f2323232323232323232323232323236a323030302d30312d303166232323232323784023232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323712323232323232323232323232323232323784023232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323a36f2323232323232323232323232323236a323030302d30312d303166232323232323784023232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323712323232323232323232323232323232323784023232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323752323232323232323232323232323232323232323236a323030302d30312d3031752323232323232323232323232323232323232323236a323030302d30312d3031").unwrap();
        TransactionMetadatum::from_bytes(bytes).unwrap();
    }
}
