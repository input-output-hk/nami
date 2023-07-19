use super::*;
use std::io::{BufRead, Seek, Write};

// This library was code-generated using an experimental CDDL to rust tool:
// https://github.com/Emurgo/cddl-codegen

use cbor_event::{
    self,
    de::Deserializer,
    se::{Serialize, Serializer},
};

use fraction::Fraction;
use schemars::JsonSchema;

#[wasm_bindgen]
#[derive(Clone, Debug, Eq, Ord, PartialEq, PartialOrd)]
pub struct PlutusScript(Vec<u8>);

to_from_bytes!(PlutusScript);

#[wasm_bindgen]
impl PlutusScript {
    pub fn hash(&self, namespace: ScriptHashNamespace) -> ScriptHash {
        hash_script(namespace, self.bytes())
    }

    /**
     * Creates a new Plutus script from the RAW bytes of the compiled script.
     * This does NOT include any CBOR encoding around these bytes (e.g. from "cborBytes" in cardano-cli)
     * If you creating this from those you should use PlutusScript::from_bytes() instead.
     */
    pub fn new(bytes: Vec<u8>) -> PlutusScript {
        Self(bytes)
    }

    /**
     * The raw bytes of this compiled Plutus script.
     * If you need "cborBytes" for cardano-cli use PlutusScript::to_bytes() instead.
     */
    pub fn bytes(&self) -> Vec<u8> {
        self.0.clone()
    }
}

impl serde::Serialize for PlutusScript {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&hex::encode(&self.0))
    }
}

impl<'de> serde::de::Deserialize<'de> for PlutusScript {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::de::Deserializer<'de>,
    {
        let s = <String as serde::de::Deserialize>::deserialize(deserializer)?;
        hex::decode(&s)
            .map(|bytes| PlutusScript::new(bytes))
            .map_err(|_err| {
                serde::de::Error::invalid_value(
                    serde::de::Unexpected::Str(&s),
                    &"PlutusScript as hex string e.g. F8AB28C2 (without CBOR bytes tag)",
                )
            })
    }
}

impl JsonSchema for PlutusScript {
    fn schema_name() -> String {
        String::from("PlutusScript")
    }
    fn json_schema(gen: &mut schemars::gen::SchemaGenerator) -> schemars::schema::Schema {
        String::json_schema(gen)
    }
    fn is_referenceable() -> bool {
        String::is_referenceable()
    }
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct PlutusScripts(pub(crate) Vec<PlutusScript>);

to_from_bytes!(PlutusScripts);

#[wasm_bindgen]
impl PlutusScripts {
    pub fn new() -> Self {
        Self(Vec::new())
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn get(&self, index: usize) -> PlutusScript {
        self.0[index].clone()
    }

    pub fn add(&mut self, elem: &PlutusScript) {
        self.0.push(elem.clone());
    }
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct ConstrPlutusData {
    alternative: BigNum,
    data: PlutusList,
}

to_from_bytes!(ConstrPlutusData);

#[wasm_bindgen]
impl ConstrPlutusData {
    pub fn alternative(&self) -> BigNum {
        self.alternative.clone()
    }

    pub fn data(&self) -> PlutusList {
        self.data.clone()
    }

    pub fn new(alternative: &BigNum, data: &PlutusList) -> Self {
        Self {
            alternative: alternative.clone(),
            data: data.clone(),
        }
    }
}

impl ConstrPlutusData {
    // see: https://github.com/input-output-hk/plutus/blob/1f31e640e8a258185db01fa899da63f9018c0e85/plutus-core/plutus-core/src/PlutusCore/Data.hs#L61
    // We don't directly serialize the alternative in the tag, instead the scheme is:
    // - Alternatives 0-6 -> tags 121-127, followed by the arguments in a list
    // - Alternatives 7-127 -> tags 1280-1400, followed by the arguments in a list
    // - Any alternatives, including those that don't fit in the above -> tag 102 followed by a list containing
    //   an unsigned integer for the actual alternative, and then the arguments in a (nested!) list.
    const GENERAL_FORM_TAG: u64 = 102;

    // None -> needs general tag serialization, not compact
    fn alternative_to_compact_cbor_tag(alt: u64) -> Option<u64> {
        if alt <= 6 {
            Some(121 + alt)
        } else if alt >= 7 && alt <= 127 {
            Some(1280 - 7 + alt)
        } else {
            None
        }
    }

    // None -> General tag(=102) OR Invalid CBOR tag for this scheme
    fn compact_cbor_tag_to_alternative(cbor_tag: u64) -> Option<u64> {
        if cbor_tag >= 121 && cbor_tag <= 127 {
            Some(cbor_tag - 121)
        } else if cbor_tag >= 1280 && cbor_tag <= 1400 {
            Some(cbor_tag - 1280 + 7)
        } else {
            None
        }
    }
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct CostModel(Vec<Int>);

to_from_bytes!(CostModel);

const OP_COUNT_V1: usize = 166;
const OP_COUNT_V2: usize = 175;
const OP_COUNT_V3: usize = 179;

#[wasm_bindgen]
impl CostModel {
    pub fn new() -> Self {
        let mut costs = Vec::with_capacity(OP_COUNT_V1);
        for _ in 0..OP_COUNT_V1 {
            costs.push(Int::new_i32(0));
        }
        Self(costs)
    }

    pub fn new_plutus_v2() -> Self {
        let mut costs = Vec::with_capacity(OP_COUNT_V2);
        for _ in 0..OP_COUNT_V2 {
            costs.push(Int::new_i32(0));
        }
        Self(costs)
    }

    pub fn new_plutus_v3() -> Self {
        let mut costs = Vec::with_capacity(OP_COUNT_V3);
        for _ in 0..OP_COUNT_V3 {
            costs.push(Int::new_i32(0));
        }
        Self(costs)
    }

    pub fn set(&mut self, operation: usize, cost: &Int) -> Result<Int, JsError> {
        if operation >= self.len() {
            return Err(JsError::from_str(&format!(
                "CostModel operation {} out of bounds. Max is {}",
                operation,
                self.len()
            )));
        }
        let old = self.0[operation].clone();
        self.0[operation] = cost.clone();
        Ok(old)
    }

    pub fn get(&self, operation: usize) -> Result<Int, JsError> {
        if operation >= self.len() {
            return Err(JsError::from_str(&format!(
                "CostModel operation {} out of bounds. Max is {}",
                operation,
                self.len()
            )));
        }
        Ok(self.0[operation].clone())
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct Costmdls(std::collections::BTreeMap<Language, CostModel>);

to_from_bytes!(Costmdls);

#[wasm_bindgen]
impl Costmdls {
    pub fn new() -> Self {
        Self(std::collections::BTreeMap::new())
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn insert(&mut self, key: &Language, value: &CostModel) -> Option<CostModel> {
        self.0.insert(key.clone(), value.clone())
    }

    pub fn get(&self, key: &Language) -> Option<CostModel> {
        self.0.get(key).map(|v| v.clone())
    }

    pub fn keys(&self) -> Languages {
        Languages(self.0.iter().map(|(k, _v)| k.clone()).collect::<Vec<_>>())
    }

    pub(crate) fn language_views_encoding(&self) -> Vec<u8> {
        let mut serializer = Serializer::new_vec();
        let mut keys_bytes: Vec<(Language, Vec<u8>)> = self
            .0
            .iter()
            .map(|(k, _v)| (k.clone(), k.to_bytes()))
            .collect();
        // keys must be in canonical ordering first
        keys_bytes.sort_by(|lhs, rhs| match lhs.1.len().cmp(&rhs.1.len()) {
            std::cmp::Ordering::Equal => lhs.1.cmp(&rhs.1),
            len_order => len_order,
        });
        serializer
            .write_map(cbor_event::Len::Len(self.0.len() as u64))
            .unwrap();
        for (key, key_bytes) in keys_bytes.iter() {
            match key.0 {
                LanguageKind::PlutusV1 => {
                    serializer.write_bytes(key_bytes).unwrap();
                    let cost_model = self.0.get(&key).unwrap();
                    // Due to a bug in the cardano-node input-output-hk/cardano-ledger-specs/issues/2512
                    // we must use indefinite length serialization in this inner bytestring to match it
                    let mut cost_model_serializer = Serializer::new_vec();
                    cost_model_serializer
                        .write_array(cbor_event::Len::Indefinite)
                        .unwrap();
                    for cost in &cost_model.0 {
                        cost.serialize(&mut cost_model_serializer).unwrap();
                    }
                    cost_model_serializer
                        .write_special(cbor_event::Special::Break)
                        .unwrap();
                    serializer
                        .write_bytes(cost_model_serializer.finalize())
                        .unwrap();
                }
                LanguageKind::PlutusV2 | LanguageKind::PlutusV3 => {
                    key.serialize(&mut serializer).unwrap();
                    let cost_model = self.0.get(&key).unwrap();

                    serializer
                        .write_array(cbor_event::Len::Len(cost_model.len() as u64))
                        .unwrap();
                    for cost in &cost_model.0 {
                        cost.serialize(&mut serializer).unwrap();
                    }
                }
            }
        }
        let out = serializer.finalize();
        println!("language_views = {}", hex::encode(out.clone()));
        out
    }
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct ExUnitPrices {
    mem_price: SubCoin,
    step_price: SubCoin,
}

to_from_bytes!(ExUnitPrices);

#[wasm_bindgen]
impl ExUnitPrices {
    pub fn mem_price(&self) -> SubCoin {
        self.mem_price.clone()
    }

    pub fn step_price(&self) -> SubCoin {
        self.step_price.clone()
    }

    pub fn new(mem_price: &SubCoin, step_price: &SubCoin) -> Self {
        Self {
            mem_price: mem_price.clone(),
            step_price: step_price.clone(),
        }
    }

    pub fn from_float(mem_price: f64, step_price: f64) -> Self {
        let mem_price_frac = Fraction::from(mem_price);
        let step_price_frac = Fraction::from(step_price);
        Self {
            mem_price: SubCoin::new(
                &to_bignum(*mem_price_frac.numer().unwrap() as u64),
                &to_bignum(*mem_price_frac.denom().unwrap() as u64),
            ),
            step_price: SubCoin::new(
                &to_bignum(*step_price_frac.numer().unwrap() as u64),
                &to_bignum(*step_price_frac.denom().unwrap() as u64),
            ),
        }
    }
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct ExUnits {
    // TODO: should these be u32 or BigNum?
    mem: BigNum,
    steps: BigNum,
}

to_from_bytes!(ExUnits);

#[wasm_bindgen]
impl ExUnits {
    pub fn mem(&self) -> BigNum {
        self.mem.clone()
    }

    pub fn steps(&self) -> BigNum {
        self.steps.clone()
    }

    pub fn new(mem: &BigNum, steps: &BigNum) -> Self {
        Self {
            mem: mem.clone(),
            steps: steps.clone(),
        }
    }
}

#[wasm_bindgen]
#[derive(
    Hash,
    Clone,
    Copy,
    Debug,
    Eq,
    Ord,
    PartialEq,
    PartialOrd,
    serde::Serialize,
    serde::Deserialize,
    JsonSchema,
)]
pub enum LanguageKind {
    PlutusV1,
    PlutusV2,
    PlutusV3,
}

#[wasm_bindgen]
#[derive(
    Hash,
    Clone,
    Copy,
    Debug,
    Eq,
    Ord,
    PartialEq,
    PartialOrd,
    serde::Serialize,
    serde::Deserialize,
    JsonSchema,
)]
pub struct Language(LanguageKind);

to_from_bytes!(Language);

#[wasm_bindgen]
impl Language {
    pub fn new_plutus_v1() -> Self {
        Self(LanguageKind::PlutusV1)
    }

    pub fn new_plutus_v2() -> Self {
        Self(LanguageKind::PlutusV2)
    }

    pub fn new_plutus_v3() -> Self {
        Self(LanguageKind::PlutusV3)
    }

    pub fn kind(&self) -> LanguageKind {
        self.0
    }
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct Languages(Vec<Language>);

#[wasm_bindgen]
impl Languages {
    pub fn new() -> Self {
        Self(Vec::new())
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn get(&self, index: usize) -> Language {
        self.0[index]
    }

    pub fn add(&mut self, elem: Language) {
        self.0.push(elem);
    }
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct PlutusMap(Vec<(PlutusData, PlutusData)>);

to_from_bytes!(PlutusMap);

#[wasm_bindgen]
impl PlutusMap {
    pub fn new() -> Self {
        Self(Vec::new())
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn insert(&mut self, key: &PlutusData, value: &PlutusData) -> Option<PlutusData> {
        let index_exists = self.0.iter().position(|(k, _)| k == key);
        match index_exists {
            Some(index) => {
                let old_value = self.0[index].1.clone();
                self.0[index] = (key.clone(), value.clone());
                Some(old_value)
            }
            None => {
                self.0.push((key.clone(), value.clone()));
                None
            }
        }
    }

    pub fn get(&self, key: &PlutusData) -> Option<PlutusData> {
        let item_exists = self.0.iter().find(|(k, _)| k == key);
        match item_exists {
            Some(item) => Some(item.1.clone()),
            None => None,
        }
    }

    pub fn keys(&self) -> PlutusList {
        PlutusList {
            elems: self.0.iter().map(|(k, _v)| k.clone()).collect::<Vec<_>>(),
            definite_encoding: None,
        }
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug, Eq, Ord, PartialEq, PartialOrd)]
pub enum PlutusDataKind {
    ConstrPlutusData,
    Map,
    List,
    Integer,
    Bytes,
}

#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub enum PlutusDataEnum {
    ConstrPlutusData(ConstrPlutusData),
    Map(PlutusMap),
    List(PlutusList),
    Integer(BigInt),
    Bytes(Vec<u8>),
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct PlutusData {
    datum: PlutusDataEnum,
    // We should always preserve the original datums when deserialized as this is NOT canonicized
    // before computing datum hashes. So this field stores the original bytes to re-use.
    original_bytes: Option<Vec<u8>>,
}

to_from_bytes!(PlutusData);

#[wasm_bindgen]
impl PlutusData {
    pub fn new_constr_plutus_data(constr_plutus_data: &ConstrPlutusData) -> Self {
        Self {
            datum: PlutusDataEnum::ConstrPlutusData(constr_plutus_data.clone()),
            original_bytes: None,
        }
    }

    pub fn new_map(map: &PlutusMap) -> Self {
        Self {
            datum: PlutusDataEnum::Map(map.clone()),
            original_bytes: None,
        }
    }

    pub fn new_list(list: &PlutusList) -> Self {
        Self {
            datum: PlutusDataEnum::List(list.clone()),
            original_bytes: None,
        }
    }

    pub fn new_integer(integer: &BigInt) -> Self {
        Self {
            datum: PlutusDataEnum::Integer(integer.clone()),
            original_bytes: None,
        }
    }

    pub fn new_bytes(bytes: Vec<u8>) -> Self {
        Self {
            datum: PlutusDataEnum::Bytes(bytes),
            original_bytes: None,
        }
    }

    pub fn kind(&self) -> PlutusDataKind {
        match &self.datum {
            PlutusDataEnum::ConstrPlutusData(_) => PlutusDataKind::ConstrPlutusData,
            PlutusDataEnum::Map(_) => PlutusDataKind::Map,
            PlutusDataEnum::List(_) => PlutusDataKind::List,
            PlutusDataEnum::Integer(_) => PlutusDataKind::Integer,
            PlutusDataEnum::Bytes(_) => PlutusDataKind::Bytes,
        }
    }

    pub fn as_constr_plutus_data(&self) -> Option<ConstrPlutusData> {
        match &self.datum {
            PlutusDataEnum::ConstrPlutusData(x) => Some(x.clone()),
            _ => None,
        }
    }

    pub fn as_map(&self) -> Option<PlutusMap> {
        match &self.datum {
            PlutusDataEnum::Map(x) => Some(x.clone()),
            _ => None,
        }
    }

    pub fn as_list(&self) -> Option<PlutusList> {
        match &self.datum {
            PlutusDataEnum::List(x) => Some(x.clone()),
            _ => None,
        }
    }

    pub fn as_integer(&self) -> Option<BigInt> {
        match &self.datum {
            PlutusDataEnum::Integer(x) => Some(x.clone()),
            _ => None,
        }
    }

    pub fn as_bytes(&self) -> Option<Vec<u8>> {
        match &self.datum {
            PlutusDataEnum::Bytes(x) => Some(x.clone()),
            _ => None,
        }
    }
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct PlutusList {
    pub(crate) elems: Vec<PlutusData>,
    // We should always preserve the original datums when deserialized as this is NOT canonicized
    // before computing datum hashes. This field will default to cardano-cli behavior if None
    // and will re-use the provided one if deserialized, unless the list is modified.
    pub(crate) definite_encoding: Option<bool>,
}

to_from_bytes!(PlutusList);

#[wasm_bindgen]
impl PlutusList {
    pub fn new() -> Self {
        Self {
            elems: Vec::new(),
            definite_encoding: None,
        }
    }

    pub fn len(&self) -> usize {
        self.elems.len()
    }

    pub fn get(&self, index: usize) -> PlutusData {
        self.elems[index].clone()
    }

    pub fn add(&mut self, elem: &PlutusData) {
        self.elems.push(elem.clone());
        self.definite_encoding = None;
    }
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct Redeemer {
    tag: RedeemerTag,
    index: BigNum,
    data: PlutusData,
    ex_units: ExUnits,
}

to_from_bytes!(Redeemer);

#[wasm_bindgen]
impl Redeemer {
    pub fn tag(&self) -> RedeemerTag {
        self.tag.clone()
    }

    pub fn index(&self) -> BigNum {
        self.index.clone()
    }

    pub fn data(&self) -> PlutusData {
        self.data.clone()
    }

    pub fn ex_units(&self) -> ExUnits {
        self.ex_units.clone()
    }

    pub fn new(tag: &RedeemerTag, index: &BigNum, data: &PlutusData, ex_units: &ExUnits) -> Self {
        Self {
            tag: tag.clone(),
            index: index.clone(),
            data: data.clone(),
            ex_units: ex_units.clone(),
        }
    }
}

#[wasm_bindgen]
#[derive(
    Copy,
    Clone,
    Debug,
    Eq,
    Ord,
    PartialEq,
    PartialOrd,
    Hash,
    serde::Serialize,
    serde::Deserialize,
    JsonSchema,
)]
pub enum RedeemerTagKind {
    Spend,
    Mint,
    Cert,
    Reward,
    Drep,
}

#[wasm_bindgen]
#[derive(
    Clone,
    Debug,
    Eq,
    Ord,
    PartialEq,
    PartialOrd,
    Hash,
    serde::Serialize,
    serde::Deserialize,
    JsonSchema,
)]
pub struct RedeemerTag(RedeemerTagKind);

to_from_bytes!(RedeemerTag);

#[wasm_bindgen]
impl RedeemerTag {
    pub fn new_spend() -> Self {
        Self(RedeemerTagKind::Spend)
    }

    pub fn new_mint() -> Self {
        Self(RedeemerTagKind::Mint)
    }

    pub fn new_cert() -> Self {
        Self(RedeemerTagKind::Cert)
    }

    pub fn new_reward() -> Self {
        Self(RedeemerTagKind::Reward)
    }

    pub fn new_drep() -> Self {
        Self(RedeemerTagKind::Drep)
    }

    pub fn kind(&self) -> RedeemerTagKind {
        self.0
    }
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct Redeemers(pub(crate) Vec<Redeemer>);

to_from_bytes!(Redeemers);

#[wasm_bindgen]
impl Redeemers {
    pub fn new() -> Self {
        Self(Vec::new())
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn get(&self, index: usize) -> Redeemer {
        self.0[index].clone()
    }

    pub fn add(&mut self, elem: &Redeemer) {
        self.0.push(elem.clone());
    }
}

impl Redeemers {
    pub fn get_total_ex_units(&self) -> Result<ExUnits, JsError> {
        let mut mem = BigNum::from_str("0")?;
        let mut step = BigNum::from_str("0")?;
        for redeemer in &self.0 {
            mem = mem.checked_add(&redeemer.ex_units().mem())?;
            step = step.checked_add(&redeemer.ex_units().steps())?;
        }
        Ok(ExUnits::new(&mem, &step))
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug, Eq, Ord, PartialEq, PartialOrd)]
pub struct Strings(Vec<String>);

#[wasm_bindgen]
impl Strings {
    pub fn new() -> Self {
        Self(Vec::new())
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn get(&self, index: usize) -> String {
        self.0[index].clone()
    }

    pub fn add(&mut self, elem: String) {
        self.0.push(elem);
    }
}

// json

/// JSON <-> PlutusData conversion schemas.
/// Follows ScriptDataJsonSchema in cardano-cli defined at:
/// https://github.com/input-output-hk/cardano-node/blob/master/cardano-api/src/Cardano/Api/ScriptData.hs#L254
///
/// All methods here have the following restrictions due to limitations on dependencies:
/// * JSON numbers above u64::MAX (positive) or below i64::MIN (negative) will throw errors
/// * Hex strings for bytes don't accept odd-length (half-byte) strings.
///      cardano-cli seems to support these however but it seems to be different than just 0-padding
///      on either side when tested so proceed with caution
#[wasm_bindgen]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum PlutusDatumSchema {
    /// ScriptDataJsonNoSchema in cardano-node.
    ///
    /// This is the format used by --script-data-value in cardano-cli
    /// This tries to accept most JSON but does not support the full spectrum of Plutus datums.
    /// From JSON:
    /// * null/true/false/floats NOT supported
    /// * strings starting with 0x are treated as hex bytes. All other strings are encoded as their utf8 bytes.
    /// To JSON:
    /// * ConstrPlutusData not supported in ANY FORM (neither keys nor values)
    /// * Lists not supported in keys
    /// * Maps not supported in keys
    ////
    BasicConversions,
    /// ScriptDataJsonDetailedSchema in cardano-node.
    ///
    /// This is the format used by --script-data-file in cardano-cli
    /// This covers almost all (only minor exceptions) Plutus datums, but the JSON must conform to a strict schema.
    /// The schema specifies that ALL keys and ALL values must be contained in a JSON map with 2 cases:
    /// 1. For ConstrPlutusData there must be two fields "constructor" contianing a number and "fields" containing its fields
    ///    e.g. { "constructor": 2, "fields": [{"int": 2}, {"list": [{"bytes": "CAFEF00D"}]}]}
    /// 2. For all other cases there must be only one field named "int", "bytes", "list" or "map"
    ///    Integer's value is a JSON number e.g. {"int": 100}
    ///    Bytes' value is a hex string representing the bytes WITHOUT any prefix e.g. {"bytes": "CAFEF00D"}
    ///    Lists' value is a JSON list of its elements encoded via the same schema e.g. {"list": [{"bytes": "CAFEF00D"}]}
    ///    Maps' value is a JSON list of objects, one for each key-value pair in the map, with keys "k" and "v"
    ///          respectively with their values being the plutus datum encoded via this same schema
    ///          e.g. {"map": [
    ///              {"k": {"int": 2}, "v": {"int": 5}},
    ///              {"k": {"map": [{"k": {"list": [{"int": 1}]}, "v": {"bytes": "FF03"}}]}, "v": {"list": []}}
    ///          ]}
    /// From JSON:
    /// * null/true/false/floats NOT supported
    /// * the JSON must conform to a very specific schema
    /// To JSON:
    /// * all Plutus datums should be fully supported outside of the integer range limitations outlined above.
    ////
    DetailedSchema,
}

// Data takes the cbor encoded plutus data in bytes
#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct Data(PlutusData);

to_from_bytes!(Data);
to_from_json!(Data);

#[wasm_bindgen]
impl Data {
    pub fn new(plutus_data: &PlutusData) -> Self {
        Self(plutus_data.clone())
    }

    pub fn get(&self) -> PlutusData {
        self.0.clone()
    }
}

#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub enum ScriptEnum {
    NativeScript(NativeScript),
    PlutusScriptV1(PlutusScript),
    PlutusScriptV2(PlutusScript),
    PlutusScriptV3(PlutusScript),
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub enum ScriptKind {
    NativeScript,
    PlutusScriptV1,
    PlutusScriptV2,
    PlutusScriptV3,
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct Script(ScriptEnum);

to_from_bytes!(Script);
to_from_json!(Script);

#[wasm_bindgen]
impl Script {
    pub fn new_native(native_script: &NativeScript) -> Self {
        Self(ScriptEnum::NativeScript(native_script.clone()))
    }

    pub fn new_plutus_v1(plutus_script: &PlutusScript) -> Self {
        Self(ScriptEnum::PlutusScriptV1(plutus_script.clone()))
    }

    pub fn new_plutus_v2(plutus_script: &PlutusScript) -> Self {
        Self(ScriptEnum::PlutusScriptV2(plutus_script.clone()))
    }

    pub fn new_plutus_v3(plutus_script: &PlutusScript) -> Self {
        Self(ScriptEnum::PlutusScriptV3(plutus_script.clone()))
    }

    pub fn kind(&self) -> ScriptKind {
        match &self.0 {
            ScriptEnum::NativeScript(_) => ScriptKind::NativeScript,
            ScriptEnum::PlutusScriptV1(_) => ScriptKind::PlutusScriptV1,
            ScriptEnum::PlutusScriptV2(_) => ScriptKind::PlutusScriptV2,
            ScriptEnum::PlutusScriptV3(_) => ScriptKind::PlutusScriptV3,
        }
    }

    pub fn as_native(&self) -> Option<NativeScript> {
        match &self.0 {
            ScriptEnum::NativeScript(native_script) => Some(native_script.clone()),
            _ => None,
        }
    }

    pub fn as_plutus_v1(&self) -> Option<PlutusScript> {
        match &self.0 {
            ScriptEnum::PlutusScriptV1(plutus_script) => Some(plutus_script.clone()),
            _ => None,
        }
    }

    pub fn as_plutus_v2(&self) -> Option<PlutusScript> {
        match &self.0 {
            ScriptEnum::PlutusScriptV2(plutus_script) => Some(plutus_script.clone()),
            _ => None,
        }
    }

    pub fn as_plutus_v3(&self) -> Option<PlutusScript> {
        match &self.0 {
            ScriptEnum::PlutusScriptV3(plutus_script) => Some(plutus_script.clone()),
            _ => None,
        }
    }
}

// ScriptRef takes the cbor encoded scripts in bytes
#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct ScriptRef(Script);

to_from_bytes!(ScriptRef);
to_from_json!(ScriptRef);

#[wasm_bindgen]
impl ScriptRef {
    pub fn new(script: &Script) -> Self {
        Self(script.clone())
    }

    pub fn get(&self) -> Script {
        self.0.clone()
    }
}

#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub enum DatumEnum {
    Hash(DataHash),
    Data(Data),
}

#[wasm_bindgen]
#[derive(Clone, Debug, Eq, Ord, PartialEq, PartialOrd)]
pub enum DatumKind {
    Hash,
    Data,
}

#[wasm_bindgen]
#[derive(
    Clone, Debug, Eq, Ord, PartialEq, PartialOrd, serde::Serialize, serde::Deserialize, JsonSchema,
)]
pub struct Datum(DatumEnum);

to_from_bytes!(Datum);
to_from_json!(Datum);

#[wasm_bindgen]
impl Datum {
    pub fn new_data_hash(data_hash: &DataHash) -> Self {
        Self(DatumEnum::Hash(data_hash.clone()))
    }
    pub fn new_data(data: &Data) -> Self {
        Self(DatumEnum::Data(data.clone()))
    }

    pub fn kind(&self) -> DatumKind {
        match &self.0 {
            DatumEnum::Hash(_) => DatumKind::Hash,
            DatumEnum::Data(_) => DatumKind::Data,
        }
    }

    pub fn as_data_hash(&self) -> Option<DataHash> {
        match &self.0 {
            DatumEnum::Hash(hash) => Some(hash.clone()),
            _ => None,
        }
    }

    pub fn as_data(&self) -> Option<Data> {
        match &self.0 {
            DatumEnum::Data(data) => Some(data.clone()),
            _ => None,
        }
    }
}

#[wasm_bindgen]
pub fn encode_json_str_to_plutus_datum(
    json: &str,
    schema: PlutusDatumSchema,
) -> Result<PlutusData, JsError> {
    let value = serde_json::from_str(json).map_err(|e| JsError::from_str(&e.to_string()))?;
    encode_json_value_to_plutus_datum(value, schema)
}

pub fn encode_json_value_to_plutus_datum(
    value: serde_json::Value,
    schema: PlutusDatumSchema,
) -> Result<PlutusData, JsError> {
    use serde_json::Value;
    fn encode_number(x: serde_json::Number) -> Result<PlutusData, JsError> {
        if let Some(x) = x.as_u64() {
            Ok(PlutusData::new_integer(&BigInt::from(x)))
        } else if let Some(x) = x.as_i64() {
            Ok(PlutusData::new_integer(&BigInt::from(x)))
        } else {
            Err(JsError::from_str("floats not allowed in plutus datums"))
        }
    }
    fn encode_string(
        s: &str,
        schema: PlutusDatumSchema,
        is_key: bool,
    ) -> Result<PlutusData, JsError> {
        if schema == PlutusDatumSchema::BasicConversions {
            if s.starts_with("0x") {
                // this must be a valid hex bytestring after
                hex::decode(&s[2..])
                    .map(|bytes| PlutusData::new_bytes(bytes))
                    .map_err(|err| JsError::from_str(&format!("Error decoding {}: {}", s, err)))
            } else if is_key {
                // try as an integer
                BigInt::from_str(s)
                    .map(|x| PlutusData::new_integer(&x))
                    // if not, we use the utf8 bytes of the string instead directly
                    .or_else(|_err| Ok(PlutusData::new_bytes(s.as_bytes().to_vec())))
            } else {
                // can only be UTF bytes if not in a key and not prefixed by 0x
                Ok(PlutusData::new_bytes(s.as_bytes().to_vec()))
            }
        } else {
            if s.starts_with("0x") {
                Err(JsError::from_str("Hex byte strings in detailed schema should NOT start with 0x and should just contain the hex characters"))
            } else {
                hex::decode(s)
                    .map(|bytes| PlutusData::new_bytes(bytes))
                    .map_err(|e| JsError::from_str(&e.to_string()))
            }
        }
    }
    fn encode_array(
        json_arr: Vec<Value>,
        schema: PlutusDatumSchema,
    ) -> Result<PlutusData, JsError> {
        let mut arr = PlutusList::new();
        for value in json_arr {
            arr.add(&encode_json_value_to_plutus_datum(value, schema)?);
        }
        Ok(PlutusData::new_list(&arr))
    }
    match schema {
        PlutusDatumSchema::BasicConversions => match value {
            Value::Null => Err(JsError::from_str("null not allowed in plutus datums")),
            Value::Bool(_) => Err(JsError::from_str("bools not allowed in plutus datums")),
            Value::Number(x) => encode_number(x),
            // no strings in plutus so it's all bytes (as hex or utf8 printable)
            Value::String(s) => encode_string(&s, schema, false),
            Value::Array(json_arr) => encode_array(json_arr, schema),
            Value::Object(json_obj) => {
                let mut map = PlutusMap::new();
                for (raw_key, raw_value) in json_obj {
                    let key = encode_string(&raw_key, schema, true)?;
                    let value = encode_json_value_to_plutus_datum(raw_value, schema)?;
                    map.insert(&key, &value);
                }
                Ok(PlutusData::new_map(&map))
            }
        },
        PlutusDatumSchema::DetailedSchema => match value {
            Value::Object(obj) => {
                if obj.len() == 1 {
                    // all variants except tagged constructors
                    let (k, v) = obj.into_iter().next().unwrap();
                    fn tag_mismatch() -> JsError {
                        JsError::from_str("key does not match type")
                    }
                    match k.as_str() {
                        "int" => match v {
                            Value::Number(x) => encode_number(x),
                            _ => Err(tag_mismatch()),
                        },
                        "bytes" => {
                            encode_string(v.as_str().ok_or_else(tag_mismatch)?, schema, false)
                        }
                        "list" => {
                            encode_array(v.as_array().ok_or_else(tag_mismatch)?.clone(), schema)
                        }
                        "map" => {
                            let mut map = PlutusMap::new();
                            fn map_entry_err() -> JsError {
                                JsError::from_str("entry format in detailed schema map object not correct. Needs to be of form {\"k\": {\"key_type\": key}, \"v\": {\"value_type\", value}}")
                            }
                            for entry in v.as_array().ok_or_else(tag_mismatch)? {
                                let entry_obj = entry.as_object().ok_or_else(map_entry_err)?;
                                let raw_key = entry_obj.get("k").ok_or_else(map_entry_err)?;
                                let value = entry_obj.get("v").ok_or_else(map_entry_err)?;
                                let key =
                                    encode_json_value_to_plutus_datum(raw_key.clone(), schema)?;
                                map.insert(
                                    &key,
                                    &encode_json_value_to_plutus_datum(value.clone(), schema)?,
                                );
                            }
                            Ok(PlutusData::new_map(&map))
                        }
                        invalid_key => Err(JsError::from_str(&format!(
                            "key '{}' in tagged object not valid",
                            invalid_key
                        ))),
                    }
                } else {
                    // constructor with tagged variant
                    if obj.len() != 2 {
                        return Err(JsError::from_str("detailed schemas must either have only one of the following keys: \"int\", \"bytes\", \"list\" or \"map\", or both of these 2 keys: \"constructor\" + \"fields\""));
                    }
                    let variant: BigNum = obj
                        .get("constructor")
                        .and_then(|v| Some(to_bignum(v.as_u64()?)))
                        .ok_or_else(|| JsError::from_str("tagged constructors must contain an unsigned integer called \"constructor\""))?;
                    let fields_json =
                        obj.get("fields")
                            .and_then(|f| f.as_array())
                            .ok_or_else(|| {
                                JsError::from_str(
                                    "tagged constructors must contian a list called \"fields\"",
                                )
                            })?;
                    let mut fields = PlutusList::new();
                    for field_json in fields_json {
                        let field = encode_json_value_to_plutus_datum(field_json.clone(), schema)?;
                        fields.add(&field);
                    }
                    Ok(PlutusData::new_constr_plutus_data(&ConstrPlutusData::new(
                        &variant, &fields,
                    )))
                }
            }
            _ => Err(JsError::from_str(&format!(
                "DetailedSchema requires ALL JSON to be tagged objects, found: {}",
                value
            ))),
        },
    }
}

#[wasm_bindgen]
pub fn decode_plutus_datum_to_json_str(
    datum: &PlutusData,
    schema: PlutusDatumSchema,
) -> Result<String, JsError> {
    let value = decode_plutus_datum_to_json_value(datum, schema)?;
    serde_json::to_string(&value).map_err(|e| JsError::from_str(&e.to_string()))
}

pub fn decode_plutus_datum_to_json_value(
    datum: &PlutusData,
    schema: PlutusDatumSchema,
) -> Result<serde_json::Value, JsError> {
    use serde_json::Value;
    use std::convert::TryFrom;
    let (type_tag, json_value) = match &datum.datum {
        PlutusDataEnum::ConstrPlutusData(constr) => {
            let mut obj = serde_json::map::Map::with_capacity(2);
            obj.insert(
                String::from("constructor"),
                Value::from(from_bignum(&constr.alternative))
            );
            let mut fields = Vec::new();
            for field in constr.data.elems.iter() {
                fields.push(decode_plutus_datum_to_json_value(field, schema)?);
            }
            obj.insert(
                String::from("fields"),
                Value::from(fields)
            );
            (None, Value::from(obj))
        },
        PlutusDataEnum::Map(map) => match schema {
            PlutusDatumSchema::BasicConversions => (None, Value::from(map.0.iter().map(|(key, value)| {
                let json_key: String = match &key.datum {
                    PlutusDataEnum::ConstrPlutusData(_) => Err(JsError::from_str("plutus data constructors are not allowed as keys in this schema. Use DetailedSchema.")),
                    PlutusDataEnum::Map(_) => Err(JsError::from_str("plutus maps are not allowed as keys in this schema. Use DetailedSchema.")),
                    PlutusDataEnum::List(_) => Err(JsError::from_str("plutus lists are not allowed as keys in this schema. Use DetailedSchema.")),
                    PlutusDataEnum::Integer(x) => Ok(x.to_str()),
                    PlutusDataEnum::Bytes(bytes) => String::from_utf8(bytes.clone()).or_else(|_err| Ok(format!("0x{}", hex::encode(bytes))))
                }?;
                let json_value = decode_plutus_datum_to_json_value(value, schema)?;
                Ok((json_key, Value::from(json_value)))
            }).collect::<Result<serde_json::map::Map<String, Value>, JsError>>()?)),
            PlutusDatumSchema::DetailedSchema => (Some("map"), Value::from(map.0.iter().map(|(key, value)| {
                let k = decode_plutus_datum_to_json_value(key, schema)?;
                let v = decode_plutus_datum_to_json_value(value, schema)?;
                let mut kv_obj = serde_json::map::Map::with_capacity(2);
                kv_obj.insert(String::from("k"), k);
                kv_obj.insert(String::from("v"), v);
                Ok(Value::from(kv_obj))
            }).collect::<Result<Vec<_>, JsError>>()?)),
        },
        PlutusDataEnum::List(list) => {
            let mut elems = Vec::new();
            for elem in list.elems.iter() {
                elems.push(decode_plutus_datum_to_json_value(elem, schema)?);
            }
            (Some("list"), Value::from(elems))
        },
        PlutusDataEnum::Integer(bigint) => (
            Some("int"),
            bigint
                .as_int()
                .as_ref()
                .map(|int| if int.0 >= 0 { Value::from(int.0 as u64) } else { Value::from(int.0 as i64) })
                .ok_or_else(|| JsError::from_str(&format!("Integer {} too big for our JSON support", bigint.to_str())))?
        ),
        PlutusDataEnum::Bytes(bytes) => (Some("bytes"), Value::from(match schema {
            PlutusDatumSchema::BasicConversions => {
                // cardano-cli converts to a string only if bytes are utf8 and all characters are printable
                String::from_utf8(bytes.clone())
                    .ok()
                    .filter(|utf8| utf8.chars().all(|c| !c.is_control()))
                // otherwise we hex-encode the bytes with a 0x prefix
                    .unwrap_or_else(|| format!("0x{}", hex::encode(bytes)))
            },
            PlutusDatumSchema::DetailedSchema => hex::encode(bytes),
        })),
    };
    if type_tag.is_none() || schema != PlutusDatumSchema::DetailedSchema {
        Ok(json_value)
    } else {
        let mut wrapper = serde_json::map::Map::with_capacity(1);
        wrapper.insert(String::from(type_tag.unwrap()), json_value);
        Ok(Value::from(wrapper))
    }
}

// Serialization

use std::io::SeekFrom;

impl cbor_event::se::Serialize for Datum {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        match &self.0 {
            DatumEnum::Hash(data_hash) => {
                serializer.write_unsigned_integer(0u64)?;
                data_hash.serialize(serializer)
            }
            DatumEnum::Data(data) => {
                serializer.write_unsigned_integer(1u64)?;
                data.serialize(serializer)
            }
        }
    }
}

impl Deserialize for Datum {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            if let cbor_event::Len::Len(n) = len {
                if n != 1 && n != 2 {
                    return Err(DeserializeFailure::CBOR(cbor_event::Error::WrongLen(
                        2,
                        len,
                        "[hash, inline]",
                    ))
                    .into());
                }
            }
            let datum_enum = match raw.unsigned_integer()? {
                0 => DatumEnum::Hash(DataHash::deserialize(raw)?),
                1 => DatumEnum::Data(Data::deserialize(raw)?),
                n => {
                    return Err(DeserializeFailure::FixedValueMismatch {
                        found: Key::Uint(n),
                        // TODO: change codegen to make FixedValueMismatch support Vec<Key> or ranges or something
                        expected: Key::Uint(0),
                    }
                    .into());
                }
            };
            if let cbor_event::Len::Indefinite = len {
                if raw.special()? != CBORSpecial::Break {
                    return Err(DeserializeFailure::EndingBreakMissing.into());
                }
            }
            Ok(Datum(datum_enum))
        })()
        .map_err(|e| e.annotate("Datum"))
    }
}

impl cbor_event::se::Serialize for Script {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        match &self.0 {
            ScriptEnum::NativeScript(native_script) => {
                serializer.write_unsigned_integer(0u64)?;
                native_script.serialize(serializer)
            }
            ScriptEnum::PlutusScriptV1(plutus_script) => {
                serializer.write_unsigned_integer(1u64)?;
                plutus_script.serialize(serializer)
            }
            ScriptEnum::PlutusScriptV2(plutus_script) => {
                serializer.write_unsigned_integer(2u64)?;
                plutus_script.serialize(serializer)
            }
            ScriptEnum::PlutusScriptV3(plutus_script) => {
                serializer.write_unsigned_integer(3u64)?;
                plutus_script.serialize(serializer)
            }
        }
    }
}

impl Deserialize for Script {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            if let cbor_event::Len::Len(n) = len {
                if n != 2 {
                    return Err(DeserializeFailure::CBOR(cbor_event::Error::WrongLen(
                        2,
                        len,
                        "[id, hash]",
                    ))
                    .into());
                }
            }
            let script_enum = match raw.unsigned_integer()? {
                0 => ScriptEnum::NativeScript(NativeScript::deserialize(raw)?),
                1 => ScriptEnum::PlutusScriptV1(PlutusScript::deserialize(raw)?),
                2 => ScriptEnum::PlutusScriptV2(PlutusScript::deserialize(raw)?),
                3 => ScriptEnum::PlutusScriptV3(PlutusScript::deserialize(raw)?),
                n => {
                    return Err(DeserializeFailure::FixedValueMismatch {
                        found: Key::Uint(n),
                        // TODO: change codegen to make FixedValueMismatch support Vec<Key> or ranges or something
                        expected: Key::Uint(0),
                    }
                    .into());
                }
            };
            if let cbor_event::Len::Indefinite = len {
                if raw.special()? != CBORSpecial::Break {
                    return Err(DeserializeFailure::EndingBreakMissing.into());
                }
            }
            Ok(Script(script_enum))
        })()
        .map_err(|e| e.annotate("Script"))
    }
}

impl cbor_event::se::Serialize for Data {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_tag(24u64)?;
        serializer.write_bytes(&self.0.to_bytes())
    }
}

impl Deserialize for Data {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        match raw.tag()? {
            24 => Ok(Self(PlutusData::from_bytes(raw.bytes()?).unwrap())),
            n => Err(DeserializeFailure::TagMismatch {
                found: n,
                expected: 24,
            }
            .into()),
        }
    }
}

impl cbor_event::se::Serialize for ScriptRef {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_tag(24u64)?;
        serializer.write_bytes(&self.0.to_bytes())
    }
}

impl Deserialize for ScriptRef {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        match raw.tag()? {
            24 => Ok(Self(Script::from_bytes(raw.bytes()?).unwrap())),
            n => Err(DeserializeFailure::TagMismatch {
                found: n,
                expected: 24,
            }
            .into()),
        }
    }
}

impl cbor_event::se::Serialize for PlutusScript {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_bytes(&self.0)
    }
}

impl Deserialize for PlutusScript {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        Ok(Self(raw.bytes()?))
    }
}

impl cbor_event::se::Serialize for PlutusScripts {
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

impl Deserialize for PlutusScripts {
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
                arr.push(PlutusScript::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("PlutusScripts"))?;
        Ok(Self(arr))
    }
}

impl cbor_event::se::Serialize for ConstrPlutusData {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        if let Some(compact_tag) =
            Self::alternative_to_compact_cbor_tag(from_bignum(&self.alternative))
        {
            // compact form
            serializer.write_tag(compact_tag as u64)?;
            self.data.serialize(serializer)
        } else {
            // general form
            serializer.write_tag(Self::GENERAL_FORM_TAG)?;
            serializer.write_array(cbor_event::Len::Len(2))?;
            self.alternative.serialize(serializer)?;
            self.data.serialize(serializer)
        }
    }
}

impl Deserialize for ConstrPlutusData {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let (alternative, data) = match raw.tag()? {
                // general form
                Self::GENERAL_FORM_TAG => {
                    let len = raw.array()?;
                    let mut read_len = CBORReadLen::new(len);
                    read_len.read_elems(2)?;
                    let alternative = BigNum::deserialize(raw)?;
                    let data =
                        (|| -> Result<_, DeserializeError> { Ok(PlutusList::deserialize(raw)?) })()
                            .map_err(|e| e.annotate("datas"))?;
                    match len {
                        cbor_event::Len::Len(_) => (),
                        cbor_event::Len::Indefinite => match raw.special()? {
                            CBORSpecial::Break => (),
                            _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                        },
                    }
                    (alternative, data)
                }
                // concise form
                tag => {
                    if let Some(alternative) = Self::compact_cbor_tag_to_alternative(tag) {
                        (to_bignum(alternative), PlutusList::deserialize(raw)?)
                    } else {
                        return Err(DeserializeFailure::TagMismatch {
                            found: tag,
                            expected: Self::GENERAL_FORM_TAG,
                        }
                        .into());
                    }
                }
            };
            Ok(ConstrPlutusData { alternative, data })
        })()
        .map_err(|e| e.annotate("ConstrPlutusData"))
    }
}

impl cbor_event::se::Serialize for CostModel {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for cost in &self.0 {
            cost.serialize(serializer)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for CostModel {
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
                arr.push(Int::deserialize(raw)?);
            }
            if arr.len() != OP_COUNT_V1 && arr.len() != OP_COUNT_V2 {
                return Err(DeserializeFailure::OutOfRange {
                    min: OP_COUNT_V1,
                    max: OP_COUNT_V1,
                    found: arr.len(),
                }
                .into());
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("CostModel"))?;
        Ok(Self(arr.try_into().unwrap()))
    }
}

impl cbor_event::se::Serialize for Costmdls {
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

impl Deserialize for Costmdls {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut table = std::collections::BTreeMap::new();
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
                let key = Language::deserialize(raw)?;
                let value = CostModel::deserialize(raw)?;
                if table.insert(key.clone(), value).is_some() {
                    return Err(DeserializeFailure::DuplicateKey(Key::Str(String::from(
                        "some complicated/unsupported type",
                    )))
                    .into());
                }
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("Costmdls"))?;
        Ok(Self(table))
    }
}

impl cbor_event::se::Serialize for ExUnitPrices {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.mem_price.serialize(serializer)?;
        self.step_price.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for ExUnitPrices {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let mut read_len = CBORReadLen::new(len);
            read_len.read_elems(2)?;
            let mem_price =
                (|| -> Result<_, DeserializeError> { Ok(SubCoin::deserialize(raw)?) })()
                    .map_err(|e| e.annotate("mem_price"))?;
            let step_price =
                (|| -> Result<_, DeserializeError> { Ok(SubCoin::deserialize(raw)?) })()
                    .map_err(|e| e.annotate("step_price"))?;
            match len {
                cbor_event::Len::Len(_) => (),
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break => (),
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            Ok(ExUnitPrices {
                mem_price,
                step_price,
            })
        })()
        .map_err(|e| e.annotate("ExUnitPrices"))
    }
}

impl cbor_event::se::Serialize for ExUnits {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(2))?;
        self.mem.serialize(serializer)?;
        self.steps.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for ExUnits {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let mut read_len = CBORReadLen::new(len);
            read_len.read_elems(2)?;
            let mem = (|| -> Result<_, DeserializeError> { Ok(BigNum::deserialize(raw)?) })()
                .map_err(|e| e.annotate("mem"))?;
            let steps = (|| -> Result<_, DeserializeError> { Ok(BigNum::deserialize(raw)?) })()
                .map_err(|e| e.annotate("steps"))?;
            match len {
                cbor_event::Len::Len(_) => (),
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break => (),
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            Ok(ExUnits { mem, steps })
        })()
        .map_err(|e| e.annotate("ExUnits"))
    }
}

impl cbor_event::se::Serialize for Language {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        match self.0 {
            LanguageKind::PlutusV1 => serializer.write_unsigned_integer(0u64),
            LanguageKind::PlutusV2 => serializer.write_unsigned_integer(1u64),
            LanguageKind::PlutusV3 => serializer.write_unsigned_integer(2u64),
        }
    }
}

impl Deserialize for Language {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            match raw.unsigned_integer()? {
                0 => Ok(Language::new_plutus_v1()),
                1 => Ok(Language::new_plutus_v2()),
                2 => Ok(Language::new_plutus_v3()),
                _ => Err(DeserializeError::new(
                    "Language",
                    DeserializeFailure::NoVariantMatched.into(),
                )),
            }
        })()
        .map_err(|e| e.annotate("Language"))
    }
}

impl cbor_event::se::Serialize for Languages {
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

impl Deserialize for Languages {
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
                arr.push(Language::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("Languages"))?;
        Ok(Self(arr))
    }
}

impl cbor_event::se::Serialize for PlutusMap {
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

impl Deserialize for PlutusMap {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut table: Vec<(PlutusData, PlutusData)> = Vec::new();
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
                let key = PlutusData::deserialize(raw)?;
                let value = PlutusData::deserialize(raw)?;
                if table.iter().find(|(k, _)| *k == key).is_some() {
                    return Err(DeserializeFailure::DuplicateKey(Key::Str(String::from(
                        "some complicated/unsupported type",
                    )))
                    .into());
                }
                table.push((key.clone(), value));
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("PlutusMap"))?;
        Ok(Self(table))
    }
}

impl cbor_event::se::Serialize for PlutusDataEnum {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        match self {
            PlutusDataEnum::ConstrPlutusData(x) => x.serialize(serializer),
            PlutusDataEnum::Map(x) => x.serialize(serializer),
            PlutusDataEnum::List(x) => x.serialize(serializer),
            PlutusDataEnum::Integer(x) => x.serialize(serializer),
            PlutusDataEnum::Bytes(x) => write_bounded_bytes(serializer, &x),
        }
    }
}

impl Deserialize for PlutusDataEnum {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let initial_position = raw.as_mut_ref().seek(SeekFrom::Current(0)).unwrap();
            match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
                Ok(ConstrPlutusData::deserialize(raw)?)
            })(raw)
            {
                Ok(variant) => return Ok(PlutusDataEnum::ConstrPlutusData(variant)),
                Err(_) => raw
                    .as_mut_ref()
                    .seek(SeekFrom::Start(initial_position))
                    .unwrap(),
            };
            match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
                Ok(PlutusMap::deserialize(raw)?)
            })(raw)
            {
                Ok(variant) => return Ok(PlutusDataEnum::Map(variant)),
                Err(_) => raw
                    .as_mut_ref()
                    .seek(SeekFrom::Start(initial_position))
                    .unwrap(),
            };
            match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
                Ok(PlutusList::deserialize(raw)?)
            })(raw)
            {
                Ok(variant) => return Ok(PlutusDataEnum::List(variant)),
                Err(_) => raw
                    .as_mut_ref()
                    .seek(SeekFrom::Start(initial_position))
                    .unwrap(),
            };
            match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
                Ok(BigInt::deserialize(raw)?)
            })(raw)
            {
                Ok(variant) => return Ok(PlutusDataEnum::Integer(variant)),
                Err(_) => raw
                    .as_mut_ref()
                    .seek(SeekFrom::Start(initial_position))
                    .unwrap(),
            };
            match (|raw: &mut Deserializer<_>| -> Result<_, DeserializeError> {
                Ok(read_bounded_bytes(raw)?)
            })(raw)
            {
                Ok(variant) => return Ok(PlutusDataEnum::Bytes(variant)),
                Err(_) => raw
                    .as_mut_ref()
                    .seek(SeekFrom::Start(initial_position))
                    .unwrap(),
            };
            Err(DeserializeError::new(
                "PlutusDataEnum",
                DeserializeFailure::NoVariantMatched.into(),
            ))
        })()
        .map_err(|e| e.annotate("PlutusDataEnum"))
    }
}

impl cbor_event::se::Serialize for PlutusData {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        match &self.original_bytes {
            Some(bytes) => serializer.write_raw_bytes(bytes),
            None => self.datum.serialize(serializer),
        }
    }
}

impl Deserialize for PlutusData {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        // these unwraps are fine since we're seeking the current position
        let before = raw.as_mut_ref().seek(SeekFrom::Current(0)).unwrap();
        let datum = PlutusDataEnum::deserialize(raw)?;
        let after = raw.as_mut_ref().seek(SeekFrom::Current(0)).unwrap();
        let bytes_read = (after - before) as usize;
        raw.as_mut_ref().seek(SeekFrom::Start(before)).unwrap();
        // these unwraps are fine since we read the above already
        let original_bytes = raw.as_mut_ref().fill_buf().unwrap()[..bytes_read].to_vec();
        raw.as_mut_ref().consume(bytes_read);
        Ok(Self {
            datum,
            original_bytes: Some(original_bytes),
        })
    }
}

impl cbor_event::se::Serialize for PlutusList {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        let use_definite_encoding = match self.definite_encoding {
            Some(definite) => definite,
            None => self.elems.is_empty(),
        };
        if use_definite_encoding {
            serializer.write_array(cbor_event::Len::Len(self.elems.len() as u64))?;
        } else {
            serializer.write_array(cbor_event::Len::Indefinite)?;
        }
        for element in &self.elems {
            element.serialize(serializer)?;
        }
        if !use_definite_encoding {
            serializer.write_special(cbor_event::Special::Break)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for PlutusList {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        let mut arr = Vec::new();
        let len = (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            while match len {
                cbor_event::Len::Len(n) => arr.len() < n as usize,
                cbor_event::Len::Indefinite => true,
            } {
                if raw.cbor_type()? == CBORType::Special {
                    assert_eq!(raw.special()?, CBORSpecial::Break);
                    break;
                }
                arr.push(PlutusData::deserialize(raw)?);
            }
            Ok(len)
        })()
        .map_err(|e| e.annotate("PlutusList"))?;
        Ok(Self {
            elems: arr,
            definite_encoding: Some(len != cbor_event::Len::Indefinite),
        })
    }
}

impl cbor_event::se::Serialize for Redeemer {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(4))?;
        self.tag.serialize(serializer)?;
        self.index.serialize(serializer)?;
        self.data.serialize(serializer)?;
        self.ex_units.serialize(serializer)?;
        Ok(serializer)
    }
}

impl Deserialize for Redeemer {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            let len = raw.array()?;
            let mut read_len = CBORReadLen::new(len);
            read_len.read_elems(4)?;
            let tag = (|| -> Result<_, DeserializeError> { Ok(RedeemerTag::deserialize(raw)?) })()
                .map_err(|e| e.annotate("tag"))?;
            let index = (|| -> Result<_, DeserializeError> { Ok(BigNum::deserialize(raw)?) })()
                .map_err(|e| e.annotate("index"))?;
            let data = (|| -> Result<_, DeserializeError> { Ok(PlutusData::deserialize(raw)?) })()
                .map_err(|e| e.annotate("data"))?;
            let ex_units = (|| -> Result<_, DeserializeError> { Ok(ExUnits::deserialize(raw)?) })()
                .map_err(|e| e.annotate("ex_units"))?;
            match len {
                cbor_event::Len::Len(_) => (),
                cbor_event::Len::Indefinite => match raw.special()? {
                    CBORSpecial::Break => (),
                    _ => return Err(DeserializeFailure::EndingBreakMissing.into()),
                },
            }
            Ok(Redeemer {
                tag,
                index,
                data,
                ex_units,
            })
        })()
        .map_err(|e| e.annotate("Redeemer"))
    }
}

impl cbor_event::se::Serialize for RedeemerTagKind {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        match self {
            RedeemerTagKind::Spend => serializer.write_unsigned_integer(0u64),
            RedeemerTagKind::Mint => serializer.write_unsigned_integer(1u64),
            RedeemerTagKind::Cert => serializer.write_unsigned_integer(2u64),
            RedeemerTagKind::Reward => serializer.write_unsigned_integer(3u64),
            RedeemerTagKind::Drep => serializer.write_unsigned_integer(4u64),
        }
    }
}

impl Deserialize for RedeemerTagKind {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        (|| -> Result<_, DeserializeError> {
            match raw.unsigned_integer() {
                Ok(0) => Ok(RedeemerTagKind::Spend),
                Ok(1) => Ok(RedeemerTagKind::Mint),
                Ok(2) => Ok(RedeemerTagKind::Cert),
                Ok(3) => Ok(RedeemerTagKind::Reward),
                Ok(4) => Ok(RedeemerTagKind::Drep),
                Ok(_) | Err(_) => Err(DeserializeFailure::NoVariantMatched.into()),
            }
        })()
        .map_err(|e| e.annotate("RedeemerTagEnum"))
    }
}

impl cbor_event::se::Serialize for RedeemerTag {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        self.0.serialize(serializer)
    }
}

impl Deserialize for RedeemerTag {
    fn deserialize<R: BufRead + Seek>(raw: &mut Deserializer<R>) -> Result<Self, DeserializeError> {
        Ok(Self(RedeemerTagKind::deserialize(raw)?))
    }
}

impl cbor_event::se::Serialize for Redeemers {
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

impl Deserialize for Redeemers {
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
                arr.push(Redeemer::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("Redeemers"))?;
        Ok(Self(arr))
    }
}

impl cbor_event::se::Serialize for Strings {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_array(cbor_event::Len::Len(self.0.len() as u64))?;
        for element in &self.0 {
            serializer.write_text(&element)?;
        }
        Ok(serializer)
    }
}

impl Deserialize for Strings {
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
                arr.push(String::deserialize(raw)?);
            }
            Ok(())
        })()
        .map_err(|e| e.annotate("Strings"))?;
        Ok(Self(arr))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use hex::*;

    #[test]
    pub fn matching_plutus_address() {
        let script = "59099a59099701000033233223322323233322232333222323333333322222222323332223233332222323233223233322232333222323233223322323233333222223322332233223322332233222222323253353031333006375a00a6eb4010cccd5cd19b8735573aa004900011980499191919191919191919191999ab9a3370e6aae754029200023333333333017335025232323333573466e1cd55cea8012400046603a60706ae854008c0a8d5d09aba250022350573530583357389201035054310005949926135573ca00226ea8004d5d0a80519a8128131aba150093335502c75ca0566ae854020ccd540b1d728159aba1500733502504135742a00c66a04a66aa0a4094eb4d5d0a8029919191999ab9a3370e6aae7540092000233501f3232323333573466e1cd55cea80124000466a04e66a080eb4d5d0a80118229aba135744a00446a0b66a60b866ae712401035054310005d49926135573ca00226ea8004d5d0a8011919191999ab9a3370e6aae7540092000233502533504075a6ae854008c114d5d09aba2500223505b35305c3357389201035054310005d49926135573ca00226ea8004d5d09aba250022350573530583357389201035054310005949926135573ca00226ea8004d5d0a80219a812bae35742a00666a04a66aa0a4eb88004d5d0a801181b9aba135744a00446a0a66a60a866ae71241035054310005549926135744a00226ae8940044d5d1280089aba25001135744a00226ae8940044d5d1280089aba25001135573ca00226ea8004d5d0a8011919191999ab9a3370ea00290031180e181c9aba135573ca00646666ae68cdc3a801240084603660866ae84d55cf280211999ab9a3370ea00690011180d98171aba135573ca00a46666ae68cdc3a802240004603c6eb8d5d09aab9e500623504e35304f3357389201035054310005049926499264984d55cea80089baa001357426ae8940088d411cd4c120cd5ce2490350543100049499261048135046353047335738920103505435000484984d55cf280089baa0012212330010030022001222222222212333333333300100b00a00900800700600500400300220012212330010030022001122123300100300212001122123300100300212001122123300100300212001212222300400521222230030052122223002005212222300100520011232230023758002640026aa068446666aae7c004940388cd4034c010d5d080118019aba200203323232323333573466e1cd55cea801a4000466600e6464646666ae68cdc39aab9d5002480008cc034c0c4d5d0a80119a8098169aba135744a00446a06c6a606e66ae712401035054310003849926135573ca00226ea8004d5d0a801999aa805bae500a35742a00466a01eeb8d5d09aba25002235032353033335738921035054310003449926135744a00226aae7940044dd50009110919980080200180110009109198008018011000899aa800bae75a224464460046eac004c8004d540b888c8cccd55cf80112804919a80419aa81898031aab9d5002300535573ca00460086ae8800c0b84d5d08008891001091091198008020018900089119191999ab9a3370ea002900011a80418029aba135573ca00646666ae68cdc3a801240044a01046a0526a605466ae712401035054310002b499264984d55cea80089baa001121223002003112200112001232323333573466e1cd55cea8012400046600c600e6ae854008dd69aba135744a00446a0466a604866ae71241035054310002549926135573ca00226ea80048848cc00400c00880048c8cccd5cd19b8735573aa002900011bae357426aae7940088d407cd4c080cd5ce24810350543100021499261375400224464646666ae68cdc3a800a40084a00e46666ae68cdc3a8012400446a014600c6ae84d55cf280211999ab9a3370ea00690001280511a8111a981199ab9c490103505431000244992649926135573aa00226ea8004484888c00c0104488800844888004480048c8cccd5cd19b8750014800880188cccd5cd19b8750024800080188d4068d4c06ccd5ce249035054310001c499264984d55ce9baa0011220021220012001232323232323333573466e1d4005200c200b23333573466e1d4009200a200d23333573466e1d400d200823300b375c6ae854014dd69aba135744a00a46666ae68cdc3a8022400c46601a6eb8d5d0a8039bae357426ae89401c8cccd5cd19b875005480108cc048c050d5d0a8049bae357426ae8940248cccd5cd19b875006480088c050c054d5d09aab9e500b23333573466e1d401d2000230133016357426aae7940308d407cd4c080cd5ce2481035054310002149926499264992649926135573aa00826aae79400c4d55cf280109aab9e500113754002424444444600e01044244444446600c012010424444444600a010244444440082444444400644244444446600401201044244444446600201201040024646464646666ae68cdc3a800a400446660106eb4d5d0a8021bad35742a0066eb4d5d09aba2500323333573466e1d400920002300a300b357426aae7940188d4040d4c044cd5ce2490350543100012499264984d55cea80189aba25001135573ca00226ea80048488c00800c888488ccc00401401000c80048c8c8cccd5cd19b875001480088c018dd71aba135573ca00646666ae68cdc3a80124000460106eb8d5d09aab9e500423500a35300b3357389201035054310000c499264984d55cea80089baa001212230020032122300100320011122232323333573466e1cd55cea80124000466aa016600c6ae854008c014d5d09aba25002235007353008335738921035054310000949926135573ca00226ea8004498480048004448848cc00400c008448004448c8c00400488cc00cc008008004ccc888ccc888cccccccc88888888cc88ccccc88888cccc8888ccc888cc88cc88cc88ccc888cc88cc88ccc888cc88cc88cc88cc88888ccd5cd19b8700300201e01d2212330010030022001222222222212333333333300100b00a00900800700600500400300220012212330010030022001222123330010040030022001112200212212233001004003120011122123300100300211200122123300100300220011212230020031122001120011221233001003002120011221233001003002120011221233001003002120011220021220012001121222300300411222002112220011200121222230040052122223003005212222300200521222230010052001221233001003002200121222222230070082212222222330060090082122222223005008122222220041222222200322122222223300200900822122222223300100900820012122300200322212233300100500400320012122300200321223001003200101";
        let full_cbor = PlutusScript::from_bytes(hex::decode(script).unwrap()).unwrap();

        let address = EnterpriseAddress::new(
            0u8,
            &StakeCredential::from_scripthash(&full_cbor.hash(ScriptHashNamespace::PlutusV1)),
        );

        assert_ne!(hex::encode(full_cbor.bytes()), script);

        assert_eq!(
            address.to_address().to_bech32(None).unwrap(),
            "addr_test1wz8jmzsx9uh2pgcxj7za36jeln7sprheumhkd3srnytfacg6cgclw"
        );
    }

    #[test]
    pub fn plutus_constr_data() {
        let constr_0 = PlutusData::new_constr_plutus_data(&ConstrPlutusData::new(
            &to_bignum(0),
            &PlutusList::new(),
        ));
        let constr_0_hash = hex::encode(hash_plutus_data(&constr_0).to_bytes());
        assert_eq!(
            constr_0_hash,
            "923918e403bf43c34b4ef6b48eb2ee04babed17320d8d1b9ff9ad086e86f44ec"
        );
        let _constr_0_roundtrip = PlutusData::from_bytes(constr_0.to_bytes()).unwrap();
        // TODO: do we want semantic equality or bytewise equality?
        //assert_eq!(constr_0, constr_0_roundtrip);
        let constr_1854 = PlutusData::new_constr_plutus_data(&ConstrPlutusData::new(
            &to_bignum(1854),
            &PlutusList::new(),
        ));
        let _constr_1854_roundtrip = PlutusData::from_bytes(constr_1854.to_bytes()).unwrap();
        //assert_eq!(constr_1854, constr_1854_roundtrip);
    }

    #[test]
    pub fn plutus_list_serialization_cli_compatibility() {
        // mimic cardano-cli array encoding, see https://github.com/Emurgo/cardano-serialization-lib/issues/227
        let datum_cli = "d8799f4100d8799fd8799fd8799f581cffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd8799fd8799fd8799f581cffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd87a80ff1a002625a0d8799fd879801a000f4240d87a80ffff";
        let datum = PlutusData::from_bytes(Vec::from_hex(datum_cli).unwrap()).unwrap();
        assert_eq!(datum_cli, hex::encode(datum.to_bytes()));

        // encode empty arrays as fixed
        assert_eq!("80", hex::encode(PlutusList::new().to_bytes()));

        // encode arrays as indefinite length array
        let mut list = PlutusList::new();
        list.add(&PlutusData::new_integer(&BigInt::from_str("1").unwrap()));
        assert_eq!("9f01ff", hex::encode(list.to_bytes()));

        // witness_set should have fixed length array
        let mut witness_set = TransactionWitnessSet::new();
        witness_set.set_plutus_data(&list);
        assert_eq!("a1049f01ff", hex::encode(witness_set.to_bytes()));

        list = PlutusList::new();
        list.add(&datum);
        witness_set.set_plutus_data(&list);
        assert_eq!(
            format!("a1049f{}ff", datum_cli),
            hex::encode(witness_set.to_bytes())
        );
    }

    #[test]
    pub fn plutus_datums_respect_deserialized_encoding() {
        let orig_bytes = Vec::from_hex(
            "81d8799f581ce1cbb80db89e292269aeb93ec15eb963dda5176b66949fe1c2a6a38da140a1401864ff",
        )
        .unwrap();
        let datums = PlutusList::from_bytes(orig_bytes.clone()).unwrap();
        let new_bytes = datums.to_bytes();
        assert_eq!(orig_bytes, new_bytes);
    }

    #[test]
    pub fn test_cost_model() {
        let arr = vec![
            197209, 0, 1, 1, 396231, 621, 0, 1, 150000, 1000, 0, 1, 150000, 32, 2477736, 29175, 4,
            29773, 100, 29773, 100, 29773, 100, 29773, 100, 29773, 100, 29773, 100, 100, 100,
            29773, 100, 150000, 32, 150000, 32, 150000, 32, 150000, 1000, 0, 1, 150000, 32, 150000,
            1000, 0, 8, 148000, 425507, 118, 0, 1, 1, 150000, 1000, 0, 8, 150000, 112536, 247, 1,
            150000, 10000, 1, 136542, 1326, 1, 1000, 150000, 1000, 1, 150000, 32, 150000, 32,
            150000, 32, 1, 1, 150000, 1, 150000, 4, 103599, 248, 1, 103599, 248, 1, 145276, 1366,
            1, 179690, 497, 1, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000,
            32, 148000, 425507, 118, 0, 1, 1, 61516, 11218, 0, 1, 150000, 32, 148000, 425507, 118,
            0, 1, 1, 148000, 425507, 118, 0, 1, 1, 2477736, 29175, 4, 0, 82363, 4, 150000, 5000, 0,
            1, 150000, 32, 197209, 0, 1, 1, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000,
            32, 150000, 32, 150000, 32, 3345831, 1, 1,
        ];
        let cm = arr
            .iter()
            .fold((CostModel::new(), 0), |(mut cm, i), x| {
                cm.set(i, &Int::new_i32(x.clone())).unwrap();
                (cm, i + 1)
            })
            .0;
        let mut cms = Costmdls::new();
        cms.insert(&Language::new_plutus_v1(), &cm);
        assert_eq!(
            hex::encode(cms.language_views_encoding()),
            "a141005901d59f1a000302590001011a00060bc719026d00011a000249f01903e800011a000249f018201a0025cea81971f70419744d186419744d186419744d186419744d186419744d186419744d18641864186419744d18641a000249f018201a000249f018201a000249f018201a000249f01903e800011a000249f018201a000249f01903e800081a000242201a00067e2318760001011a000249f01903e800081a000249f01a0001b79818f7011a000249f0192710011a0002155e19052e011903e81a000249f01903e8011a000249f018201a000249f018201a000249f0182001011a000249f0011a000249f0041a000194af18f8011a000194af18f8011a0002377c190556011a0002bdea1901f1011a000249f018201a000249f018201a000249f018201a000249f018201a000249f018201a000249f018201a000242201a00067e23187600010119f04c192bd200011a000249f018201a000242201a00067e2318760001011a000242201a00067e2318760001011a0025cea81971f704001a000141bb041a000249f019138800011a000249f018201a000302590001011a000249f018201a000249f018201a000249f018201a000249f018201a000249f018201a000249f018201a000249f018201a00330da70101ff"
        );
    }

    pub fn plutus_datum_from_json_basic() {
        let json = "{
            \"5\": \"some utf8 string\",
            \"0xDEADBEEF\": [
                {\"reg string\": {}},
                -9
            ]
        }";

        let datum =
            encode_json_str_to_plutus_datum(json, PlutusDatumSchema::BasicConversions).unwrap();

        let map = datum.as_map().unwrap();
        let map_5 = map
            .get(&PlutusData::new_integer(&BigInt::from_str("5").unwrap()))
            .unwrap();
        let utf8_bytes = "some utf8 string".as_bytes();
        assert_eq!(map_5.as_bytes().unwrap(), utf8_bytes);
        let map_deadbeef: PlutusList = map
            .get(&PlutusData::new_bytes(vec![222, 173, 190, 239]))
            .expect("DEADBEEF key not found")
            .as_list()
            .expect("must be a map");
        assert_eq!(map_deadbeef.len(), 2);
        let inner_map = map_deadbeef.get(0).as_map().unwrap();
        assert_eq!(inner_map.len(), 1);
        let reg_string = inner_map
            .get(&PlutusData::new_bytes("reg string".as_bytes().to_vec()))
            .unwrap();
        assert_eq!(reg_string.as_map().expect("reg string: {}").len(), 0);
        assert_eq!(
            map_deadbeef.get(1).as_integer(),
            BigInt::from_str("-9").ok()
        );

        // test round-trip via generated JSON
        let json2 =
            decode_plutus_datum_to_json_str(&datum, PlutusDatumSchema::BasicConversions).unwrap();
        let datum2 =
            encode_json_str_to_plutus_datum(&json2, PlutusDatumSchema::BasicConversions).unwrap();
        assert_eq!(datum, datum2);
    }

    #[test]
    pub fn plutus_datum_from_json_detailed() {
        let json = "{\"list\": [
            {\"map\": [
                {\"k\": {\"bytes\": \"DEADBEEF\"}, \"v\": {\"int\": 42}},
                {\"k\": {\"map\" : [
                    {\"k\": {\"int\": 9}, \"v\": {\"int\": -5}}
                ]}, \"v\": {\"list\": []}}
            ]},
            {\"bytes\": \"CAFED00D\"},
            {\"constructor\": 0, \"fields\": [
                {\"map\": []},
                {\"int\": 23}
            ]}
        ]}";
        let datum =
            encode_json_str_to_plutus_datum(json, PlutusDatumSchema::DetailedSchema).unwrap();

        let list = datum.as_list().unwrap();
        assert_eq!(3, list.len());
        // map
        let map = list.get(0).as_map().unwrap();
        assert_eq!(map.len(), 2);
        let map_deadbeef = map
            .get(&PlutusData::new_bytes(vec![222, 173, 190, 239]))
            .unwrap();
        assert_eq!(map_deadbeef.as_integer(), BigInt::from_str("42").ok());
        let mut long_key = PlutusMap::new();
        long_key.insert(
            &PlutusData::new_integer(&BigInt::from_str("9").unwrap()),
            &PlutusData::new_integer(&BigInt::from_str("-5").unwrap()),
        );
        let map_9_to_5 = map
            .get(&PlutusData::new_map(&long_key))
            .unwrap()
            .as_list()
            .unwrap();
        assert_eq!(map_9_to_5.len(), 0);
        // bytes
        let bytes = list.get(1).as_bytes().unwrap();
        assert_eq!(bytes, [202, 254, 208, 13]);
        // constr data
        let constr = list.get(2).as_constr_plutus_data().unwrap();
        assert_eq!(to_bignum(0), constr.alternative());
        let fields = constr.data();
        assert_eq!(fields.len(), 2);
        let field0 = fields.get(0).as_map().unwrap();
        assert_eq!(field0.len(), 0);
        let field1 = fields.get(1);
        assert_eq!(field1.as_integer(), BigInt::from_str("23").ok());

        // test round-trip via generated JSON
        let json2 =
            decode_plutus_datum_to_json_str(&datum, PlutusDatumSchema::DetailedSchema).unwrap();
        let datum2 =
            encode_json_str_to_plutus_datum(&json2, PlutusDatumSchema::DetailedSchema).unwrap();
        assert_eq!(datum, datum2);
    }
}
