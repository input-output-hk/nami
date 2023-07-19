use fraction::ToPrimitive;
use itertools::Itertools;

use super::fees;
use super::utils;
use super::*;
use crate::{tx_builder_utils::*, witness_builder::RedeemerWitnessKey};
use std::collections::{BTreeMap, BTreeSet, HashMap, HashSet};

// comes from witsVKeyNeeded in the Ledger spec
fn witness_keys_for_cert(
    tx_builder: &mut TransactionBuilder,
    cert_enum: &Certificate,
    script_witness: Option<ScriptWitness>,
) {
    match &cert_enum.0 {
        // stake key registrations do not require a witness
        CertificateEnum::StakeRegistration(_cert) => {}
        CertificateEnum::StakeDeregistration(cert) => match cert.stake_credential().kind() {
            StakeCredKind::Script => {
                let hash = cert.stake_credential().to_scripthash().unwrap();
                match &script_witness {
                    Some(sw) => match &sw.kind() {
                        ScriptWitnessKind::NativeWitness => {
                            let native_script = sw.as_native_witness().unwrap();
                            if !tx_builder.input_types.scripts.contains(&hash) {
                                tx_builder.add_native_script(&native_script);
                                tx_builder.input_types.scripts.insert(hash.clone());
                            }
                        }
                        ScriptWitnessKind::PlutusWitness => {
                            let plutus_witness = sw.as_plutus_witness().unwrap();
                            if !tx_builder.input_types.scripts.contains(&hash)
                                && plutus_witness.script().is_some()
                            {
                                match plutus_witness.version() {
                                    LanguageKind::PlutusV1 => {
                                        tx_builder
                                            .add_plutus_script(&plutus_witness.script().unwrap());
                                    }
                                    LanguageKind::PlutusV2 => {
                                        tx_builder.add_plutus_v2_script(
                                            &plutus_witness.script().unwrap(),
                                        );
                                    }
                                    LanguageKind::PlutusV3 => {
                                        todo!("PlutusV3 not implemented yet.")
                                    }
                                }
                                tx_builder.input_types.scripts.insert(hash.clone());
                            }
                            tx_builder.used_plutus_scripts.insert(hash.clone());
                        }
                    },
                    None => (),
                }
            }
            StakeCredKind::Key => {
                tx_builder
                    .input_types
                    .vkeys
                    .insert(cert.stake_credential().to_keyhash().unwrap());
            }
        },
        CertificateEnum::StakeDelegation(cert) => match cert.stake_credential().kind() {
            StakeCredKind::Script => {
                let hash = cert.stake_credential().to_scripthash().unwrap();
                match &script_witness {
                    Some(sw) => match &sw.kind() {
                        ScriptWitnessKind::NativeWitness => {
                            let native_script = sw.as_native_witness().unwrap();
                            if !tx_builder.input_types.scripts.contains(&hash) {
                                tx_builder.add_native_script(&native_script);
                                tx_builder.input_types.scripts.insert(hash.clone());
                            }
                        }
                        ScriptWitnessKind::PlutusWitness => {
                            let plutus_witness = sw.as_plutus_witness().unwrap();
                            if !tx_builder.input_types.scripts.contains(&hash)
                                && plutus_witness.script().is_some()
                            {
                                match plutus_witness.version() {
                                    LanguageKind::PlutusV1 => {
                                        tx_builder
                                            .add_plutus_script(&plutus_witness.script().unwrap());
                                    }
                                    LanguageKind::PlutusV2 => {
                                        tx_builder.add_plutus_v2_script(
                                            &plutus_witness.script().unwrap(),
                                        );
                                    }
                                    LanguageKind::PlutusV3 => {
                                        todo!("PlutusV3 not implemented yet.")
                                    }
                                }
                                tx_builder.input_types.scripts.insert(hash.clone());
                            }
                            tx_builder.used_plutus_scripts.insert(hash.clone());
                        }
                    },
                    None => (),
                }
            }
            StakeCredKind::Key => {
                tx_builder
                    .input_types
                    .vkeys
                    .insert(cert.stake_credential().to_keyhash().unwrap());
            }
        },
        CertificateEnum::PoolRegistration(cert) => {
            for owner in &cert.pool_params().pool_owners().0 {
                tx_builder.input_types.vkeys.insert(owner.clone());
            }
            tx_builder.input_types.vkeys.insert(
                Ed25519KeyHash::from_bytes(cert.pool_params().operator().to_bytes()).unwrap(),
            );
        }
        CertificateEnum::PoolRetirement(cert) => {
            tx_builder
                .input_types
                .vkeys
                .insert(Ed25519KeyHash::from_bytes(cert.pool_keyhash().to_bytes()).unwrap());
        }
        CertificateEnum::GenesisKeyDelegation(cert) => {
            tx_builder.input_types.vkeys.insert(
                Ed25519KeyHash::from_bytes(cert.genesis_delegate_hash().to_bytes()).unwrap(),
            );
        }
        // not witness as there is no single core node or genesis key that posts the certificate
        CertificateEnum::MoveInstantaneousRewardsCert(_cert) => {}
        _ => todo!("Conway certificates not yet implemented!"),
    }
}

fn fake_private_key() -> Bip32PrivateKey {
    Bip32PrivateKey::from_bytes(&[
        0xb8, 0xf2, 0xbe, 0xce, 0x9b, 0xdf, 0xe2, 0xb0, 0x28, 0x2f, 0x5b, 0xad, 0x70, 0x55, 0x62,
        0xac, 0x99, 0x6e, 0xfb, 0x6a, 0xf9, 0x6b, 0x64, 0x8f, 0x44, 0x45, 0xec, 0x44, 0xf4, 0x7a,
        0xd9, 0x5c, 0x10, 0xe3, 0xd7, 0x2f, 0x26, 0xed, 0x07, 0x54, 0x22, 0xa3, 0x6e, 0xd8, 0x58,
        0x5c, 0x74, 0x5a, 0x0e, 0x11, 0x50, 0xbc, 0xce, 0xba, 0x23, 0x57, 0xd0, 0x58, 0x63, 0x69,
        0x91, 0xf3, 0x8a, 0x37, 0x91, 0xe2, 0x48, 0xde, 0x50, 0x9c, 0x07, 0x0d, 0x81, 0x2a, 0xb2,
        0xfd, 0xa5, 0x78, 0x60, 0xac, 0x87, 0x6b, 0xc4, 0x89, 0x19, 0x2c, 0x1e, 0xf4, 0xce, 0x25,
        0x3c, 0x19, 0x7e, 0xe2, 0x19, 0xa4,
    ])
    .unwrap()
}

fn fake_raw_key_sig() -> Ed25519Signature {
    Ed25519Signature::from_bytes(vec![
        36, 248, 153, 211, 155, 23, 253, 93, 102, 193, 146, 196, 181, 13, 52, 62, 66, 247, 35, 91,
        48, 80, 76, 138, 231, 97, 159, 147, 200, 40, 220, 109, 206, 69, 104, 221, 105, 23, 124, 85,
        24, 40, 73, 45, 119, 122, 103, 39, 253, 102, 194, 251, 204, 189, 168, 194, 174, 237, 146,
        3, 44, 153, 121, 10,
    ])
    .unwrap()
}

fn fake_raw_key_public() -> PublicKey {
    PublicKey::from_bytes(&[
        207, 118, 57, 154, 33, 13, 232, 114, 14, 159, 168, 148, 228, 94, 65, 226, 154, 181, 37,
        227, 11, 196, 2, 128, 28, 7, 98, 80, 209, 88, 91, 205,
    ])
    .unwrap()
}

fn count_needed_vkeys(tx_builder: &TransactionBuilder) -> usize {
    let mut input_hashes = tx_builder.input_types.vkeys.clone();

    // required signers field
    if let Some(required_signers) = &tx_builder.required_signers {
        for key_hash in required_signers.0.iter() {
            input_hashes.insert(key_hash.clone());
        }
    }

    match &tx_builder.native_scripts {
        None => input_hashes.len(),
        Some(scripts) => {
            // Union all input keys with native script keys
            input_hashes
                .union(&RequiredSignersSet::from(scripts))
                .count()
        }
    }
}

// tx_body must be the result of building from tx_builder
// constructs the rest of the Transaction using fake witness data of the correct length
// for use in calculating the size of the final Transaction
fn fake_full_tx(
    tx_builder: &TransactionBuilder,
    body: TransactionBody,
) -> Result<Transaction, JsError> {
    let fake_key_root = fake_private_key();
    let raw_key_public = fake_raw_key_public();
    let fake_sig = fake_raw_key_sig();

    // recall: this includes keys for input, certs and withdrawals
    let vkeys = match count_needed_vkeys(tx_builder) {
        0 => None,
        x => {
            let fake_vkey_witness = Vkeywitness::new(&Vkey::new(&raw_key_public), &fake_sig);
            let mut result = Vkeywitnesses::new();
            for _i in 0..x {
                result.add(&fake_vkey_witness.clone());
            }
            Some(result)
        }
    };
    let bootstrap_keys = match tx_builder.input_types.bootstraps.len() {
        0 => None,
        _x => {
            let mut result = BootstrapWitnesses::new();
            for addr in &tx_builder.input_types.bootstraps {
                // picking icarus over daedalus for fake witness generation shouldn't matter
                result.add(&make_icarus_bootstrap_witness(
                    &TransactionHash::from([0u8; TransactionHash::BYTE_COUNT]),
                    &ByronAddress::from_bytes(addr.clone()).unwrap(),
                    &fake_key_root,
                ));
            }
            Some(result)
        }
    };

    let witness_set = TransactionWitnessSet {
        vkeys,
        native_scripts: tx_builder.native_scripts.clone(),
        bootstraps: bootstrap_keys,
        plutus_scripts: tx_builder.plutus_scripts.clone(),
        plutus_data: tx_builder.collect_plutus_data(),
        redeemers: tx_builder.redeemers.clone(),
        plutus_v2_scripts: tx_builder.plutus_v2_scripts.clone(),
        plutus_v3_scripts: None, // TODO
    };
    Ok(Transaction {
        body,
        witness_set,
        is_valid: true,
        auxiliary_data: tx_builder.auxiliary_data.clone(),
    })
}

fn min_fee(tx_builder: &mut TransactionBuilder) -> Result<Coin, JsError> {
    // Commented out for performance, `min_fee` is a critical function
    // This was mostly added here as a paranoid step anyways
    // If someone is using `set_mint` and `add_mint*` API function, everything is expected to be intact
    // TODO: figure out if assert is needed here and a better way to do it maybe only once if mint doesn't change
    // if let Some(mint) = tx_builder.mint.as_ref() {
    //     assert_required_mint_scripts(mint, tx_builder.native_scripts.as_ref())?;
    // }
    let build = tx_builder.build()?;
    let full_tx = fake_full_tx(tx_builder, build)?;
    fees::min_fee(
        &full_tx,
        &tx_builder.config.fee_algo,
        &tx_builder.config.ex_unit_prices,
    )
}

// We need to know how many of each type of witness will be in the transaction so we can calculate the tx fee
#[derive(Clone, Debug)]
struct MockWitnessSet {
    vkeys: BTreeSet<Ed25519KeyHash>,
    scripts: BTreeSet<ScriptHash>,
    bootstraps: BTreeSet<Vec<u8>>,
}

#[derive(Clone, Debug)]
struct TxBuilderInput {
    utxo: TransactionUnspentOutput,
    // input: TransactionInput,
    // amount: Value, // we need to keep track of the amount in the inputs for input selection
    redeemer: Option<Redeemer>, // we need to keep track of the redeemer index
}

#[derive(Clone, Debug)]
struct TxBuilderMint {
    policy_id: PolicyID,
    mint_assets: MintAssets,
    redeemer: Option<Redeemer>, // we need to keep track of the redeemer index
}

#[derive(Clone, Debug)]
struct TxBuilderCert {
    certificate: Certificate,
    redeemer: Option<Redeemer>, // we need to keep track of the redeemer index
}

#[derive(Clone, Debug)]
struct TxBuilderWithdrawal {
    reward_address: RewardAddress,
    coin: Coin,
    redeemer: Option<Redeemer>, // we need to keep track of the redeemer index
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct TransactionBuilderConfig {
    fee_algo: fees::LinearFee,
    pool_deposit: BigNum,               // protocol parameter
    key_deposit: BigNum,                // protocol parameter
    max_value_size: u32,                // protocol parameter
    max_tx_size: u32,                   // protocol parameter
    coins_per_utxo_byte: Coin,          // protocol parameter
    ex_unit_prices: ExUnitPrices,       // protocol parameter
    max_tx_ex_units: ExUnits,           // protocol parameter
    costmdls: Costmdls,                 // protocol parameter
    collateral_percentage: u32,         // protocol parameter
    max_collateral_inputs: u32,         // protocol parameter
    slot_config: (BigNum, BigNum, u32), // (zero_time, zero_slot, slot_length)
    blockfrost: Blockfrost,
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct TransactionBuilderConfigBuilder {
    fee_algo: Option<fees::LinearFee>,
    pool_deposit: Option<BigNum>,               // protocol parameter
    key_deposit: Option<BigNum>,                // protocol parameter
    max_value_size: Option<u32>,                // protocol parameter
    max_tx_size: Option<u32>,                   // protocol parameter
    coins_per_utxo_byte: Option<Coin>,          // protocol parameter
    ex_unit_prices: Option<ExUnitPrices>,       // protocol parameter
    max_tx_ex_units: Option<ExUnits>,           // protocol parameter
    costmdls: Option<Costmdls>,                 // protocol parameter
    collateral_percentage: Option<u32>,         // protocol parameter
    max_collateral_inputs: Option<u32>,         // protocol parameter
    slot_config: Option<(BigNum, BigNum, u32)>, // (zero_time, zero_slot, slot_length)
    blockfrost: Option<Blockfrost>,
}

#[wasm_bindgen]
impl TransactionBuilderConfigBuilder {
    pub fn new() -> Self {
        Self {
            fee_algo: None,
            pool_deposit: None,
            key_deposit: None,
            max_value_size: None,
            max_tx_size: None,
            coins_per_utxo_byte: None,
            ex_unit_prices: None,
            max_tx_ex_units: None,
            costmdls: None,
            collateral_percentage: None,
            max_collateral_inputs: None,
            slot_config: None,
            blockfrost: None,
        }
    }

    pub fn fee_algo(&self, fee_algo: &fees::LinearFee) -> Self {
        let mut cfg = self.clone();
        cfg.fee_algo = Some(fee_algo.clone());
        cfg
    }

    pub fn coins_per_utxo_byte(&self, coins_per_utxo_byte: &Coin) -> Self {
        let mut cfg = self.clone();
        cfg.coins_per_utxo_byte = Some(coins_per_utxo_byte.clone());
        cfg
    }

    pub fn pool_deposit(&self, pool_deposit: &BigNum) -> Self {
        let mut cfg = self.clone();
        cfg.pool_deposit = Some(pool_deposit.clone());
        cfg
    }

    pub fn key_deposit(&self, key_deposit: &BigNum) -> Self {
        let mut cfg = self.clone();
        cfg.key_deposit = Some(key_deposit.clone());
        cfg
    }

    pub fn max_value_size(&self, max_value_size: u32) -> Self {
        let mut cfg = self.clone();
        cfg.max_value_size = Some(max_value_size);
        cfg
    }

    pub fn max_tx_size(&self, max_tx_size: u32) -> Self {
        let mut cfg = self.clone();
        cfg.max_tx_size = Some(max_tx_size);
        cfg
    }

    pub fn ex_unit_prices(&self, ex_unit_prices: &ExUnitPrices) -> Self {
        let mut cfg = self.clone();
        cfg.ex_unit_prices = Some(ex_unit_prices.clone());
        cfg
    }

    pub fn max_tx_ex_units(&self, max_tx_ex_units: &ExUnits) -> Self {
        let mut cfg = self.clone();
        cfg.max_tx_ex_units = Some(max_tx_ex_units.clone());
        cfg
    }

    pub fn costmdls(&self, costmdls: &Costmdls) -> Self {
        let mut cfg = self.clone();
        cfg.costmdls = Some(costmdls.clone());
        cfg
    }

    pub fn collateral_percentage(&self, collateral_percentage: u32) -> Self {
        let mut cfg = self.clone();
        cfg.collateral_percentage = Some(collateral_percentage);
        cfg
    }

    pub fn max_collateral_inputs(&self, max_collateral_inputs: u32) -> Self {
        let mut cfg = self.clone();
        cfg.max_collateral_inputs = Some(max_collateral_inputs);
        cfg
    }

    pub fn slot_config(&self, zero_time: &BigNum, zero_slot: &BigNum, slot_length: u32) -> Self {
        let mut cfg = self.clone();
        cfg.slot_config = Some((zero_time.clone(), zero_slot.clone(), slot_length));
        cfg
    }

    pub fn blockfrost(&self, blockfrost: &Blockfrost) -> Self {
        let mut cfg = self.clone();
        cfg.blockfrost = Some(blockfrost.clone());
        cfg
    }

    pub fn build(&self) -> Result<TransactionBuilderConfig, JsError> {
        let cfg = self.clone();
        Ok(TransactionBuilderConfig {
            fee_algo: cfg
                .fee_algo
                .ok_or(JsError::from_str("uninitialized field: fee_algo"))?,
            pool_deposit: cfg
                .pool_deposit
                .ok_or(JsError::from_str("uninitialized field: pool_deposit"))?,
            key_deposit: cfg
                .key_deposit
                .ok_or(JsError::from_str("uninitialized field: key_deposit"))?,
            max_value_size: cfg
                .max_value_size
                .ok_or(JsError::from_str("uninitialized field: max_value_size"))?,
            max_tx_size: cfg
                .max_tx_size
                .ok_or(JsError::from_str("uninitialized field: max_tx_size"))?,
            coins_per_utxo_byte: cfg.coins_per_utxo_byte.ok_or(JsError::from_str(
                "uninitialized field: coins_per_utxo_byte",
            ))?,
            ex_unit_prices: cfg
                .ex_unit_prices
                .ok_or(JsError::from_str("uninitialized field: ex_unit_prices"))?,
            max_tx_ex_units: if cfg.max_tx_ex_units.is_some() {
                cfg.max_tx_ex_units.unwrap()
            } else {
                ExUnits::new(&to_bignum(0), &to_bignum(0))
            },
            costmdls: if cfg.costmdls.is_some() {
                cfg.costmdls.unwrap()
            } else {
                Costmdls::new()
            },
            collateral_percentage: cfg.collateral_percentage.ok_or(JsError::from_str(
                "uninitialized field: collateral_percentage",
            ))?,
            max_collateral_inputs: cfg.max_collateral_inputs.ok_or(JsError::from_str(
                "uninitialized field: max_collateral_inputs",
            ))?,
            slot_config: if cfg.slot_config.is_some() {
                cfg.slot_config.unwrap()
            } else {
                (to_bignum(0), to_bignum(0), 0)
            },
            blockfrost: if cfg.blockfrost.is_some() {
                cfg.blockfrost.unwrap()
            } else {
                Blockfrost::new("".to_string(), "".to_string())
            },
        })
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct TransactionBuilder {
    config: TransactionBuilderConfig,
    inputs: Vec<TxBuilderInput>,
    outputs: TransactionOutputs,
    change_outputs: TransactionOutputs,
    fee: Option<Coin>,
    ttl: Option<Slot>, // absolute slot number
    certs: Option<Vec<TxBuilderCert>>,
    withdrawals: Option<Vec<TxBuilderWithdrawal>>,
    auxiliary_data: Option<AuxiliaryData>,
    validity_start_interval: Option<Slot>,
    input_types: MockWitnessSet,
    mint: Option<Vec<TxBuilderMint>>,
    native_scripts: Option<NativeScripts>,
    script_data_hash: Option<ScriptDataHash>,
    collateral: Option<Vec<TxBuilderInput>>,
    required_signers: Option<RequiredSigners>,
    network_id: Option<NetworkId>,
    plutus_scripts: Option<PlutusScripts>,
    plutus_data: Option<BTreeMap<DataHash, PlutusData>>,
    redeemers: Option<Redeemers>,
    //Babbage
    collateral_return: Option<TransactionOutput>,
    total_collateral: Option<Coin>,
    reference_inputs: Option<TransactionUnspentOutputs>,
    plutus_v2_scripts: Option<PlutusScripts>,
    used_plutus_scripts: HashSet<ScriptHash>, // collect script hashes from inputs, mints, certs and withdrawals
    plutus_versions: HashMap<ScriptHash, Language>, // versions part of the tx determined through looking at added scripts
}

#[wasm_bindgen]
impl TransactionBuilder {
    /// This automatically selects and adds inputs from {inputs} consisting of just enough to cover
    /// the outputs that have already been added.
    /// This should be called after adding all certs/outputs/etc and will be an error otherwise.
    /// Adding a change output must be called after via TransactionBuilder::balance()
    /// inputs to cover the minimum fees. This does not, however, set the txbuilder's fee.
    ///
    /// change_address is required here in order to determine the min ada requirement precisely
    pub fn add_inputs_from(
        &mut self,
        inputs: &TransactionUnspentOutputs,
        change_address: &Address,
        weights: &[u32], // default: [200, 1000, 1500, 800, 800, 5000]
    ) -> Result<(), JsError> {
        let coins_per_utxo_byte = self.config.coins_per_utxo_byte.clone();

        let input_total = self.get_total_input()?;
        let mut output_total = self
            .get_total_output()?
            .checked_add(&Value::new(&self.min_fee()?))?;

        let change_total = input_total.clamped_sub(&output_total);
        if change_total.multiasset().is_some() {
            let mut check_output = TransactionOutput::new(&change_address, &change_total);
            check_output.amount.coin = to_bignum(0);
            /* Adding extra min ada to mint value, which is just change right now, but needs to have a minimum amount of ADA when added to an output */
            let min_ada = min_ada_required(&check_output, &coins_per_utxo_byte)?;
            if min_ada >= change_total.coin {
                let change_to_add = min_ada.checked_sub(&change_total.coin)?;
                output_total = output_total
                    .checked_add(&Value::new(&change_total.coin.checked_add(&change_to_add)?))?;
            }
        }

        /*  Making sure input is not already part of the tx builder inputs
            The inputs that try to fill the output target amount
        */
        let available_inputs = &inputs
            .0
            .clone()
            .into_iter()
            .filter(|utxo| {
                self.inputs
                    .iter()
                    .all(|tx_builder_input| utxo.input != tx_builder_input.utxo.input)
            })
            .collect::<Vec<TransactionUnspentOutput>>();

        if available_inputs.len() <= 0 {
            return Ok(());
        }

        /* The remaining amount that needs to be filled with the available inputs */
        let output_target = output_total.clamped_sub(&input_total);
        // if output_target.is_zero() {
        //     return Ok(());
        // }

        use rand::Rng;
        use std::cmp;

        let get_asset = |value: &Value, asset: (&PolicyID, &AssetName)| -> BigNum {
            value
                .clone()
                .multiasset
                .unwrap_or(MultiAsset::new())
                .get(&asset.0)
                .unwrap_or(Assets::new())
                .get(&asset.1)
                .unwrap_or(to_bignum(0))
        };

        let get_flat_assets = |value: &Value| -> Vec<(PolicyID, AssetName, BigNum)> {
            let mut flat_assets = Vec::new();
            for (policy_id, assets) in value.clone().multiasset.unwrap_or(MultiAsset::new()).0 {
                for (asset_name, quantity) in assets.0 {
                    flat_assets.push((policy_id.clone(), asset_name.clone(), quantity.clone()));
                }
            }
            flat_assets
        };

        let pure_ada = |value: &Value| -> BigNum {
            match &value.multiasset {
                Some(_) => {
                    let check_output = TransactionOutput::new(&change_address, &value);

                    value
                        .coin
                        .checked_sub(
                            &min_ada_required(&check_output, &coins_per_utxo_byte).unwrap(),
                        )
                        .unwrap_or(to_bignum(0))
                }
                None => value.coin,
            }
        };

        let is_relevant_value =
            |value: &Value, relevant: (bool, Option<(&PolicyID, &AssetName)>)| -> bool {
                let (ada_relevant, asset) = relevant;
                let available_coin = if ada_relevant {
                    pure_ada(&value) > to_bignum(0)
                } else {
                    false
                };
                let assets_relevant = match asset {
                    Some((policy_id, asset_name)) => {
                        get_asset(&value, (&policy_id, &asset_name)) > to_bignum(0)
                    }
                    None => false,
                };
                available_coin || assets_relevant
            };

        let norm = |vector: &Vec<i128>| -> f64 {
            vector
                .iter()
                .fold(num_bigint::BigUint::from(0u64), |acc, coord| {
                    acc + num_bigint::BigInt::from(*coord)
                        .pow(2)
                        .to_biguint()
                        .unwrap()
                })
                .sqrt()
                .to_f64()
                .unwrap()
        };

        let sub_vectors = |vector1: &Vec<u64>, vector2: &Vec<u64>| -> Vec<i128> {
            vector1
                .iter()
                .zip(vector2.iter())
                .map(|(x, y)| *x as i128 - *y as i128)
                .collect()
        };

        let get_normalization = |vector1: &Vec<u64>, vector2: &Vec<u64>| -> f64 {
            (vector1
                .iter()
                .fold(num_bigint::BigUint::from(0_u64), |acc, x| {
                    acc + num_bigint::BigUint::from(*x).pow(2)
                })
                * vector2
                    .iter()
                    .fold(num_bigint::BigUint::from(0_u64), |acc, x| {
                        acc + num_bigint::BigUint::from(*x).pow(2)
                    }))
            .sqrt()
            .to_f64()
            .unwrap()
        };

        /*
            The cost function evalues each move in the improvement phase by penalizing bad actions:
            1. We try to get to an ideal ada amount (twice the target amount) => The further away the more penalized
            2. We try to get an ideal amount for all assets. We take the euclidean distance of two normalized vectors,
                where the dimensions represent the amount of assets and the coordinate the quantity of a specific asset.
                The closer the distance is to 0 the less penalized.
            3. We try to avoid assets in inputs if possible by penalizing each extra asset that was added.
            4. If the quantity for any asset (inculding ada) is less than the target quantity, apply a very big negative weight so that this move is definitely discarded.
            5. Whenever we interact with a plutus script, we increase the weights on avoiding assets, since assets are costy in plutus scripts.

        */
        let cost = |available: (usize, usize),
                    inputs: &Vec<TransactionUnspentOutput>,
                    target: &Value,
                    total: &Value,
                    is_plutus: bool|
         -> f64 {
            /*
               If the target coin is less than 2.5 ADA we try to add more than twice the amount in order to cover the max fees in worst case
            */
            let ideal = if target.coin > to_bignum(2500000) {
                from_bignum(&target.coin) * 2
            } else {
                cmp::max(from_bignum(&target.coin), 1000000) * 4
            };

            let input_value = inputs.iter().fold(Value::zero(), |acc, utxo| {
                acc.checked_add(&utxo.output.amount)
                    .unwrap_or(Value::zero())
            });

            let input_assets = get_flat_assets(&input_value);
            let target_assets = get_flat_assets(&target);

            let mut current_vector: Vec<u64> = Vec::new();
            let mut ideal_vector: Vec<u64> = Vec::new();

            for asset in target_assets.iter() {
                let current_asset_quantity = get_asset(&input_value, (&asset.0, &asset.1));

                if current_asset_quantity < asset.2 {
                    return 100000.0;
                }
                /* For performance reasons we only try to get to an ideal amount of assets when it's below a certain threshold */
                if target_assets.len() < 100 {
                    current_vector.push(from_bignum(&current_asset_quantity));
                    ideal_vector.push(from_bignum(&asset.2) * 2);
                }
            }

            let temp_total_input_coin = input_value.coin.checked_add(&input_total.coin).unwrap();

            if temp_total_input_coin < total.coin {
                return 1000000.0;
            }

            let current_ideal =
                (from_bignum(&pure_ada(&input_value)) as f64 - ideal as f64) / ideal as f64;

            let weight_ideal = if current_ideal > 0.0 {
                current_ideal * 0.0
            } else if inputs.len() > 100 {
                -current_ideal * weights[0] as f64
            } else {
                -current_ideal * weights[1] as f64
            };

            /* Normalize the asset length through the max possible asset length */
            let asset_len = if available.1 > 0 {
                input_assets.len() as f64 / available.1 as f64
            } else {
                0.0
            };

            let weight_assets = if is_plutus {
                /* Assets are expensive for Plutus scripts => penalize harder if more assets are in inputs */
                asset_len * weights[2] as f64
            } else {
                /* Penalize more assets a bit, but try to find the ideal quantity in order to avoid asset fractions over time. */

                let distance = norm(&sub_vectors(&current_vector, &ideal_vector));
                let normalization = get_normalization(&current_vector, &ideal_vector);
                let norm_distance = distance / normalization;

                asset_len * weights[3] as f64 + norm_distance * weights[4] as f64
            };

            /* If the UTxO set is getting quite large we start to take the UTxO count into consideration. */
            let weight_utxos = if inputs.len() > 100 && available.0 > 0 {
                (inputs.len() as f64 / available.0 as f64) * weights[5] as f64
            } else {
                0.0
            };

            weight_ideal + weight_assets + weight_utxos
        };

        let available_count = available_inputs.len();
        let available_value = available_inputs.iter().fold(Value::zero(), |acc, utxo| {
            acc.checked_add(&utxo.output.amount)
                .unwrap_or(Value::zero())
        });
        let available_assets_len = get_flat_assets(&available_value).len();

        let mut current_value = Value::zero();
        let mut inputs = available_inputs.clone();
        let mut current_inputs: Vec<TransactionUnspentOutput> = Vec::new();

        /* Add enough assets to inputs */
        for (policy_id, assets) in output_target
            .multiasset
            .clone()
            .unwrap_or(MultiAsset::new())
            .0
        {
            for (asset_name, _) in assets.0 {
                let mut relevant_inputs = inputs
                    .clone()
                    .into_iter()
                    .filter(|input| {
                        is_relevant_value(
                            &input.output.amount,
                            (false, Some((&policy_id, &asset_name))),
                        )
                    })
                    .collect::<Vec<TransactionUnspentOutput>>();

                while get_asset(&current_value, (&policy_id, &asset_name))
                    < get_asset(&output_target, (&policy_id, &asset_name))
                {
                    if relevant_inputs.len() <= 0 {
                        return Err(JsError::from_str("InputsExhaustedError"));
                    }
                    let index = rand::thread_rng().gen_range(0..relevant_inputs.len());
                    let utxo = relevant_inputs[index].clone();
                    current_value = current_value.checked_add(&utxo.output.amount)?;
                    current_inputs.push(utxo.clone());

                    output_total = output_total.checked_add(&Value::new(&self.fee_for_input(
                        &utxo.output.address,
                        &utxo.input,
                        &utxo.output.amount,
                    )?))?;

                    let index_inputs = inputs
                        .iter()
                        .position(|utxo_| utxo_.input == utxo.input)
                        .unwrap();
                    inputs.swap_remove(index_inputs);
                    relevant_inputs.swap_remove(index);
                }
            }
        }

        /* Add enough ADA to inputs */
        let mut relevant_inputs = inputs.clone();
        while pure_ada(&current_value) < pure_ada(&output_target)
            || input_total.checked_add(&current_value)?.coin < output_total.coin
        {
            if relevant_inputs.len() <= 0 {
                return Err(JsError::from_str("InputsExhaustedError"));
            }
            let index = rand::thread_rng().gen_range(0..relevant_inputs.len());
            let utxo = relevant_inputs[index].clone();
            current_value = current_value.checked_add(&utxo.output.amount)?;
            current_inputs.push(utxo.clone());

            output_total = output_total.checked_add(&Value::new(&self.fee_for_input(
                &utxo.output.address,
                &utxo.input,
                &utxo.output.amount,
            )?))?;

            let index_inputs = inputs
                .iter()
                .position(|utxo_| utxo_.input == utxo.input)
                .unwrap();
            inputs.swap_remove(index_inputs);
            relevant_inputs.swap_remove(index);
        }

        /* Improvement Phase */
        let iterations = cmp::max(current_inputs.len(), 100);

        let is_plutus = self.collect_redeemers().is_some();
        let mut current_cost = cost(
            (available_count, available_assets_len),
            &current_inputs,
            &output_target,
            &output_total,
            is_plutus,
        );

        for _ in 0..iterations {
            if relevant_inputs.len() <= 0 {
                break;
            }

            /*
                0 = Replace
                1 = Append
                2 = Delete
            */
            for action in 0..=2 {
                if action == 0 {
                    if current_inputs.len() <= 0 {
                        continue;
                    }
                    let mut current_inputs_check = current_inputs.clone();
                    let index = rand::thread_rng().gen_range(0..relevant_inputs.len());
                    let index2 = rand::thread_rng().gen_range(0..current_inputs_check.len());

                    let utxo = relevant_inputs[index].clone();
                    current_inputs_check[index2] = utxo.clone();

                    /* Checks if replacement utxo is better than current one at this position */
                    let new_cost = cost(
                        (available_count, available_assets_len),
                        &current_inputs_check,
                        &output_target,
                        &output_total,
                        is_plutus,
                    );
                    if new_cost < current_cost {
                        let old_utxo = current_inputs[index2].clone();
                        current_value = current_value.checked_sub(&old_utxo.output.amount)?;
                        current_value = current_value.checked_add(&utxo.output.amount)?;
                        current_inputs = current_inputs_check;
                        relevant_inputs[index] = old_utxo.clone();
                        current_cost = new_cost;

                        break;
                    }
                } else if action == 1 {
                    let mut current_inputs_check = current_inputs.clone();
                    let index = rand::thread_rng().gen_range(0..relevant_inputs.len());
                    let utxo = relevant_inputs[index].clone();
                    current_inputs_check.push(utxo.clone());

                    /* Checks if appending a utxo improves coin selection */
                    let new_cost = cost(
                        (available_count, available_assets_len),
                        &current_inputs_check,
                        &output_target,
                        &output_total,
                        is_plutus,
                    );
                    if new_cost < current_cost {
                        current_value = current_value.checked_add(&utxo.output.amount)?;
                        current_inputs = current_inputs_check;

                        relevant_inputs.swap_remove(index);

                        output_total =
                            output_total.checked_add(&Value::new(&self.fee_for_input(
                                &utxo.output.address,
                                &utxo.input,
                                &utxo.output.amount,
                            )?))?;
                        current_cost = new_cost;

                        break;
                    }
                } else {
                    if current_inputs.len() <= 0 {
                        continue;
                    }
                    let mut current_inputs_check = current_inputs.clone();
                    let index = rand::thread_rng().gen_range(0..current_inputs_check.len());
                    let utxo = current_inputs_check[index].clone();
                    current_inputs_check.swap_remove(index);

                    /* Checks if deleting a utxo is better than current input set */
                    let new_cost = cost(
                        (available_count, available_assets_len),
                        &current_inputs_check,
                        &output_target,
                        &output_total,
                        is_plutus,
                    );
                    if new_cost < current_cost {
                        current_value = current_value.checked_sub(&utxo.output.amount)?;
                        current_inputs = current_inputs_check;

                        output_total =
                            output_total.checked_sub(&Value::new(&self.fee_for_input(
                                &utxo.output.address,
                                &utxo.input,
                                &utxo.output.amount,
                            )?))?;
                        current_cost = new_cost;

                        break;
                    }
                }
            }
        }

        for input in current_inputs.into_iter() {
            self.add_input(&input, None);
        }

        // We need at least one input in the transaction
        if self.inputs.len() <= 0 {
            let utxo = match available_inputs.get(0) {
                Some(utxo) => utxo,
                None => return Err(JsError::from_str(
                    "No UTxO found. At least one UTxO is required to make the transaction valid.",
                )),
            };
            self.add_input(&utxo, None);
        }

        Ok(())
    }

    /// We have to know what kind of inputs these are to know what kind of mock witnesses to create since
    /// 1) mock witnesses have different lengths depending on the type which changes the expecting fee
    /// 2) Witnesses are a set so we need to get rid of duplicates to avoid over-estimating the fee
    fn add_key_input(&mut self, hash: &Ed25519KeyHash, utxo: &TransactionUnspentOutput) {
        self.inputs.push(TxBuilderInput {
            utxo: utxo.clone(),
            redeemer: None,
        });
        self.input_types.vkeys.insert(hash.clone());
    }
    fn add_script_input(
        &mut self,
        hash: &ScriptHash,
        utxo: &TransactionUnspentOutput,
        script_witness: Option<ScriptWitness>,
    ) {
        if self
            .inputs
            .iter()
            .any(|tx_builder_input| utxo.input == tx_builder_input.utxo.input)
        {
            return;
        }

        if script_witness.is_none() {
            self.inputs.push(TxBuilderInput {
                utxo: utxo.clone(),
                redeemer: None,
            });
        } else {
            let sw = script_witness.unwrap();
            match &sw.kind() {
                ScriptWitnessKind::NativeWitness => {
                    let native_script = sw.as_native_witness().unwrap();
                    self.add_native_script(&native_script);

                    self.inputs.push(TxBuilderInput {
                        utxo: utxo.clone(),
                        redeemer: None,
                    });
                }
                ScriptWitnessKind::PlutusWitness => {
                    let plutus_witness = sw.as_plutus_witness().unwrap();
                    if plutus_witness.script().is_some() {
                        match plutus_witness.version() {
                            LanguageKind::PlutusV1 => {
                                self.add_plutus_script(&plutus_witness.script().unwrap());
                            }
                            LanguageKind::PlutusV2 => {
                                self.add_plutus_v2_script(&plutus_witness.script().unwrap());
                            }
                            LanguageKind::PlutusV3 => {
                                todo!("PlutusV3 not implemented yet.")
                            }
                        }
                    }

                    self.used_plutus_scripts.insert(hash.clone());

                    // we don't need plutus data here if datum is inline, only needed if used as hash
                    if let Some(d) = plutus_witness.plutus_data() {
                        self.add_plutus_data(&d);
                    }

                    self.inputs.push(TxBuilderInput {
                        utxo: utxo.clone(),
                        redeemer: Some(Redeemer::new(
                            &RedeemerTag::new_spend(),
                            &to_bignum(0), // will point to correct input when finalizing txBuilder
                            &plutus_witness.redeemer(),
                            &ExUnits::new(&to_bignum(0), &to_bignum(0)), // correct ex units calculated at the end
                        )),
                    });
                }
            }
        }
    }
    fn add_bootstrap_input(&mut self, hash: &ByronAddress, utxo: &TransactionUnspentOutput) {
        if self
            .inputs
            .iter()
            .any(|tx_builder_input| utxo.input == tx_builder_input.utxo.input)
        {
            return;
        }

        self.inputs.push(TxBuilderInput {
            utxo: utxo.clone(),
            redeemer: None,
        });
        self.input_types.bootstraps.insert(hash.to_bytes());
    }

    pub fn add_input(
        &mut self,
        utxo: &TransactionUnspentOutput,
        script_witness: Option<ScriptWitness>,
    ) {
        if self
            .inputs
            .iter()
            .any(|tx_builder_input| utxo.input == tx_builder_input.utxo.input)
        {
            return;
        }

        // get plutus version for script from scriptRef
        match &utxo.output.script_ref {
            Some(sr) => match sr.get().kind() {
                ScriptKind::PlutusScriptV1 => {
                    let script_hash = sr
                        .get()
                        .as_plutus_v1()
                        .unwrap()
                        .hash(ScriptHashNamespace::PlutusV1);
                    self.plutus_versions
                        .insert(script_hash, Language::new_plutus_v1());
                }
                ScriptKind::PlutusScriptV2 => {
                    let script_hash = sr
                        .get()
                        .as_plutus_v2()
                        .unwrap()
                        .hash(ScriptHashNamespace::PlutusV2);
                    self.plutus_versions
                        .insert(script_hash, Language::new_plutus_v2());
                }
                ScriptKind::PlutusScriptV3 => todo!("PlutusV3 not yet implemented."),
                ScriptKind::NativeScript => (),
            },
            None => (),
        }

        let address = &utxo.output.address;

        match &BaseAddress::from_address(address) {
            Some(addr) => {
                match &addr.payment_cred().to_keyhash() {
                    Some(hash) => return self.add_key_input(hash, &utxo),
                    None => (),
                }
                match &addr.payment_cred().to_scripthash() {
                    Some(hash) => return self.add_script_input(hash, &utxo, script_witness),
                    None => (),
                }
            }
            None => (),
        }
        match &EnterpriseAddress::from_address(address) {
            Some(addr) => {
                match &addr.payment_cred().to_keyhash() {
                    Some(hash) => return self.add_key_input(hash, &utxo),
                    None => (),
                }
                match &addr.payment_cred().to_scripthash() {
                    Some(hash) => return self.add_script_input(hash, &utxo, script_witness),
                    None => (),
                }
            }
            None => (),
        }
        match &PointerAddress::from_address(address) {
            Some(addr) => {
                match &addr.payment_cred().to_keyhash() {
                    Some(hash) => return self.add_key_input(hash, &utxo),
                    None => (),
                }
                match &addr.payment_cred().to_scripthash() {
                    Some(hash) => return self.add_script_input(hash, &utxo, script_witness),
                    None => (),
                }
            }
            None => (),
        }
        match &ByronAddress::from_address(address) {
            Some(addr) => {
                return self.add_bootstrap_input(addr, &utxo);
            }
            None => (),
        }
    }

    pub fn add_reference_input(&mut self, utxo: &TransactionUnspentOutput) {
        if self
            .reference_inputs
            .clone()
            .unwrap_or(TransactionUnspentOutputs::new())
            .0
            .iter()
            .any(|_utxo| _utxo.input == utxo.input)
        {
            return;
        }

        if self.reference_inputs.is_none() {
            let utxos = TransactionUnspentOutputs::new();
            self.reference_inputs = Some(utxos);
        }
        let mut utxos = self.reference_inputs.clone().unwrap();
        utxos.add(&utxo);
        self.reference_inputs = Some(utxos);

        // get plutus version for script from scriptRef
        match &utxo.output.script_ref {
            Some(sr) => match sr.get().kind() {
                ScriptKind::PlutusScriptV1 => {
                    let script_hash = sr
                        .get()
                        .as_plutus_v1()
                        .unwrap()
                        .hash(ScriptHashNamespace::PlutusV1);
                    self.plutus_versions
                        .insert(script_hash, Language::new_plutus_v1());
                }
                ScriptKind::PlutusScriptV2 => {
                    let script_hash = sr
                        .get()
                        .as_plutus_v2()
                        .unwrap()
                        .hash(ScriptHashNamespace::PlutusV2);
                    self.plutus_versions
                        .insert(script_hash, Language::new_plutus_v2());
                }
                ScriptKind::PlutusScriptV3 => todo!("PlutusV3 not yet implemented."),
                ScriptKind::NativeScript => (),
            },
            None => (),
        }
    }

    /// calculates how much the fee would increase if you added a given output
    pub fn fee_for_input(
        &self,
        address: &Address,
        input: &TransactionInput,
        amount: &Value,
    ) -> Result<Coin, JsError> {
        let mut self_copy = self.clone();

        // we need some value for these for it to be a a valid transaction
        // but since we're only calculating the difference between the fee of two transactions
        // it doesn't matter what these are set as, since it cancels out
        self_copy.set_fee(&to_bignum(0));

        let fee_before = min_fee(&mut self_copy)?;

        let utxo =
            TransactionUnspentOutput::new(&input, &TransactionOutput::new(&address, &amount));

        self_copy.add_input(&utxo, None);
        let fee_after = min_fee(&mut self_copy)?;
        fee_after.checked_sub(&fee_before)
    }

    /// Add explicit output via a TransactionOutput object
    pub fn add_output(&mut self, output: &TransactionOutput) -> Result<(), JsError> {
        let mut_output = &mut output.clone();

        let min_ada = min_ada_required(&output, &self.config.coins_per_utxo_byte)?;
        if mut_output.amount().coin() < min_ada {
            mut_output.amount.coin = min_ada;
        }
        let value_size = mut_output.amount.to_bytes().len();
        if value_size > self.config.max_value_size as usize {
            Err(JsError::from_str(&format!(
                "Maximum value size of {} exceeded. Found: {}",
                self.config.max_value_size, value_size
            )))
        } else {
            self.outputs.add(mut_output);
            Ok(())
        }
    }

    /// Add explicit change output via a TransactionOutput object
    fn add_change_output(&mut self, output: &TransactionOutput) -> Result<(), JsError> {
        let value_size = output.amount.to_bytes().len();
        if value_size > self.config.max_value_size as usize {
            return Err(JsError::from_str(&format!(
                "Maximum value size of {} exceeded. Found: {}",
                self.config.max_value_size, value_size
            )));
        }
        let min_ada = min_ada_required(&output, &self.config.coins_per_utxo_byte)?;
        if output.amount().coin() < min_ada {
            Err(JsError::from_str(&format!(
                "Value {} less than the minimum UTXO value {}",
                from_bignum(&output.amount().coin()),
                from_bignum(&min_ada)
            )))
        } else {
            self.change_outputs.add(output);
            Ok(())
        }
    }

    /// Add plutus scripts via a PlutusScripts object
    pub fn add_plutus_script(&mut self, plutus_script: &PlutusScript) {
        if self.plutus_scripts.is_none() {
            let scripts = PlutusScripts::new();
            self.plutus_scripts = Some(scripts);
        }

        let script_hash = plutus_script.hash(ScriptHashNamespace::PlutusV1);

        if !self.input_types.scripts.contains(&script_hash) {
            let mut scripts = self.plutus_scripts.clone().unwrap();
            scripts.add(&plutus_script);
            self.plutus_scripts = Some(scripts);

            self.plutus_versions
                .insert(script_hash.clone(), Language::new_plutus_v1());
            self.input_types.scripts.insert(script_hash);
        }
    }

    /// Add plutus v2 scripts via a PlutusScripts object
    pub fn add_plutus_v2_script(&mut self, plutus_script: &PlutusScript) {
        if self.plutus_v2_scripts.is_none() {
            let scripts = PlutusScripts::new();
            self.plutus_v2_scripts = Some(scripts);
        }

        let script_hash = plutus_script.hash(ScriptHashNamespace::PlutusV2);

        if !self.input_types.scripts.contains(&script_hash) {
            let mut scripts = self.plutus_v2_scripts.clone().unwrap();
            scripts.add(&plutus_script);
            self.plutus_v2_scripts = Some(scripts);

            self.plutus_versions
                .insert(script_hash.clone(), Language::new_plutus_v2());
            self.input_types.scripts.insert(script_hash);
        }
    }

    /// Add plutus data via a PlutusData object
    pub fn add_plutus_data(&mut self, plutus_data: &PlutusData) {
        if self.plutus_data.is_none() {
            self.plutus_data = Some(BTreeMap::new());
        }
        let mut data = self.plutus_data.clone().unwrap();
        data.insert(hash_plutus_data(&plutus_data), plutus_data.clone());
        self.plutus_data = Some(data);
    }

    /// Add native scripts via a NativeScripts object
    pub fn add_native_script(&mut self, native_script: &NativeScript) {
        if self.native_scripts.is_none() {
            let scripts = NativeScripts::new();
            self.native_scripts = Some(scripts);
        }

        let script_hash = native_script.hash(ScriptHashNamespace::NativeScript);

        if !self.input_types.scripts.contains(&script_hash) {
            let mut scripts = self.native_scripts.clone().unwrap();
            scripts.add(native_script);
            self.native_scripts = Some(scripts);
            self.input_types.scripts.insert(script_hash);
        }
    }

    /// Add certificate via a Certificates object
    pub fn add_certificate(
        &mut self,
        certificate: &Certificate,
        script_witness: Option<ScriptWitness>,
    ) {
        let redeemer = match &script_witness {
            Some(sw) => match sw.kind() {
                ScriptWitnessKind::NativeWitness => None,
                ScriptWitnessKind::PlutusWitness => {
                    let plutus_witness = sw.as_plutus_witness().unwrap();
                    Some(Redeemer::new(
                        &RedeemerTag::new_cert(),
                        &to_bignum(0), // will point to correct input when finalizing txBuilder
                        &plutus_witness.redeemer(),
                        &ExUnits::new(&to_bignum(0), &to_bignum(0)), // correct ex units calculated at the end
                    ))
                }
            },
            None => None,
        };

        let mut cert_array = self.certs.clone().unwrap_or(Vec::new());

        cert_array.push(TxBuilderCert {
            certificate: certificate.clone(),
            redeemer,
        });
        self.certs = Some(cert_array.clone());

        witness_keys_for_cert(self, certificate, script_witness);
    }

    /// calculates how much the fee would increase if you added a given output
    pub fn fee_for_output(&self, output: &TransactionOutput) -> Result<Coin, JsError> {
        let mut self_copy = self.clone();

        // we need some value for these for it to be a a valid transaction
        // but since we're only calculating the different between the fee of two transactions
        // it doesn't matter what these are set as, since it cancels out
        self_copy.set_fee(&to_bignum(0));

        let fee_before = min_fee(&mut self_copy)?;

        self_copy.add_output(&output)?;
        let fee_after = min_fee(&mut self_copy)?;
        fee_after.checked_sub(&fee_before)
    }

    fn set_fee(&mut self, fee: &Coin) {
        self.fee = Some(fee.clone())
    }

    pub fn set_ttl(&mut self, ttl: &Slot) {
        self.ttl = Some(ttl.clone())
    }

    pub fn set_validity_start_interval(&mut self, validity_start_interval: &Slot) {
        self.validity_start_interval = Some(validity_start_interval.clone())
    }

    pub fn add_withdrawal(
        &mut self,
        reward_address: &RewardAddress,
        coin: &Coin,
        script_witness: Option<ScriptWitness>,
    ) {
        let redeemer = match reward_address.payment_cred().kind() {
            StakeCredKind::Key => {
                let key = reward_address.payment_cred().to_keyhash().unwrap().clone();
                self.input_types.vkeys.insert(key);
                None
            }
            StakeCredKind::Script => {
                let hash = reward_address
                    .payment_cred()
                    .to_scripthash()
                    .unwrap()
                    .clone();
                match &script_witness {
                    Some(sw) => {
                        match sw.kind() {
                            ScriptWitnessKind::NativeWitness => {
                                let native_script = sw.as_native_witness().unwrap();
                                self.add_native_script(&native_script);
                                None
                            }
                            ScriptWitnessKind::PlutusWitness => {
                                let plutus_witness = sw.as_plutus_witness().unwrap();
                                if plutus_witness.script().is_some() {
                                    match plutus_witness.version() {
                                        LanguageKind::PlutusV1 => {
                                            self.add_plutus_script(
                                                &plutus_witness.script().unwrap(),
                                            );
                                        }
                                        LanguageKind::PlutusV2 => {
                                            self.add_plutus_v2_script(
                                                &plutus_witness.script().unwrap(),
                                            );
                                        }
                                        LanguageKind::PlutusV3 => {
                                            todo!("PlutusV3 not implemented yet.")
                                        }
                                    }
                                }
                                self.used_plutus_scripts.insert(hash.clone());

                                Some(Redeemer::new(
                                    &RedeemerTag::new_reward(),
                                    &to_bignum(0), // will point to correct input when finalizing txBuilder
                                    &plutus_witness.redeemer(),
                                    &ExUnits::new(&to_bignum(0), &to_bignum(0)), // correct ex units calculated at the end
                                ))
                            }
                        }
                    }
                    None => None,
                }
            }
        };

        let mut withdrawal_array = self.withdrawals.clone().unwrap_or(Vec::new());

        withdrawal_array.push(TxBuilderWithdrawal {
            reward_address: reward_address.clone(),
            coin: coin.clone(),
            redeemer,
        });
        self.withdrawals = Some(withdrawal_array.clone());
    }

    pub fn auxiliary_data(&self) -> Option<AuxiliaryData> {
        self.auxiliary_data.clone()
    }

    /// Set explicit auxiliary data via an AuxiliaryData object
    /// It might contain some metadata plus native or Plutus scripts
    pub fn set_auxiliary_data(&mut self, auxiliary_data: &AuxiliaryData) {
        self.auxiliary_data = Some(auxiliary_data.clone())
    }

    /// Set metadata using a GeneralTransactionMetadata object
    /// It will be set to the existing or new auxiliary data in this builder
    pub fn set_metadata(&mut self, metadata: &GeneralTransactionMetadata) {
        let mut aux = self
            .auxiliary_data
            .as_ref()
            .cloned()
            .unwrap_or(AuxiliaryData::new());
        aux.set_metadata(metadata);
        self.set_auxiliary_data(&aux);
    }

    /// Add a single metadatum using TransactionMetadatumLabel and TransactionMetadatum objects
    /// It will be securely added to existing or new metadata in this builder
    pub fn add_metadatum(&mut self, key: &TransactionMetadatumLabel, val: &TransactionMetadatum) {
        let mut metadata = self
            .auxiliary_data
            .as_ref()
            .map(|aux| aux.metadata().as_ref().cloned())
            .unwrap_or(None)
            .unwrap_or(GeneralTransactionMetadata::new());
        metadata.insert(key, val);

        self.set_metadata(&metadata);
    }

    /// Add a single JSON metadatum using a TransactionMetadatumLabel and a String
    /// It will be securely added to existing or new metadata in this builder
    pub fn add_json_metadatum(
        &mut self,
        key: &TransactionMetadatumLabel,
        val: String,
    ) -> Result<(), JsError> {
        self.add_json_metadatum_with_schema(key, val, MetadataJsonSchema::NoConversions)
    }

    /// Add a single JSON metadatum using a TransactionMetadatumLabel, a String, and a MetadataJsonSchema object
    /// It will be securely added to existing or new metadata in this builder
    pub fn add_json_metadatum_with_schema(
        &mut self,
        key: &TransactionMetadatumLabel,
        val: String,
        schema: MetadataJsonSchema,
    ) -> Result<(), JsError> {
        let metadatum = encode_json_str_to_metadatum(val, schema)?;
        self.add_metadatum(key, &metadatum);
        Ok(())
    }

    /// Returns a copy of the current mint state in the builder
    pub fn mint(&self) -> Option<Mint> {
        self.mint_array_to_mint()
    }

    pub fn certificates(&self) -> Option<Certificates> {
        self.cert_array_to_certificates()
    }

    pub fn withdrawals(&self) -> Option<Withdrawals> {
        self.withdrawals_array_to_withdrawals()
    }

    /// Returns a copy of the current witness native scripts in the builder
    pub fn native_scripts(&self) -> Option<NativeScripts> {
        self.native_scripts.clone()
    }

    /// Add a mint entry to this builder using a PolicyID and MintAssets object
    /// It will be securely added to existing or new Mint in this builder
    /// It will securely add assets to an existing PolicyID
    /// But it will replace/overwrite any existing mint assets with the same PolicyID
    /// first redeemer applied to a PolicyID is taken for all further assets added to the same PolicyID
    pub fn add_mint(
        &mut self,
        policy_id: &PolicyID,
        mint_assets: &MintAssets,
        script_witness: Option<ScriptWitness>,
    ) {
        let redeemer = match &script_witness {
            Some(sw) => match sw.kind() {
                ScriptWitnessKind::NativeWitness => {
                    let native_script = sw.as_native_witness().unwrap();
                    self.add_native_script(&native_script);
                    None
                }
                ScriptWitnessKind::PlutusWitness => {
                    let plutus_witness = sw.as_plutus_witness().unwrap();
                    if plutus_witness.script().is_some() {
                        match plutus_witness.version() {
                            LanguageKind::PlutusV1 => {
                                self.add_plutus_script(&plutus_witness.script().unwrap());
                            }
                            LanguageKind::PlutusV2 => {
                                self.add_plutus_v2_script(&plutus_witness.script().unwrap());
                            }
                            LanguageKind::PlutusV3 => {
                                todo!("PlutusV3 not implemented yet.")
                            }
                        }
                    }
                    self.used_plutus_scripts.insert(policy_id.clone());

                    Some(Redeemer::new(
                        &RedeemerTag::new_mint(),
                        &to_bignum(0), // will point to correct input when finalizing txBuilder
                        &plutus_witness.redeemer(),
                        &ExUnits::new(&to_bignum(0), &to_bignum(0)), // correct ex units calculated at the end
                    ))
                }
            },
            None => None,
        };

        let mut mint_array = self.mint.clone().unwrap_or(Vec::new());

        let index = mint_array
            .iter()
            .position(|m| m.policy_id == policy_id.clone());

        match index {
            Some(i) => {
                for (asset_name, quantity) in &mint_assets.0 {
                    mint_array[i]
                        .mint_assets
                        .0
                        .entry(asset_name.clone())
                        .and_modify(|q| *q = Int(q.0 + quantity.0))
                        .or_insert(quantity.clone());
                }
            }
            None => {
                mint_array.push(TxBuilderMint {
                    policy_id: policy_id.clone(),
                    mint_assets: mint_assets.clone(),
                    redeemer,
                });
            }
        }

        self.mint = Some(mint_array);
    }

    pub fn new(cfg: &TransactionBuilderConfig) -> Self {
        Self {
            config: cfg.clone(),
            inputs: Vec::new(),
            outputs: TransactionOutputs::new(),
            change_outputs: TransactionOutputs::new(),
            fee: None,
            ttl: None,
            certs: None,
            withdrawals: None,
            auxiliary_data: None,
            input_types: MockWitnessSet {
                vkeys: BTreeSet::new(),
                scripts: BTreeSet::new(),
                bootstraps: BTreeSet::new(),
            },
            validity_start_interval: None,
            mint: None,
            native_scripts: None,
            script_data_hash: None,
            collateral: None,
            required_signers: None,
            network_id: None,
            plutus_scripts: None,
            plutus_data: None,
            redeemers: None,
            collateral_return: None,
            total_collateral: None,
            reference_inputs: None,
            plutus_v2_scripts: None,
            used_plutus_scripts: HashSet::new(),
            plutus_versions: HashMap::new(),
        }
    }

    pub fn script_data_hash(&self) -> Option<ScriptDataHash> {
        self.script_data_hash.clone()
    }

    pub fn add_collateral(&mut self, utxo: &TransactionUnspentOutput) -> Result<(), JsError> {
        if self.collateral.is_none() {
            self.collateral = Some(Vec::new());
        }

        let mut inputs = self.collateral.clone().unwrap();
        inputs.push(TxBuilderInput {
            utxo: utxo.clone(),
            redeemer: None,
        });
        self.collateral = Some(inputs.clone());

        let address = &utxo.output.address;

        match &BaseAddress::from_address(address) {
            Some(addr) => {
                match &addr.payment_cred().to_keyhash() {
                    Some(hash) => {
                        self.input_types.vkeys.insert(hash.clone());
                        return Ok(());
                    }
                    None => (),
                }
                match &addr.payment_cred().to_scripthash() {
                    Some(_) => {
                        return Err(JsError::from_str("Only Vkey inputs allowed as collateral."))
                    }
                    None => (),
                }
            }
            None => (),
        }
        match &EnterpriseAddress::from_address(address) {
            Some(addr) => {
                match &addr.payment_cred().to_keyhash() {
                    Some(hash) => {
                        self.input_types.vkeys.insert(hash.clone());
                        return Ok(());
                    }
                    None => (),
                }
                match &addr.payment_cred().to_scripthash() {
                    Some(_) => {
                        return Err(JsError::from_str("Only Vkey inputs allowed as collateral."))
                    }
                    None => (),
                }
            }
            None => (),
        }
        match &PointerAddress::from_address(address) {
            Some(addr) => {
                match &addr.payment_cred().to_keyhash() {
                    Some(hash) => {
                        self.input_types.vkeys.insert(hash.clone());
                        return Ok(());
                    }
                    None => (),
                }
                match &addr.payment_cred().to_scripthash() {
                    Some(_) => {
                        return Err(JsError::from_str("Only Vkey inputs allowed as collateral."))
                    }
                    None => (),
                }
            }
            None => (),
        }
        match &ByronAddress::from_address(address) {
            Some(addr) => {
                self.input_types.bootstraps.insert(addr.to_bytes());
                return Ok(());
            }
            None => (),
        }
        Ok(())
    }

    pub fn get_collateral(&self) -> Option<TransactionInputs> {
        if let None = self.collateral {
            return None;
        }
        let mut inputs = TransactionInputs::new();
        for tx_builder_input in self.collateral.clone().unwrap() {
            inputs.add(&tx_builder_input.utxo.input);
        }
        Some(inputs)
    }

    pub fn add_required_signer(&mut self, required_signer: &Ed25519KeyHash) {
        if self.required_signers.is_none() {
            self.required_signers = Some(Ed25519KeyHashes::new());
        }

        let mut required_signers = self.required_signers.clone().unwrap();
        if !required_signers.0.contains(required_signer) {
            required_signers.add(&required_signer.clone());
            self.required_signers = Some(required_signers);
        }
    }

    pub fn required_signers(&self) -> Option<RequiredSigners> {
        self.required_signers.clone()
    }

    pub fn set_network_id(&mut self, network_id: NetworkId) {
        self.network_id = Some(network_id)
    }

    pub fn network_id(&self) -> Option<NetworkId> {
        self.network_id.clone()
    }

    pub fn redeemers(&self) -> Option<Redeemers> {
        self.collect_redeemers().clone()
    }

    /// does not include refunds or withdrawals
    pub fn get_explicit_input(&self) -> Result<Value, JsError> {
        self.inputs
            .iter()
            .try_fold(Value::zero(), |acc, ref tx_builder_input| {
                acc.checked_add(&tx_builder_input.utxo.output.amount)
            })
    }

    /// withdrawals and refunds
    pub fn get_implicit_input(&self) -> Result<Value, JsError> {
        internal_get_implicit_input(
            &self.withdrawals(),
            &self.certificates(),
            &self.config.pool_deposit,
            &self.config.key_deposit,
        )
    }

    fn mint_array_to_mint(&self) -> Option<Mint> {
        match &self.mint {
            Some(tx_builder_mint) => {
                let mut collected_mint = Mint::new();

                for m in tx_builder_mint.iter() {
                    collected_mint.insert(&m.policy_id, &m.mint_assets);
                }
                Some(collected_mint)
            }
            None => None,
        }
    }

    fn cert_array_to_certificates(&self) -> Option<Certificates> {
        match &self.certs {
            Some(tx_builder_certs) => {
                let mut collected_certs = Certificates::new();

                for cert in tx_builder_certs.iter() {
                    collected_certs.add(&cert.certificate);
                }
                Some(collected_certs)
            }
            None => None,
        }
    }

    fn withdrawals_array_to_withdrawals(&self) -> Option<Withdrawals> {
        match &self.withdrawals {
            Some(tx_builder_withdrawals) => {
                let mut collected_withdrawals = Withdrawals::new();

                for m in tx_builder_withdrawals.iter() {
                    collected_withdrawals.insert(&m.reward_address, &m.coin);
                }
                Some(collected_withdrawals)
            }
            None => None,
        }
    }

    /// Returns mint as tuple of (mint_value, burn_value) or two zero values
    fn get_mint_as_values(&self) -> (Value, Value) {
        let mint = self.mint_array_to_mint();
        mint.as_ref()
            .map(|m| {
                (
                    Value::new_from_assets(&m.as_positive_multiasset()),
                    Value::new_from_assets(&m.as_negative_multiasset()),
                )
            })
            .unwrap_or((Value::zero(), Value::zero()))
    }

    /// Return explicit input plus implicit input plus mint
    pub fn get_total_input(&self) -> Result<Value, JsError> {
        let (mint_value, _) = self.get_mint_as_values();
        self.get_explicit_input()?
            .checked_add(&self.get_implicit_input()?)?
            .checked_add(&mint_value)
    }

    /// Return explicit output plus implicit output plus burn (does not consider fee directly)
    pub fn get_total_output(&self) -> Result<Value, JsError> {
        let (_, burn_value) = self.get_mint_as_values();
        self.get_explicit_output()?
            .checked_add(&Value::new(&self.get_deposit()?))?
            .checked_add(&burn_value)
    }

    /// does not include fee
    pub fn get_explicit_output(&self) -> Result<Value, JsError> {
        self.outputs
            .0
            .iter()
            .chain(self.change_outputs.0.iter())
            .try_fold(Value::new(&to_bignum(0)), |acc, ref output| {
                acc.checked_add(&output.amount())
            })
    }

    pub fn get_deposit(&self) -> Result<Coin, JsError> {
        internal_get_deposit(
            &self.certificates(),
            &self.config.pool_deposit,
            &self.config.key_deposit,
        )
    }

    pub fn get_fee_if_set(&self) -> Option<Coin> {
        self.fee.clone()
    }

    fn get_lexical_order_inputs(&self) -> Vec<TransactionInput> {
        let mut inputs = self
            .inputs
            .iter()
            .map(|TxBuilderInput { utxo, redeemer: _ }| utxo.input.clone())
            .collect::<Vec<TransactionInput>>();
        inputs.sort();
        inputs
    }

    fn get_lexical_order_policy_ids(&self) -> Vec<PolicyID> {
        let mut policy_ids = self
            .mint
            .as_ref()
            .unwrap_or(Vec::new().as_ref())
            .iter()
            .map(
                |TxBuilderMint {
                     policy_id,
                     mint_assets: _,
                     redeemer: _,
                 }| policy_id.clone(),
            )
            .collect::<Vec<ScriptHash>>();
        policy_ids.sort();
        policy_ids
    }

    fn get_tx_order_certificates(&self) -> Vec<Certificate> {
        let certificates = self
            .certs
            .as_ref()
            .unwrap_or(Vec::new().as_ref())
            .iter()
            .map(
                |TxBuilderCert {
                     certificate,
                     redeemer: _,
                 }| certificate.clone(),
            )
            .collect::<Vec<Certificate>>();
        certificates
    }

    fn get_lexical_order_withdrawals(&self) -> Vec<RewardAddress> {
        let mut withdrawals = self
            .withdrawals
            .as_ref()
            .unwrap_or(Vec::new().as_ref())
            .iter()
            .map(
                |TxBuilderWithdrawal {
                     reward_address,
                     coin: _,
                     redeemer: _,
                 }| reward_address.clone(),
            )
            .collect::<Vec<RewardAddress>>();
        withdrawals.sort();
        withdrawals
    }

    /// Warning: this function will mutate the /fee/ field
    /// Make sure to call this function last after setting all other tx-body properties
    /// Editing inputs, outputs, mint, etc. after change been calculated
    /// might cause a mismatch in calculated fee versus the required fee
    pub fn balance(
        &mut self,
        change_address: &Address,
        datum: Option<Datum>,
    ) -> Result<(), JsError> {
        let mut fee = self.min_fee()?;

        let input_total = self.get_total_input()?;
        let output_total = self.get_total_output()?;

        match &input_total.partial_cmp(&output_total.checked_add(&Value::new(&fee))?) {
            Some(Ordering::Equal) => {
                // recall: min_fee assumed the fee was the maximum possible so we definitely have enough input to cover whatever fee it ends up being
                self.set_fee(&input_total.checked_sub(&output_total)?.coin());
                Ok(())
            }
            Some(Ordering::Less) => Err(JsError::from_str("Insufficient input in transaction")),
            Some(Ordering::Greater) => {
                let mut change_total = input_total.checked_sub(&output_total)?;

                /* We set change_total.coin here as amount to make sure we can don't exceed the max val size by a few bytes */
                let mut change_output = TransactionOutput {
                    format: if datum.is_some() && datum.as_ref().unwrap().kind() == DatumKind::Data
                    {
                        1
                    } else {
                        0
                    },
                    address: change_address.clone(),
                    amount: Value::new(&change_total.coin).clone(),
                    datum: datum.clone(),
                    script_ref: None,
                };

                /* Loop through all assets and fill up outputs until max val size is reached */
                for (policy_id, assets) in change_total
                    .clone()
                    .multiasset
                    .unwrap_or(MultiAsset::new())
                    .0
                {
                    for (asset_name, quantity) in assets.0 {
                        let mut ma = MultiAsset::new();
                        let mut assets = Assets::new();
                        assets.insert(&asset_name, &quantity);
                        ma.insert(&policy_id, &assets);
                        let check_amount = change_output
                            .amount
                            .checked_add(&Value::new_from_assets(&ma))?;

                        if check_amount.to_bytes().len() > self.config.max_value_size as usize {
                            change_output.amount.coin = to_bignum(0);
                            change_output.amount.coin =
                                min_ada_required(&change_output, &self.config.coins_per_utxo_byte)?;

                            let fee_for_change = self.fee_for_output(&change_output)?;
                            fee = fee.checked_add(&fee_for_change)?;
                            self.add_change_output(&change_output)?;

                            if let Ok(new_change) = change_total.checked_sub(&change_output.amount)
                            {
                                change_total = new_change;
                            } else {
                                return Err(JsError::from_str(
                                    "Not enough ADA leftover to cover minADA",
                                ));
                            }
                            // reset
                            change_output.amount = Value::new_from_assets(&ma);
                        } else {
                            change_output.amount = check_amount;
                        }
                    }
                }

                let try_two_outputs = |tx_builder: &mut TransactionBuilder,
                                       change_total: &Value,
                                       change_output: &TransactionOutput,
                                       fee: &BigNum|
                 -> Result<(), JsError> {
                    if change_total.multiasset.is_none() {
                        return Err(JsError::from_str("No multiassets to make split necessary"));
                    }
                    let mut fee_check = fee.clone();
                    let mut change_total_check = change_total.clone();
                    let mut change_output_0 = change_output.clone();

                    change_output_0.amount = change_total_check.clone();
                    change_output_0.amount.coin = to_bignum(0);
                    let change_value_0 = Value::new(&min_ada_required(
                        &change_output_0,
                        &tx_builder.config.coins_per_utxo_byte,
                    )?);
                    change_output_0.amount.coin = change_value_0.coin;
                    change_total_check = change_total_check.checked_sub(&change_output_0.amount)?;

                    fee_check =
                        fee_check.checked_add(&tx_builder.fee_for_output(&change_output_0)?)?;

                    let mut change_output_1 = change_output.clone();
                    change_output_1.amount = change_total_check.clone();

                    fee_check =
                        fee_check.checked_add(&tx_builder.fee_for_output(&change_output_1)?)?;

                    change_output_1.amount.coin =
                        change_output_1.amount.coin.checked_sub(&fee_check)?;

                    if change_output_1.amount.coin
                        < min_ada_required(
                            &change_output_1,
                            &tx_builder.config.coins_per_utxo_byte,
                        )?
                    {
                        return Err(JsError::from_str("Not enough ADA leftover to cover minADA"));
                    };

                    tx_builder.add_change_output(&change_output_0)?;
                    tx_builder.add_change_output(&change_output_1)?;
                    tx_builder.set_fee(&fee_check);

                    Ok(())
                };

                let try_one_output = |tx_builder: &mut TransactionBuilder,
                                      change_total: &Value,
                                      change_output: &TransactionOutput,
                                      fee: &BigNum|
                 -> Result<(), JsError> {
                    let mut fee_check = fee.clone();
                    let change_total_check = change_total.clone();
                    let mut change_output_0 = change_output.clone();
                    change_output_0.amount = change_total_check.clone();

                    fee_check =
                        fee_check.checked_add(&tx_builder.fee_for_output(&change_output_0)?)?;

                    change_output_0.amount.coin =
                        change_output_0.amount.coin.checked_sub(&fee_check)?;

                    if change_output_0.amount.coin
                        < min_ada_required(
                            &change_output_0,
                            &tx_builder.config.coins_per_utxo_byte,
                        )?
                    {
                        return Err(JsError::from_str("Not enough ADA leftover to cover minADA"));
                    };

                    tx_builder.add_change_output(&change_output_0)?;
                    tx_builder.set_fee(&fee_check);

                    Ok(())
                };

                let try_just_fee = |tx_builder: &mut TransactionBuilder,
                                    change_total: &Value,
                                    fee: &BigNum|
                 -> Result<(), JsError> {
                    if change_total.multiasset.is_some()
                        && change_total.clone().multiasset.unwrap().len() > 0
                    {
                        return Err(JsError::from_str("Not enough ADA leftover to cover minADA"));
                    }
                    if change_total.coin < *fee {
                        return Err(JsError::from_str("Not enough ADA leftover to cover fees"));
                    }
                    tx_builder.set_fee(&change_total.coin);
                    return Ok(());
                };

                try_two_outputs(self, &change_total, &change_output, &fee).or_else(|_| {
                    try_one_output(self, &change_total, &change_output, &fee)
                        .or_else(|_| try_just_fee(self, &change_total, &fee))
                })
            }
            None => Err(JsError::from_str(
                "Missing input or output for some native asset",
            )),
        }
    }

    fn build_and_size(&mut self) -> Result<(TransactionBody, usize), JsError> {
        let fee = self.fee.unwrap_or(to_bignum(0));
        // .ok_or_else(|| JsError::from_str("Fee not specified"))?;

        let mut total_outputs = self.outputs.clone();
        for change_output in &self.change_outputs.0 {
            total_outputs.add(&change_output);
        }

        let built = TransactionBody {
            original_bytes: None,

            inputs: TransactionInputs(
                self.inputs
                    .iter()
                    .map(|ref tx_builder_input| tx_builder_input.utxo.input.clone())
                    .collect(),
            ),
            outputs: total_outputs,
            fee: fee,
            ttl: self.ttl,
            certs: self.certificates(),
            withdrawals: self.withdrawals(),
            update: None,
            auxiliary_data_hash: match &self.auxiliary_data {
                None => None,
                Some(x) => Some(utils::hash_auxiliary_data(x)),
            },
            validity_start_interval: self.validity_start_interval,
            mint: self.mint_array_to_mint(),
            script_data_hash: match self.redeemers.is_some() || self.plutus_data.is_some() {
                false => None,
                true => {
                    /* Get the used plutus versions from script hashes */
                    let mut used_versions: HashSet<Language> = HashSet::new();
                    for script_hash in &self.used_plutus_scripts {
                        if let Some(v) = self.plutus_versions.get(&script_hash) {
                            used_versions.insert(v.clone());
                        }
                    }

                    let mut required_costmdls = Costmdls::new();
                    for plutus_version in &used_versions {
                        required_costmdls.insert(
                            &plutus_version,
                            &self
                                .config
                                .costmdls
                                .get(&plutus_version)
                                .ok_or_else(|| {
                                    JsError::from_str("Cost model missing for plutus version")
                                })
                                .unwrap(),
                        );
                    }

                    Some(utils::hash_script_data(
                        &self.redeemers.clone().unwrap_or(Redeemers::new()),
                        &required_costmdls,
                        self.collect_plutus_data(),
                    ))
                }
            },
            collateral: self.get_collateral().clone(),
            required_signers: self.required_signers.clone(),
            network_id: self.network_id.clone(),
            collateral_return: self.collateral_return.clone(),
            total_collateral: self.total_collateral.clone(),
            reference_inputs: match &self.reference_inputs {
                Some(utxos) => Some(TransactionInputs(
                    utxos.0.iter().map(|utxo| utxo.input.clone()).collect(),
                )),
                None => None,
            },
            // TODO: Conway
            voting_procedures: None,
            proposal_procedures: None,
        };
        // we must build a tx with fake data (of correct size) to check the final Transaction size
        let full_tx = fake_full_tx(self, built)?;
        let full_tx_size = full_tx.to_bytes().len();
        return Ok((full_tx.body, full_tx_size));
    }

    /// Returns the TransactionBody.
    pub fn to_bytes(&mut self) -> Result<Vec<u8>, JsError> {
        match self.build_and_size() {
            Ok((body, _)) => Ok(body.to_bytes()),
            Err(err) => Err(err),
        }
    }

    pub fn full_size(&mut self) -> Result<usize, JsError> {
        return self.build_and_size().map(|r| r.1);
    }

    pub fn output_sizes(&self) -> Vec<usize> {
        return self
            .outputs
            .0
            .iter()
            .chain(self.change_outputs.0.iter())
            .map(|o| o.to_bytes().len())
            .collect();
    }

    pub fn outputs(&self) -> TransactionOutputs {
        let mut total_outputs = self.outputs.clone();
        for change_output in &self.change_outputs.0 {
            total_outputs.add(&change_output);
        }
        total_outputs
    }

    /// Returns object the body of the new transaction
    /// Auxiliary data itself is not included
    /// You can use `get_auxiliary_data` or `build_tx`
    fn build(&mut self) -> Result<TransactionBody, JsError> {
        let (body, full_tx_size) = self.build_and_size()?;
        if full_tx_size > self.config.max_tx_size as usize {
            Err(JsError::from_str(&format!(
                "Maximum transaction size of {} exceeded. Found: {}",
                self.config.max_tx_size, full_tx_size
            )))
        } else {
            Ok(body)
        }
    }

    fn collect_plutus_data(&self) -> Option<PlutusList> {
        match &self.plutus_data {
            Some(plutus_data) => Some(PlutusList {
                elems: plutus_data.values().cloned().collect(),
                definite_encoding: None,
            })
            .clone(),
            None => None,
        }
    }

    fn collect_redeemers(&self) -> Option<Redeemers> {
        let mut collected_redeemers = BTreeMap::new();

        let lexical_order_inputs = self.get_lexical_order_inputs();
        for input in &self.inputs {
            if let Some(redeemer) = &input.redeemer {
                let index = to_bignum(
                    lexical_order_inputs
                        .iter()
                        .position(|i| *i == input.utxo.input)
                        .unwrap() as u64,
                );
                let new_redeemer = Redeemer::new(
                    &redeemer.tag(),
                    &index,
                    &redeemer.data(),
                    &redeemer.ex_units(),
                );
                collected_redeemers.insert(
                    RedeemerWitnessKey::new(&new_redeemer.tag(), &new_redeemer.index()),
                    new_redeemer.clone(),
                );
            }
        }

        let lexical_order_policy_id = self.get_lexical_order_policy_ids();
        for m in self.mint.as_ref().unwrap_or(&Vec::new()) {
            if let Some(redeemer) = &m.redeemer {
                let index = to_bignum(
                    lexical_order_policy_id
                        .iter()
                        .position(|policy_id| *policy_id == m.policy_id)
                        .unwrap() as u64,
                );
                let new_redeemer = Redeemer::new(
                    &redeemer.tag(),
                    &index,
                    &redeemer.data(),
                    &redeemer.ex_units(),
                );
                collected_redeemers.insert(
                    RedeemerWitnessKey::new(&new_redeemer.tag(), &new_redeemer.index()),
                    new_redeemer,
                );
            }
        }

        let tx_order_certificates = self.get_tx_order_certificates();
        for cert in self.certs.as_ref().unwrap_or(&Vec::new()) {
            if let Some(redeemer) = &cert.redeemer {
                let index = to_bignum(
                    tx_order_certificates
                        .iter()
                        .position(|c| *c == cert.certificate)
                        .unwrap() as u64,
                );
                let new_redeemer = Redeemer::new(
                    &redeemer.tag(),
                    &index,
                    &redeemer.data(),
                    &redeemer.ex_units(),
                );
                collected_redeemers.insert(
                    RedeemerWitnessKey::new(&new_redeemer.tag(), &new_redeemer.index()),
                    new_redeemer,
                );
            }
        }

        let lexical_order_withdrawals = self.get_lexical_order_withdrawals();
        for w in self.withdrawals.as_ref().unwrap_or(&Vec::new()) {
            if let Some(redeemer) = &w.redeemer {
                let index = to_bignum(
                    lexical_order_withdrawals
                        .iter()
                        .position(|reward_address| *reward_address == w.reward_address)
                        .unwrap() as u64,
                );
                let new_redeemer = Redeemer::new(
                    &redeemer.tag(),
                    &index,
                    &redeemer.data(),
                    &redeemer.ex_units(),
                );
                collected_redeemers.insert(
                    RedeemerWitnessKey::new(&new_redeemer.tag(), &new_redeemer.index()),
                    new_redeemer,
                );
            }
        }

        if collected_redeemers.len() > 0 {
            Some(Redeemers(collected_redeemers.values().cloned().collect()))
        } else {
            None
        }
    }

    // returns the new fee
    fn update_fee_and_balance(&mut self) -> Result<BigNum, JsError> {
        let mut old_fee = self.fee.clone().unwrap();
        let mut new_fee = min_fee(self)?;

        if old_fee >= new_fee {
            return Ok(old_fee);
        }
        // we run in a loop to make 100% sure that adding to fee field and subtracting from output does not change bytes length
        // if it does we loop again and adjust accordingly
        while old_fee < new_fee {
            if self.change_outputs.len() <= 0 {
                return Err(JsError::from_str("Not enough ADA leftover to cover fees"));
            }
            let index = self.change_outputs.len() - 1;
            let change_output = &mut self.change_outputs.0[index];

            // assumes new fee is always higher than previously set fee
            let amount_to_subtract = new_fee.checked_sub(&old_fee)?;

            change_output.amount = change_output
                .amount
                .checked_sub(&Value::new(&amount_to_subtract))?;

            if change_output.amount.coin
                < min_ada_required(&change_output, &self.config.coins_per_utxo_byte)?
                && change_output.amount.multiasset.is_some()
            {
                return Err(JsError::from_str("Not enough ADA leftover to cover fees"));
            }
            // burn whole output
            if change_output.amount.coin
                < min_ada_required(&change_output, &self.config.coins_per_utxo_byte)?
            {
                let fee = old_fee
                    .checked_add(&change_output.amount.coin)?
                    .checked_add(&amount_to_subtract)?;
                self.set_fee(&fee);
                self.change_outputs.0.pop().unwrap();
                return Ok(fee);
            }

            self.set_fee(&new_fee);

            old_fee = new_fee.clone();
            new_fee = min_fee(self)?;
        }

        Ok(new_fee)
    }

    // returns the new total collateral
    fn update_collateral_and_balance(
        &mut self,
        collateral: &Vec<TxBuilderInput>,
        collateral_change_address: &Address,
    ) -> Result<BigNum, JsError> {
        let mut old_total_col = self
            .fee
            .unwrap()
            .checked_mul(&to_bignum(self.config.collateral_percentage as u64))?
            .checked_div_ceil(&to_bignum(100))?;
        let mut new_total_col = self
            .update_fee_and_balance()?
            .checked_mul(&to_bignum(self.config.collateral_percentage as u64))?
            .checked_div_ceil(&to_bignum(100))?;

        if old_total_col >= new_total_col {
            return Ok(old_total_col);
        }

        let collateral_input_value = collateral.iter().fold(Value::zero(), |acc, input| {
            acc.checked_add(&input.utxo.output.amount).unwrap()
        });

        let get_collateral_return = |input_value: &Value, total_col: &BigNum| {
            TransactionOutput::new(
                &collateral_change_address,
                &input_value.clamped_sub(&Value::new(&total_col)),
            )
        };

        while old_total_col < new_total_col {
            let collateral_return = get_collateral_return(&collateral_input_value, &new_total_col);

            // burn whole return output
            if collateral_return.amount.coin
                < min_ada_required(&collateral_return, &self.config.coins_per_utxo_byte)?
                && collateral_return.amount.coin >= new_total_col
                && collateral_return.amount.multiasset.is_none()
            {
                new_total_col = collateral_return.amount.coin.clone();
                self.total_collateral = Some(new_total_col);
                self.collateral_return = None;
            } else {
                if collateral_return.amount.coin
                    < min_ada_required(&collateral_return, &self.config.coins_per_utxo_byte)?
                {
                    return Err(JsError::from_str("Not enough ADA leftover to cover fees"));
                }

                self.total_collateral = Some(new_total_col.clone());

                self.collateral_return = Some(collateral_return.clone());
            }

            old_total_col = new_total_col.clone();
            new_total_col = self
                .update_fee_and_balance()?
                .checked_mul(&to_bignum(self.config.collateral_percentage as u64))?
                .checked_div_ceil(&to_bignum(100))?;
        }
        Ok(new_total_col)
    }

    /// Returns full Transaction object with the body and the auxiliary data
    ///
    /// NOTE: witness_set will contain all mint_scripts if any been added or set
    ///
    /// takes fetched ex units into consideration
    ///
    /// add collateral utxos and collateral change receiver in case you redeem from plutus script utxos
    ///
    /// async call
    ///
    /// NOTE: is_valid set to true
    pub async fn construct(
        self,
        collateral_utxos: Option<TransactionUnspentOutputs>,
        collateral_change_address: Option<Address>,
        native_uplc: Option<bool>,
    ) -> Result<Transaction, JsError> {
        let this = &mut self.clone();
        this.redeemers = this.collect_redeemers();
        let (body, full_tx_size) = this.build_and_size()?;
        if full_tx_size > this.config.max_tx_size as usize {
            Err(JsError::from_str(&format!(
                "Maximum transaction size of {} exceeded. Found: {}",
                this.config.max_tx_size, full_tx_size
            )))
        } else {
            let full_tx = Transaction {
                body: body.clone(),
                witness_set: this.get_witness_set(),
                is_valid: true,
                auxiliary_data: this.auxiliary_data.clone(),
            };

            if let Some(_) = &this.redeemers {
                let updated_redeemers = if native_uplc.is_some() && native_uplc.unwrap() {
                    let mut utxos = TransactionUnspentOutputs(
                        this.inputs.iter().map(|input| input.utxo.clone()).collect(),
                    );
                    if let Some(ref_inputs) = &this.reference_inputs {
                        for utxo in ref_inputs.0.iter() {
                            utxos.add(utxo);
                        }
                    };

                    get_ex_units(
                        &full_tx,
                        &utxos,
                        &this.config.costmdls,
                        &this.config.max_tx_ex_units,
                        this.config.slot_config,
                    )?
                } else {
                    get_ex_units_blockfrost(full_tx.clone(), &this.config.blockfrost).await?
                };
                this.redeemers = Some(updated_redeemers);

                let pure_ada = |output: &TransactionOutput| -> BigNum {
                    match &output.amount.multiasset {
                        Some(_) => output
                            .amount
                            .coin
                            .checked_sub(
                                &min_ada_required(&output, &self.config.coins_per_utxo_byte)
                                    .unwrap(),
                            )
                            .unwrap_or(to_bignum(0)),
                        None => output.amount.coin,
                    }
                };

                let mut available_collateral: Vec<TransactionUnspentOutput> = collateral_utxos
                    .unwrap()
                    .0
                    .into_iter()
                    .sorted_by(|a, b| pure_ada(&a.output).cmp(&pure_ada(&b.output)))
                    .collect();

                loop {
                    let collateral = this.collateral.clone().unwrap_or(Vec::new());
                    match this.update_collateral_and_balance(
                        &collateral,
                        &collateral_change_address.clone().unwrap(),
                    ) {
                        Ok(_) => {
                            break;
                        }
                        Err(_) => (),
                    };

                    if collateral.len() as u32 >= this.config.max_collateral_inputs {
                        return Err(JsError::from_str("Max collateral inputs reached"));
                    }
                    if available_collateral.len() <= 0 {
                        return Err(JsError::from_str("Insufficient collateral balance"));
                    }

                    let utxo = available_collateral.pop().unwrap();
                    this.add_collateral(&utxo)?;
                }

                let (final_body, final_full_tx_size) = this.build_and_size()?;

                if final_full_tx_size > this.config.max_tx_size as usize {
                    return Err(JsError::from_str(&format!(
                        "Maximum transaction size of {} exceeded. Found: {}",
                        this.config.max_tx_size, final_full_tx_size
                    )));
                }

                let final_tx = &mut Transaction {
                    body: final_body.clone(),
                    witness_set: this.get_witness_set(),
                    is_valid: true,
                    auxiliary_data: this.auxiliary_data.clone(),
                };

                return Ok(final_tx.clone());
            }

            Ok(full_tx)
        }
    }

    // This function should be producing the total witness-set
    // that is created by the tx-builder itself,
    // before the transaction is getting signed by the actual wallet.
    // E.g. scripts or something else that has been used during the tx preparation
    fn get_witness_set(&self) -> TransactionWitnessSet {
        let mut wit = TransactionWitnessSet::new();
        if let Some(scripts) = self.native_scripts.as_ref() {
            wit.set_native_scripts(scripts);
        }
        if let Some(scripts) = self.plutus_scripts.as_ref() {
            wit.set_plutus_scripts(scripts);
        }
        if let Some(_) = self.plutus_data.as_ref() {
            wit.set_plutus_data(&self.collect_plutus_data().unwrap());
        }
        if let Some(redeemers) = self.redeemers.as_ref() {
            wit.set_redeemers(redeemers);
        }
        if let Some(scripts) = self.plutus_v2_scripts.as_ref() {
            wit.set_plutus_v2_scripts(scripts);
        }
        wit
    }

    /// Returns full Transaction object with the body and the auxiliary data
    /// NOTE: witness_set will contain all mint_scripts if any been added or set
    /// NOTE: is_valid set to true
    pub fn build_tx(&mut self) -> Result<Transaction, JsError> {
        self.redeemers = self.collect_redeemers();
        Ok(Transaction {
            body: self.build()?,
            witness_set: self.get_witness_set(),
            is_valid: true,
            auxiliary_data: self.auxiliary_data.clone(),
        })
    }

    /// warning: sum of all parts of a transaction must equal 0. You cannot just set the fee to the min value and forget about it
    /// warning: min_fee may be slightly larger than the actual minimum fee (ex: a few lovelaces)
    /// this is done to simplify the library code, but can be fixed later
    pub fn min_fee(&self) -> Result<Coin, JsError> {
        let mut self_copy = self.clone();
        self_copy.set_fee(&to_bignum(0x1_00_00_00_00));
        min_fee(&mut self_copy)
    }
}

#[cfg(test)]
mod tests {

    use super::output_builder::TransactionOutputBuilder;
    use super::*;
    use fees::*;
    use itertools::Itertools;

    const MAX_VALUE_SIZE: u32 = 4000;
    const MAX_TX_SIZE: u32 = 8000; // might be out of date but suffices for our tests
                                   // this is what is used in mainnet
    static COINS_PER_UTXO_WORD: u64 = 4310;

    fn genesis_id() -> TransactionHash {
        TransactionHash::from([0u8; TransactionHash::BYTE_COUNT])
    }

    fn root_key_15() -> Bip32PrivateKey {
        // art forum devote street sure rather head chuckle guard poverty release quote oak craft enemy
        let entropy = [
            0x0c, 0xcb, 0x74, 0xf3, 0x6b, 0x7d, 0xa1, 0x64, 0x9a, 0x81, 0x44, 0x67, 0x55, 0x22,
            0xd4, 0xd8, 0x09, 0x7c, 0x64, 0x12,
        ];
        Bip32PrivateKey::from_bip39_entropy(&entropy, &[])
    }

    fn fake_key_hash(x: u8) -> Ed25519KeyHash {
        Ed25519KeyHash::from_bytes(vec![
            x, 239, 181, 120, 142, 135, 19, 200, 68, 223, 211, 43, 46, 145, 222, 30, 48, 159, 239,
            255, 213, 85, 248, 39, 204, 158, 225, 100,
        ])
        .unwrap()
    }

    fn harden(index: u32) -> u32 {
        index | 0x80_00_00_00
    }

    #[test]
    fn check_fake_private_key() {
        let fpk = fake_private_key();
        assert_eq!(
            fpk.to_bech32(),
            "xprv1hretan5mml3tq2p0twkhq4tz4jvka7m2l94kfr6yghkyfar6m9wppc7h9unw6p65y23kakzct3695rs32z7vaw3r2lg9scmfj8ec5du3ufydu5yuquxcz24jlkjhsc9vsa4ufzge9s00fn398svhacse5su2awrw",
        );
        assert_eq!(
            fpk.to_public().to_bech32(),
            "xpub1eamrnx3pph58yr5l4z2wghjpu2dt2f0rp0zq9qquqa39p52ct0xercjgmegfcpcdsy4t9ld90ps2epmtcjy3jtq77n8z20qe0m3pnfqntgrgj",
        );
    }

    fn byron_address() -> Address {
        ByronAddress::from_base58("Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3")
            .unwrap()
            .to_address()
    }

    fn create_linear_fee(coefficient: u64, constant: u64) -> LinearFee {
        LinearFee::new(&to_bignum(coefficient), &to_bignum(constant))
    }

    fn create_default_linear_fee() -> LinearFee {
        create_linear_fee(500, 2)
    }

    fn create_tx_builder_full(
        linear_fee: &LinearFee,
        pool_deposit: u64,
        key_deposit: u64,
        max_val_size: u32,
        coins_per_utxo_byte: u64,
    ) -> TransactionBuilder {
        let cfg = TransactionBuilderConfigBuilder::new()
            .fee_algo(linear_fee)
            .pool_deposit(&to_bignum(pool_deposit))
            .key_deposit(&to_bignum(key_deposit))
            .max_value_size(max_val_size)
            .max_tx_size(MAX_TX_SIZE)
            .coins_per_utxo_byte(&to_bignum(coins_per_utxo_byte))
            .ex_unit_prices(&ExUnitPrices::from_float(0.0, 0.0))
            .collateral_percentage(150)
            .max_collateral_inputs(3)
            .build()
            .unwrap();
        TransactionBuilder::new(&cfg)
    }

    fn create_tx_builder(
        linear_fee: &LinearFee,
        coins_per_utxo_byte: u64,
        pool_deposit: u64,
        key_deposit: u64,
    ) -> TransactionBuilder {
        create_tx_builder_full(
            linear_fee,
            pool_deposit,
            key_deposit,
            MAX_VALUE_SIZE,
            coins_per_utxo_byte,
        )
    }

    fn create_reallistic_tx_builder() -> TransactionBuilder {
        create_tx_builder(
            &create_linear_fee(44, 155381),
            COINS_PER_UTXO_WORD,
            500000000,
            2000000,
        )
    }

    fn create_tx_builder_with_fee_and_val_size(
        linear_fee: &LinearFee,
        max_val_size: u32,
    ) -> TransactionBuilder {
        create_tx_builder_full(linear_fee, 1, 1, max_val_size, 1)
    }

    fn create_tx_builder_with_fee(linear_fee: &LinearFee) -> TransactionBuilder {
        create_tx_builder(linear_fee, 1, 1, 1)
    }

    fn create_tx_builder_with_fee_and_pure_change(linear_fee: &LinearFee) -> TransactionBuilder {
        TransactionBuilder::new(
            &TransactionBuilderConfigBuilder::new()
                .fee_algo(linear_fee)
                .pool_deposit(&to_bignum(1))
                .key_deposit(&to_bignum(1))
                .max_value_size(MAX_VALUE_SIZE)
                .max_tx_size(MAX_TX_SIZE)
                .coins_per_utxo_byte(&to_bignum(1))
                .ex_unit_prices(&ExUnitPrices::from_float(0.0, 0.0))
                .collateral_percentage(150)
                .max_collateral_inputs(3)
                .build()
                .unwrap(),
        )
    }

    fn create_tx_builder_with_key_deposit(deposit: u64) -> TransactionBuilder {
        create_tx_builder(&create_default_linear_fee(), 1, 1, deposit)
    }

    fn create_default_tx_builder() -> TransactionBuilder {
        create_tx_builder_with_fee(&create_default_linear_fee())
    }

    #[test]

    fn test_coin_selection_big_and_small_utxo() {
        let spend = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(0)
            .derive(0)
            .to_public();

        let stake = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(2)
            .derive(0)
            .to_public();

        let spend_cred = StakeCredential::from_keyhash(&spend.to_raw_key().hash());
        let stake_cred = StakeCredential::from_keyhash(&stake.to_raw_key().hash());
        let addr_net_0 = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &spend_cred,
            &stake_cred,
        )
        .to_address();

        let mut ma = MultiAsset::new();
        let policy_id = &PolicyID::from([0u8; 28]);
        let mut a = Assets::new();

        for i in 0..100 {
            let name = AssetName::new(vec![0u8, 1, 2, i]).unwrap();
            a.insert(&name, &to_bignum(70));
        }
        ma.insert(policy_id, &a);

        let mut ma2 = MultiAsset::new();
        let mut a2 = Assets::new();

        for i in 0..=2 {
            let name = AssetName::new(vec![0u8, 1, 2, i]).unwrap();
            a2.insert(&name, &to_bignum(70));
        }
        ma2.insert(policy_id, &a2);

        let mut i_v = Value::new(&to_bignum(1500000));
        i_v.set_multiasset(&ma2);

        let mut tx_builder = create_reallistic_tx_builder();

        tx_builder.add_input(
            &TransactionUnspentOutput::new(
                &TransactionInput::new(&genesis_id(), &1.into()),
                &TransactionOutput::new(&addr_net_0, &Value::new(&to_bignum(900999))),
            ),
            None,
        );

        let input_value = Value::new_from_assets(&ma);

        let mut utxo = TransactionUnspentOutput::new(
            &TransactionInput::new(&genesis_id(), &0.into()),
            &TransactionOutput::new(&addr_net_0, &input_value),
        );

        utxo.output.amount.coin =
            min_ada_required(&utxo.output, &tx_builder.config.coins_per_utxo_byte).unwrap();

        let mut utxos = TransactionUnspentOutputs::new();
        // utxos.add(&utxo);

        // utxos.add(&TransactionUnspentOutput::new(
        //     &TransactionInput::new(&genesis_id(), &1.into()),
        //     &TransactionOutput::new(&addr_net_0, &Value::new(&to_bignum(10_000_000))),
        // ));

        utxos.add(&TransactionUnspentOutput::new(
            &TransactionInput::new(&genesis_id(), &2.into()),
            &TransactionOutput::new(&addr_net_0, &Value::new(&to_bignum(10_000_000))),
        ));

        // utxos.add(&TransactionUnspentOutput::new(
        //     &TransactionInput::new(&genesis_id(), &3.into()),
        //     &TransactionOutput::new(&addr_net_0, &Value::new(&to_bignum(4_000_000))),
        // ));
        // utxos.add(&TransactionUnspentOutput::new(
        //     &TransactionInput::new(&genesis_id(), &3.into()),
        //     &TransactionOutput::new(&addr_net_0, &i_v),
        // ));

        // utxos.add(&TransactionUnspentOutput::new(
        //     &TransactionInput::new(&genesis_id(), &3.into()),
        //     &TransactionOutput::new(&addr_net_0, &Value::new(&to_bignum(1_000_000))),
        // ));

        // utxos.add(&TransactionUnspentOutput::new(
        //     &TransactionInput::new(&genesis_id(), &3.into()),
        //     &TransactionOutput::new(&addr_net_0, &Value::new(&to_bignum(8_000_000))),
        // ));

        // utxos.add(&TransactionUnspentOutput::new(
        //     &TransactionInput::new(&genesis_id(), &4.into()),
        //     &TransactionOutput::new(&addr_net_0, &Value::new(&to_bignum(2_000_000))),
        // ));

        let mut target_ma = MultiAsset::new();
        let mut target_a = Assets::new();
        let name = AssetName::new(vec![0u8, 1, 2, 0]).unwrap();
        target_a.insert(&name, &to_bignum(2));
        target_ma.insert(&policy_id, &target_a);
        let mut target = Value::new(&to_bignum(0));
        target.set_multiasset(&target_ma);

        let nameM = AssetName::new(vec![0u8, 1, 2, 5]).unwrap();

        let mint = MintAssets::new_from_entry(&nameM, Int::new_negative(&to_bignum(3)));

        // tx_builder.add_mint(&policy_id, &mint, None);

        // i_v.coin = to_bignum(0);

        // tx_builder
        //     .add_output(&TransactionOutput::new(&addr_net_0, &i_v))
        //     .unwrap();

        // tx_builder
        //     .add_output(&TransactionOutput::new(
        //         &addr_net_0,
        //         &Value::new(&to_bignum(1000000)),
        //     ))
        //     .unwrap();

        tx_builder
            .add_inputs_from(&utxos, &addr_net_0, &[200, 1000, 1500, 800, 800, 5000])
            .unwrap();
        tx_builder.balance(&addr_net_0, None).unwrap();

        let tx = tx_builder.build_tx().unwrap();
    }

    #[test]
    fn build_tx_with_change() {
        let mut tx_builder = create_default_tx_builder();
        let spend = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(0)
            .derive(0)
            .to_public();
        let change_key = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(1)
            .derive(0)
            .to_public();
        let stake = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(2)
            .derive(0)
            .to_public();

        let spend_cred = StakeCredential::from_keyhash(&spend.to_raw_key().hash());
        let stake_cred = StakeCredential::from_keyhash(&stake.to_raw_key().hash());
        let addr_net_0 = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &spend_cred,
            &stake_cred,
        )
        .to_address();
        let utxo = TransactionUnspentOutput::new(
            &TransactionInput::new(&genesis_id(), &0.into()),
            &TransactionOutput::new(&addr_net_0, &Value::new(&to_bignum(1_000_000))),
        );
        tx_builder.add_input(&utxo, None);
        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&addr_net_0)
                    .next()
                    .unwrap()
                    .with_coin(&to_bignum(0))
                    .build()
                    .unwrap(),
            )
            .unwrap();
        tx_builder.set_ttl(&1000.into());

        let change_cred = StakeCredential::from_keyhash(&change_key.to_raw_key().hash());
        let change_addr = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &change_cred,
            &stake_cred,
        )
        .to_address();
        tx_builder.balance(&change_addr, None);
        assert_eq!(
            tx_builder
                .outputs
                .0
                .iter()
                .chain(tx_builder.change_outputs.0.iter())
                .collect_vec()
                .len(),
            2
        );
        assert_eq!(
            tx_builder
                .get_explicit_input()
                .unwrap()
                .checked_add(&tx_builder.get_implicit_input().unwrap())
                .unwrap(),
            tx_builder
                .get_explicit_output()
                .unwrap()
                .checked_add(&Value::new(&tx_builder.get_fee_if_set().unwrap()))
                .unwrap()
        );
        assert_eq!(tx_builder.full_size().unwrap(), 285);
        assert_eq!(tx_builder.output_sizes(), vec![62, 65]);
        let _final_tx = tx_builder.build(); // just test that it doesn't throw
    }

    #[test]
    fn fetch_request_to_serde() {
        let data = r#"
            {
                "type": "result",
                "version": "1.0",
                "servicename": "ogmios",
                "methodname": "evalEx",
                "result": {
                    "EvaluationResult": {
                        "spend:0": {
                            "memory": 10000000,
                            "steps": 20000000
                        }
                    }
                }
            }
        "#;

        let g: RedeemerResult = serde_json::from_str(data).unwrap();
        match g.result {
            Some(res) => {
                for (pointer, eu) in &res.EvaluationResult.unwrap() {
                    assert_eq!(pointer, &"spend:0".to_string());
                    assert_eq!(eu.memory, 10000000);
                    assert_eq!(eu.steps, 20000000);

                    let r: Vec<&str> = pointer.split(":").collect();
                    assert_eq!(r[0], "spend");
                    assert_eq!(r[1], "0");
                }
            }
            None => {
                assert!(false);
            }
        }
    }

    #[test]
    fn fetch_request_to_serde_with_failure() {
        let data = r#"
            {
                "type": "result",
                "version": "1.0",
                "servicename": "ogmios",
                "methodname": "evalEx",
                "result": {
                    "EvaluationFailure": {
                        "spend:0": {"error": "Caluldation error"}
                    }
                }
            }
        "#;

        let g: RedeemerResult = serde_json::from_str(data).unwrap();
        match g.result {
            Some(res) => {
                if let Some(e) = &res.EvaluationFailure {
                    println!("{}", &serde_json::to_string_pretty(&e).unwrap());
                } else {
                    assert!(false);
                    for (pointer, eu) in &res.EvaluationResult.unwrap() {
                        assert_eq!(pointer, &"spend:0".to_string());
                        assert_eq!(eu.memory, 10000000);
                        assert_eq!(eu.steps, 20000000);

                        let r: Vec<&str> = pointer.split(":").collect();
                        assert_eq!(r[0], "spend");
                        assert_eq!(r[1], "0");
                    }
                }
            }
            None => {
                assert!(false);
            }
        }
    }

    #[test]
    fn build_tx_without_change() {
        let mut tx_builder = create_default_tx_builder();
        let spend = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(0)
            .derive(0)
            .to_public();
        let change_key = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(1)
            .derive(0)
            .to_public();
        let stake = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(2)
            .derive(0)
            .to_public();

        let spend_cred = StakeCredential::from_keyhash(&spend.to_raw_key().hash());
        let stake_cred = StakeCredential::from_keyhash(&stake.to_raw_key().hash());
        let addr_net_0 = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &spend_cred,
            &stake_cred,
        )
        .to_address();
        let utxo = TransactionUnspentOutput::new(
            &TransactionInput::new(&genesis_id(), &0.into()),
            &TransactionOutput::new(&addr_net_0, &Value::new(&to_bignum(1_000_000))),
        );
        tx_builder.add_input(&utxo, None);
        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&addr_net_0)
                    .next()
                    .unwrap()
                    .with_coin(&to_bignum(880_000))
                    .build()
                    .unwrap(),
            )
            .unwrap();
        tx_builder.set_ttl(&1000.into());

        let change_cred = StakeCredential::from_keyhash(&change_key.to_raw_key().hash());
        let change_addr = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &change_cred,
            &stake_cred,
        )
        .to_address();
        tx_builder.balance(&change_addr, None);
        assert_eq!(
            tx_builder
                .outputs
                .0
                .iter()
                .chain(tx_builder.change_outputs.0.iter())
                .collect_vec()
                .len(),
            1
        );
        assert_eq!(
            tx_builder
                .get_explicit_input()
                .unwrap()
                .checked_add(&tx_builder.get_implicit_input().unwrap())
                .unwrap(),
            tx_builder
                .get_explicit_output()
                .unwrap()
                .checked_add(&Value::new(&tx_builder.get_fee_if_set().unwrap()))
                .unwrap()
        );
        let _final_tx = tx_builder.build(); // just test that it doesn't throw
    }

    #[test]
    fn build_tx_with_certs() {
        let mut tx_builder = create_tx_builder_with_key_deposit(1_000_000);
        let spend = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(0)
            .derive(0)
            .to_public();
        let change_key = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(1)
            .derive(0)
            .to_public();
        let stake = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(2)
            .derive(0)
            .to_public();

        let stake_cred = StakeCredential::from_keyhash(&stake.to_raw_key().hash());
        let change_cred = StakeCredential::from_keyhash(&change_key.to_raw_key().hash());
        let addr_net_0 = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &change_cred,
            &stake_cred,
        )
        .to_address();
        let utxo = TransactionUnspentOutput::new(
            &TransactionInput::new(&genesis_id(), &0.into()),
            &TransactionOutput::new(&addr_net_0, &Value::new(&to_bignum(5_000_000))),
        );
        tx_builder.add_input(&utxo, None);

        tx_builder.set_ttl(&1000.into());

        tx_builder.add_certificate(
            &Certificate::new_stake_registration(&StakeRegistration::new(&stake_cred)),
            None,
        );
        tx_builder.add_certificate(
            &Certificate::new_stake_delegation(&StakeDelegation::new(
                &stake_cred,
                &stake.to_raw_key().hash(), // in reality, this should be the pool owner's key, not ours
            )),
            None,
        );

        let change_addr = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &change_cred,
            &stake_cred,
        )
        .to_address();
        tx_builder.balance(&change_addr, None).unwrap();
        assert_eq!(tx_builder.min_fee().unwrap().to_str(), "214002");
        assert_eq!(tx_builder.get_fee_if_set().unwrap().to_str(), "214002");
        assert_eq!(tx_builder.get_deposit().unwrap().to_str(), "1000000");
        assert_eq!(
            tx_builder
                .outputs
                .0
                .iter()
                .chain(tx_builder.change_outputs.0.iter())
                .collect_vec()
                .len(),
            1
        );
        assert_eq!(
            tx_builder
                .get_explicit_input()
                .unwrap()
                .checked_add(&tx_builder.get_implicit_input().unwrap())
                .unwrap(),
            tx_builder
                .get_explicit_output()
                .unwrap()
                .checked_add(&Value::new(&tx_builder.get_fee_if_set().unwrap()))
                .unwrap()
                .checked_add(&Value::new(&tx_builder.get_deposit().unwrap()))
                .unwrap()
        );
        let _final_tx = tx_builder.build(); // just test that it doesn't throw
    }

    #[test]
    fn build_tx_exact_amount() {
        // transactions where sum(input) == sum(output) exact should pass
        let mut tx_builder = create_tx_builder_with_fee(&create_linear_fee(0, 0));
        let spend = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(0)
            .derive(0)
            .to_public();
        let change_key = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(1)
            .derive(0)
            .to_public();
        let stake = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(2)
            .derive(0)
            .to_public();

        let spend_cred = StakeCredential::from_keyhash(&spend.to_raw_key().hash());
        let stake_cred = StakeCredential::from_keyhash(&stake.to_raw_key().hash());
        let addr_net_0 = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &spend_cred,
            &stake_cred,
        )
        .to_address();

        let utxo = TransactionUnspentOutput::new(
            &TransactionInput::new(&genesis_id(), &0.into()),
            &TransactionOutput::new(&addr_net_0, &Value::new(&to_bignum(300))),
        );
        tx_builder.add_input(&utxo, None);

        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&addr_net_0)
                    .next()
                    .unwrap()
                    .with_coin(&to_bignum(0))
                    .build()
                    .unwrap(),
            )
            .unwrap();
        tx_builder.set_ttl(&0.into());

        let change_cred = StakeCredential::from_keyhash(&change_key.to_raw_key().hash());
        let change_addr = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &change_cred,
            &stake_cred,
        )
        .to_address();
        tx_builder.balance(&change_addr, None).unwrap();
        let final_tx = tx_builder.build().unwrap();
        assert_eq!(final_tx.outputs().len(), 1);
    }

    #[test]
    fn build_tx_exact_change() {
        // transactions where we have exactly enough ADA to add change should pass
        let mut tx_builder = create_tx_builder_with_fee(&create_linear_fee(0, 0));
        let spend = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(0)
            .derive(0)
            .to_public();
        let change_key = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(1)
            .derive(0)
            .to_public();
        let stake = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(2)
            .derive(0)
            .to_public();

        let spend_cred = StakeCredential::from_keyhash(&spend.to_raw_key().hash());
        let stake_cred = StakeCredential::from_keyhash(&stake.to_raw_key().hash());
        let addr_net_0 = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &spend_cred,
            &stake_cred,
        )
        .to_address();

        let utxo = TransactionUnspentOutput::new(
            &TransactionInput::new(&genesis_id(), &0.into()),
            &TransactionOutput::new(&addr_net_0, &Value::new(&to_bignum(470))),
        );
        tx_builder.add_input(&utxo, None);

        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&addr_net_0)
                    .next()
                    .unwrap()
                    .with_coin(&to_bignum(0))
                    .build()
                    .unwrap(),
            )
            .unwrap();
        tx_builder.set_ttl(&0.into());

        let change_cred = StakeCredential::from_keyhash(&change_key.to_raw_key().hash());
        let change_addr = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &change_cred,
            &stake_cred,
        )
        .to_address();
        tx_builder.balance(&change_addr, None).unwrap();
        let final_tx = tx_builder.build().unwrap();
        assert_eq!(final_tx.outputs().len(), 2);
        assert_eq!(final_tx.outputs().get(1).amount().coin().to_str(), "248");
    }

    #[test]
    #[should_panic]
    fn build_tx_insufficient_deposit() {
        // transactions should fail with insufficient fees if a deposit is required
        let mut tx_builder = create_tx_builder_with_key_deposit(5);
        let spend = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(0)
            .derive(0)
            .to_public();
        let change_key = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(1)
            .derive(0)
            .to_public();
        let stake = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(2)
            .derive(0)
            .to_public();

        let spend_cred = StakeCredential::from_keyhash(&spend.to_raw_key().hash());
        let stake_cred = StakeCredential::from_keyhash(&stake.to_raw_key().hash());
        let addr_net_0 = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &spend_cred,
            &stake_cred,
        )
        .to_address();

        let utxo = TransactionUnspentOutput::new(
            &TransactionInput::new(&genesis_id(), &0.into()),
            &TransactionOutput::new(&addr_net_0, &Value::new(&to_bignum(5))),
        );
        tx_builder.add_input(&utxo, None);

        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&addr_net_0)
                    .next()
                    .unwrap()
                    .with_coin(&to_bignum(5))
                    .build()
                    .unwrap(),
            )
            .unwrap();
        tx_builder.set_ttl(&0.into());

        // add a cert which requires a deposit
        tx_builder.add_certificate(
            &Certificate::new_stake_registration(&StakeRegistration::new(&stake_cred)),
            None,
        );

        let change_cred = StakeCredential::from_keyhash(&change_key.to_raw_key().hash());
        let change_addr = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &change_cred,
            &stake_cred,
        )
        .to_address();

        tx_builder.balance(&change_addr, None).unwrap();
    }

    #[test]
    fn build_tx_with_inputs() {
        let mut tx_builder = create_default_tx_builder();
        let spend = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(0)
            .derive(0)
            .to_public();
        let stake = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(2)
            .derive(0)
            .to_public();

        let spend_cred = StakeCredential::from_keyhash(&spend.to_raw_key().hash());
        let stake_cred = StakeCredential::from_keyhash(&stake.to_raw_key().hash());

        {
            assert_eq!(
                tx_builder
                    .fee_for_input(
                        &EnterpriseAddress::new(NetworkInfo::testnet().network_id(), &spend_cred)
                            .to_address(),
                        &TransactionInput::new(&genesis_id(), &0.into()),
                        &Value::new(&to_bignum(1_000_000))
                    )
                    .unwrap()
                    .to_str(),
                "69500"
            );

            let utxo = TransactionUnspentOutput::new(
                &TransactionInput::new(&genesis_id(), &0.into()),
                &TransactionOutput::new(
                    &EnterpriseAddress::new(NetworkInfo::testnet().network_id(), &spend_cred)
                        .to_address(),
                    &Value::new(&to_bignum(1_000_000)),
                ),
            );
            tx_builder.add_input(&utxo, None);
        }
        tx_builder.add_input(
            &TransactionUnspentOutput::new(
                &TransactionInput::new(&genesis_id(), &0.into()),
                &TransactionOutput::new(
                    &BaseAddress::new(
                        NetworkInfo::testnet().network_id(),
                        &spend_cred,
                        &stake_cred,
                    )
                    .to_address(),
                    &Value::new(&to_bignum(1_000_000)),
                ),
            ),
            None,
        );
        tx_builder.add_input(
            &TransactionUnspentOutput::new(
                &TransactionInput::new(&genesis_id(), &0.into()),
                &TransactionOutput::new(
                    &PointerAddress::new(
                        NetworkInfo::testnet().network_id(),
                        &spend_cred,
                        &Pointer::new(&to_bignum(0), &to_bignum(0), &to_bignum(0)),
                    )
                    .to_address(),
                    &Value::new(&to_bignum(1_000_000)),
                ),
            ),
            None,
        );
        tx_builder.add_input(
            &TransactionUnspentOutput::new(
                &TransactionInput::new(&genesis_id(), &0.into()),
                &TransactionOutput::new(
                    &ByronAddress::icarus_from_key(&spend, NetworkInfo::testnet().protocol_magic())
                        .to_address(),
                    &Value::new(&to_bignum(1_000_000)),
                ),
            ),
            None,
        );

        assert_eq!(tx_builder.inputs.len(), 1);
    }

    #[test]
    fn build_tx_with_mint_all_sent() {
        let mut tx_builder = create_tx_builder_with_fee(&create_linear_fee(0, 1));
        let spend = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(0)
            .derive(0)
            .to_public();
        let change_key = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(1)
            .derive(0)
            .to_public();
        let stake = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(2)
            .derive(0)
            .to_public();

        let spend_cred = StakeCredential::from_keyhash(&spend.to_raw_key().hash());
        let stake_cred = StakeCredential::from_keyhash(&stake.to_raw_key().hash());

        // Input with 500 coins
        tx_builder.add_input(
            &TransactionUnspentOutput::new(
                &TransactionInput::new(&genesis_id(), &0.into()),
                &TransactionOutput::new(
                    &EnterpriseAddress::new(NetworkInfo::testnet().network_id(), &spend_cred)
                        .to_address(),
                    &Value::new(&to_bignum(500)),
                ),
            ),
            None,
        );

        let addr_net_0 = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &spend_cred,
            &stake_cred,
        )
        .to_address();

        let (min_script, policy_id) = mint_script_and_policy(0);
        let name = AssetName::new(vec![0u8, 1, 2, 3]).unwrap();
        let amount = to_bignum(1234);

        // Adding mint of the asset - which should work as an input
        tx_builder.add_mint(
            &policy_id,
            &MintAssets::new_from_entry(&name, Int::new(&amount)),
            Some(ScriptWitness::new_native_witness(&min_script)),
        );

        let mut ass = Assets::new();
        ass.insert(&name, &amount);
        let mut mass = MultiAsset::new();
        mass.insert(&policy_id, &ass);

        // One coin and the minted asset goes into the output
        let mut output_amount = Value::new(&to_bignum(0));
        output_amount.set_multiasset(&mass);

        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&addr_net_0)
                    .next()
                    .unwrap()
                    .with_value(&output_amount)
                    .build()
                    .unwrap(),
            )
            .unwrap();

        let change_cred = StakeCredential::from_keyhash(&change_key.to_raw_key().hash());
        let change_addr = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &change_cred,
            &stake_cred,
        )
        .to_address();

        tx_builder.balance(&change_addr, None).unwrap();
        assert_eq!(
            tx_builder
                .outputs
                .0
                .iter()
                .chain(tx_builder.change_outputs.0.iter())
                .collect_vec()
                .len(),
            2
        );

        // Change must be one remaining coin because fee is one constant coin
        let change = tx_builder
            .outputs
            .0
            .iter()
            .chain(tx_builder.change_outputs.0.iter())
            .collect_vec()
            .get(1)
            .unwrap()
            .amount();
        assert_eq!(change.coin(), to_bignum(235));
        assert!(change.multiasset().is_none());
    }

    #[test]
    fn build_tx_with_mint_in_change() {
        let mut tx_builder = create_tx_builder_with_fee(&create_linear_fee(0, 1));
        let spend = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(0)
            .derive(0)
            .to_public();
        let change_key = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(1)
            .derive(0)
            .to_public();
        let stake = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(2)
            .derive(0)
            .to_public();

        let spend_cred = StakeCredential::from_keyhash(&spend.to_raw_key().hash());
        let stake_cred = StakeCredential::from_keyhash(&stake.to_raw_key().hash());

        // Input with 600 coins
        tx_builder.add_input(
            &TransactionUnspentOutput::new(
                &TransactionInput::new(&genesis_id(), &0.into()),
                &TransactionOutput::new(
                    &EnterpriseAddress::new(NetworkInfo::testnet().network_id(), &spend_cred)
                        .to_address(),
                    &Value::new(&to_bignum(600)),
                ),
            ),
            None,
        );

        let addr_net_0 = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &spend_cred,
            &stake_cred,
        )
        .to_address();

        let (min_script, policy_id) = mint_script_and_policy(0);
        let name = AssetName::new(vec![0u8, 1, 2, 3]).unwrap();

        let amount_minted = to_bignum(1000);
        let amount_sent = to_bignum(500);

        // Adding mint of the asset - which should work as an input
        tx_builder.add_mint(
            &policy_id,
            &MintAssets::new_from_entry(&name, Int::new(&amount_minted)),
            Some(ScriptWitness::new_native_witness(&min_script)),
        );

        let mut ass = Assets::new();
        ass.insert(&name, &amount_sent);
        let mut mass = MultiAsset::new();
        mass.insert(&policy_id, &ass);

        // One coin and the minted asset goes into the output
        let mut output_amount = Value::new(&to_bignum(0));
        output_amount.set_multiasset(&mass);

        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&addr_net_0)
                    .next()
                    .unwrap()
                    .with_value(&output_amount)
                    .build()
                    .unwrap(),
            )
            .unwrap();

        let change_cred = StakeCredential::from_keyhash(&change_key.to_raw_key().hash());
        let change_addr = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &change_cred,
            &stake_cred,
        )
        .to_address();

        tx_builder.balance(&change_addr, None).unwrap();
        assert_eq!(
            tx_builder
                .outputs
                .0
                .iter()
                .chain(tx_builder.change_outputs.0.iter())
                .collect_vec()
                .len(),
            2
        );

        // Change must be one remaining coin because fee is one constant coin
        let change = tx_builder
            .outputs
            .0
            .iter()
            .chain(tx_builder.change_outputs.0.iter())
            .collect_vec()
            .get(1)
            .unwrap()
            .amount();
        assert_eq!(change.coin(), to_bignum(335));
        assert!(change.multiasset().is_some());

        let change_assets = change.multiasset().unwrap();
        let change_asset = change_assets.get(&policy_id).unwrap();
        assert_eq!(
            change_asset.get(&name).unwrap(),
            amount_minted.checked_sub(&amount_sent).unwrap(),
        );
    }

    #[test]
    fn build_tx_with_native_assets_change() {
        let mut tx_builder = create_tx_builder_with_fee(&create_linear_fee(0, 1));
        let spend = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(0)
            .derive(0)
            .to_public();
        let change_key = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(1)
            .derive(0)
            .to_public();
        let stake = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(2)
            .derive(0)
            .to_public();

        let policy_id = &PolicyID::from([0u8; 28]);
        let name = AssetName::new(vec![0u8, 1, 2, 3]).unwrap();

        let ma_input1 = 100;
        let ma_input2 = 200;
        let ma_output1 = 60;

        let multiassets = [ma_input1, ma_input2, ma_output1]
            .iter()
            .map(|input| {
                let mut multiasset = MultiAsset::new();
                multiasset.insert(policy_id, &{
                    let mut assets = Assets::new();
                    assets.insert(&name, &to_bignum(*input));
                    assets
                });
                multiasset
            })
            .collect::<Vec<MultiAsset>>();

        let mut index = 0;
        for (multiasset, ada) in multiassets
            .iter()
            .zip([100u64, 500].iter().cloned().map(to_bignum))
        {
            let mut input_amount = Value::new(&ada);
            input_amount.set_multiasset(multiasset);

            tx_builder.add_input(
                &TransactionUnspentOutput::new(
                    &TransactionInput::new(&genesis_id(), &index.into()),
                    &TransactionOutput::new(
                        &EnterpriseAddress::new(
                            NetworkInfo::testnet().network_id(),
                            &StakeCredential::from_keyhash(&spend.to_raw_key().hash()),
                        )
                        .to_address(),
                        &input_amount,
                    ),
                ),
                None,
            );
            index += 1;
        }

        let stake_cred = StakeCredential::from_keyhash(&stake.to_raw_key().hash());
        let spend_cred = StakeCredential::from_keyhash(&spend.to_raw_key().hash());

        let addr_net_0 = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &spend_cred,
            &stake_cred,
        )
        .to_address();

        let mut output_amount = Value::new(&to_bignum(0));
        output_amount.set_multiasset(&multiassets[2]);

        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&addr_net_0)
                    .next()
                    .unwrap()
                    .with_value(&output_amount)
                    .build()
                    .unwrap(),
            )
            .unwrap();

        let change_cred = StakeCredential::from_keyhash(&change_key.to_raw_key().hash());
        let change_addr = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &change_cred,
            &stake_cred,
        )
        .to_address();

        tx_builder.balance(&change_addr, None).unwrap();
        let final_tx = tx_builder.build().unwrap();
        assert_eq!(final_tx.outputs().len(), 2);
        assert_eq!(
            final_tx
                .outputs()
                .get(1)
                .amount()
                .multiasset()
                .unwrap()
                .get(policy_id)
                .unwrap()
                .get(&name)
                .unwrap(),
            to_bignum(ma_input1 + ma_input2 - ma_output1)
        );
        assert_eq!(final_tx.outputs().get(1).amount().coin(), to_bignum(336));
    }

    #[test]
    fn build_tx_with_native_assets_change_and_purification() {
        let coin_per_utxo_word = to_bignum(1);
        // Prefer pure change!
        let mut tx_builder = create_tx_builder_with_fee_and_pure_change(&create_linear_fee(0, 1));
        let spend = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(0)
            .derive(0)
            .to_public();
        let change_key = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(1)
            .derive(0)
            .to_public();
        let stake = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(2)
            .derive(0)
            .to_public();

        let policy_id = &PolicyID::from([0u8; 28]);
        let name = AssetName::new(vec![0u8, 1, 2, 3]).unwrap();

        let ma_input1 = 100;
        let ma_input2 = 200;
        let ma_output1 = 60;

        let multiassets = [ma_input1, ma_input2, ma_output1]
            .iter()
            .map(|input| {
                let mut multiasset = MultiAsset::new();
                multiasset.insert(policy_id, &{
                    let mut assets = Assets::new();
                    assets.insert(&name, &to_bignum(*input));
                    assets
                });
                multiasset
            })
            .collect::<Vec<MultiAsset>>();

        let mut index = 0;
        for (multiasset, ada) in multiassets
            .iter()
            .zip([100u64, 800].iter().cloned().map(to_bignum))
        {
            let mut input_amount = Value::new(&ada);
            input_amount.set_multiasset(multiasset);

            tx_builder.add_input(
                &TransactionUnspentOutput::new(
                    &TransactionInput::new(&genesis_id(), &index.into()),
                    &TransactionOutput::new(
                        &EnterpriseAddress::new(
                            NetworkInfo::testnet().network_id(),
                            &StakeCredential::from_keyhash(&spend.to_raw_key().hash()),
                        )
                        .to_address(),
                        &input_amount,
                    ),
                ),
                None,
            );
            index += 1;
        }

        let stake_cred = StakeCredential::from_keyhash(&stake.to_raw_key().hash());
        let spend_cred = StakeCredential::from_keyhash(&spend.to_raw_key().hash());

        let addr_net_0 = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &spend_cred,
            &stake_cred,
        )
        .to_address();

        let mut output_amount = Value::new(&to_bignum(0));
        output_amount.set_multiasset(&multiassets[2]);

        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&addr_net_0)
                    .next()
                    .unwrap()
                    .with_value(&output_amount)
                    .build()
                    .unwrap(),
            )
            .unwrap();

        let change_cred = StakeCredential::from_keyhash(&change_key.to_raw_key().hash());
        let change_addr = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &change_cred,
            &stake_cred,
        )
        .to_address();

        tx_builder.balance(&change_addr, None).unwrap();
        let final_tx = tx_builder.build().unwrap();
        assert_eq!(final_tx.outputs().len(), 3);
        assert_eq!(final_tx.outputs().get(0).amount().coin(), to_bignum(263));
        assert_eq!(
            final_tx
                .outputs()
                .get(1)
                .amount()
                .multiasset()
                .unwrap()
                .get(policy_id)
                .unwrap()
                .get(&name)
                .unwrap(),
            to_bignum(ma_input1 + ma_input2 - ma_output1)
        );
        // The first change output that contains all the tokens contain minimum required Coin
        let min_coin_for_dirty_change =
            min_ada_required(&final_tx.outputs().get(1), &coin_per_utxo_word).unwrap();
        assert_eq!(
            final_tx.outputs().get(1).amount().coin(),
            min_coin_for_dirty_change
        );
        assert_eq!(final_tx.outputs().get(2).amount().coin(), to_bignum(373));
        assert_eq!(final_tx.outputs().get(2).amount().multiasset(), None);
    }

    #[test]
    #[ignore]
    fn build_tx_with_native_assets_change_and_no_purification_cuz_not_enough_pure_coin() {
        // Prefer pure change!
        let mut tx_builder = create_tx_builder_with_fee_and_pure_change(&create_linear_fee(1, 1));
        let spend = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(0)
            .derive(0)
            .to_public();
        let change_key = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(1)
            .derive(0)
            .to_public();
        let stake = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(2)
            .derive(0)
            .to_public();

        let policy_id = &PolicyID::from([0u8; 28]);
        let name = AssetName::new(vec![0u8, 1, 2, 3]).unwrap();

        let ma_input1 = 100;
        let ma_input2 = 200;
        let ma_output1 = 60;

        let multiassets = [ma_input1, ma_input2, ma_output1]
            .iter()
            .map(|input| {
                let mut multiasset = MultiAsset::new();
                multiasset.insert(policy_id, &{
                    let mut assets = Assets::new();
                    assets.insert(&name, &to_bignum(*input));
                    assets
                });
                multiasset
            })
            .collect::<Vec<MultiAsset>>();

        for (multiasset, ada) in multiassets
            .iter()
            .zip([300u64, 300].iter().cloned().map(to_bignum))
        {
            let mut input_amount = Value::new(&ada);
            input_amount.set_multiasset(multiasset);

            tx_builder.add_input(
                &TransactionUnspentOutput::new(
                    &TransactionInput::new(&genesis_id(), &0.into()),
                    &TransactionOutput::new(
                        &EnterpriseAddress::new(
                            NetworkInfo::testnet().network_id(),
                            &StakeCredential::from_keyhash(&spend.to_raw_key().hash()),
                        )
                        .to_address(),
                        &input_amount,
                    ),
                ),
                None,
            );
        }

        let stake_cred = StakeCredential::from_keyhash(&stake.to_raw_key().hash());
        let spend_cred = StakeCredential::from_keyhash(&spend.to_raw_key().hash());

        let addr_net_0 = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &spend_cred,
            &stake_cred,
        )
        .to_address();

        let mut output_amount = Value::new(&to_bignum(100));
        output_amount.set_multiasset(&multiassets[2]);

        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&addr_net_0)
                    .next()
                    .unwrap()
                    .with_value(&output_amount)
                    .build()
                    .unwrap(),
            )
            .unwrap();

        let change_cred = StakeCredential::from_keyhash(&change_key.to_raw_key().hash());
        let change_addr = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &change_cred,
            &stake_cred,
        )
        .to_address();

        tx_builder.balance(&change_addr, None).unwrap();
        let final_tx = tx_builder.build().unwrap();
        assert_eq!(final_tx.outputs().len(), 2);
        assert_eq!(final_tx.outputs().get(0).amount().coin(), to_bignum(100));
        assert_eq!(
            final_tx
                .outputs()
                .get(1)
                .amount()
                .multiasset()
                .unwrap()
                .get(policy_id)
                .unwrap()
                .get(&name)
                .unwrap(),
            to_bignum(ma_input1 + ma_input2 - ma_output1)
        );
        // The single change output contains more Coin then minimal utxo value
        // But not enough to cover the additional fee for a separate output
        assert_eq!(final_tx.outputs().get(1).amount().coin(), to_bignum(101));
    }

    #[test]
    #[should_panic]
    fn build_tx_leftover_assets() {
        let mut tx_builder = create_default_tx_builder();
        let spend = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(0)
            .derive(0)
            .to_public();
        let change_key = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(1)
            .derive(0)
            .to_public();
        let stake = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(2)
            .derive(0)
            .to_public();

        let spend_cred = StakeCredential::from_keyhash(&spend.to_raw_key().hash());
        let stake_cred = StakeCredential::from_keyhash(&stake.to_raw_key().hash());
        let addr_net_0 = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &spend_cred,
            &stake_cred,
        )
        .to_address();

        // add an input that contains an asset not present in the output
        let policy_id = &PolicyID::from([0u8; 28]);
        let name = AssetName::new(vec![0u8, 1, 2, 3]).unwrap();
        let mut input_amount = Value::new(&to_bignum(1_000_000));
        let mut input_multiasset = MultiAsset::new();
        input_multiasset.insert(policy_id, &{
            let mut assets = Assets::new();
            assets.insert(&name, &to_bignum(100));
            assets
        });
        input_amount.set_multiasset(&input_multiasset);
        tx_builder.add_input(
            &TransactionUnspentOutput::new(
                &TransactionInput::new(&genesis_id(), &0.into()),
                &TransactionOutput::new(
                    &EnterpriseAddress::new(
                        NetworkInfo::testnet().network_id(),
                        &StakeCredential::from_keyhash(&spend.to_raw_key().hash()),
                    )
                    .to_address(),
                    &input_amount,
                ),
            ),
            None,
        );

        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&addr_net_0)
                    .next()
                    .unwrap()
                    .with_coin(&to_bignum(880_000))
                    .build()
                    .unwrap(),
            )
            .unwrap();
        tx_builder.set_ttl(&1000.into());

        let change_cred = StakeCredential::from_keyhash(&change_key.to_raw_key().hash());
        let change_addr = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &change_cred,
            &stake_cred,
        )
        .to_address();
        tx_builder.balance(&change_addr, None).unwrap();
        assert_eq!(
            tx_builder
                .outputs
                .0
                .iter()
                .chain(tx_builder.change_outputs.0.iter())
                .collect_vec()
                .len(),
            1
        );
        assert_eq!(
            tx_builder
                .get_explicit_input()
                .unwrap()
                .checked_add(&tx_builder.get_implicit_input().unwrap())
                .unwrap(),
            tx_builder
                .get_explicit_output()
                .unwrap()
                .checked_add(&Value::new(&tx_builder.get_fee_if_set().unwrap()))
                .unwrap()
        );
        let _final_tx = tx_builder.build(); // just test that it doesn't throw
    }

    #[test]
    fn build_tx_burn_less_than_min_ada() {
        // with this mainnet value we should end up with a final min_ada_required of just under 1_000_000
        let mut tx_builder = create_reallistic_tx_builder();

        let output_addr = ByronAddress::from_base58(
            "Ae2tdPwUPEZD9QQf2ZrcYV34pYJwxK4vqXaF8EXkup1eYH73zUScHReM42b",
        )
        .unwrap();
        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&output_addr.to_address())
                    .next()
                    .unwrap()
                    .with_value(&Value::new(&to_bignum(2_000_000)))
                    .build()
                    .unwrap(),
            )
            .unwrap();

        tx_builder.add_input(
            &TransactionUnspentOutput::new(
                &TransactionInput::new(&genesis_id(), &0.into()),
                &TransactionOutput::new(
                    &ByronAddress::from_base58(
                        "Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3",
                    )
                    .unwrap()
                    .to_address(),
                    &Value::new(&to_bignum(2_400_000)),
                ),
            ),
            None,
        );

        tx_builder.set_ttl(&1.into());

        let change_addr = ByronAddress::from_base58(
            "Ae2tdPwUPEZGUEsuMAhvDcy94LKsZxDjCbgaiBBMgYpR8sKf96xJmit7Eho",
        )
        .unwrap();
        tx_builder.balance(&change_addr.to_address(), None).unwrap();
        assert_eq!(
            tx_builder
                .outputs
                .0
                .iter()
                .chain(tx_builder.change_outputs.0.iter())
                .collect_vec()
                .len(),
            1
        );
        assert_eq!(
            tx_builder
                .get_explicit_input()
                .unwrap()
                .checked_add(&tx_builder.get_implicit_input().unwrap())
                .unwrap(),
            tx_builder
                .get_explicit_output()
                .unwrap()
                .checked_add(&Value::new(&tx_builder.get_fee_if_set().unwrap()))
                .unwrap()
        );
        let _final_tx = tx_builder.build(); // just test that it doesn't throw
    }

    #[test]
    fn build_tx_burn_empty_assets() {
        let mut tx_builder = create_reallistic_tx_builder();

        let output_addr = ByronAddress::from_base58(
            "Ae2tdPwUPEZD9QQf2ZrcYV34pYJwxK4vqXaF8EXkup1eYH73zUScHReM42b",
        )
        .unwrap();
        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&output_addr.to_address())
                    .next()
                    .unwrap()
                    .with_value(&Value::new(&to_bignum(2_000_000)))
                    .build()
                    .unwrap(),
            )
            .unwrap();

        let mut input_value = Value::new(&to_bignum(2_400_000));
        input_value.set_multiasset(&MultiAsset::new());
        tx_builder.add_input(
            &TransactionUnspentOutput::new(
                &TransactionInput::new(&genesis_id(), &0.into()),
                &TransactionOutput::new(
                    &ByronAddress::from_base58(
                        "Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3",
                    )
                    .unwrap()
                    .to_address(),
                    &input_value,
                ),
            ),
            None,
        );

        tx_builder.set_ttl(&1.into());

        let change_addr = ByronAddress::from_base58(
            "Ae2tdPwUPEZGUEsuMAhvDcy94LKsZxDjCbgaiBBMgYpR8sKf96xJmit7Eho",
        )
        .unwrap();
        tx_builder.balance(&change_addr.to_address(), None).unwrap();
        assert_eq!(
            tx_builder
                .outputs
                .0
                .iter()
                .chain(tx_builder.change_outputs.0.iter())
                .collect_vec()
                .len(),
            1
        );
        assert_eq!(
            tx_builder
                .get_explicit_input()
                .unwrap()
                .checked_add(&tx_builder.get_implicit_input().unwrap())
                .unwrap()
                .coin(),
            tx_builder
                .get_explicit_output()
                .unwrap()
                .checked_add(&Value::new(&tx_builder.get_fee_if_set().unwrap()))
                .unwrap()
                .coin()
        );
        let _final_tx = tx_builder.build(); // just test that it doesn't throw
    }

    #[test]
    fn build_tx_no_useless_multiasset() {
        let mut tx_builder = create_reallistic_tx_builder();

        let policy_id = &PolicyID::from([0u8; 28]);
        let name = AssetName::new(vec![0u8, 1, 2, 3]).unwrap();

        // add an output that uses up all the token but leaves ADA
        let mut input_amount = Value::new(&to_bignum(5_000_000));
        let mut input_multiasset = MultiAsset::new();
        input_multiasset.insert(policy_id, &{
            let mut assets = Assets::new();
            assets.insert(&name, &to_bignum(100));
            assets
        });
        input_amount.set_multiasset(&input_multiasset);

        tx_builder.add_input(
            &TransactionUnspentOutput::new(
                &TransactionInput::new(&genesis_id(), &0.into()),
                &TransactionOutput::new(
                    &ByronAddress::from_base58(
                        "Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3",
                    )
                    .unwrap()
                    .to_address(),
                    &input_amount,
                ),
            ),
            None,
        );

        // add an input that contains an asset & ADA
        let mut output_amount = Value::new(&to_bignum(2_000_000));
        let mut output_multiasset = MultiAsset::new();
        output_multiasset.insert(policy_id, &{
            let mut assets = Assets::new();
            assets.insert(&name, &to_bignum(100));
            assets
        });
        output_amount.set_multiasset(&output_multiasset);

        let output_addr = ByronAddress::from_base58(
            "Ae2tdPwUPEZD9QQf2ZrcYV34pYJwxK4vqXaF8EXkup1eYH73zUScHReM42b",
        )
        .unwrap();
        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&output_addr.to_address())
                    .next()
                    .unwrap()
                    .with_value(&output_amount)
                    .build()
                    .unwrap(),
            )
            .unwrap();

        tx_builder.set_ttl(&1.into());

        let change_addr = ByronAddress::from_base58(
            "Ae2tdPwUPEZGUEsuMAhvDcy94LKsZxDjCbgaiBBMgYpR8sKf96xJmit7Eho",
        )
        .unwrap();
        tx_builder.balance(&change_addr.to_address(), None).unwrap();
        assert_eq!(
            tx_builder
                .outputs
                .0
                .iter()
                .chain(tx_builder.change_outputs.0.iter())
                .collect_vec()
                .len(),
            2
        );
        let final_tx = tx_builder.build().unwrap();
        let change_output = final_tx.outputs().get(1);
        let change_assets = change_output.amount().multiasset();

        // since all tokens got sent in the output
        // the change should be only ADA and not have any multiasset struct in it
        assert!(change_assets.is_none());
    }

    fn create_multiasset() -> (MultiAsset, [ScriptHash; 3], [AssetName; 3]) {
        let policy_ids = [
            PolicyID::from([0u8; 28]),
            PolicyID::from([1u8; 28]),
            PolicyID::from([2u8; 28]),
        ];
        let names = [
            AssetName::new(vec![99u8; 32]).unwrap(),
            AssetName::new(vec![0u8, 1, 2, 3]).unwrap(),
            AssetName::new(vec![4u8, 5, 6, 7, 8, 9]).unwrap(),
        ];
        let multiasset = policy_ids.iter().zip(names.iter()).fold(
            MultiAsset::new(),
            |mut acc, (policy_id, name)| {
                acc.insert(policy_id, &{
                    let mut assets = Assets::new();
                    assets.insert(&name, &to_bignum(500));
                    assets
                });
                acc
            },
        );
        return (multiasset, policy_ids, names);
    }

    #[test]
    fn build_tx_add_change_split_nfts() {
        let max_value_size = 100; // super low max output size to test with fewer assets
        let mut tx_builder =
            create_tx_builder_with_fee_and_val_size(&create_linear_fee(0, 1), max_value_size);

        let (multiasset, policy_ids, names) = create_multiasset();

        let mut input_value = Value::new(&to_bignum(1000));
        input_value.set_multiasset(&multiasset);

        tx_builder.add_input(
            &TransactionUnspentOutput::new(
                &TransactionInput::new(&genesis_id(), &0.into()),
                &TransactionOutput::new(
                    &ByronAddress::from_base58(
                        "Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3",
                    )
                    .unwrap()
                    .to_address(),
                    &input_value,
                ),
            ),
            None,
        );

        let output_addr = ByronAddress::from_base58(
            "Ae2tdPwUPEZD9QQf2ZrcYV34pYJwxK4vqXaF8EXkup1eYH73zUScHReM42b",
        )
        .unwrap()
        .to_address();
        let output_amount = Value::new(&to_bignum(0));

        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&output_addr)
                    .next()
                    .unwrap()
                    .with_value(&output_amount)
                    .build()
                    .unwrap(),
            )
            .unwrap();

        let change_addr = ByronAddress::from_base58(
            "Ae2tdPwUPEZGUEsuMAhvDcy94LKsZxDjCbgaiBBMgYpR8sKf96xJmit7Eho",
        )
        .unwrap()
        .to_address();

        tx_builder.balance(&change_addr, None).unwrap();
        let final_tx = tx_builder.build().unwrap();
        assert_eq!(final_tx.outputs().len(), 4);
        for (policy_id, asset_name) in policy_ids.iter().zip(names.iter()) {
            assert!(final_tx
                .outputs
                .0
                .iter()
                .find(|output| output.amount.multiasset.as_ref().map_or_else(
                    || false,
                    |ma| ma
                        .0
                        .iter()
                        .find(|(pid, a)| *pid == policy_id
                            && a.0.iter().find(|(name, _)| *name == asset_name).is_some())
                        .is_some()
                ))
                .is_some());
        }
        for output in final_tx.outputs.0.iter() {
            assert!(output.amount.to_bytes().len() <= max_value_size as usize);
        }
    }

    #[test]
    fn build_tx_too_big_output() {
        let mut tx_builder = create_tx_builder_with_fee_and_val_size(&create_linear_fee(0, 1), 10);

        tx_builder.add_input(
            &TransactionUnspentOutput::new(
                &TransactionInput::new(&genesis_id(), &0.into()),
                &TransactionOutput::new(
                    &ByronAddress::from_base58(
                        "Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3",
                    )
                    .unwrap()
                    .to_address(),
                    &Value::new(&to_bignum(500)),
                ),
            ),
            None,
        );

        let output_addr = ByronAddress::from_base58(
            "Ae2tdPwUPEZD9QQf2ZrcYV34pYJwxK4vqXaF8EXkup1eYH73zUScHReM42b",
        )
        .unwrap()
        .to_address();
        let mut output_amount = Value::new(&to_bignum(50));
        output_amount.set_multiasset(&create_multiasset().0);

        assert!(tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&output_addr)
                    .next()
                    .unwrap()
                    .with_value(&output_amount)
                    .build()
                    .unwrap(),
            )
            .is_err());
    }

    #[test]
    fn build_tx_add_change_nfts_not_enough_ada() {
        let mut tx_builder = create_tx_builder_with_fee_and_val_size(
            &create_linear_fee(0, 1),
            150, // super low max output size to test with fewer assets
        );

        let policy_ids = [
            PolicyID::from([0u8; 28]),
            PolicyID::from([1u8; 28]),
            PolicyID::from([2u8; 28]),
        ];
        let names = [
            AssetName::new(vec![99u8; 32]).unwrap(),
            AssetName::new(vec![0u8, 1, 2, 3]).unwrap(),
            AssetName::new(vec![4u8, 5, 6, 7, 8, 9]).unwrap(),
        ];

        let multiasset = policy_ids.iter().zip(names.iter()).fold(
            MultiAsset::new(),
            |mut acc, (policy_id, name)| {
                acc.insert(policy_id, &{
                    let mut assets = Assets::new();
                    assets.insert(&name, &to_bignum(500));
                    assets
                });
                acc
            },
        );

        let mut input_value = Value::new(&to_bignum(58));
        input_value.set_multiasset(&multiasset);

        tx_builder.add_input(
            &TransactionUnspentOutput::new(
                &TransactionInput::new(&genesis_id(), &0.into()),
                &TransactionOutput::new(
                    &ByronAddress::from_base58(
                        "Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3",
                    )
                    .unwrap()
                    .to_address(),
                    &input_value,
                ),
            ),
            None,
        );

        let output_addr = ByronAddress::from_base58(
            "Ae2tdPwUPEZD9QQf2ZrcYV34pYJwxK4vqXaF8EXkup1eYH73zUScHReM42b",
        )
        .unwrap()
        .to_address();
        let output_amount = Value::new(&to_bignum(0));

        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&output_addr)
                    .next()
                    .unwrap()
                    .with_value(&output_amount)
                    .build()
                    .unwrap(),
            )
            .unwrap();

        let change_addr = ByronAddress::from_base58(
            "Ae2tdPwUPEZGUEsuMAhvDcy94LKsZxDjCbgaiBBMgYpR8sKf96xJmit7Eho",
        )
        .unwrap()
        .to_address();

        assert!(tx_builder.balance(&change_addr, None).is_err())
    }

    fn make_input(input_hash_byte: u8, value: Value) -> TransactionUnspentOutput {
        TransactionUnspentOutput::new(
            &TransactionInput::new(&TransactionHash::from([input_hash_byte; 32]), &0.into()),
            &TransactionOutputBuilder::new()
                .with_address(
                    &Address::from_bech32(
                        "addr1vyy6nhfyks7wdu3dudslys37v252w2nwhv0fw2nfawemmnqs6l44z",
                    )
                    .unwrap(),
                )
                .next()
                .unwrap()
                .with_value(&value)
                .build()
                .unwrap(),
        )
    }

    #[ignore]
    #[test]
    fn tx_builder_cip2_largest_first_increasing_fees() {
        // we have a = 1 to test increasing fees when more inputs are added
        let mut tx_builder = create_tx_builder_with_fee(&create_linear_fee(1, 0));
        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(
                        &Address::from_bech32(
                            "addr1vyy6nhfyks7wdu3dudslys37v252w2nwhv0fw2nfawemmnqs6l44z",
                        )
                        .unwrap(),
                    )
                    .next()
                    .unwrap()
                    .with_coin(&to_bignum(1000))
                    .build()
                    .unwrap(),
            )
            .unwrap();
        let mut available_inputs = TransactionUnspentOutputs::new();
        available_inputs.add(&make_input(0u8, Value::new(&to_bignum(150))));
        available_inputs.add(&make_input(1u8, Value::new(&to_bignum(200))));
        available_inputs.add(&make_input(2u8, Value::new(&to_bignum(800))));
        available_inputs.add(&make_input(3u8, Value::new(&to_bignum(400))));
        available_inputs.add(&make_input(4u8, Value::new(&to_bignum(100))));
        let change_addr = ByronAddress::from_base58(
            "Ae2tdPwUPEZGUEsuMAhvDcy94LKsZxDjCbgaiBBMgYpR8sKf96xJmit7Eho",
        )
        .unwrap()
        .to_address();
        tx_builder
            .add_inputs_from(
                &available_inputs,
                &change_addr,
                &[200, 1000, 1500, 800, 800, 5000],
            )
            .unwrap();
        tx_builder.balance(&change_addr, None).unwrap();
        let tx = tx_builder.build().unwrap();
        // change needed
        assert_eq!(2, tx.outputs().len());
        assert_eq!(3, tx.inputs().len());
        // confirm order of only what is necessary
        assert_eq!(2u8, tx.inputs().get(0).transaction_id().0[0]);
        assert_eq!(3u8, tx.inputs().get(1).transaction_id().0[0]);
        assert_eq!(1u8, tx.inputs().get(2).transaction_id().0[0]);
    }

    #[ignore]
    #[test]
    fn tx_builder_cip2_largest_first_static_fees() {
        // we have a = 0 so we know adding inputs/outputs doesn't change the fee so we can analyze more
        let mut tx_builder = create_tx_builder_with_fee(&create_linear_fee(0, 0));
        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(
                        &Address::from_bech32(
                            "addr1vyy6nhfyks7wdu3dudslys37v252w2nwhv0fw2nfawemmnqs6l44z",
                        )
                        .unwrap(),
                    )
                    .next()
                    .unwrap()
                    .with_coin(&to_bignum(1200))
                    .build()
                    .unwrap(),
            )
            .unwrap();
        let mut available_inputs = TransactionUnspentOutputs::new();
        available_inputs.add(&make_input(0u8, Value::new(&to_bignum(150))));
        available_inputs.add(&make_input(1u8, Value::new(&to_bignum(200))));
        available_inputs.add(&make_input(2u8, Value::new(&to_bignum(800))));
        available_inputs.add(&make_input(3u8, Value::new(&to_bignum(400))));
        available_inputs.add(&make_input(4u8, Value::new(&to_bignum(100))));
        let change_addr = ByronAddress::from_base58(
            "Ae2tdPwUPEZGUEsuMAhvDcy94LKsZxDjCbgaiBBMgYpR8sKf96xJmit7Eho",
        )
        .unwrap()
        .to_address();
        tx_builder
            .add_inputs_from(
                &available_inputs,
                &change_addr,
                &[200, 1000, 1500, 800, 800, 5000],
            )
            .unwrap();
        tx_builder.balance(&change_addr, None).unwrap();
        let tx = tx_builder.build().unwrap();
        // change not needed - should be exact
        assert_eq!(1, tx.outputs().len());
        assert_eq!(2, tx.inputs().len());
        // confirm order of only what is necessary
        assert_eq!(2u8, tx.inputs().get(0).transaction_id().0[0]);
        assert_eq!(3u8, tx.inputs().get(1).transaction_id().0[0]);
    }

    #[ignore = "new coin selection used"]
    #[test]
    fn tx_builder_cip2_largest_first_multiasset() {
        // we have a = 0 so we know adding inputs/outputs doesn't change the fee so we can analyze more
        let mut tx_builder = create_tx_builder_with_fee(&create_linear_fee(0, 0));
        let pid1 = PolicyID::from([1u8; 28]);
        let pid2 = PolicyID::from([2u8; 28]);
        let asset_name1 = AssetName::new(vec![1u8; 8]).unwrap();
        let asset_name2 = AssetName::new(vec![2u8; 11]).unwrap();
        let asset_name3 = AssetName::new(vec![3u8; 9]).unwrap();

        let mut output_value = Value::new(&to_bignum(415));
        let mut output_ma = MultiAsset::new();
        output_ma.set_asset(&pid1, &asset_name1, to_bignum(5));
        output_ma.set_asset(&pid1, &asset_name2, to_bignum(1));
        output_ma.set_asset(&pid2, &asset_name2, to_bignum(2));
        output_ma.set_asset(&pid2, &asset_name3, to_bignum(4));
        output_value.set_multiasset(&output_ma);
        tx_builder
            .add_output(&TransactionOutput::new(
                &Address::from_bech32("addr1vyy6nhfyks7wdu3dudslys37v252w2nwhv0fw2nfawemmnqs6l44z")
                    .unwrap(),
                &output_value,
            ))
            .unwrap();

        let mut available_inputs = TransactionUnspentOutputs::new();
        // should not be taken
        available_inputs.add(&make_input(0u8, Value::new(&to_bignum(150))));

        // should not be taken
        let mut input1 = make_input(1u8, Value::new(&to_bignum(200)));
        let mut ma1 = MultiAsset::new();
        ma1.set_asset(&pid1, &asset_name1, to_bignum(10));
        ma1.set_asset(&pid1, &asset_name2, to_bignum(1));
        ma1.set_asset(&pid2, &asset_name2, to_bignum(2));
        input1.output.amount.set_multiasset(&ma1);
        available_inputs.add(&input1);

        // taken first to satisfy pid1:asset_name1 (but also satisfies pid2:asset_name3)
        let mut input2 = make_input(2u8, Value::new(&to_bignum(10)));
        let mut ma2 = MultiAsset::new();
        ma2.set_asset(&pid1, &asset_name1, to_bignum(20));
        ma2.set_asset(&pid2, &asset_name3, to_bignum(4));
        input2.output.amount.set_multiasset(&ma2);
        available_inputs.add(&input2);

        // taken second to satisfy pid1:asset_name2 (but also satisfies pid2:asset_name1)
        let mut input3 = make_input(3u8, Value::new(&to_bignum(50)));
        let mut ma3 = MultiAsset::new();
        ma3.set_asset(&pid2, &asset_name1, to_bignum(5));
        ma3.set_asset(&pid1, &asset_name2, to_bignum(15));
        input3.output.amount.multiasset = Some(ma3);
        available_inputs.add(&input3);

        // should not be taken either
        let mut input4 = make_input(4u8, Value::new(&to_bignum(10)));
        let mut ma4 = MultiAsset::new();
        ma4.set_asset(&pid1, &asset_name1, to_bignum(10));
        ma4.set_asset(&pid1, &asset_name2, to_bignum(10));
        input4.output.amount.multiasset = Some(ma4);
        available_inputs.add(&input4);

        // taken third to satisfy pid2:asset_name_2
        let mut input5 = make_input(5u8, Value::new(&to_bignum(10)));
        let mut ma5 = MultiAsset::new();
        ma5.set_asset(&pid1, &asset_name2, to_bignum(10));
        ma5.set_asset(&pid2, &asset_name2, to_bignum(3));
        input5.output.amount.multiasset = Some(ma5);
        available_inputs.add(&input5);

        // should be taken to get enough ADA
        let input6 = make_input(6u8, Value::new(&to_bignum(400)));
        available_inputs.add(&input6);

        // should not be taken
        available_inputs.add(&make_input(7u8, Value::new(&to_bignum(100))));
        let change_addr = ByronAddress::from_base58(
            "Ae2tdPwUPEZGUEsuMAhvDcy94LKsZxDjCbgaiBBMgYpR8sKf96xJmit7Eho",
        )
        .unwrap()
        .to_address();
        tx_builder
            .add_inputs_from(
                &available_inputs,
                &change_addr,
                &[200, 1000, 1500, 800, 800, 5000],
            )
            .unwrap();
        tx_builder.balance(&change_addr, None).unwrap();
        let tx = tx_builder.build().unwrap();

        assert_eq!(2, tx.outputs().len());
        assert_eq!(4, tx.inputs().len());
        // check order expected per-asset
        assert_eq!(2u8, tx.inputs().get(0).transaction_id().0[0]);
        assert_eq!(3u8, tx.inputs().get(1).transaction_id().0[0]);
        assert_eq!(5u8, tx.inputs().get(2).transaction_id().0[0]);
        assert_eq!(6u8, tx.inputs().get(3).transaction_id().0[0]);

        let change = tx.outputs().get(1).amount;
        assert_eq!(from_bignum(&change.coin), 55);
        let change_ma = change.multiasset().unwrap();
        assert_eq!(15, from_bignum(&change_ma.get_asset(&pid1, &asset_name1)));
        assert_eq!(24, from_bignum(&change_ma.get_asset(&pid1, &asset_name2)));
        assert_eq!(1, from_bignum(&change_ma.get_asset(&pid2, &asset_name2)));
        assert_eq!(0, from_bignum(&change_ma.get_asset(&pid2, &asset_name3)));
        let expected_input = input2
            .output
            .amount
            .checked_add(&input3.output.amount)
            .unwrap()
            .checked_add(&input5.output.amount)
            .unwrap()
            .checked_add(&input6.output.amount)
            .unwrap();
        let expected_change = expected_input.checked_sub(&output_value).unwrap();
        assert_eq!(expected_change, change);
    }

    #[test]
    fn tx_builder_cip2_random_improve_multiasset() {
        let linear_fee = LinearFee::new(&to_bignum(0), &to_bignum(0));
        let mut tx_builder = create_tx_builder_with_fee(&create_linear_fee(0, 0));
        let pid1 = PolicyID::from([1u8; 28]);
        let pid2 = PolicyID::from([2u8; 28]);
        let asset_name1 = AssetName::new(vec![1u8; 8]).unwrap();
        let asset_name2 = AssetName::new(vec![2u8; 11]).unwrap();
        let asset_name3 = AssetName::new(vec![3u8; 9]).unwrap();

        let mut output_value = Value::new(&to_bignum(415));
        let mut output_ma = MultiAsset::new();
        output_ma.set_asset(&pid1, &asset_name1, to_bignum(5));
        output_ma.set_asset(&pid1, &asset_name2, to_bignum(1));
        output_ma.set_asset(&pid2, &asset_name2, to_bignum(2));
        output_ma.set_asset(&pid2, &asset_name3, to_bignum(4));
        output_value.set_multiasset(&output_ma);
        tx_builder
            .add_output(&TransactionOutput::new(
                &Address::from_bech32("addr1vyy6nhfyks7wdu3dudslys37v252w2nwhv0fw2nfawemmnqs6l44z")
                    .unwrap(),
                &output_value,
            ))
            .unwrap();

        let mut available_inputs = TransactionUnspentOutputs::new();
        available_inputs.add(&make_input(0u8, Value::new(&to_bignum(1000))));

        let mut input1 = make_input(1u8, Value::new(&to_bignum(200)));
        let mut ma1 = MultiAsset::new();
        ma1.set_asset(&pid1, &asset_name1, to_bignum(10));
        ma1.set_asset(&pid1, &asset_name2, to_bignum(1));
        ma1.set_asset(&pid2, &asset_name2, to_bignum(2));
        input1.output.amount.set_multiasset(&ma1);
        available_inputs.add(&input1);

        let mut input2 = make_input(2u8, Value::new(&to_bignum(10)));
        let mut ma2 = MultiAsset::new();
        ma2.set_asset(&pid1, &asset_name1, to_bignum(20));
        ma2.set_asset(&pid2, &asset_name3, to_bignum(4));
        input2.output.amount.set_multiasset(&ma2);
        available_inputs.add(&input2);

        let mut input3 = make_input(3u8, Value::new(&to_bignum(50)));
        let mut ma3 = MultiAsset::new();
        ma3.set_asset(&pid2, &asset_name1, to_bignum(5));
        ma3.set_asset(&pid1, &asset_name2, to_bignum(15));
        input3.output.amount.multiasset = Some(ma3);
        available_inputs.add(&input3);

        let mut input4 = make_input(4u8, Value::new(&to_bignum(10)));
        let mut ma4 = MultiAsset::new();
        ma4.set_asset(&pid1, &asset_name1, to_bignum(10));
        ma4.set_asset(&pid1, &asset_name2, to_bignum(10));
        input4.output.amount.multiasset = Some(ma4);
        available_inputs.add(&input4);

        let mut input5 = make_input(5u8, Value::new(&to_bignum(10)));
        let mut ma5 = MultiAsset::new();
        ma5.set_asset(&pid1, &asset_name2, to_bignum(10));
        ma5.set_asset(&pid2, &asset_name2, to_bignum(3));
        input5.output.amount.multiasset = Some(ma5);
        available_inputs.add(&input5);

        let input6 = make_input(6u8, Value::new(&to_bignum(400)));
        available_inputs.add(&input6);
        available_inputs.add(&make_input(7u8, Value::new(&to_bignum(100))));

        let mut input8 = make_input(8u8, Value::new(&to_bignum(10)));
        let mut ma8 = MultiAsset::new();
        ma8.set_asset(&pid2, &asset_name2, to_bignum(10));
        input8.output.amount.multiasset = Some(ma8);
        available_inputs.add(&input8);

        let mut input9 = make_input(9u8, Value::new(&to_bignum(10)));
        let mut ma9 = MultiAsset::new();
        ma9.set_asset(&pid2, &asset_name3, to_bignum(10));
        input9.output.amount.multiasset = Some(ma9);
        available_inputs.add(&input9);

        let change_addr = ByronAddress::from_base58(
            "Ae2tdPwUPEZGUEsuMAhvDcy94LKsZxDjCbgaiBBMgYpR8sKf96xJmit7Eho",
        )
        .unwrap()
        .to_address();
        tx_builder
            .add_inputs_from(
                &available_inputs,
                &change_addr,
                &[200, 1000, 1500, 800, 800, 5000],
            )
            .unwrap();
        tx_builder.balance(&change_addr, None).unwrap();
        let tx = tx_builder.build().unwrap();

        assert_eq!(3, tx.outputs().len());

        let input_total = tx_builder.get_explicit_input().unwrap();
        assert!(input_total >= output_value);
    }

    #[test]
    fn tx_builder_cip2_random_improve() {
        // we have a = 1 to test increasing fees when more inputs are added
        let mut tx_builder = create_tx_builder_with_fee(&create_linear_fee(1, 0));
        const COST: u64 = 10000;
        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(
                        &Address::from_bech32(
                            "addr1vyy6nhfyks7wdu3dudslys37v252w2nwhv0fw2nfawemmnqs6l44z",
                        )
                        .unwrap(),
                    )
                    .next()
                    .unwrap()
                    .with_coin(&to_bignum(COST))
                    .build()
                    .unwrap(),
            )
            .unwrap();
        let mut available_inputs = TransactionUnspentOutputs::new();
        available_inputs.add(&make_input(0u8, Value::new(&to_bignum(1500))));
        available_inputs.add(&make_input(1u8, Value::new(&to_bignum(2000))));
        available_inputs.add(&make_input(2u8, Value::new(&to_bignum(8000))));
        available_inputs.add(&make_input(3u8, Value::new(&to_bignum(4000))));
        available_inputs.add(&make_input(4u8, Value::new(&to_bignum(1000))));
        available_inputs.add(&make_input(5u8, Value::new(&to_bignum(2000))));
        available_inputs.add(&make_input(6u8, Value::new(&to_bignum(1500))));
        let change_addr = ByronAddress::from_base58(
            "Ae2tdPwUPEZGUEsuMAhvDcy94LKsZxDjCbgaiBBMgYpR8sKf96xJmit7Eho",
        )
        .unwrap()
        .to_address();
        let add_inputs_res = tx_builder.add_inputs_from(
            &available_inputs,
            &change_addr,
            &[200, 1000, 1500, 800, 800, 5000],
        );
        assert!(add_inputs_res.is_ok(), "{:?}", add_inputs_res.err());
        tx_builder.balance(&change_addr, None).unwrap();
        let tx_build_res = tx_builder.build();
        assert!(tx_build_res.is_ok(), "{:?}", tx_build_res.err());
        let tx = tx_build_res.unwrap();
        // we need to look up the values to ensure there's enough
        let mut input_values = BTreeMap::new();
        for utxo in available_inputs.0.iter() {
            input_values.insert(utxo.input.transaction_id(), utxo.output.amount.clone());
        }
        let mut encountered = std::collections::HashSet::new();
        let mut input_total = Value::new(&Coin::zero());
        for input in tx.inputs.0.iter() {
            let txid = input.transaction_id();
            if !encountered.insert(txid.clone()) {
                panic!("Input {:?} duplicated", txid);
            }
            let value = input_values.get(&txid).unwrap();
            input_total = input_total.checked_add(value).unwrap();
        }
        assert!(
            input_total
                >= Value::new(
                    &tx_builder
                        .min_fee()
                        .unwrap()
                        .checked_add(&to_bignum(COST))
                        .unwrap()
                )
        );
    }

    #[test]
    fn tx_builder_cip2_random_improve_when_using_all_available_inputs() {
        // we have a = 1 to test increasing fees when more inputs are added
        let linear_fee = LinearFee::new(&to_bignum(1), &to_bignum(0));
        let cfg = TransactionBuilderConfigBuilder::new()
            .fee_algo(&linear_fee)
            .pool_deposit(&to_bignum(0))
            .key_deposit(&to_bignum(0))
            .max_value_size(9999)
            .max_tx_size(9999)
            .coins_per_utxo_byte(&Coin::zero())
            .ex_unit_prices(&ExUnitPrices::from_float(0.0, 0.0))
            .collateral_percentage(150)
            .max_collateral_inputs(3)
            .build()
            .unwrap();
        let mut tx_builder = TransactionBuilder::new(&cfg);
        const COST: u64 = 1000;
        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(
                        &Address::from_bech32(
                            "addr1vyy6nhfyks7wdu3dudslys37v252w2nwhv0fw2nfawemmnqs6l44z",
                        )
                        .unwrap(),
                    )
                    .next()
                    .unwrap()
                    .with_coin(&to_bignum(COST))
                    .build()
                    .unwrap(),
            )
            .unwrap();
        let mut available_inputs = TransactionUnspentOutputs::new();
        available_inputs.add(&make_input(1u8, Value::new(&to_bignum(800))));
        available_inputs.add(&make_input(2u8, Value::new(&to_bignum(800))));
        let add_inputs_res = tx_builder.add_inputs_from(
            &available_inputs,
            &Address::from_bech32("addr1vyy6nhfyks7wdu3dudslys37v252w2nwhv0fw2nfawemmnqs6l44z")
                .unwrap(),
            &[200, 1000, 1500, 800, 800, 5000],
        );
        assert!(add_inputs_res.is_ok(), "{:?}", add_inputs_res.err());
    }

    #[ignore]
    #[test]
    fn tx_builder_cip2_random_improve_adds_enough_for_fees() {
        // we have a = 1 to test increasing fees when more inputs are added
        let linear_fee = LinearFee::new(&to_bignum(1), &to_bignum(0));
        let cfg = TransactionBuilderConfigBuilder::new()
            .fee_algo(&linear_fee)
            .pool_deposit(&to_bignum(0))
            .key_deposit(&to_bignum(0))
            .max_value_size(9999)
            .max_tx_size(9999)
            .coins_per_utxo_byte(&Coin::zero())
            .ex_unit_prices(&ExUnitPrices::from_float(0.0, 0.0))
            .collateral_percentage(150)
            .max_collateral_inputs(3)
            .build()
            .unwrap();
        let mut tx_builder = TransactionBuilder::new(&cfg);
        const COST: u64 = 100;
        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(
                        &Address::from_bech32(
                            "addr1vyy6nhfyks7wdu3dudslys37v252w2nwhv0fw2nfawemmnqs6l44z",
                        )
                        .unwrap(),
                    )
                    .next()
                    .unwrap()
                    .with_coin(&to_bignum(COST))
                    .build()
                    .unwrap(),
            )
            .unwrap();
        assert_eq!(tx_builder.min_fee().unwrap(), to_bignum(53));
        let mut available_inputs = TransactionUnspentOutputs::new();
        available_inputs.add(&make_input(1u8, Value::new(&to_bignum(150))));
        available_inputs.add(&make_input(2u8, Value::new(&to_bignum(150))));
        available_inputs.add(&make_input(3u8, Value::new(&to_bignum(150))));
        let change_addr = ByronAddress::from_base58(
            "Ae2tdPwUPEZGUEsuMAhvDcy94LKsZxDjCbgaiBBMgYpR8sKf96xJmit7Eho",
        )
        .unwrap()
        .to_address();
        let add_inputs_res = tx_builder.add_inputs_from(
            &available_inputs,
            &change_addr,
            &[200, 1000, 1500, 800, 800, 5000],
        );
        assert!(add_inputs_res.is_ok(), "{:?}", add_inputs_res.err());
        assert_eq!(tx_builder.min_fee().unwrap(), to_bignum(264));
        tx_builder.balance(&change_addr, None);
    }

    #[test]
    fn build_tx_pay_to_multisig() {
        let mut tx_builder = create_tx_builder_with_fee(&create_linear_fee(10, 2));
        let spend = root_key_15()
            .derive(harden(1854))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(0)
            .derive(0)
            .to_public();

        let stake = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(2)
            .derive(0)
            .to_public();

        let spend_cred = StakeCredential::from_keyhash(&spend.to_raw_key().hash());
        let stake_cred = StakeCredential::from_keyhash(&stake.to_raw_key().hash());

        let addr_net_0 = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &spend_cred,
            &stake_cred,
        )
        .to_address();

        tx_builder.add_input(
            &TransactionUnspentOutput::new(
                &TransactionInput::new(&genesis_id(), &0.into()),
                &TransactionOutput::new(
                    &EnterpriseAddress::new(
                        NetworkInfo::testnet().network_id(),
                        &StakeCredential::from_keyhash(&spend.to_raw_key().hash()),
                    )
                    .to_address(),
                    &Value::new(&to_bignum(1_000_000)),
                ),
            ),
            None,
        );
        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&addr_net_0)
                    .next()
                    .unwrap()
                    .with_coin(&to_bignum(999_000))
                    .build()
                    .unwrap(),
            )
            .unwrap();
        tx_builder.set_ttl(&1000.into());
        tx_builder.set_fee(&to_bignum(1_000));

        assert_eq!(
            tx_builder
                .outputs
                .0
                .iter()
                .chain(tx_builder.change_outputs.0.iter())
                .collect_vec()
                .len(),
            1
        );
        assert_eq!(
            tx_builder
                .get_explicit_input()
                .unwrap()
                .checked_add(&tx_builder.get_implicit_input().unwrap())
                .unwrap(),
            tx_builder
                .get_explicit_output()
                .unwrap()
                .checked_add(&Value::new(&tx_builder.get_fee_if_set().unwrap()))
                .unwrap()
        );

        let _final_tx = tx_builder.build().unwrap();
        let _deser_t = TransactionBody::from_bytes(_final_tx.to_bytes()).unwrap();

        assert_eq!(_deser_t.to_bytes(), _final_tx.to_bytes());
    }

    fn build_full_tx(
        body: &TransactionBody,
        witness_set: &TransactionWitnessSet,
        auxiliary_data: Option<AuxiliaryData>,
    ) -> Transaction {
        return Transaction::new(body, witness_set, auxiliary_data);
    }

    #[test]
    fn build_tx_multisig_spend_1on1_unsigned() {
        let mut tx_builder = create_tx_builder_with_fee(&create_linear_fee(10, 2));

        let spend = root_key_15() //multisig
            .derive(harden(1854))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(0)
            .derive(0)
            .to_public();
        let stake = root_key_15() //multisig
            .derive(harden(1854))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(2)
            .derive(0)
            .to_public();

        let change_key = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(1)
            .derive(0)
            .to_public();

        let spend_cred = StakeCredential::from_keyhash(&spend.to_raw_key().hash());
        let stake_cred = StakeCredential::from_keyhash(&stake.to_raw_key().hash());
        let change_cred = StakeCredential::from_keyhash(&change_key.to_raw_key().hash());
        let addr_multisig = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &spend_cred,
            &stake_cred,
        )
        .to_address();
        let addr_output = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &change_cred,
            &stake_cred,
        )
        .to_address();

        tx_builder.add_input(
            &TransactionUnspentOutput::new(
                &TransactionInput::new(&genesis_id(), &0.into()),
                &TransactionOutput::new(&addr_multisig, &Value::new(&to_bignum(1_000_000))),
            ),
            None,
        );

        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&addr_output)
                    .next()
                    .unwrap()
                    .with_coin(&to_bignum(999_000))
                    .build()
                    .unwrap(),
            )
            .unwrap();
        tx_builder.set_ttl(&1000.into());
        tx_builder.set_fee(&to_bignum(1_000));

        let mut auxiliary_data = AuxiliaryData::new();
        let mut pubkey_native_scripts = NativeScripts::new();
        let mut oneof_native_scripts = NativeScripts::new();

        let spending_hash = spend.to_raw_key().hash();
        pubkey_native_scripts.add(&NativeScript::new_script_pubkey(&ScriptPubkey::new(
            &spending_hash,
        )));
        oneof_native_scripts.add(&NativeScript::new_script_n_of_k(&ScriptNOfK::new(
            1,
            &pubkey_native_scripts,
        )));
        auxiliary_data.set_native_scripts(&oneof_native_scripts);
        tx_builder.set_auxiliary_data(&auxiliary_data);

        assert_eq!(
            tx_builder
                .outputs
                .0
                .iter()
                .chain(tx_builder.change_outputs.0.iter())
                .collect_vec()
                .len(),
            1
        );
        assert_eq!(
            tx_builder
                .get_explicit_input()
                .unwrap()
                .checked_add(&tx_builder.get_implicit_input().unwrap())
                .unwrap(),
            tx_builder
                .get_explicit_output()
                .unwrap()
                .checked_add(&Value::new(&tx_builder.get_fee_if_set().unwrap()))
                .unwrap()
        );

        let _final_tx = tx_builder.build().unwrap();
        let _deser_t = TransactionBody::from_bytes(_final_tx.to_bytes()).unwrap();

        assert_eq!(_deser_t.to_bytes(), _final_tx.to_bytes());
        assert_eq!(
            _deser_t.auxiliary_data_hash.unwrap(),
            utils::hash_auxiliary_data(&auxiliary_data)
        );
    }

    #[test]
    fn build_tx_multisig_1on1_signed() {
        let mut tx_builder = create_tx_builder_with_fee(&create_linear_fee(10, 2));
        let spend = root_key_15()
            .derive(harden(1854)) //multisig
            .derive(harden(1815))
            .derive(harden(0))
            .derive(0)
            .derive(0)
            .to_public();
        let stake = root_key_15()
            .derive(harden(1854)) //multisig
            .derive(harden(1815))
            .derive(harden(0))
            .derive(2)
            .derive(0)
            .to_public();

        let spend_cred = StakeCredential::from_keyhash(&spend.to_raw_key().hash());
        let stake_cred = StakeCredential::from_keyhash(&stake.to_raw_key().hash());
        let addr_net_0 = BaseAddress::new(
            NetworkInfo::testnet().network_id(),
            &spend_cred,
            &stake_cred,
        )
        .to_address();
        tx_builder.add_input(
            &TransactionUnspentOutput::new(
                &TransactionInput::new(&genesis_id(), &0.into()),
                &TransactionOutput::new(
                    &EnterpriseAddress::new(
                        NetworkInfo::network_id(&NetworkInfo::testnet()),
                        &StakeCredential::from_keyhash(&spend.to_raw_key().hash()),
                    )
                    .to_address(),
                    &Value::new(&to_bignum(1_000_000)),
                ),
            ),
            None,
        );
        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&addr_net_0)
                    .next()
                    .unwrap()
                    .with_coin(&to_bignum(999_000))
                    .build()
                    .unwrap(),
            )
            .unwrap();
        tx_builder.set_ttl(&1000.into());
        tx_builder.set_fee(&to_bignum(1_000));

        let mut auxiliary_data = AuxiliaryData::new();
        let mut pubkey_native_scripts = NativeScripts::new();
        let mut oneof_native_scripts = NativeScripts::new();

        let spending_hash = spend.to_raw_key().hash();
        pubkey_native_scripts.add(&NativeScript::new_script_pubkey(&ScriptPubkey::new(
            &spending_hash,
        )));
        oneof_native_scripts.add(&NativeScript::new_script_n_of_k(&ScriptNOfK::new(
            1,
            &pubkey_native_scripts,
        )));
        auxiliary_data.set_native_scripts(&oneof_native_scripts);
        tx_builder.set_auxiliary_data(&auxiliary_data);

        let body = tx_builder.build().unwrap();

        assert_eq!(
            tx_builder
                .outputs
                .0
                .iter()
                .chain(tx_builder.change_outputs.0.iter())
                .collect_vec()
                .len(),
            1
        );
        assert_eq!(
            tx_builder
                .get_explicit_input()
                .unwrap()
                .checked_add(&tx_builder.get_implicit_input().unwrap())
                .unwrap(),
            tx_builder
                .get_explicit_output()
                .unwrap()
                .checked_add(&Value::new(&tx_builder.get_fee_if_set().unwrap()))
                .unwrap()
        );

        let mut witness_set = TransactionWitnessSet::new();
        let mut vkw = Vkeywitnesses::new();
        vkw.add(&make_vkey_witness(
            &hash_transaction(&body),
            &PrivateKey::from_normal_bytes(
                &hex::decode("c660e50315d76a53d80732efda7630cae8885dfb85c46378684b3c6103e1284a")
                    .unwrap(),
            )
            .unwrap(),
        ));
        witness_set.set_vkeys(&vkw);

        let _final_tx = build_full_tx(&body, &witness_set, None);
        let _deser_t = Transaction::from_bytes(_final_tx.to_bytes()).unwrap();
        assert_eq!(_deser_t.to_bytes(), _final_tx.to_bytes());
        assert_eq!(
            _deser_t.body().auxiliary_data_hash.unwrap(),
            utils::hash_auxiliary_data(&auxiliary_data)
        );
    }

    #[test]
    fn add_change_splits_change_into_multiple_outputs_when_nfts_overflow_output_size() {
        let linear_fee = LinearFee::new(&to_bignum(0), &to_bignum(1));
        let max_value_size = 100; // super low max output size to test with fewer assets
        let mut tx_builder = TransactionBuilder::new(
            &TransactionBuilderConfigBuilder::new()
                .fee_algo(&linear_fee)
                .pool_deposit(&to_bignum(0))
                .key_deposit(&to_bignum(0))
                .max_value_size(max_value_size)
                .max_tx_size(MAX_TX_SIZE)
                .coins_per_utxo_byte(&to_bignum(1))
                .ex_unit_prices(&ExUnitPrices::from_float(0.0, 0.0))
                .collateral_percentage(150)
                .max_collateral_inputs(3)
                .build()
                .unwrap(),
        );

        let policy_id = PolicyID::from([0u8; 28]);
        let names = [
            AssetName::new(vec![99u8; 32]).unwrap(),
            AssetName::new(vec![0u8, 1, 2, 3]).unwrap(),
            AssetName::new(vec![4u8, 5, 6, 7]).unwrap(),
            AssetName::new(vec![5u8, 5, 6, 7]).unwrap(),
            AssetName::new(vec![6u8, 5, 6, 7]).unwrap(),
        ];
        let assets = names.iter().fold(Assets::new(), |mut a, name| {
            a.insert(&name, &to_bignum(500));
            a
        });
        let mut multiasset = MultiAsset::new();
        multiasset.insert(&policy_id, &assets);

        let mut input_value = Value::new(&to_bignum(780));
        input_value.set_multiasset(&multiasset);

        tx_builder.add_input(
            &TransactionUnspentOutput::new(
                &TransactionInput::new(&genesis_id(), &0.into()),
                &TransactionOutput::new(
                    &ByronAddress::from_base58(
                        "Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3",
                    )
                    .unwrap()
                    .to_address(),
                    &input_value,
                ),
            ),
            None,
        );

        let output_addr = ByronAddress::from_base58(
            "Ae2tdPwUPEZD9QQf2ZrcYV34pYJwxK4vqXaF8EXkup1eYH73zUScHReM42b",
        )
        .unwrap()
        .to_address();
        let output_amount = Value::new(&to_bignum(0));

        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&output_addr)
                    .next()
                    .unwrap()
                    .with_value(&output_amount)
                    .build()
                    .unwrap(),
            )
            .unwrap();

        let change_addr = ByronAddress::from_base58(
            "Ae2tdPwUPEZGUEsuMAhvDcy94LKsZxDjCbgaiBBMgYpR8sKf96xJmit7Eho",
        )
        .unwrap()
        .to_address();

        tx_builder.balance(&change_addr, None).unwrap();
        assert_eq!(
            tx_builder
                .outputs
                .0
                .iter()
                .chain(tx_builder.change_outputs.0.iter())
                .collect_vec()
                .len(),
            3
        );

        let total_outputs = tx_builder
            .outputs
            .0
            .iter()
            .chain(tx_builder.change_outputs.0.iter())
            .collect_vec();

        let change1 = total_outputs.get(1).unwrap().clone();
        let change2 = total_outputs.get(2).unwrap().clone();

        assert_eq!(change1.address, change_addr);
        assert_eq!(change1.address, change2.address);

        assert_eq!(change1.amount.coin, to_bignum(274));
        assert_eq!(change2.amount.coin, to_bignum(297));

        assert!(change1.amount.multiasset.is_some());
        assert!(change2.amount.multiasset.is_some());

        let masset1 = change1.amount.multiasset.clone().unwrap();
        let masset2 = change2.amount.multiasset.clone().unwrap();

        assert_eq!(masset1.keys().len(), 1);
        assert_eq!(masset1.keys(), masset2.keys());

        let asset1 = masset1.get(&policy_id).unwrap();
        let asset2 = masset2.get(&policy_id).unwrap();
        assert_eq!(asset1.len(), 4);
        assert_eq!(asset2.len(), 1);

        names.iter().for_each(|name| {
            let v1 = asset1.get(name);
            let v2 = asset2.get(name);
            assert_ne!(v1.is_some(), v2.is_some());
            assert_eq!(v1.or(v2).unwrap(), to_bignum(500));
        });
    }

    fn create_json_metadatum_string() -> String {
        String::from("{ \"qwe\": 123 }")
    }

    fn create_json_metadatum() -> TransactionMetadatum {
        encode_json_str_to_metadatum(
            create_json_metadatum_string(),
            MetadataJsonSchema::NoConversions,
        )
        .unwrap()
    }

    fn create_aux_with_metadata(metadatum_key: &TransactionMetadatumLabel) -> AuxiliaryData {
        let mut metadata = GeneralTransactionMetadata::new();
        metadata.insert(metadatum_key, &create_json_metadatum());

        let mut aux = AuxiliaryData::new();
        aux.set_metadata(&metadata);

        let mut nats = NativeScripts::new();
        nats.add(&NativeScript::new_timelock_start(&TimelockStart::new(
            &123.into(),
        )));
        aux.set_native_scripts(&nats);

        return aux;
    }

    fn assert_json_metadatum(dat: &TransactionMetadatum) {
        let map = dat.as_map().unwrap();
        assert_eq!(map.len(), 1);
        let key = TransactionMetadatum::new_text(String::from("qwe")).unwrap();
        let val = map.get(&key).unwrap();
        assert_eq!(val.as_int().unwrap(), Int::new_i32(123));
    }

    #[test]
    fn set_metadata_with_empty_auxiliary() {
        let mut tx_builder = create_default_tx_builder();

        let num = to_bignum(42);
        tx_builder.set_metadata(&create_aux_with_metadata(&num).metadata().unwrap());

        assert!(tx_builder.auxiliary_data.is_some());

        let aux = tx_builder.auxiliary_data.unwrap();
        assert!(aux.metadata().is_some());
        assert!(aux.native_scripts().is_none());
        assert!(aux.plutus_scripts().is_none());

        let met = aux.metadata().unwrap();

        assert_eq!(met.len(), 1);
        assert_json_metadatum(&met.get(&num).unwrap());
    }

    #[test]
    fn set_metadata_with_existing_auxiliary() {
        let mut tx_builder = create_default_tx_builder();

        let num1 = to_bignum(42);
        tx_builder.set_auxiliary_data(&create_aux_with_metadata(&num1));

        let num2 = to_bignum(84);
        tx_builder.set_metadata(&create_aux_with_metadata(&num2).metadata().unwrap());

        let aux = tx_builder.auxiliary_data.unwrap();
        assert!(aux.metadata().is_some());
        assert!(aux.native_scripts().is_some());
        assert!(aux.plutus_scripts().is_none());

        let met = aux.metadata().unwrap();
        assert_eq!(met.len(), 1);
        assert!(met.get(&num1).is_none());
        assert_json_metadatum(&met.get(&num2).unwrap());
    }

    #[test]
    fn add_metadatum_with_empty_auxiliary() {
        let mut tx_builder = create_default_tx_builder();

        let num = to_bignum(42);
        tx_builder.add_metadatum(&num, &create_json_metadatum());

        assert!(tx_builder.auxiliary_data.is_some());

        let aux = tx_builder.auxiliary_data.unwrap();
        assert!(aux.metadata().is_some());
        assert!(aux.native_scripts().is_none());
        assert!(aux.plutus_scripts().is_none());

        let met = aux.metadata().unwrap();

        assert_eq!(met.len(), 1);
        assert_json_metadatum(&met.get(&num).unwrap());
    }

    #[test]
    fn add_metadatum_with_existing_auxiliary() {
        let mut tx_builder = create_default_tx_builder();

        let num1 = to_bignum(42);
        tx_builder.set_auxiliary_data(&create_aux_with_metadata(&num1));

        let num2 = to_bignum(84);
        tx_builder.add_metadatum(&num2, &create_json_metadatum());

        let aux = tx_builder.auxiliary_data.unwrap();
        assert!(aux.metadata().is_some());
        assert!(aux.native_scripts().is_some());
        assert!(aux.plutus_scripts().is_none());

        let met = aux.metadata().unwrap();
        assert_eq!(met.len(), 2);
        assert_json_metadatum(&met.get(&num1).unwrap());
        assert_json_metadatum(&met.get(&num2).unwrap());
    }

    #[test]
    fn add_json_metadatum_with_empty_auxiliary() {
        let mut tx_builder = create_default_tx_builder();

        let num = to_bignum(42);
        tx_builder
            .add_json_metadatum(&num, create_json_metadatum_string())
            .unwrap();

        assert!(tx_builder.auxiliary_data.is_some());

        let aux = tx_builder.auxiliary_data.unwrap();
        assert!(aux.metadata().is_some());
        assert!(aux.native_scripts().is_none());
        assert!(aux.plutus_scripts().is_none());

        let met = aux.metadata().unwrap();

        assert_eq!(met.len(), 1);
        assert_json_metadatum(&met.get(&num).unwrap());
    }

    #[test]
    fn add_json_metadatum_with_existing_auxiliary() {
        let mut tx_builder = create_default_tx_builder();

        let num1 = to_bignum(42);
        tx_builder.set_auxiliary_data(&create_aux_with_metadata(&num1));

        let num2 = to_bignum(84);
        tx_builder
            .add_json_metadatum(&num2, create_json_metadatum_string())
            .unwrap();

        let aux = tx_builder.auxiliary_data.unwrap();
        assert!(aux.metadata().is_some());
        assert!(aux.native_scripts().is_some());
        assert!(aux.plutus_scripts().is_none());

        let met = aux.metadata().unwrap();
        assert_eq!(met.len(), 2);
        assert_json_metadatum(&met.get(&num1).unwrap());
        assert_json_metadatum(&met.get(&num2).unwrap());
    }

    fn create_asset_name() -> AssetName {
        AssetName::new(vec![0u8, 1, 2, 3]).unwrap()
    }

    fn create_mint_asset() -> MintAssets {
        MintAssets::new_from_entry(&create_asset_name(), Int::new_i32(1234))
    }

    fn create_assets() -> Assets {
        let mut assets = Assets::new();
        assets.insert(&create_asset_name(), &to_bignum(1234));
        return assets;
    }

    fn create_mint_with_one_asset(policy_id: &PolicyID) -> Mint {
        Mint::new_from_entry(policy_id, &create_mint_asset())
    }

    fn create_multiasset_one_asset(policy_id: &PolicyID) -> MultiAsset {
        let mut mint = MultiAsset::new();
        mint.insert(policy_id, &create_assets());
        return mint;
    }

    fn assert_mint_asset(mint: &Mint, policy_id: &PolicyID) {
        assert!(mint.get(&policy_id).is_some());
        let result_asset = mint.get(&policy_id).unwrap();
        assert_eq!(result_asset.len(), 1);
        assert_eq!(
            result_asset.get(&create_asset_name()).unwrap(),
            Int::new_i32(1234)
        );
    }

    fn mint_script_and_policy_and_hash(x: u8) -> (NativeScript, PolicyID, Ed25519KeyHash) {
        let hash = fake_key_hash(x);
        let mint_script = NativeScript::new_script_pubkey(&ScriptPubkey::new(&hash));
        let policy_id = mint_script.hash(ScriptHashNamespace::NativeScript);
        (mint_script, policy_id, hash)
    }

    fn mint_script_and_policy(x: u8) -> (NativeScript, PolicyID) {
        let (m, p, _) = mint_script_and_policy_and_hash(x);
        (m, p)
    }

    #[test]
    fn set_mint_asset_with_empty_mint() {
        let mut tx_builder = create_default_tx_builder();

        let (mint_script, policy_id) = mint_script_and_policy(0);
        tx_builder.add_mint(
            &policy_id,
            &create_mint_asset(),
            Some(ScriptWitness::new_native_witness(&mint_script)),
        );

        assert!(tx_builder.mint.is_some());
        assert!(tx_builder.native_scripts.is_some());

        let mint = tx_builder.mint().unwrap();
        let mint_scripts = tx_builder.native_scripts.unwrap();

        assert_eq!(mint.len(), 1);
        assert_mint_asset(&mint, &policy_id);

        assert_eq!(mint_scripts.len(), 1);
        assert_eq!(mint_scripts.get(0), mint_script);
    }

    #[test]
    #[ignore]
    fn set_mint_asset_with_existing_mint() {
        // let mut tx_builder = create_default_tx_builder();

        // let (mint_script1, policy_id1) = mint_script_and_policy(0);
        // let (mint_script2, policy_id2) = mint_script_and_policy(1);

        // tx_builder
        //     .set_mint(
        //         &create_mint_with_one_asset(&policy_id1),
        //         &NativeScripts::from(vec![mint_script1.clone()]),
        //     )
        //     .unwrap();

        // tx_builder.set_mint_asset(&mint_script2, &create_mint_asset());

        // assert!(tx_builder.mint.is_some());
        // assert!(tx_builder.native_scripts.is_some());

        // let mint = tx_builder.mint.unwrap();
        // let mint_scripts = tx_builder.native_scripts.unwrap();

        // assert_eq!(mint.len(), 2);
        // assert_mint_asset(&mint, &policy_id1);
        // assert_mint_asset(&mint, &policy_id2);

        // // Only second script is present in the scripts
        // assert_eq!(mint_scripts.len(), 2);
        // assert_eq!(mint_scripts.get(0), mint_script1);
        // assert_eq!(mint_scripts.get(1), mint_script2);
    }

    #[test]
    fn add_mint_asset_with_empty_mint() {
        let mut tx_builder = create_default_tx_builder();

        let (mint_script, policy_id) = mint_script_and_policy(0);

        tx_builder.add_mint(
            &policy_id,
            &MintAssets::new_from_entry(&create_asset_name(), Int::new_i32(1234)),
            Some(ScriptWitness::new_native_witness(&mint_script)),
        );

        assert!(tx_builder.mint.is_some());
        assert!(tx_builder.native_scripts.is_some());

        let mint = tx_builder.mint().unwrap();
        let mint_scripts = tx_builder.native_scripts.unwrap();

        assert_eq!(mint.len(), 1);
        assert_mint_asset(&mint, &policy_id);

        assert_eq!(mint_scripts.len(), 1);
        assert_eq!(mint_scripts.get(0), mint_script);
    }

    #[test]
    #[ignore]
    fn add_mint_asset_with_existing_mint() {
        // let mut tx_builder = create_default_tx_builder();

        // let (mint_script1, policy_id1) = mint_script_and_policy(0);
        // let (mint_script2, policy_id2) = mint_script_and_policy(1);

        // tx_builder
        //     .set_mint(
        //         &create_mint_with_one_asset(&policy_id1),
        //         &NativeScripts::from(vec![mint_script1.clone()]),
        //     )
        //     .unwrap();
        // tx_builder.add_mint_asset(&mint_script2, &create_asset_name(), Int::new_i32(1234));

        // assert!(tx_builder.mint.is_some());
        // assert!(tx_builder.native_scripts.is_some());

        // let mint = tx_builder.mint.unwrap();
        // let mint_scripts = tx_builder.native_scripts.unwrap();

        // assert_eq!(mint.len(), 2);
        // assert_mint_asset(&mint, &policy_id1);
        // assert_mint_asset(&mint, &policy_id2);

        // assert_eq!(mint_scripts.len(), 2);
        // assert_eq!(mint_scripts.get(0), mint_script1);
        // assert_eq!(mint_scripts.get(1), mint_script2);
    }

    #[test]
    fn add_output_amount() {
        let mut tx_builder = create_default_tx_builder();

        let policy_id1 = PolicyID::from([0u8; 28]);
        let multiasset = create_multiasset_one_asset(&policy_id1);
        let mut value = Value::new(&to_bignum(251));
        value.set_multiasset(&multiasset);

        let address = byron_address();
        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&address)
                    .next()
                    .unwrap()
                    .with_value(&value)
                    .build()
                    .unwrap(),
            )
            .unwrap();

        assert_eq!(
            tx_builder
                .outputs
                .0
                .iter()
                .chain(tx_builder.change_outputs.0.iter())
                .collect_vec()
                .len(),
            1
        );
        let out = tx_builder.outputs.get(0);

        assert_eq!(out.address.to_bytes(), address.to_bytes());
        assert_eq!(out.amount, value);
    }

    #[test]
    fn add_output_coin() {
        let mut tx_builder = create_default_tx_builder();

        let address = byron_address();
        let coin = to_bignum(210);
        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&address)
                    .next()
                    .unwrap()
                    .with_coin(&coin)
                    .build()
                    .unwrap(),
            )
            .unwrap();

        assert_eq!(
            tx_builder
                .outputs
                .0
                .iter()
                .chain(tx_builder.change_outputs.0.iter())
                .collect_vec()
                .len(),
            1
        );
        let out = tx_builder.outputs.get(0);

        assert_eq!(out.address.to_bytes(), address.to_bytes());
        assert_eq!(out.amount.coin, coin);
        assert!(out.amount.multiasset.is_none());
    }

    #[test]
    fn add_output_coin_and_multiasset() {
        let mut tx_builder = create_default_tx_builder();

        let policy_id1 = PolicyID::from([0u8; 28]);
        let multiasset = create_multiasset_one_asset(&policy_id1);

        let address = byron_address();
        let coin = to_bignum(251);

        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&address)
                    .next()
                    .unwrap()
                    .with_coin_and_asset(&coin, &multiasset)
                    .build()
                    .unwrap(),
            )
            .unwrap();

        assert_eq!(
            tx_builder
                .outputs
                .0
                .iter()
                .chain(tx_builder.change_outputs.0.iter())
                .collect_vec()
                .len(),
            1
        );
        let out = tx_builder.outputs.get(0);

        assert_eq!(out.address.to_bytes(), address.to_bytes());
        assert_eq!(out.amount.coin, coin);
        assert_eq!(out.amount.multiasset.unwrap(), multiasset);
    }

    #[test]
    fn add_output_asset_and_min_required_coin() {
        let mut tx_builder = create_reallistic_tx_builder();

        let policy_id1 = PolicyID::from([0u8; 28]);
        let multiasset = create_multiasset_one_asset(&policy_id1);

        let address = byron_address();
        tx_builder
            .add_output(
                &TransactionOutputBuilder::new()
                    .with_address(&address)
                    .next()
                    .unwrap()
                    .with_asset_and_min_required_coin(
                        &multiasset,
                        &tx_builder.config.coins_per_utxo_byte,
                    )
                    .unwrap()
                    .build()
                    .unwrap(),
            )
            .unwrap();

        assert_eq!(
            tx_builder
                .outputs
                .0
                .iter()
                .chain(tx_builder.change_outputs.0.iter())
                .collect_vec()
                .len(),
            1
        );
        let out = tx_builder.outputs.get(0);

        assert_eq!(out.address.to_bytes(), address.to_bytes());
        assert_eq!(out.amount.multiasset.unwrap(), multiasset);
        assert_eq!(out.amount.coin, to_bignum(1086120));
    }

    #[test]
    fn add_mint_includes_witnesses_into_fee_estimation() {
        let mut tx_builder = create_reallistic_tx_builder();

        let hash0 = fake_key_hash(0);

        let (mint_script1, _, hash1) = mint_script_and_policy_and_hash(1);
        let (mint_script2, _, _) = mint_script_and_policy_and_hash(2);
        let (mint_script3, _, _) = mint_script_and_policy_and_hash(3);

        let name1 = AssetName::new(vec![0u8, 1, 2, 3]).unwrap();
        let name2 = AssetName::new(vec![1u8, 1, 2, 3]).unwrap();
        let name3 = AssetName::new(vec![2u8, 1, 2, 3]).unwrap();
        let name4 = AssetName::new(vec![3u8, 1, 2, 3]).unwrap();
        let amount = Int::new_i32(1234);

        // One input from unrelated address
        tx_builder.add_input(
            &TransactionUnspentOutput::new(
                &TransactionInput::new(&genesis_id(), &0.into()),
                &TransactionOutput::new(
                    &EnterpriseAddress::new(
                        NetworkInfo::testnet().network_id(),
                        &StakeCredential::from_keyhash(&hash0),
                    )
                    .to_address(),
                    &Value::new(&to_bignum(10_000_000)),
                ),
            ),
            None,
        );

        // One input from same address as mint
        tx_builder.add_input(
            &TransactionUnspentOutput::new(
                &TransactionInput::new(&genesis_id(), &1.into()),
                &TransactionOutput::new(
                    &EnterpriseAddress::new(
                        NetworkInfo::testnet().network_id(),
                        &StakeCredential::from_keyhash(&hash1),
                    )
                    .to_address(),
                    &Value::new(&to_bignum(10_000_000)),
                ),
            ),
            None,
        );

        // Original tx fee now assumes two VKey signatures for two inputs
        let original_tx_fee = tx_builder.min_fee().unwrap();
        assert_eq!(original_tx_fee, to_bignum(168361));

        // Add minting four assets from three different policies

        tx_builder.add_mint(
            &hash_script(ScriptHashNamespace::NativeScript, mint_script1.to_bytes()),
            &MintAssets::new_from_entry(&name1, amount.clone()),
            Some(ScriptWitness::new_native_witness(&mint_script1)),
        );
        tx_builder.add_mint(
            &hash_script(ScriptHashNamespace::NativeScript, mint_script2.to_bytes()),
            &MintAssets::new_from_entry(&name2, amount.clone()),
            Some(ScriptWitness::new_native_witness(&mint_script2)),
        );
        tx_builder.add_mint(
            &hash_script(ScriptHashNamespace::NativeScript, mint_script3.to_bytes()),
            &MintAssets::new_from_entry(&name3, amount.clone()),
            Some(ScriptWitness::new_native_witness(&mint_script3)),
        );
        tx_builder.add_mint(
            &hash_script(ScriptHashNamespace::NativeScript, mint_script3.to_bytes()),
            &MintAssets::new_from_entry(&name4, amount.clone()),
            Some(ScriptWitness::new_native_witness(&mint_script3)),
        );

        let mint = tx_builder.mint().unwrap();
        let mint_len = mint.to_bytes().len();

        let mint_scripts = tx_builder.get_witness_set();
        let mint_scripts_len =
            mint_scripts.to_bytes().len() - TransactionWitnessSet::new().to_bytes().len();

        let fee_coefficient = tx_builder.config.fee_algo.coefficient();

        let raw_mint_fee = fee_coefficient
            .checked_mul(&to_bignum(mint_len as u64))
            .unwrap();

        let raw_mint_script_fee = fee_coefficient
            .checked_mul(&to_bignum(mint_scripts_len as u64))
            .unwrap();

        assert_eq!(raw_mint_fee, to_bignum(5544));
        assert_eq!(raw_mint_script_fee, to_bignum(4312));

        let new_tx_fee = tx_builder.min_fee().unwrap();

        let fee_diff_from_adding_mint = new_tx_fee.checked_sub(&original_tx_fee).unwrap();

        let witness_fee_increase = fee_diff_from_adding_mint
            .checked_sub(&raw_mint_fee)
            .unwrap()
            .checked_sub(&raw_mint_script_fee)
            .unwrap();

        assert_eq!(witness_fee_increase, to_bignum(8932));

        let fee_increase_bytes = from_bignum(&witness_fee_increase)
            .checked_div(from_bignum(&fee_coefficient))
            .unwrap();

        // Two vkey witnesses 96 bytes each (32 byte pubkey + 64 byte signature)
        // Plus 11 bytes overhead for CBOR wrappers
        // This is happening because we have three different minting policies
        // but the same key-hash from one of them is already also used in inputs
        // so no suplicate witness signature is require for that one
        assert_eq!(fee_increase_bytes, 203);
    }

    #[test]
    #[ignore]
    fn fee_estimation_fails_on_missing_mint_scripts() {
        // let mut tx_builder = create_reallistic_tx_builder();

        // // No error estimating fee without mint
        // assert!(tx_builder.min_fee().is_ok());

        // let (mint_script1, policy_id1) = mint_script_and_policy(0);
        // let (mint_script2, _) = mint_script_and_policy(1);

        // let name1 = AssetName::new(vec![0u8, 1, 2, 3]).unwrap();
        // let amount = Int::new_i32(1234);

        // let mut mint = Mint::new();
        // mint.insert(
        //     &policy_id1,
        //     &MintAssets::new_from_entry(&name1, amount.clone()),
        // );

        // tx_builder
        //     .set_mint(&mint, &NativeScripts::from(vec![mint_script1]))
        //     .unwrap();

        // let est1 = tx_builder.min_fee();
        // assert!(est1.is_ok());

        // tx_builder.add_mint_asset(&mint_script2, &name1, amount.clone());

        // let est2 = tx_builder.min_fee();
        // assert!(est2.is_ok());

        // Native script assertion has been commented out in `.min_fee`
        // Until implemented in a more performant manner
        // TODO: these test parts might be returned back when it's done

        // // Remove one mint script
        // tx_builder.native_scripts =
        //     Some(NativeScripts::from(vec![tx_builder.native_scripts.unwrap().get(1)]));
        //
        // // Now two different policies are minted but only one witness script is present
        // let est3 = tx_builder.min_fee();
        // assert!(est3.is_err());
        // assert!(est3.err().unwrap().to_string().contains(&format!("{:?}", hex::encode(policy_id1.to_bytes()))));
        //
        // // Remove all mint scripts
        // tx_builder.native_scripts = Some(NativeScripts::new());
        //
        // // Mint exists but no witness scripts at all present
        // let est4 = tx_builder.min_fee();
        // assert!(est4.is_err());
        // assert!(est4.err().unwrap().to_string().contains("witness scripts are not provided"));
        //
        // // Remove all mint scripts
        // tx_builder.native_scripts = None;
        //
        // // Mint exists but no witness scripts at all present
        // let est5 = tx_builder.min_fee();
        // assert!(est5.is_err());
        // assert!(est5.err().unwrap().to_string().contains("witness scripts are not provided"));
    }

    #[ignore]
    #[test]
    fn total_input_with_mint_and_burn() {
        let mut tx_builder = create_tx_builder_with_fee(&create_linear_fee(0, 1));
        let spend = root_key_15()
            .derive(harden(1852))
            .derive(harden(1815))
            .derive(harden(0))
            .derive(0)
            .derive(0)
            .to_public();

        let (mint_script1, policy_id1) = mint_script_and_policy(0);
        let (mint_script2, policy_id2) = mint_script_and_policy(1);

        let name = AssetName::new(vec![0u8, 1, 2, 3]).unwrap();

        let ma_input1 = 100;
        let ma_input2 = 200;
        let ma_output1 = 60;

        let multiassets = [ma_input1, ma_input2, ma_output1]
            .iter()
            .map(|input| {
                let mut multiasset = MultiAsset::new();
                multiasset.insert(&policy_id1, &{
                    let mut assets = Assets::new();
                    assets.insert(&name, &to_bignum(*input));
                    assets
                });
                multiasset.insert(&policy_id2, &{
                    let mut assets = Assets::new();
                    assets.insert(&name, &to_bignum(*input));
                    assets
                });
                multiasset
            })
            .collect::<Vec<MultiAsset>>();

        for (multiasset, ada) in multiassets
            .iter()
            .zip([100u64, 100, 100].iter().cloned().map(to_bignum))
        {
            let mut input_amount = Value::new(&ada);
            input_amount.set_multiasset(multiasset);

            tx_builder.add_input(
                &TransactionUnspentOutput::new(
                    &TransactionInput::new(&genesis_id(), &0.into()),
                    &TransactionOutput::new(
                        &EnterpriseAddress::new(
                            NetworkInfo::testnet().network_id(),
                            &StakeCredential::from_keyhash(&spend.to_raw_key().hash()),
                        )
                        .to_address(),
                        &input_amount,
                    ),
                ),
                None,
            );
        }

        let total_input_before_mint = tx_builder.get_total_input().unwrap();

        assert_eq!(total_input_before_mint.coin, to_bignum(300));
        let ma1 = total_input_before_mint.multiasset.unwrap();
        assert_eq!(
            ma1.get(&policy_id1).unwrap().get(&name).unwrap(),
            to_bignum(360)
        );
        assert_eq!(
            ma1.get(&policy_id2).unwrap().get(&name).unwrap(),
            to_bignum(360)
        );

        tx_builder.add_mint(
            &hash_script(ScriptHashNamespace::NativeScript, mint_script1.to_bytes()),
            &MintAssets::new_from_entry(&name, Int::new_i32(40)),
            Some(ScriptWitness::new_native_witness(&mint_script1)),
        );
        tx_builder.add_mint(
            &hash_script(ScriptHashNamespace::NativeScript, mint_script2.to_bytes()),
            &MintAssets::new_from_entry(&name, Int::new_i32(-40)),
            Some(ScriptWitness::new_native_witness(&mint_script2)),
        );

        let total_input_after_mint = tx_builder.get_total_input().unwrap();

        assert_eq!(total_input_after_mint.coin, to_bignum(300));
        let ma2 = total_input_after_mint.multiasset.unwrap();
        assert_eq!(
            ma2.get(&policy_id1).unwrap().get(&name).unwrap(),
            to_bignum(400)
        );
        assert_eq!(
            ma2.get(&policy_id2).unwrap().get(&name).unwrap(),
            to_bignum(320)
        );
    }
}
