use super::*;
use std::collections::{BTreeMap, HashMap, HashSet};

#[wasm_bindgen]
#[derive(Clone, Debug, PartialEq, Eq, Hash, Ord, PartialOrd)]
pub struct RedeemerWitnessKey {
    tag: RedeemerTag,
    index: BigNum,
}

#[wasm_bindgen]
impl RedeemerWitnessKey {
    pub fn tag(&self) -> RedeemerTag {
        self.tag.clone()
    }

    pub fn index(&self) -> BigNum {
        self.index.clone()
    }

    pub fn new(tag: &RedeemerTag, index: &BigNum) -> Self {
        Self {
            tag: tag.clone(),
            index: index.clone(),
        }
    }
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct RequiredWitnessSet {
    // note: the real key type for these is Vkey
    // but cryptographically these should be equivalent and Ed25519KeyHash is more flexible
    vkeys: HashSet<Ed25519KeyHash>,
    bootstraps: HashSet<Ed25519KeyHash>,

    native_scripts: HashSet<ScriptHash>,
    plutus_scripts: HashSet<ScriptHash>,
    plutus_data: HashSet<DataHash>,
    redeemers: HashSet<RedeemerWitnessKey>,
    plutus_v2_scripts: HashSet<ScriptHash>,
}

#[wasm_bindgen]
impl RequiredWitnessSet {
    pub fn add_vkey(&mut self, vkey: &Vkeywitness) {
        self.add_vkey_key(&vkey.vkey());
    }
    pub fn add_vkey_key(&mut self, vkey: &Vkey) {
        self.add_vkey_key_hash(&vkey.public_key().hash());
    }
    pub fn add_vkey_key_hash(&mut self, hash: &Ed25519KeyHash) {
        self.vkeys.insert(hash.clone());
    }

    pub fn add_bootstrap(&mut self, bootstrap: &BootstrapWitness) {
        self.add_bootstrap_key(&bootstrap.vkey());
    }
    pub fn add_bootstrap_key(&mut self, bootstrap: &Vkey) {
        self.add_bootstrap_key_hash(&bootstrap.public_key().hash());
    }
    pub fn add_bootstrap_key_hash(&mut self, hash: &Ed25519KeyHash) {
        self.bootstraps.insert(hash.clone());
    }

    pub fn add_native_script(&mut self, native_script: &NativeScript) {
        self.add_native_script_hash(&native_script.hash(ScriptHashNamespace::NativeScript));
    }
    pub fn add_native_script_hash(&mut self, native_script: &ScriptHash) {
        self.native_scripts.insert(native_script.clone());
    }

    pub fn add_plutus_script(&mut self, plutus_script: &PlutusScript) {
        self.add_plutus_hash(&plutus_script.hash(ScriptHashNamespace::PlutusV1));
    }

    pub fn add_plutus_v2_script(&mut self, plutus_script: &PlutusScript) {
        self.add_plutus_hash(&plutus_script.hash(ScriptHashNamespace::PlutusV2));
    }

    pub fn add_plutus_hash(&mut self, plutus_script: &ScriptHash) {
        self.plutus_scripts.insert(plutus_script.clone());
    }

    pub fn add_plutus_datum(&mut self, plutus_datum: &PlutusData) {
        self.add_plutus_datum_hash(&hash_plutus_data(&plutus_datum));
    }
    pub fn add_plutus_datum_hash(&mut self, plutus_datum: &DataHash) {
        self.plutus_data.insert(plutus_datum.clone());
    }

    pub fn add_redeemer(&mut self, redeemer: &Redeemer) {
        self.add_redeemer_tag(&RedeemerWitnessKey::new(&redeemer.tag(), &redeemer.index()));
    }
    pub fn add_redeemer_tag(&mut self, redeemer: &RedeemerWitnessKey) {
        self.redeemers.insert(redeemer.clone());
    }

    pub fn add_all(&mut self, requirements: &RequiredWitnessSet) {
        self.vkeys.extend(requirements.vkeys.iter().cloned());
        self.bootstraps
            .extend(requirements.bootstraps.iter().cloned());
        self.native_scripts
            .extend(requirements.native_scripts.iter().cloned());
        self.plutus_scripts
            .extend(requirements.plutus_scripts.iter().cloned());
        self.plutus_v2_scripts
            .extend(requirements.plutus_v2_scripts.iter().cloned());
        self.plutus_data
            .extend(requirements.plutus_data.iter().cloned());
        self.redeemers
            .extend(requirements.redeemers.iter().cloned());
    }

    pub(crate) fn to_str(&self) -> String {
        let vkeys = self
            .vkeys
            .iter()
            .map(|key| format!("Vkey:{}", hex::encode(key.to_bytes())))
            .collect::<Vec<String>>()
            .join(",");
        let bootstraps = self
            .bootstraps
            .iter()
            .map(|key| format!("Legacy Bootstraps:{}", hex::encode(key.to_bytes())))
            .collect::<Vec<String>>()
            .join(",");
        let native_scripts = self
            .native_scripts
            .iter()
            .map(|hash| format!("Native script hash:{}", hex::encode(hash.to_bytes())))
            .collect::<Vec<String>>()
            .join(",");
        let plutus_scripts = self
            .plutus_scripts
            .iter()
            .map(|hash| format!("Plutus script hash:{}", hex::encode(hash.to_bytes())))
            .collect::<Vec<String>>()
            .join(",");
        let plutus_v2_scripts = self
            .plutus_v2_scripts
            .iter()
            .map(|hash| format!("Plutus v2 script hash:{}", hex::encode(hash.to_bytes())))
            .collect::<Vec<String>>()
            .join(",");
        let plutus_data = self
            .plutus_data
            .iter()
            .map(|hash| format!("Plutus data hash:{}", hex::encode(hash.to_bytes())))
            .collect::<Vec<String>>()
            .join(",");
        let redeemers = self
            .redeemers
            .iter()
            .map(|key| {
                format!(
                    "Redeemer:{}-{}",
                    hex::encode(key.tag().to_bytes()),
                    key.index().to_str()
                )
            })
            .collect::<Vec<String>>()
            .join(",");

        [
            vkeys,
            bootstraps,
            native_scripts,
            plutus_scripts,
            plutus_data,
            redeemers,
            plutus_v2_scripts,
        ]
        .iter()
        .filter(|msg| msg.len() > 0)
        .cloned()
        .collect::<Vec<String>>()
        .join("\n")
    }

    pub(crate) fn len(&self) -> usize {
        self.vkeys.len()
            + self.bootstraps.len()
            + self.native_scripts.len()
            + self.plutus_scripts.len()
            + self.plutus_data.len()
            + self.redeemers.len()
            + self.plutus_v2_scripts.len()
    }

    pub fn new() -> Self {
        Self {
            vkeys: HashSet::new(),
            bootstraps: HashSet::new(),
            native_scripts: HashSet::new(),
            plutus_scripts: HashSet::new(),
            plutus_data: HashSet::new(),
            redeemers: HashSet::new(),
            plutus_v2_scripts: HashSet::new(),
        }
    }
}

/// Builder de-duplicates witnesses as they are added
#[wasm_bindgen]
#[derive(Clone)]
pub struct TransactionWitnessSetBuilder {
    // See Alonzo spec section 3.1 which defines the keys for these types
    vkeys: HashMap<Vkey, Vkeywitness>,
    bootstraps: HashMap<Vkey, BootstrapWitness>,
    native_scripts: HashMap<ScriptHash, NativeScript>,
    plutus_scripts: HashMap<ScriptHash, PlutusScript>,
    plutus_data: BTreeMap<DataHash, PlutusData>,
    redeemers: BTreeMap<RedeemerWitnessKey, Redeemer>,
    plutus_v2_scripts: HashMap<ScriptHash, PlutusScript>,

    /// witnesses that need to be added for the build function to succeed
    /// this allows checking that witnesses are present at build time (instead of when submitting to a node)
    /// This is useful for APIs that can keep track of which witnesses will be required (like transaction builders)
    required_wits: RequiredWitnessSet,
}

#[wasm_bindgen]
impl TransactionWitnessSetBuilder {
    pub fn add_vkey(&mut self, vkey: &Vkeywitness) {
        self.vkeys.insert(vkey.vkey(), vkey.clone());
    }

    pub fn add_bootstrap(&mut self, bootstrap: &BootstrapWitness) {
        self.bootstraps.insert(bootstrap.vkey(), bootstrap.clone());
    }

    pub fn add_native_script(&mut self, native_script: &NativeScript) {
        self.native_scripts.insert(
            native_script.hash(ScriptHashNamespace::NativeScript),
            native_script.clone(),
        );
    }

    pub fn add_plutus_script(&mut self, plutus_script: &PlutusScript) {
        self.plutus_scripts.insert(
            plutus_script.hash(ScriptHashNamespace::PlutusV1),
            plutus_script.clone(),
        );
    }

    pub fn add_plutus_v2_script(&mut self, plutus_script: &PlutusScript) {
        self.plutus_v2_scripts.insert(
            plutus_script.hash(ScriptHashNamespace::PlutusV2),
            plutus_script.clone(),
        );
    }

    pub fn add_plutus_datum(&mut self, plutus_datum: &PlutusData) {
        self.plutus_data
            .insert(hash_plutus_data(&plutus_datum), plutus_datum.clone());
    }

    pub fn add_redeemer(&mut self, redeemer: &Redeemer) {
        self.redeemers.insert(
            RedeemerWitnessKey::new(&redeemer.tag(), &redeemer.index()),
            redeemer.clone(),
        );
    }

    pub fn add_required_wits(&mut self, required_wits: &RequiredWitnessSet) {
        self.required_wits.add_all(&required_wits)
    }

    pub fn new() -> Self {
        Self {
            vkeys: HashMap::new(),
            bootstraps: HashMap::new(),
            native_scripts: HashMap::new(),
            plutus_scripts: HashMap::new(),
            // BTreeMap for datums and redeemers because order matters regarding script data hash
            plutus_data: BTreeMap::new(),
            redeemers: BTreeMap::new(),
            required_wits: RequiredWitnessSet::new(),
            plutus_v2_scripts: HashMap::new(),
        }
    }

    pub fn add_existing(&mut self, wit_set: &TransactionWitnessSet) {
        match &wit_set.vkeys() {
            None => (),
            Some(vkeys) => vkeys.0.iter().for_each(|vkey| {
                self.add_vkey(vkey);
            }),
        };
        match &wit_set.bootstraps() {
            None => (),
            Some(bootstraps) => bootstraps.0.iter().for_each(|bootstrap| {
                self.add_bootstrap(bootstrap);
            }),
        };
        match &wit_set.native_scripts() {
            None => (),
            Some(native_scripts) => native_scripts.0.iter().for_each(|native_script| {
                self.add_native_script(native_script);
            }),
        };
        match &wit_set.plutus_scripts() {
            None => (),
            Some(plutus_scripts) => plutus_scripts.0.iter().for_each(|plutus_script| {
                self.add_plutus_script(plutus_script);
            }),
        };
        match &wit_set.plutus_v2_scripts() {
            None => (),
            Some(plutus_scripts) => plutus_scripts.0.iter().for_each(|plutus_script| {
                self.add_plutus_v2_script(plutus_script);
            }),
        };
        match &wit_set.plutus_data() {
            None => (),
            Some(plutus_data) => plutus_data.elems.iter().for_each(|plutus_datum| {
                self.add_plutus_datum(plutus_datum);
            }),
        };
        match &wit_set.redeemers() {
            None => (),
            Some(redeemers) => redeemers.0.iter().for_each(|redeemer| {
                self.add_redeemer(redeemer);
            }),
        };
    }

    pub fn build(&self) -> Result<TransactionWitnessSet, JsError> {
        let mut result = TransactionWitnessSet::new();
        let mut remaining_wits = self.required_wits.clone();

        if self.vkeys.len() > 0 {
            result.set_vkeys(&Vkeywitnesses(self.vkeys.values().cloned().collect()));
            self.vkeys.keys().for_each(|key| {
                remaining_wits.vkeys.remove(&key.public_key().hash());
            });
        }
        if self.bootstraps.len() > 0 {
            result.set_bootstraps(&BootstrapWitnesses(
                self.bootstraps.values().cloned().collect(),
            ));
            self.bootstraps.keys().for_each(|key| {
                remaining_wits.bootstraps.remove(&key.public_key().hash());
            });
        }
        if self.native_scripts.len() > 0 {
            result.set_native_scripts(&NativeScripts(
                self.native_scripts.values().cloned().collect(),
            ));
            self.native_scripts.keys().for_each(|hash| {
                remaining_wits.native_scripts.remove(hash);
            });
        }
        if self.plutus_scripts.len() > 0 {
            result.set_plutus_scripts(&PlutusScripts(
                self.plutus_scripts.values().cloned().collect(),
            ));
            self.plutus_scripts.keys().for_each(|hash| {
                remaining_wits.plutus_scripts.remove(hash);
            });
        }
        if self.plutus_v2_scripts.len() > 0 {
            result.set_plutus_v2_scripts(&PlutusScripts(
                self.plutus_v2_scripts.values().cloned().collect(),
            ));
            self.plutus_v2_scripts.keys().for_each(|hash| {
                remaining_wits.plutus_v2_scripts.remove(hash);
            });
        }
        if self.plutus_data.len() > 0 {
            result.set_plutus_data(&PlutusList {
                elems: self.plutus_data.values().cloned().collect(),
                definite_encoding: None,
            });
            self.plutus_data.keys().for_each(|hash| {
                remaining_wits.plutus_data.remove(hash);
            });
        }
        if self.redeemers.len() > 0 {
            result.set_redeemers(&Redeemers(self.redeemers.values().cloned().collect()));
            self.redeemers.keys().for_each(|key| {
                remaining_wits.redeemers.remove(key);
            });
        }

        if remaining_wits.len() > 0 {
            return Err(JsError::from_str(&format!(
                "Missing following witnesses:\n{}",
                remaining_wits.to_str()
            )));
        }

        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn fake_raw_key_sig(id: u8) -> Ed25519Signature {
        Ed25519Signature::from_bytes(vec![
            id, 248, 153, 211, 155, 23, 253, 93, 102, 193, 146, 196, 181, 13, 52, 62, 66, 247, 35,
            91, 48, 80, 76, 138, 231, 97, 159, 147, 200, 40, 220, 109, 206, 69, 104, 221, 105, 23,
            124, 85, 24, 40, 73, 45, 119, 122, 103, 39, 253, 102, 194, 251, 204, 189, 168, 194,
            174, 237, 146, 3, 44, 153, 121, 10,
        ])
        .unwrap()
    }

    fn fake_raw_key_public(id: u8) -> PublicKey {
        PublicKey::from_bytes(&[
            id, 118, 57, 154, 33, 13, 232, 114, 14, 159, 168, 148, 228, 94, 65, 226, 154, 181, 37,
            227, 11, 196, 2, 128, 28, 7, 98, 80, 209, 88, 91, 205,
        ])
        .unwrap()
    }

    fn fake_private_key1() -> Bip32PrivateKey {
        Bip32PrivateKey::from_bytes(&[
            0xb8, 0xf2, 0xbe, 0xce, 0x9b, 0xdf, 0xe2, 0xb0, 0x28, 0x2f, 0x5b, 0xad, 0x70, 0x55,
            0x62, 0xac, 0x99, 0x6e, 0xfb, 0x6a, 0xf9, 0x6b, 0x64, 0x8f, 0x44, 0x45, 0xec, 0x44,
            0xf4, 0x7a, 0xd9, 0x5c, 0x10, 0xe3, 0xd7, 0x2f, 0x26, 0xed, 0x07, 0x54, 0x22, 0xa3,
            0x6e, 0xd8, 0x58, 0x5c, 0x74, 0x5a, 0x0e, 0x11, 0x50, 0xbc, 0xce, 0xba, 0x23, 0x57,
            0xd0, 0x58, 0x63, 0x69, 0x91, 0xf3, 0x8a, 0x37, 0x91, 0xe2, 0x48, 0xde, 0x50, 0x9c,
            0x07, 0x0d, 0x81, 0x2a, 0xb2, 0xfd, 0xa5, 0x78, 0x60, 0xac, 0x87, 0x6b, 0xc4, 0x89,
            0x19, 0x2c, 0x1e, 0xf4, 0xce, 0x25, 0x3c, 0x19, 0x7e, 0xe2, 0x19, 0xa4,
        ])
        .unwrap()
    }

    fn fake_private_key2() -> Bip32PrivateKey {
        Bip32PrivateKey::from_bytes(
            &hex::decode("d84c65426109a36edda5375ea67f1b738e1dacf8629f2bb5a2b0b20f3cd5075873bf5cdfa7e533482677219ac7d639e30a38e2e645ea9140855f44ff09e60c52c8b95d0d35fe75a70f9f5633a3e2439b2994b9e2bc851c49e9f91d1a5dcbb1a3").unwrap()
        ).unwrap()
    }

    #[test]
    fn vkey_test() {
        let mut builder = TransactionWitnessSetBuilder::new();

        let raw_key_public = fake_raw_key_public(0);
        let fake_sig = fake_raw_key_sig(0);

        // add the same element twice
        builder.add_vkey(&Vkeywitness::new(&Vkey::new(&raw_key_public), &fake_sig));
        builder.add_vkey(&Vkeywitness::new(&Vkey::new(&raw_key_public), &fake_sig));

        // add a different element
        builder.add_vkey(&Vkeywitness::new(
            &Vkey::new(&fake_raw_key_public(1)),
            &fake_raw_key_sig(1),
        ));

        let wit_set = builder.build().unwrap();
        assert_eq!(wit_set.vkeys().unwrap().len(), 2);
    }

    #[test]
    fn bootstrap_test() {
        let mut builder = TransactionWitnessSetBuilder::new();

        // add the same element twice
        let wit1 = make_icarus_bootstrap_witness(
            &TransactionHash::from([0u8; TransactionHash::BYTE_COUNT]),
            &ByronAddress::from_base58(
                "Ae2tdPwUPEZGUEsuMAhvDcy94LKsZxDjCbgaiBBMgYpR8sKf96xJmit7Eho",
            )
            .unwrap(),
            &fake_private_key1(),
        );
        builder.add_bootstrap(&wit1);
        builder.add_bootstrap(&wit1);

        // add a different element
        builder.add_bootstrap(&make_icarus_bootstrap_witness(
            &TransactionHash::from([0u8; TransactionHash::BYTE_COUNT]),
            &ByronAddress::from_base58(
                "Ae2tdPwUPEZGUEsuMAhvDcy94LKsZxDjCbgaiBBMgYpR8sKf96xJmit7Eho",
            )
            .unwrap(),
            &fake_private_key2(),
        ));

        let wit_set = builder.build().unwrap();
        assert_eq!(wit_set.bootstraps().unwrap().len(), 2);
    }

    #[test]
    fn native_script_test() {
        let mut builder = TransactionWitnessSetBuilder::new();

        // add the same element twice
        let wit1 = NativeScript::new_timelock_start(&TimelockStart::new(&1.into()));
        builder.add_native_script(&wit1);
        builder.add_native_script(&wit1);

        // add a different element
        builder.add_native_script(&NativeScript::new_timelock_start(&TimelockStart::new(
            &2.into(),
        )));

        let wit_set = builder.build().unwrap();
        assert_eq!(wit_set.native_scripts().unwrap().len(), 2);
    }

    // TODO: tests for plutus_scripts, plutus_data, redeemers
    // once we have mock data for them
    #[test]
    fn requirement_test_fail() {
        let mut builder = TransactionWitnessSetBuilder::new();

        let mut required_wits = RequiredWitnessSet::new();
        required_wits.add_vkey_key(&Vkey::new(&fake_raw_key_public(0)));
        required_wits.add_native_script(&NativeScript::new_timelock_start(&TimelockStart::new(
            &2.into(),
        )));
        builder.add_required_wits(&required_wits);

        // add a different element
        builder.add_vkey(&Vkeywitness::new(
            &Vkey::new(&fake_raw_key_public(1)),
            &fake_raw_key_sig(1),
        ));

        assert!(builder.build().is_err());
    }

    #[test]
    fn requirement_test_pass() {
        let mut builder = TransactionWitnessSetBuilder::new();

        let mut required_wits = RequiredWitnessSet::new();
        required_wits.add_vkey_key(&Vkey::new(&fake_raw_key_public(0)));
        builder.add_required_wits(&required_wits);

        // add a different element
        builder.add_vkey(&Vkeywitness::new(
            &Vkey::new(&fake_raw_key_public(0)),
            &fake_raw_key_sig(0),
        ));

        assert!(builder.build().is_ok());
    }
}
