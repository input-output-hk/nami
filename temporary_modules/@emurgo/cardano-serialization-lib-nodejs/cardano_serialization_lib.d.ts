/* tslint:disable */
/* eslint-disable */
/**
* @param {Uint8Array} bytes
* @returns {TransactionMetadatum}
*/
export function encode_arbitrary_bytes_as_metadatum(bytes: Uint8Array): TransactionMetadatum;
/**
* @param {TransactionMetadatum} metadata
* @returns {Uint8Array}
*/
export function decode_arbitrary_bytes_from_metadatum(metadata: TransactionMetadatum): Uint8Array;
/**
* @param {string} json
* @param {number} schema
* @returns {TransactionMetadatum}
*/
export function encode_json_str_to_metadatum(json: string, schema: number): TransactionMetadatum;
/**
* @param {TransactionMetadatum} metadatum
* @param {number} schema
* @returns {string}
*/
export function decode_metadatum_to_json_str(metadatum: TransactionMetadatum, schema: number): string;
/**
* @param {string} password
* @param {string} salt
* @param {string} nonce
* @param {string} data
* @returns {string}
*/
export function encrypt_with_password(password: string, salt: string, nonce: string, data: string): string;
/**
* @param {string} password
* @param {string} data
* @returns {string}
*/
export function decrypt_with_password(password: string, data: string): string;
/**
* @param {TransactionHash} tx_body_hash
* @param {ByronAddress} addr
* @param {LegacyDaedalusPrivateKey} key
* @returns {BootstrapWitness}
*/
export function make_daedalus_bootstrap_witness(tx_body_hash: TransactionHash, addr: ByronAddress, key: LegacyDaedalusPrivateKey): BootstrapWitness;
/**
* @param {TransactionHash} tx_body_hash
* @param {ByronAddress} addr
* @param {Bip32PrivateKey} key
* @returns {BootstrapWitness}
*/
export function make_icarus_bootstrap_witness(tx_body_hash: TransactionHash, addr: ByronAddress, key: Bip32PrivateKey): BootstrapWitness;
/**
* @param {TransactionHash} tx_body_hash
* @param {PrivateKey} sk
* @returns {Vkeywitness}
*/
export function make_vkey_witness(tx_body_hash: TransactionHash, sk: PrivateKey): Vkeywitness;
/**
* @param {AuxiliaryData} auxiliary_data
* @returns {AuxiliaryDataHash}
*/
export function hash_auxiliary_data(auxiliary_data: AuxiliaryData): AuxiliaryDataHash;
/**
* @param {TransactionBody} tx_body
* @returns {TransactionHash}
*/
export function hash_transaction(tx_body: TransactionBody): TransactionHash;
/**
* @param {PlutusData} plutus_data
* @returns {DataHash}
*/
export function hash_plutus_data(plutus_data: PlutusData): DataHash;
/**
* @param {Redeemers} redeemers
* @param {LanguageViews} language_views
* @param {PlutusList | undefined} datums
* @returns {ScriptDataHash}
*/
export function hash_script_data(redeemers: Redeemers, language_views: LanguageViews, datums?: PlutusList): ScriptDataHash;
/**
* @param {TransactionBody} txbody
* @param {BigNum} pool_deposit
* @param {BigNum} key_deposit
* @returns {Value}
*/
export function get_implicit_input(txbody: TransactionBody, pool_deposit: BigNum, key_deposit: BigNum): Value;
/**
* @param {TransactionBody} txbody
* @param {BigNum} pool_deposit
* @param {BigNum} key_deposit
* @returns {BigNum}
*/
export function get_deposit(txbody: TransactionBody, pool_deposit: BigNum, key_deposit: BigNum): BigNum;
/**
* @param {Value} assets
* @param {BigNum} minimum_utxo_val
* @param {DataHash | undefined} data_hash
* @returns {BigNum}
*/
export function min_ada_required(assets: Value, minimum_utxo_val: BigNum, data_hash?: DataHash): BigNum;
/**
* @param {Transaction} tx
* @param {LinearFee} linear_fee
* @param {number} mem_price
* @param {number} step_price
* @returns {BigNum}
*/
export function min_fee(tx: Transaction, linear_fee: LinearFee, mem_price: number, step_price: number): BigNum;
/**
*/
export enum CertificateKind {
  StakeRegistration,
  StakeDeregistration,
  StakeDelegation,
  PoolRegistration,
  PoolRetirement,
  GenesisKeyDelegation,
  MoveInstantaneousRewardsCert,
}
/**
*/
export enum MIRPot {
  Reserves,
  Treasury,
}
/**
*/
export enum MIRKind {
  ToOtherPot,
  ToStakeCredentials,
}
/**
*/
export enum RelayKind {
  SingleHostAddr,
  SingleHostName,
  MultiHostName,
}
/**
*/
export enum NativeScriptKind {
  ScriptPubkey,
  ScriptAll,
  ScriptAny,
  ScriptNOfK,
  TimelockStart,
  TimelockExpiry,
}
/**
* Each new language uses a different namespace for hashing its script
* This is because you could have a language where the same bytes have different semantics
* So this avoids scripts in different languages mapping to the same hash
* Note that the enum value here is different than the enum value for deciding the cost model of a script
*/
export enum ScriptHashNamespace {
  NativeScript,
}
/**
*/
export enum NetworkIdKind {
  Testnet,
  Mainnet,
}
/**
*/
export enum TransactionMetadatumKind {
  MetadataMap,
  MetadataList,
  Int,
  Bytes,
  Text,
}
/**
*/
export enum MetadataJsonSchema {
  NoConversions,
  BasicConversions,
  DetailedSchema,
}
/**
*/
export enum LanguageKind {
  PlutusV1,
}
/**
*/
export enum PlutusDataKind {
  ConstrPlutusData,
  Map,
  List,
  Integer,
  Bytes,
}
/**
*/
export enum RedeemerTagKind {
  Spend,
  Mint,
  Cert,
  Reward,
}
/**
*/
export class Address {
  free(): void;
/**
* @param {Uint8Array} data
* @returns {Address}
*/
  static from_bytes(data: Uint8Array): Address;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {string | undefined} prefix
* @returns {string}
*/
  to_bech32(prefix?: string): string;
/**
* @param {string} bech_str
* @returns {Address}
*/
  static from_bech32(bech_str: string): Address;
/**
* @returns {number}
*/
  network_id(): number;
}
/**
*/
export class AssetName {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {AssetName}
*/
  static from_bytes(bytes: Uint8Array): AssetName;
/**
* @param {Uint8Array} name
* @returns {AssetName}
*/
  static new(name: Uint8Array): AssetName;
/**
* @returns {Uint8Array}
*/
  name(): Uint8Array;
}
/**
*/
export class AssetNames {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {AssetNames}
*/
  static from_bytes(bytes: Uint8Array): AssetNames;
/**
* @returns {AssetNames}
*/
  static new(): AssetNames;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {AssetName}
*/
  get(index: number): AssetName;
/**
* @param {AssetName} elem
*/
  add(elem: AssetName): void;
}
/**
*/
export class Assets {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Assets}
*/
  static from_bytes(bytes: Uint8Array): Assets;
/**
* @returns {Assets}
*/
  static new(): Assets;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {AssetName} key
* @param {BigNum} value
* @returns {BigNum | undefined}
*/
  insert(key: AssetName, value: BigNum): BigNum | undefined;
/**
* @param {AssetName} key
* @returns {BigNum | undefined}
*/
  get(key: AssetName): BigNum | undefined;
/**
* @returns {AssetNames}
*/
  keys(): AssetNames;
}
/**
*/
export class AuxiliaryData {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {AuxiliaryData}
*/
  static from_bytes(bytes: Uint8Array): AuxiliaryData;
/**
* @returns {AuxiliaryData}
*/
  static new(): AuxiliaryData;
/**
* @returns {GeneralTransactionMetadata | undefined}
*/
  metadata(): GeneralTransactionMetadata | undefined;
/**
* @param {GeneralTransactionMetadata} metadata
*/
  set_metadata(metadata: GeneralTransactionMetadata): void;
/**
* @returns {NativeScripts | undefined}
*/
  native_scripts(): NativeScripts | undefined;
/**
* @param {NativeScripts} native_scripts
*/
  set_native_scripts(native_scripts: NativeScripts): void;
/**
* @returns {PlutusScripts | undefined}
*/
  plutus_scripts(): PlutusScripts | undefined;
/**
* @param {PlutusScripts} plutus_scripts
*/
  set_plutus_scripts(plutus_scripts: PlutusScripts): void;
}
/**
*/
export class AuxiliaryDataHash {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {string} prefix
* @returns {string}
*/
  to_bech32(prefix: string): string;
/**
* @param {string} bech_str
* @returns {AuxiliaryDataHash}
*/
  static from_bech32(bech_str: string): AuxiliaryDataHash;
/**
* @param {Uint8Array} bytes
* @returns {AuxiliaryDataHash}
*/
  static from_bytes(bytes: Uint8Array): AuxiliaryDataHash;
}
/**
*/
export class AuxiliaryDataSet {
  free(): void;
/**
* @returns {AuxiliaryDataSet}
*/
  static new(): AuxiliaryDataSet;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} tx_index
* @param {AuxiliaryData} data
* @returns {AuxiliaryData | undefined}
*/
  insert(tx_index: number, data: AuxiliaryData): AuxiliaryData | undefined;
/**
* @param {number} tx_index
* @returns {AuxiliaryData | undefined}
*/
  get(tx_index: number): AuxiliaryData | undefined;
/**
* @returns {Uint32Array}
*/
  indices(): Uint32Array;
}
/**
*/
export class BaseAddress {
  free(): void;
/**
* @param {number} network
* @param {StakeCredential} payment
* @param {StakeCredential} stake
* @returns {BaseAddress}
*/
  static new(network: number, payment: StakeCredential, stake: StakeCredential): BaseAddress;
/**
* @returns {StakeCredential}
*/
  payment_cred(): StakeCredential;
/**
* @returns {StakeCredential}
*/
  stake_cred(): StakeCredential;
/**
* @returns {Address}
*/
  to_address(): Address;
/**
* @param {Address} addr
* @returns {BaseAddress | undefined}
*/
  static from_address(addr: Address): BaseAddress | undefined;
}
/**
*/
export class BigInt {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {BigInt}
*/
  static from_bytes(bytes: Uint8Array): BigInt;
/**
* @returns {BigNum | undefined}
*/
  as_u64(): BigNum | undefined;
/**
* @param {string} text
* @returns {BigInt}
*/
  static from_str(text: string): BigInt;
/**
* @returns {string}
*/
  to_str(): string;
}
/**
*/
export class BigNum {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {BigNum}
*/
  static from_bytes(bytes: Uint8Array): BigNum;
/**
* @param {string} string
* @returns {BigNum}
*/
  static from_str(string: string): BigNum;
/**
* @returns {string}
*/
  to_str(): string;
/**
* @returns {BigNum}
*/
  static zero(): BigNum;
/**
* @param {BigNum} other
* @returns {BigNum}
*/
  checked_mul(other: BigNum): BigNum;
/**
* @param {BigNum} other
* @returns {BigNum}
*/
  checked_div(other: BigNum): BigNum;
/**
* @param {BigNum} other
* @returns {BigNum}
*/
  checked_add(other: BigNum): BigNum;
/**
* @param {BigNum} other
* @returns {BigNum}
*/
  checked_sub(other: BigNum): BigNum;
/**
* returns 0 if it would otherwise underflow
* @param {BigNum} other
* @returns {BigNum}
*/
  clamped_sub(other: BigNum): BigNum;
/**
* @param {BigNum} rhs_value
* @returns {number}
*/
  compare(rhs_value: BigNum): number;
}
/**
*/
export class Bip32PrivateKey {
  free(): void;
/**
* derive this private key with the given index.
*
* # Security considerations
*
* * hard derivation index cannot be soft derived with the public key
*
* # Hard derivation vs Soft derivation
*
* If you pass an index below 0x80000000 then it is a soft derivation.
* The advantage of soft derivation is that it is possible to derive the
* public key too. I.e. derivation the private key with a soft derivation
* index and then retrieving the associated public key is equivalent to
* deriving the public key associated to the parent private key.
*
* Hard derivation index does not allow public key derivation.
*
* This is why deriving the private key should not fail while deriving
* the public key may fail (if the derivation index is invalid).
* @param {number} index
* @returns {Bip32PrivateKey}
*/
  derive(index: number): Bip32PrivateKey;
/**
* 128-byte xprv a key format in Cardano that some software still uses or requires
* the traditional 96-byte xprv is simply encoded as
* prv | chaincode
* however, because some software may not know how to compute a public key from a private key,
* the 128-byte inlines the public key in the following format
* prv | pub | chaincode
* so be careful if you see the term "xprv" as it could refer to either one
* our library does not require the pub (instead we compute the pub key when needed)
* @param {Uint8Array} bytes
* @returns {Bip32PrivateKey}
*/
  static from_128_xprv(bytes: Uint8Array): Bip32PrivateKey;
/**
* see from_128_xprv
* @returns {Uint8Array}
*/
  to_128_xprv(): Uint8Array;
/**
* @returns {Bip32PrivateKey}
*/
  static generate_ed25519_bip32(): Bip32PrivateKey;
/**
* @returns {PrivateKey}
*/
  to_raw_key(): PrivateKey;
/**
* @returns {Bip32PublicKey}
*/
  to_public(): Bip32PublicKey;
/**
* @param {Uint8Array} bytes
* @returns {Bip32PrivateKey}
*/
  static from_bytes(bytes: Uint8Array): Bip32PrivateKey;
/**
* @returns {Uint8Array}
*/
  as_bytes(): Uint8Array;
/**
* @param {string} bech32_str
* @returns {Bip32PrivateKey}
*/
  static from_bech32(bech32_str: string): Bip32PrivateKey;
/**
* @returns {string}
*/
  to_bech32(): string;
/**
* @param {Uint8Array} entropy
* @param {Uint8Array} password
* @returns {Bip32PrivateKey}
*/
  static from_bip39_entropy(entropy: Uint8Array, password: Uint8Array): Bip32PrivateKey;
/**
* @returns {Uint8Array}
*/
  chaincode(): Uint8Array;
}
/**
*/
export class Bip32PublicKey {
  free(): void;
/**
* derive this public key with the given index.
*
* # Errors
*
* If the index is not a soft derivation index (< 0x80000000) then
* calling this method will fail.
*
* # Security considerations
*
* * hard derivation index cannot be soft derived with the public key
*
* # Hard derivation vs Soft derivation
*
* If you pass an index below 0x80000000 then it is a soft derivation.
* The advantage of soft derivation is that it is possible to derive the
* public key too. I.e. derivation the private key with a soft derivation
* index and then retrieving the associated public key is equivalent to
* deriving the public key associated to the parent private key.
*
* Hard derivation index does not allow public key derivation.
*
* This is why deriving the private key should not fail while deriving
* the public key may fail (if the derivation index is invalid).
* @param {number} index
* @returns {Bip32PublicKey}
*/
  derive(index: number): Bip32PublicKey;
/**
* @returns {PublicKey}
*/
  to_raw_key(): PublicKey;
/**
* @param {Uint8Array} bytes
* @returns {Bip32PublicKey}
*/
  static from_bytes(bytes: Uint8Array): Bip32PublicKey;
/**
* @returns {Uint8Array}
*/
  as_bytes(): Uint8Array;
/**
* @param {string} bech32_str
* @returns {Bip32PublicKey}
*/
  static from_bech32(bech32_str: string): Bip32PublicKey;
/**
* @returns {string}
*/
  to_bech32(): string;
/**
* @returns {Uint8Array}
*/
  chaincode(): Uint8Array;
}
/**
*/
export class Block {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Block}
*/
  static from_bytes(bytes: Uint8Array): Block;
/**
* @returns {Header}
*/
  header(): Header;
/**
* @returns {TransactionBodies}
*/
  transaction_bodies(): TransactionBodies;
/**
* @returns {TransactionWitnessSets}
*/
  transaction_witness_sets(): TransactionWitnessSets;
/**
* @returns {AuxiliaryDataSet}
*/
  auxiliary_data_set(): AuxiliaryDataSet;
/**
* @returns {Uint32Array}
*/
  invalid_transactions(): Uint32Array;
/**
* @param {Header} header
* @param {TransactionBodies} transaction_bodies
* @param {TransactionWitnessSets} transaction_witness_sets
* @param {AuxiliaryDataSet} auxiliary_data_set
* @param {Uint32Array} invalid_transactions
* @returns {Block}
*/
  static new(header: Header, transaction_bodies: TransactionBodies, transaction_witness_sets: TransactionWitnessSets, auxiliary_data_set: AuxiliaryDataSet, invalid_transactions: Uint32Array): Block;
}
/**
*/
export class BlockHash {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {string} prefix
* @returns {string}
*/
  to_bech32(prefix: string): string;
/**
* @param {string} bech_str
* @returns {BlockHash}
*/
  static from_bech32(bech_str: string): BlockHash;
/**
* @param {Uint8Array} bytes
* @returns {BlockHash}
*/
  static from_bytes(bytes: Uint8Array): BlockHash;
}
/**
*/
export class BootstrapWitness {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {BootstrapWitness}
*/
  static from_bytes(bytes: Uint8Array): BootstrapWitness;
/**
* @returns {Vkey}
*/
  vkey(): Vkey;
/**
* @returns {Ed25519Signature}
*/
  signature(): Ed25519Signature;
/**
* @returns {Uint8Array}
*/
  chain_code(): Uint8Array;
/**
* @returns {Uint8Array}
*/
  attributes(): Uint8Array;
/**
* @param {Vkey} vkey
* @param {Ed25519Signature} signature
* @param {Uint8Array} chain_code
* @param {Uint8Array} attributes
* @returns {BootstrapWitness}
*/
  static new(vkey: Vkey, signature: Ed25519Signature, chain_code: Uint8Array, attributes: Uint8Array): BootstrapWitness;
}
/**
*/
export class BootstrapWitnesses {
  free(): void;
/**
* @returns {BootstrapWitnesses}
*/
  static new(): BootstrapWitnesses;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {BootstrapWitness}
*/
  get(index: number): BootstrapWitness;
/**
* @param {BootstrapWitness} elem
*/
  add(elem: BootstrapWitness): void;
}
/**
*/
export class ByronAddress {
  free(): void;
/**
* @returns {string}
*/
  to_base58(): string;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {ByronAddress}
*/
  static from_bytes(bytes: Uint8Array): ByronAddress;
/**
* returns the byron protocol magic embedded in the address, or mainnet id if none is present
* note: for bech32 addresses, you need to use network_id instead
* @returns {number}
*/
  byron_protocol_magic(): number;
/**
* @returns {Uint8Array}
*/
  attributes(): Uint8Array;
/**
* @returns {number}
*/
  network_id(): number;
/**
* @param {string} s
* @returns {ByronAddress}
*/
  static from_base58(s: string): ByronAddress;
/**
* @param {Bip32PublicKey} key
* @param {number} protocol_magic
* @returns {ByronAddress}
*/
  static icarus_from_key(key: Bip32PublicKey, protocol_magic: number): ByronAddress;
/**
* @param {string} s
* @returns {boolean}
*/
  static is_valid(s: string): boolean;
/**
* @returns {Address}
*/
  to_address(): Address;
/**
* @param {Address} addr
* @returns {ByronAddress | undefined}
*/
  static from_address(addr: Address): ByronAddress | undefined;
}
/**
*/
export class Certificate {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Certificate}
*/
  static from_bytes(bytes: Uint8Array): Certificate;
/**
* @param {StakeRegistration} stake_registration
* @returns {Certificate}
*/
  static new_stake_registration(stake_registration: StakeRegistration): Certificate;
/**
* @param {StakeDeregistration} stake_deregistration
* @returns {Certificate}
*/
  static new_stake_deregistration(stake_deregistration: StakeDeregistration): Certificate;
/**
* @param {StakeDelegation} stake_delegation
* @returns {Certificate}
*/
  static new_stake_delegation(stake_delegation: StakeDelegation): Certificate;
/**
* @param {PoolRegistration} pool_registration
* @returns {Certificate}
*/
  static new_pool_registration(pool_registration: PoolRegistration): Certificate;
/**
* @param {PoolRetirement} pool_retirement
* @returns {Certificate}
*/
  static new_pool_retirement(pool_retirement: PoolRetirement): Certificate;
/**
* @param {GenesisKeyDelegation} genesis_key_delegation
* @returns {Certificate}
*/
  static new_genesis_key_delegation(genesis_key_delegation: GenesisKeyDelegation): Certificate;
/**
* @param {MoveInstantaneousRewardsCert} move_instantaneous_rewards_cert
* @returns {Certificate}
*/
  static new_move_instantaneous_rewards_cert(move_instantaneous_rewards_cert: MoveInstantaneousRewardsCert): Certificate;
/**
* @returns {number}
*/
  kind(): number;
/**
* @returns {StakeRegistration | undefined}
*/
  as_stake_registration(): StakeRegistration | undefined;
/**
* @returns {StakeDeregistration | undefined}
*/
  as_stake_deregistration(): StakeDeregistration | undefined;
/**
* @returns {StakeDelegation | undefined}
*/
  as_stake_delegation(): StakeDelegation | undefined;
/**
* @returns {PoolRegistration | undefined}
*/
  as_pool_registration(): PoolRegistration | undefined;
/**
* @returns {PoolRetirement | undefined}
*/
  as_pool_retirement(): PoolRetirement | undefined;
/**
* @returns {GenesisKeyDelegation | undefined}
*/
  as_genesis_key_delegation(): GenesisKeyDelegation | undefined;
/**
* @returns {MoveInstantaneousRewardsCert | undefined}
*/
  as_move_instantaneous_rewards_cert(): MoveInstantaneousRewardsCert | undefined;
}
/**
*/
export class Certificates {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Certificates}
*/
  static from_bytes(bytes: Uint8Array): Certificates;
/**
* @returns {Certificates}
*/
  static new(): Certificates;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {Certificate}
*/
  get(index: number): Certificate;
/**
* @param {Certificate} elem
*/
  add(elem: Certificate): void;
}
/**
*/
export class ConstrPlutusData {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {ConstrPlutusData}
*/
  static from_bytes(bytes: Uint8Array): ConstrPlutusData;
/**
* @returns {Int}
*/
  tag(): Int;
/**
* @returns {PlutusList}
*/
  data(): PlutusList;
/**
* @param {Int} tag
* @param {PlutusList} data
* @returns {ConstrPlutusData}
*/
  static new(tag: Int, data: PlutusList): ConstrPlutusData;
}
/**
*/
export class CostModel {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {CostModel}
*/
  static from_bytes(bytes: Uint8Array): CostModel;
/**
* @returns {CostModel}
*/
  static new(): CostModel;
/**
* @param {number} operation
* @param {Int} cost
* @returns {Int}
*/
  set(operation: number, cost: Int): Int;
/**
* @param {number} operation
* @returns {Int}
*/
  get(operation: number): Int;
}
/**
*/
export class Costmdls {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Costmdls}
*/
  static from_bytes(bytes: Uint8Array): Costmdls;
/**
* @returns {Costmdls}
*/
  static new(): Costmdls;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {Language} key
* @param {CostModel} value
* @returns {CostModel | undefined}
*/
  insert(key: Language, value: CostModel): CostModel | undefined;
/**
* @param {Language} key
* @returns {CostModel | undefined}
*/
  get(key: Language): CostModel | undefined;
/**
* @returns {Languages}
*/
  keys(): Languages;
}
/**
*/
export class DNSRecordAorAAAA {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {DNSRecordAorAAAA}
*/
  static from_bytes(bytes: Uint8Array): DNSRecordAorAAAA;
/**
* @param {string} dns_name
* @returns {DNSRecordAorAAAA}
*/
  static new(dns_name: string): DNSRecordAorAAAA;
/**
* @returns {string}
*/
  record(): string;
}
/**
*/
export class DNSRecordSRV {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {DNSRecordSRV}
*/
  static from_bytes(bytes: Uint8Array): DNSRecordSRV;
/**
* @param {string} dns_name
* @returns {DNSRecordSRV}
*/
  static new(dns_name: string): DNSRecordSRV;
/**
* @returns {string}
*/
  record(): string;
}
/**
*/
export class DataHash {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {string} prefix
* @returns {string}
*/
  to_bech32(prefix: string): string;
/**
* @param {string} bech_str
* @returns {DataHash}
*/
  static from_bech32(bech_str: string): DataHash;
/**
* @param {Uint8Array} bytes
* @returns {DataHash}
*/
  static from_bytes(bytes: Uint8Array): DataHash;
}
/**
*/
export class Ed25519KeyHash {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {string} prefix
* @returns {string}
*/
  to_bech32(prefix: string): string;
/**
* @param {string} bech_str
* @returns {Ed25519KeyHash}
*/
  static from_bech32(bech_str: string): Ed25519KeyHash;
/**
* @param {Uint8Array} bytes
* @returns {Ed25519KeyHash}
*/
  static from_bytes(bytes: Uint8Array): Ed25519KeyHash;
}
/**
*/
export class Ed25519KeyHashes {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Ed25519KeyHashes}
*/
  static from_bytes(bytes: Uint8Array): Ed25519KeyHashes;
/**
* @returns {Ed25519KeyHashes}
*/
  static new(): Ed25519KeyHashes;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {Ed25519KeyHash}
*/
  get(index: number): Ed25519KeyHash;
/**
* @param {Ed25519KeyHash} elem
*/
  add(elem: Ed25519KeyHash): void;
}
/**
*/
export class Ed25519Signature {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @returns {string}
*/
  to_bech32(): string;
/**
* @returns {string}
*/
  to_hex(): string;
/**
* @param {string} bech32_str
* @returns {Ed25519Signature}
*/
  static from_bech32(bech32_str: string): Ed25519Signature;
/**
* @param {string} input
* @returns {Ed25519Signature}
*/
  static from_hex(input: string): Ed25519Signature;
/**
* @param {Uint8Array} bytes
* @returns {Ed25519Signature}
*/
  static from_bytes(bytes: Uint8Array): Ed25519Signature;
}
/**
*/
export class EnterpriseAddress {
  free(): void;
/**
* @param {number} network
* @param {StakeCredential} payment
* @returns {EnterpriseAddress}
*/
  static new(network: number, payment: StakeCredential): EnterpriseAddress;
/**
* @returns {StakeCredential}
*/
  payment_cred(): StakeCredential;
/**
* @returns {Address}
*/
  to_address(): Address;
/**
* @param {Address} addr
* @returns {EnterpriseAddress | undefined}
*/
  static from_address(addr: Address): EnterpriseAddress | undefined;
}
/**
*/
export class ExUnitPrices {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {ExUnitPrices}
*/
  static from_bytes(bytes: Uint8Array): ExUnitPrices;
/**
* @returns {UnitInterval}
*/
  mem_price(): UnitInterval;
/**
* @returns {UnitInterval}
*/
  step_price(): UnitInterval;
/**
* @param {UnitInterval} mem_price
* @param {UnitInterval} step_price
* @returns {ExUnitPrices}
*/
  static new(mem_price: UnitInterval, step_price: UnitInterval): ExUnitPrices;
}
/**
*/
export class ExUnits {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {ExUnits}
*/
  static from_bytes(bytes: Uint8Array): ExUnits;
/**
* @returns {BigNum}
*/
  mem(): BigNum;
/**
* @returns {BigNum}
*/
  steps(): BigNum;
/**
* @param {BigNum} mem
* @param {BigNum} steps
* @returns {ExUnits}
*/
  static new(mem: BigNum, steps: BigNum): ExUnits;
}
/**
*/
export class GeneralTransactionMetadata {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {GeneralTransactionMetadata}
*/
  static from_bytes(bytes: Uint8Array): GeneralTransactionMetadata;
/**
* @returns {GeneralTransactionMetadata}
*/
  static new(): GeneralTransactionMetadata;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {BigNum} key
* @param {TransactionMetadatum} value
* @returns {TransactionMetadatum | undefined}
*/
  insert(key: BigNum, value: TransactionMetadatum): TransactionMetadatum | undefined;
/**
* @param {BigNum} key
* @returns {TransactionMetadatum | undefined}
*/
  get(key: BigNum): TransactionMetadatum | undefined;
/**
* @returns {TransactionMetadatumLabels}
*/
  keys(): TransactionMetadatumLabels;
}
/**
*/
export class GenesisDelegateHash {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {string} prefix
* @returns {string}
*/
  to_bech32(prefix: string): string;
/**
* @param {string} bech_str
* @returns {GenesisDelegateHash}
*/
  static from_bech32(bech_str: string): GenesisDelegateHash;
/**
* @param {Uint8Array} bytes
* @returns {GenesisDelegateHash}
*/
  static from_bytes(bytes: Uint8Array): GenesisDelegateHash;
}
/**
*/
export class GenesisHash {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {string} prefix
* @returns {string}
*/
  to_bech32(prefix: string): string;
/**
* @param {string} bech_str
* @returns {GenesisHash}
*/
  static from_bech32(bech_str: string): GenesisHash;
/**
* @param {Uint8Array} bytes
* @returns {GenesisHash}
*/
  static from_bytes(bytes: Uint8Array): GenesisHash;
}
/**
*/
export class GenesisHashes {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {GenesisHashes}
*/
  static from_bytes(bytes: Uint8Array): GenesisHashes;
/**
* @returns {GenesisHashes}
*/
  static new(): GenesisHashes;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {GenesisHash}
*/
  get(index: number): GenesisHash;
/**
* @param {GenesisHash} elem
*/
  add(elem: GenesisHash): void;
}
/**
*/
export class GenesisKeyDelegation {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {GenesisKeyDelegation}
*/
  static from_bytes(bytes: Uint8Array): GenesisKeyDelegation;
/**
* @returns {GenesisHash}
*/
  genesishash(): GenesisHash;
/**
* @returns {GenesisDelegateHash}
*/
  genesis_delegate_hash(): GenesisDelegateHash;
/**
* @returns {VRFKeyHash}
*/
  vrf_keyhash(): VRFKeyHash;
/**
* @param {GenesisHash} genesishash
* @param {GenesisDelegateHash} genesis_delegate_hash
* @param {VRFKeyHash} vrf_keyhash
* @returns {GenesisKeyDelegation}
*/
  static new(genesishash: GenesisHash, genesis_delegate_hash: GenesisDelegateHash, vrf_keyhash: VRFKeyHash): GenesisKeyDelegation;
}
/**
*/
export class Header {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Header}
*/
  static from_bytes(bytes: Uint8Array): Header;
/**
* @returns {HeaderBody}
*/
  header_body(): HeaderBody;
/**
* @returns {KESSignature}
*/
  body_signature(): KESSignature;
/**
* @param {HeaderBody} header_body
* @param {KESSignature} body_signature
* @returns {Header}
*/
  static new(header_body: HeaderBody, body_signature: KESSignature): Header;
}
/**
*/
export class HeaderBody {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {HeaderBody}
*/
  static from_bytes(bytes: Uint8Array): HeaderBody;
/**
* @returns {number}
*/
  block_number(): number;
/**
* @returns {number}
*/
  slot(): number;
/**
* @returns {BlockHash | undefined}
*/
  prev_hash(): BlockHash | undefined;
/**
* @returns {Vkey}
*/
  issuer_vkey(): Vkey;
/**
* @returns {VRFVKey}
*/
  vrf_vkey(): VRFVKey;
/**
* @returns {VRFCert}
*/
  nonce_vrf(): VRFCert;
/**
* @returns {VRFCert}
*/
  leader_vrf(): VRFCert;
/**
* @returns {number}
*/
  block_body_size(): number;
/**
* @returns {BlockHash}
*/
  block_body_hash(): BlockHash;
/**
* @returns {OperationalCert}
*/
  operational_cert(): OperationalCert;
/**
* @returns {ProtocolVersion}
*/
  protocol_version(): ProtocolVersion;
/**
* @param {number} block_number
* @param {number} slot
* @param {BlockHash | undefined} prev_hash
* @param {Vkey} issuer_vkey
* @param {VRFVKey} vrf_vkey
* @param {VRFCert} nonce_vrf
* @param {VRFCert} leader_vrf
* @param {number} block_body_size
* @param {BlockHash} block_body_hash
* @param {OperationalCert} operational_cert
* @param {ProtocolVersion} protocol_version
* @returns {HeaderBody}
*/
  static new(block_number: number, slot: number, prev_hash: BlockHash | undefined, issuer_vkey: Vkey, vrf_vkey: VRFVKey, nonce_vrf: VRFCert, leader_vrf: VRFCert, block_body_size: number, block_body_hash: BlockHash, operational_cert: OperationalCert, protocol_version: ProtocolVersion): HeaderBody;
}
/**
*/
export class Int {
  free(): void;
/**
* @param {BigNum} x
* @returns {Int}
*/
  static new(x: BigNum): Int;
/**
* @param {BigNum} x
* @returns {Int}
*/
  static new_negative(x: BigNum): Int;
/**
* @param {number} x
* @returns {Int}
*/
  static new_i32(x: number): Int;
/**
* @returns {boolean}
*/
  is_positive(): boolean;
/**
* @returns {BigNum | undefined}
*/
  as_positive(): BigNum | undefined;
/**
* @returns {BigNum | undefined}
*/
  as_negative(): BigNum | undefined;
/**
* @returns {number | undefined}
*/
  as_i32(): number | undefined;
}
/**
*/
export class Ipv4 {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Ipv4}
*/
  static from_bytes(bytes: Uint8Array): Ipv4;
/**
* @param {Uint8Array} data
* @returns {Ipv4}
*/
  static new(data: Uint8Array): Ipv4;
/**
* @returns {Uint8Array}
*/
  ip(): Uint8Array;
}
/**
*/
export class Ipv6 {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Ipv6}
*/
  static from_bytes(bytes: Uint8Array): Ipv6;
/**
* @param {Uint8Array} data
* @returns {Ipv6}
*/
  static new(data: Uint8Array): Ipv6;
/**
* @returns {Uint8Array}
*/
  ip(): Uint8Array;
}
/**
*/
export class KESSignature {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {KESSignature}
*/
  static from_bytes(bytes: Uint8Array): KESSignature;
}
/**
*/
export class KESVKey {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {string} prefix
* @returns {string}
*/
  to_bech32(prefix: string): string;
/**
* @param {string} bech_str
* @returns {KESVKey}
*/
  static from_bech32(bech_str: string): KESVKey;
/**
* @param {Uint8Array} bytes
* @returns {KESVKey}
*/
  static from_bytes(bytes: Uint8Array): KESVKey;
}
/**
*/
export class Language {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Language}
*/
  static from_bytes(bytes: Uint8Array): Language;
/**
* @returns {Language}
*/
  static new_plutus_v1(): Language;
/**
* @returns {number}
*/
  kind(): number;
}
/**
*/
export class LanguageViews {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {LanguageViews}
*/
  static from_bytes(bytes: Uint8Array): LanguageViews;
/**
* @param {Uint8Array} bytes
* @returns {LanguageViews}
*/
  static new(bytes: Uint8Array): LanguageViews;
/**
* @returns {Uint8Array}
*/
  bytes(): Uint8Array;
}
/**
*/
export class Languages {
  free(): void;
/**
* @returns {Languages}
*/
  static new(): Languages;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {Language}
*/
  get(index: number): Language;
/**
* @param {Language} elem
*/
  add(elem: Language): void;
}
/**
*/
export class LegacyDaedalusPrivateKey {
  free(): void;
/**
* @param {Uint8Array} bytes
* @returns {LegacyDaedalusPrivateKey}
*/
  static from_bytes(bytes: Uint8Array): LegacyDaedalusPrivateKey;
/**
* @returns {Uint8Array}
*/
  as_bytes(): Uint8Array;
/**
* @returns {Uint8Array}
*/
  chaincode(): Uint8Array;
}
/**
*/
export class LinearFee {
  free(): void;
/**
* @returns {BigNum}
*/
  constant(): BigNum;
/**
* @returns {BigNum}
*/
  coefficient(): BigNum;
/**
* @param {BigNum} coefficient
* @param {BigNum} constant
* @returns {LinearFee}
*/
  static new(coefficient: BigNum, constant: BigNum): LinearFee;
}
/**
*/
export class MIRToStakeCredentials {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {MIRToStakeCredentials}
*/
  static from_bytes(bytes: Uint8Array): MIRToStakeCredentials;
/**
* @returns {MIRToStakeCredentials}
*/
  static new(): MIRToStakeCredentials;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {StakeCredential} cred
* @param {Int} delta
* @returns {Int | undefined}
*/
  insert(cred: StakeCredential, delta: Int): Int | undefined;
/**
* @param {StakeCredential} cred
* @returns {Int | undefined}
*/
  get(cred: StakeCredential): Int | undefined;
/**
* @returns {StakeCredentials}
*/
  keys(): StakeCredentials;
}
/**
*/
export class MetadataList {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {MetadataList}
*/
  static from_bytes(bytes: Uint8Array): MetadataList;
/**
* @returns {MetadataList}
*/
  static new(): MetadataList;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {TransactionMetadatum}
*/
  get(index: number): TransactionMetadatum;
/**
* @param {TransactionMetadatum} elem
*/
  add(elem: TransactionMetadatum): void;
}
/**
*/
export class MetadataMap {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {MetadataMap}
*/
  static from_bytes(bytes: Uint8Array): MetadataMap;
/**
* @returns {MetadataMap}
*/
  static new(): MetadataMap;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {TransactionMetadatum} key
* @param {TransactionMetadatum} value
* @returns {TransactionMetadatum | undefined}
*/
  insert(key: TransactionMetadatum, value: TransactionMetadatum): TransactionMetadatum | undefined;
/**
* @param {string} key
* @param {TransactionMetadatum} value
* @returns {TransactionMetadatum | undefined}
*/
  insert_str(key: string, value: TransactionMetadatum): TransactionMetadatum | undefined;
/**
* @param {number} key
* @param {TransactionMetadatum} value
* @returns {TransactionMetadatum | undefined}
*/
  insert_i32(key: number, value: TransactionMetadatum): TransactionMetadatum | undefined;
/**
* @param {TransactionMetadatum} key
* @returns {TransactionMetadatum}
*/
  get(key: TransactionMetadatum): TransactionMetadatum;
/**
* @param {string} key
* @returns {TransactionMetadatum}
*/
  get_str(key: string): TransactionMetadatum;
/**
* @param {number} key
* @returns {TransactionMetadatum}
*/
  get_i32(key: number): TransactionMetadatum;
/**
* @param {TransactionMetadatum} key
* @returns {boolean}
*/
  has(key: TransactionMetadatum): boolean;
/**
* @returns {MetadataList}
*/
  keys(): MetadataList;
}
/**
*/
export class Mint {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Mint}
*/
  static from_bytes(bytes: Uint8Array): Mint;
/**
* @returns {Mint}
*/
  static new(): Mint;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {ScriptHash} key
* @param {MintAssets} value
* @returns {MintAssets | undefined}
*/
  insert(key: ScriptHash, value: MintAssets): MintAssets | undefined;
/**
* @param {ScriptHash} key
* @returns {MintAssets | undefined}
*/
  get(key: ScriptHash): MintAssets | undefined;
/**
* @returns {ScriptHashes}
*/
  keys(): ScriptHashes;
}
/**
*/
export class MintAssets {
  free(): void;
/**
* @returns {MintAssets}
*/
  static new(): MintAssets;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {AssetName} key
* @param {Int} value
* @returns {Int | undefined}
*/
  insert(key: AssetName, value: Int): Int | undefined;
/**
* @param {AssetName} key
* @returns {Int | undefined}
*/
  get(key: AssetName): Int | undefined;
/**
* @returns {AssetNames}
*/
  keys(): AssetNames;
}
/**
*/
export class MoveInstantaneousReward {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {MoveInstantaneousReward}
*/
  static from_bytes(bytes: Uint8Array): MoveInstantaneousReward;
/**
* @param {number} pot
* @param {BigNum} amount
* @returns {MoveInstantaneousReward}
*/
  static new_to_other_pot(pot: number, amount: BigNum): MoveInstantaneousReward;
/**
* @param {number} pot
* @param {MIRToStakeCredentials} amounts
* @returns {MoveInstantaneousReward}
*/
  static new_to_stake_creds(pot: number, amounts: MIRToStakeCredentials): MoveInstantaneousReward;
/**
* @returns {number}
*/
  pot(): number;
/**
* @returns {number}
*/
  kind(): number;
/**
* @returns {BigNum | undefined}
*/
  as_to_other_pot(): BigNum | undefined;
/**
* @returns {MIRToStakeCredentials | undefined}
*/
  as_to_stake_creds(): MIRToStakeCredentials | undefined;
}
/**
*/
export class MoveInstantaneousRewardsCert {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {MoveInstantaneousRewardsCert}
*/
  static from_bytes(bytes: Uint8Array): MoveInstantaneousRewardsCert;
/**
* @returns {MoveInstantaneousReward}
*/
  move_instantaneous_reward(): MoveInstantaneousReward;
/**
* @param {MoveInstantaneousReward} move_instantaneous_reward
* @returns {MoveInstantaneousRewardsCert}
*/
  static new(move_instantaneous_reward: MoveInstantaneousReward): MoveInstantaneousRewardsCert;
}
/**
*/
export class MultiAsset {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {MultiAsset}
*/
  static from_bytes(bytes: Uint8Array): MultiAsset;
/**
* @returns {MultiAsset}
*/
  static new(): MultiAsset;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {ScriptHash} key
* @param {Assets} value
* @returns {Assets | undefined}
*/
  insert(key: ScriptHash, value: Assets): Assets | undefined;
/**
* @param {ScriptHash} key
* @returns {Assets | undefined}
*/
  get(key: ScriptHash): Assets | undefined;
/**
* @returns {ScriptHashes}
*/
  keys(): ScriptHashes;
/**
* removes an asset from the list if the result is 0 or less
* @param {MultiAsset} rhs_ma
* @returns {MultiAsset}
*/
  sub(rhs_ma: MultiAsset): MultiAsset;
}
/**
*/
export class MultiHostName {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {MultiHostName}
*/
  static from_bytes(bytes: Uint8Array): MultiHostName;
/**
* @returns {DNSRecordSRV}
*/
  dns_name(): DNSRecordSRV;
/**
* @param {DNSRecordSRV} dns_name
* @returns {MultiHostName}
*/
  static new(dns_name: DNSRecordSRV): MultiHostName;
}
/**
*/
export class NativeScript {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {NativeScript}
*/
  static from_bytes(bytes: Uint8Array): NativeScript;
/**
* @param {number} namespace
* @returns {Ed25519KeyHash}
*/
  hash(namespace: number): Ed25519KeyHash;
/**
* @param {ScriptPubkey} script_pubkey
* @returns {NativeScript}
*/
  static new_script_pubkey(script_pubkey: ScriptPubkey): NativeScript;
/**
* @param {ScriptAll} script_all
* @returns {NativeScript}
*/
  static new_script_all(script_all: ScriptAll): NativeScript;
/**
* @param {ScriptAny} script_any
* @returns {NativeScript}
*/
  static new_script_any(script_any: ScriptAny): NativeScript;
/**
* @param {ScriptNOfK} script_n_of_k
* @returns {NativeScript}
*/
  static new_script_n_of_k(script_n_of_k: ScriptNOfK): NativeScript;
/**
* @param {TimelockStart} timelock_start
* @returns {NativeScript}
*/
  static new_timelock_start(timelock_start: TimelockStart): NativeScript;
/**
* @param {TimelockExpiry} timelock_expiry
* @returns {NativeScript}
*/
  static new_timelock_expiry(timelock_expiry: TimelockExpiry): NativeScript;
/**
* @returns {number}
*/
  kind(): number;
/**
* @returns {ScriptPubkey | undefined}
*/
  as_script_pubkey(): ScriptPubkey | undefined;
/**
* @returns {ScriptAll | undefined}
*/
  as_script_all(): ScriptAll | undefined;
/**
* @returns {ScriptAny | undefined}
*/
  as_script_any(): ScriptAny | undefined;
/**
* @returns {ScriptNOfK | undefined}
*/
  as_script_n_of_k(): ScriptNOfK | undefined;
/**
* @returns {TimelockStart | undefined}
*/
  as_timelock_start(): TimelockStart | undefined;
/**
* @returns {TimelockExpiry | undefined}
*/
  as_timelock_expiry(): TimelockExpiry | undefined;
}
/**
*/
export class NativeScripts {
  free(): void;
/**
* @returns {NativeScripts}
*/
  static new(): NativeScripts;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {NativeScript}
*/
  get(index: number): NativeScript;
/**
* @param {NativeScript} elem
*/
  add(elem: NativeScript): void;
}
/**
*/
export class NetworkId {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {NetworkId}
*/
  static from_bytes(bytes: Uint8Array): NetworkId;
/**
* @returns {NetworkId}
*/
  static testnet(): NetworkId;
/**
* @returns {NetworkId}
*/
  static mainnet(): NetworkId;
/**
* @returns {number}
*/
  kind(): number;
}
/**
*/
export class NetworkInfo {
  free(): void;
/**
* @param {number} network_id
* @param {number} protocol_magic
* @returns {NetworkInfo}
*/
  static new(network_id: number, protocol_magic: number): NetworkInfo;
/**
* @returns {number}
*/
  network_id(): number;
/**
* @returns {number}
*/
  protocol_magic(): number;
/**
* @returns {NetworkInfo}
*/
  static testnet(): NetworkInfo;
/**
* @returns {NetworkInfo}
*/
  static mainnet(): NetworkInfo;
}
/**
*/
export class Nonce {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Nonce}
*/
  static from_bytes(bytes: Uint8Array): Nonce;
/**
* @returns {Nonce}
*/
  static new_identity(): Nonce;
/**
* @param {Uint8Array} hash
* @returns {Nonce}
*/
  static new_from_hash(hash: Uint8Array): Nonce;
/**
* @returns {Uint8Array | undefined}
*/
  get_hash(): Uint8Array | undefined;
}
/**
*/
export class OperationalCert {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {OperationalCert}
*/
  static from_bytes(bytes: Uint8Array): OperationalCert;
/**
* @returns {KESVKey}
*/
  hot_vkey(): KESVKey;
/**
* @returns {number}
*/
  sequence_number(): number;
/**
* @returns {number}
*/
  kes_period(): number;
/**
* @returns {Ed25519Signature}
*/
  sigma(): Ed25519Signature;
/**
* @param {KESVKey} hot_vkey
* @param {number} sequence_number
* @param {number} kes_period
* @param {Ed25519Signature} sigma
* @returns {OperationalCert}
*/
  static new(hot_vkey: KESVKey, sequence_number: number, kes_period: number, sigma: Ed25519Signature): OperationalCert;
}
/**
*/
export class PlutusData {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {PlutusData}
*/
  static from_bytes(bytes: Uint8Array): PlutusData;
/**
* @param {ConstrPlutusData} constr_plutus_data
* @returns {PlutusData}
*/
  static new_constr_plutus_data(constr_plutus_data: ConstrPlutusData): PlutusData;
/**
* @param {PlutusMap} map
* @returns {PlutusData}
*/
  static new_map(map: PlutusMap): PlutusData;
/**
* @param {PlutusList} list
* @returns {PlutusData}
*/
  static new_list(list: PlutusList): PlutusData;
/**
* @param {BigInt} integer
* @returns {PlutusData}
*/
  static new_integer(integer: BigInt): PlutusData;
/**
* @param {Uint8Array} bytes
* @returns {PlutusData}
*/
  static new_bytes(bytes: Uint8Array): PlutusData;
/**
* @returns {number}
*/
  kind(): number;
/**
* @returns {ConstrPlutusData | undefined}
*/
  as_constr_plutus_data(): ConstrPlutusData | undefined;
/**
* @returns {PlutusMap | undefined}
*/
  as_map(): PlutusMap | undefined;
/**
* @returns {PlutusList | undefined}
*/
  as_list(): PlutusList | undefined;
/**
* @returns {BigInt | undefined}
*/
  as_integer(): BigInt | undefined;
/**
* @returns {Uint8Array | undefined}
*/
  as_bytes(): Uint8Array | undefined;
}
/**
*/
export class PlutusList {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {PlutusList}
*/
  static from_bytes(bytes: Uint8Array): PlutusList;
/**
* @returns {PlutusList}
*/
  static new(): PlutusList;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {PlutusData}
*/
  get(index: number): PlutusData;
/**
* @param {PlutusData} elem
*/
  add(elem: PlutusData): void;
}
/**
*/
export class PlutusMap {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {PlutusMap}
*/
  static from_bytes(bytes: Uint8Array): PlutusMap;
/**
* @returns {PlutusMap}
*/
  static new(): PlutusMap;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {PlutusData} key
* @param {PlutusData} value
* @returns {PlutusData | undefined}
*/
  insert(key: PlutusData, value: PlutusData): PlutusData | undefined;
/**
* @param {PlutusData} key
* @returns {PlutusData | undefined}
*/
  get(key: PlutusData): PlutusData | undefined;
/**
* @returns {PlutusList}
*/
  keys(): PlutusList;
}
/**
*/
export class PlutusScript {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {PlutusScript}
*/
  static from_bytes(bytes: Uint8Array): PlutusScript;
/**
* @param {Uint8Array} bytes
* @returns {PlutusScript}
*/
  static new(bytes: Uint8Array): PlutusScript;
/**
* @returns {Uint8Array}
*/
  bytes(): Uint8Array;
}
/**
*/
export class PlutusScripts {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {PlutusScripts}
*/
  static from_bytes(bytes: Uint8Array): PlutusScripts;
/**
* @returns {PlutusScripts}
*/
  static new(): PlutusScripts;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {PlutusScript}
*/
  get(index: number): PlutusScript;
/**
* @param {PlutusScript} elem
*/
  add(elem: PlutusScript): void;
}
/**
*/
export class Pointer {
  free(): void;
/**
* @param {number} slot
* @param {number} tx_index
* @param {number} cert_index
* @returns {Pointer}
*/
  static new(slot: number, tx_index: number, cert_index: number): Pointer;
/**
* @returns {number}
*/
  slot(): number;
/**
* @returns {number}
*/
  tx_index(): number;
/**
* @returns {number}
*/
  cert_index(): number;
}
/**
*/
export class PointerAddress {
  free(): void;
/**
* @param {number} network
* @param {StakeCredential} payment
* @param {Pointer} stake
* @returns {PointerAddress}
*/
  static new(network: number, payment: StakeCredential, stake: Pointer): PointerAddress;
/**
* @returns {StakeCredential}
*/
  payment_cred(): StakeCredential;
/**
* @returns {Pointer}
*/
  stake_pointer(): Pointer;
/**
* @returns {Address}
*/
  to_address(): Address;
/**
* @param {Address} addr
* @returns {PointerAddress | undefined}
*/
  static from_address(addr: Address): PointerAddress | undefined;
}
/**
*/
export class PoolMetadata {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {PoolMetadata}
*/
  static from_bytes(bytes: Uint8Array): PoolMetadata;
/**
* @returns {URL}
*/
  url(): URL;
/**
* @returns {PoolMetadataHash}
*/
  pool_metadata_hash(): PoolMetadataHash;
/**
* @param {URL} url
* @param {PoolMetadataHash} pool_metadata_hash
* @returns {PoolMetadata}
*/
  static new(url: URL, pool_metadata_hash: PoolMetadataHash): PoolMetadata;
}
/**
*/
export class PoolMetadataHash {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {string} prefix
* @returns {string}
*/
  to_bech32(prefix: string): string;
/**
* @param {string} bech_str
* @returns {PoolMetadataHash}
*/
  static from_bech32(bech_str: string): PoolMetadataHash;
/**
* @param {Uint8Array} bytes
* @returns {PoolMetadataHash}
*/
  static from_bytes(bytes: Uint8Array): PoolMetadataHash;
}
/**
*/
export class PoolParams {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {PoolParams}
*/
  static from_bytes(bytes: Uint8Array): PoolParams;
/**
* @returns {Ed25519KeyHash}
*/
  operator(): Ed25519KeyHash;
/**
* @returns {VRFKeyHash}
*/
  vrf_keyhash(): VRFKeyHash;
/**
* @returns {BigNum}
*/
  pledge(): BigNum;
/**
* @returns {BigNum}
*/
  cost(): BigNum;
/**
* @returns {UnitInterval}
*/
  margin(): UnitInterval;
/**
* @returns {RewardAddress}
*/
  reward_account(): RewardAddress;
/**
* @returns {Ed25519KeyHashes}
*/
  pool_owners(): Ed25519KeyHashes;
/**
* @returns {Relays}
*/
  relays(): Relays;
/**
* @returns {PoolMetadata | undefined}
*/
  pool_metadata(): PoolMetadata | undefined;
/**
* @param {Ed25519KeyHash} operator
* @param {VRFKeyHash} vrf_keyhash
* @param {BigNum} pledge
* @param {BigNum} cost
* @param {UnitInterval} margin
* @param {RewardAddress} reward_account
* @param {Ed25519KeyHashes} pool_owners
* @param {Relays} relays
* @param {PoolMetadata | undefined} pool_metadata
* @returns {PoolParams}
*/
  static new(operator: Ed25519KeyHash, vrf_keyhash: VRFKeyHash, pledge: BigNum, cost: BigNum, margin: UnitInterval, reward_account: RewardAddress, pool_owners: Ed25519KeyHashes, relays: Relays, pool_metadata?: PoolMetadata): PoolParams;
}
/**
*/
export class PoolRegistration {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {PoolRegistration}
*/
  static from_bytes(bytes: Uint8Array): PoolRegistration;
/**
* @returns {PoolParams}
*/
  pool_params(): PoolParams;
/**
* @param {PoolParams} pool_params
* @returns {PoolRegistration}
*/
  static new(pool_params: PoolParams): PoolRegistration;
}
/**
*/
export class PoolRetirement {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {PoolRetirement}
*/
  static from_bytes(bytes: Uint8Array): PoolRetirement;
/**
* @returns {Ed25519KeyHash}
*/
  pool_keyhash(): Ed25519KeyHash;
/**
* @returns {number}
*/
  epoch(): number;
/**
* @param {Ed25519KeyHash} pool_keyhash
* @param {number} epoch
* @returns {PoolRetirement}
*/
  static new(pool_keyhash: Ed25519KeyHash, epoch: number): PoolRetirement;
}
/**
*/
export class PrivateKey {
  free(): void;
/**
* @returns {PublicKey}
*/
  to_public(): PublicKey;
/**
* @returns {PrivateKey}
*/
  static generate_ed25519(): PrivateKey;
/**
* @returns {PrivateKey}
*/
  static generate_ed25519extended(): PrivateKey;
/**
* @returns {string}
*/
  to_bech32(): string;
/**
* @returns {Uint8Array}
*/
  as_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {PrivateKey}
*/
  static from_extended_bytes(bytes: Uint8Array): PrivateKey;
/**
* @param {Uint8Array} bytes
* @returns {PrivateKey}
*/
  static from_normal_bytes(bytes: Uint8Array): PrivateKey;
/**
* @param {Uint8Array} message
* @returns {Ed25519Signature}
*/
  sign(message: Uint8Array): Ed25519Signature;
}
/**
*/
export class ProposedProtocolParameterUpdates {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {ProposedProtocolParameterUpdates}
*/
  static from_bytes(bytes: Uint8Array): ProposedProtocolParameterUpdates;
/**
* @returns {ProposedProtocolParameterUpdates}
*/
  static new(): ProposedProtocolParameterUpdates;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {GenesisHash} key
* @param {ProtocolParamUpdate} value
* @returns {ProtocolParamUpdate | undefined}
*/
  insert(key: GenesisHash, value: ProtocolParamUpdate): ProtocolParamUpdate | undefined;
/**
* @param {GenesisHash} key
* @returns {ProtocolParamUpdate | undefined}
*/
  get(key: GenesisHash): ProtocolParamUpdate | undefined;
/**
* @returns {GenesisHashes}
*/
  keys(): GenesisHashes;
}
/**
*/
export class ProtocolParamUpdate {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {ProtocolParamUpdate}
*/
  static from_bytes(bytes: Uint8Array): ProtocolParamUpdate;
/**
* @param {BigNum} minfee_a
*/
  set_minfee_a(minfee_a: BigNum): void;
/**
* @returns {BigNum | undefined}
*/
  minfee_a(): BigNum | undefined;
/**
* @param {BigNum} minfee_b
*/
  set_minfee_b(minfee_b: BigNum): void;
/**
* @returns {BigNum | undefined}
*/
  minfee_b(): BigNum | undefined;
/**
* @param {number} max_block_body_size
*/
  set_max_block_body_size(max_block_body_size: number): void;
/**
* @returns {number | undefined}
*/
  max_block_body_size(): number | undefined;
/**
* @param {number} max_tx_size
*/
  set_max_tx_size(max_tx_size: number): void;
/**
* @returns {number | undefined}
*/
  max_tx_size(): number | undefined;
/**
* @param {number} max_block_header_size
*/
  set_max_block_header_size(max_block_header_size: number): void;
/**
* @returns {number | undefined}
*/
  max_block_header_size(): number | undefined;
/**
* @param {BigNum} key_deposit
*/
  set_key_deposit(key_deposit: BigNum): void;
/**
* @returns {BigNum | undefined}
*/
  key_deposit(): BigNum | undefined;
/**
* @param {BigNum} pool_deposit
*/
  set_pool_deposit(pool_deposit: BigNum): void;
/**
* @returns {BigNum | undefined}
*/
  pool_deposit(): BigNum | undefined;
/**
* @param {number} max_epoch
*/
  set_max_epoch(max_epoch: number): void;
/**
* @returns {number | undefined}
*/
  max_epoch(): number | undefined;
/**
* @param {number} n_opt
*/
  set_n_opt(n_opt: number): void;
/**
* @returns {number | undefined}
*/
  n_opt(): number | undefined;
/**
* @param {UnitInterval} pool_pledge_influence
*/
  set_pool_pledge_influence(pool_pledge_influence: UnitInterval): void;
/**
* @returns {UnitInterval | undefined}
*/
  pool_pledge_influence(): UnitInterval | undefined;
/**
* @param {UnitInterval} expansion_rate
*/
  set_expansion_rate(expansion_rate: UnitInterval): void;
/**
* @returns {UnitInterval | undefined}
*/
  expansion_rate(): UnitInterval | undefined;
/**
* @param {UnitInterval} treasury_growth_rate
*/
  set_treasury_growth_rate(treasury_growth_rate: UnitInterval): void;
/**
* @returns {UnitInterval | undefined}
*/
  treasury_growth_rate(): UnitInterval | undefined;
/**
* @param {UnitInterval} d
*/
  set_d(d: UnitInterval): void;
/**
* @returns {UnitInterval | undefined}
*/
  d(): UnitInterval | undefined;
/**
* @param {Nonce} extra_entropy
*/
  set_extra_entropy(extra_entropy: Nonce): void;
/**
* @returns {Nonce | undefined}
*/
  extra_entropy(): Nonce | undefined;
/**
* @param {ProtocolVersions} protocol_version
*/
  set_protocol_version(protocol_version: ProtocolVersions): void;
/**
* @returns {ProtocolVersions | undefined}
*/
  protocol_version(): ProtocolVersions | undefined;
/**
* @param {BigNum} min_pool_cost
*/
  set_min_pool_cost(min_pool_cost: BigNum): void;
/**
* @returns {BigNum | undefined}
*/
  min_pool_cost(): BigNum | undefined;
/**
* @param {BigNum} ada_per_utxo_byte
*/
  set_ada_per_utxo_byte(ada_per_utxo_byte: BigNum): void;
/**
* @returns {BigNum | undefined}
*/
  ada_per_utxo_byte(): BigNum | undefined;
/**
* @param {Costmdls} cost_models
*/
  set_cost_models(cost_models: Costmdls): void;
/**
* @returns {Costmdls | undefined}
*/
  cost_models(): Costmdls | undefined;
/**
* @param {ExUnitPrices} execution_costs
*/
  set_execution_costs(execution_costs: ExUnitPrices): void;
/**
* @returns {ExUnitPrices | undefined}
*/
  execution_costs(): ExUnitPrices | undefined;
/**
* @param {ExUnits} max_tx_ex_units
*/
  set_max_tx_ex_units(max_tx_ex_units: ExUnits): void;
/**
* @returns {ExUnits | undefined}
*/
  max_tx_ex_units(): ExUnits | undefined;
/**
* @param {ExUnits} max_block_ex_units
*/
  set_max_block_ex_units(max_block_ex_units: ExUnits): void;
/**
* @returns {ExUnits | undefined}
*/
  max_block_ex_units(): ExUnits | undefined;
/**
* @param {number} max_value_size
*/
  set_max_value_size(max_value_size: number): void;
/**
* @returns {number | undefined}
*/
  max_value_size(): number | undefined;
/**
* @returns {ProtocolParamUpdate}
*/
  static new(): ProtocolParamUpdate;
}
/**
*/
export class ProtocolVersion {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {ProtocolVersion}
*/
  static from_bytes(bytes: Uint8Array): ProtocolVersion;
/**
* @returns {number}
*/
  major(): number;
/**
* @returns {number}
*/
  minor(): number;
/**
* @param {number} major
* @param {number} minor
* @returns {ProtocolVersion}
*/
  static new(major: number, minor: number): ProtocolVersion;
}
/**
*/
export class ProtocolVersions {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {ProtocolVersions}
*/
  static from_bytes(bytes: Uint8Array): ProtocolVersions;
/**
* @returns {ProtocolVersions}
*/
  static new(): ProtocolVersions;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {ProtocolVersion}
*/
  get(index: number): ProtocolVersion;
/**
* @param {ProtocolVersion} elem
*/
  add(elem: ProtocolVersion): void;
}
/**
* ED25519 key used as public key
*/
export class PublicKey {
  free(): void;
/**
* Get public key from its bech32 representation
* Example:
* ```javascript
* const pkey = PublicKey.from_bech32(&#39;ed25519_pk1dgaagyh470y66p899txcl3r0jaeaxu6yd7z2dxyk55qcycdml8gszkxze2&#39;);
* ```
* @param {string} bech32_str
* @returns {PublicKey}
*/
  static from_bech32(bech32_str: string): PublicKey;
/**
* @returns {string}
*/
  to_bech32(): string;
/**
* @returns {Uint8Array}
*/
  as_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {PublicKey}
*/
  static from_bytes(bytes: Uint8Array): PublicKey;
/**
* @param {Uint8Array} data
* @param {Ed25519Signature} signature
* @returns {boolean}
*/
  verify(data: Uint8Array, signature: Ed25519Signature): boolean;
/**
* @returns {Ed25519KeyHash}
*/
  hash(): Ed25519KeyHash;
}
/**
*/
export class PublicKeys {
  free(): void;
/**
*/
  constructor();
/**
* @returns {number}
*/
  size(): number;
/**
* @param {number} index
* @returns {PublicKey}
*/
  get(index: number): PublicKey;
/**
* @param {PublicKey} key
*/
  add(key: PublicKey): void;
}
/**
*/
export class Redeemer {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Redeemer}
*/
  static from_bytes(bytes: Uint8Array): Redeemer;
/**
* @returns {RedeemerTag}
*/
  tag(): RedeemerTag;
/**
* @returns {BigNum}
*/
  index(): BigNum;
/**
* @returns {PlutusData}
*/
  data(): PlutusData;
/**
* @returns {ExUnits}
*/
  ex_units(): ExUnits;
/**
* @param {RedeemerTag} tag
* @param {BigNum} index
* @param {PlutusData} data
* @param {ExUnits} ex_units
* @returns {Redeemer}
*/
  static new(tag: RedeemerTag, index: BigNum, data: PlutusData, ex_units: ExUnits): Redeemer;
}
/**
*/
export class RedeemerTag {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {RedeemerTag}
*/
  static from_bytes(bytes: Uint8Array): RedeemerTag;
/**
* @returns {RedeemerTag}
*/
  static new_spend(): RedeemerTag;
/**
* @returns {RedeemerTag}
*/
  static new_mint(): RedeemerTag;
/**
* @returns {RedeemerTag}
*/
  static new_cert(): RedeemerTag;
/**
* @returns {RedeemerTag}
*/
  static new_reward(): RedeemerTag;
/**
* @returns {number}
*/
  kind(): number;
}
/**
*/
export class Redeemers {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Redeemers}
*/
  static from_bytes(bytes: Uint8Array): Redeemers;
/**
* @returns {Redeemers}
*/
  static new(): Redeemers;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {Redeemer}
*/
  get(index: number): Redeemer;
/**
* @param {Redeemer} elem
*/
  add(elem: Redeemer): void;
}
/**
*/
export class Relay {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Relay}
*/
  static from_bytes(bytes: Uint8Array): Relay;
/**
* @param {SingleHostAddr} single_host_addr
* @returns {Relay}
*/
  static new_single_host_addr(single_host_addr: SingleHostAddr): Relay;
/**
* @param {SingleHostName} single_host_name
* @returns {Relay}
*/
  static new_single_host_name(single_host_name: SingleHostName): Relay;
/**
* @param {MultiHostName} multi_host_name
* @returns {Relay}
*/
  static new_multi_host_name(multi_host_name: MultiHostName): Relay;
/**
* @returns {number}
*/
  kind(): number;
/**
* @returns {SingleHostAddr | undefined}
*/
  as_single_host_addr(): SingleHostAddr | undefined;
/**
* @returns {SingleHostName | undefined}
*/
  as_single_host_name(): SingleHostName | undefined;
/**
* @returns {MultiHostName | undefined}
*/
  as_multi_host_name(): MultiHostName | undefined;
}
/**
*/
export class Relays {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Relays}
*/
  static from_bytes(bytes: Uint8Array): Relays;
/**
* @returns {Relays}
*/
  static new(): Relays;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {Relay}
*/
  get(index: number): Relay;
/**
* @param {Relay} elem
*/
  add(elem: Relay): void;
}
/**
*/
export class RewardAddress {
  free(): void;
/**
* @param {number} network
* @param {StakeCredential} payment
* @returns {RewardAddress}
*/
  static new(network: number, payment: StakeCredential): RewardAddress;
/**
* @returns {StakeCredential}
*/
  payment_cred(): StakeCredential;
/**
* @returns {Address}
*/
  to_address(): Address;
/**
* @param {Address} addr
* @returns {RewardAddress | undefined}
*/
  static from_address(addr: Address): RewardAddress | undefined;
}
/**
*/
export class RewardAddresses {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {RewardAddresses}
*/
  static from_bytes(bytes: Uint8Array): RewardAddresses;
/**
* @returns {RewardAddresses}
*/
  static new(): RewardAddresses;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {RewardAddress}
*/
  get(index: number): RewardAddress;
/**
* @param {RewardAddress} elem
*/
  add(elem: RewardAddress): void;
}
/**
*/
export class ScriptAll {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {ScriptAll}
*/
  static from_bytes(bytes: Uint8Array): ScriptAll;
/**
* @returns {NativeScripts}
*/
  native_scripts(): NativeScripts;
/**
* @param {NativeScripts} native_scripts
* @returns {ScriptAll}
*/
  static new(native_scripts: NativeScripts): ScriptAll;
}
/**
*/
export class ScriptAny {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {ScriptAny}
*/
  static from_bytes(bytes: Uint8Array): ScriptAny;
/**
* @returns {NativeScripts}
*/
  native_scripts(): NativeScripts;
/**
* @param {NativeScripts} native_scripts
* @returns {ScriptAny}
*/
  static new(native_scripts: NativeScripts): ScriptAny;
}
/**
*/
export class ScriptDataHash {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {string} prefix
* @returns {string}
*/
  to_bech32(prefix: string): string;
/**
* @param {string} bech_str
* @returns {ScriptDataHash}
*/
  static from_bech32(bech_str: string): ScriptDataHash;
/**
* @param {Uint8Array} bytes
* @returns {ScriptDataHash}
*/
  static from_bytes(bytes: Uint8Array): ScriptDataHash;
}
/**
*/
export class ScriptHash {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {string} prefix
* @returns {string}
*/
  to_bech32(prefix: string): string;
/**
* @param {string} bech_str
* @returns {ScriptHash}
*/
  static from_bech32(bech_str: string): ScriptHash;
/**
* @param {Uint8Array} bytes
* @returns {ScriptHash}
*/
  static from_bytes(bytes: Uint8Array): ScriptHash;
}
/**
*/
export class ScriptHashes {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {ScriptHashes}
*/
  static from_bytes(bytes: Uint8Array): ScriptHashes;
/**
* @returns {ScriptHashes}
*/
  static new(): ScriptHashes;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {ScriptHash}
*/
  get(index: number): ScriptHash;
/**
* @param {ScriptHash} elem
*/
  add(elem: ScriptHash): void;
}
/**
*/
export class ScriptNOfK {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {ScriptNOfK}
*/
  static from_bytes(bytes: Uint8Array): ScriptNOfK;
/**
* @returns {number}
*/
  n(): number;
/**
* @returns {NativeScripts}
*/
  native_scripts(): NativeScripts;
/**
* @param {number} n
* @param {NativeScripts} native_scripts
* @returns {ScriptNOfK}
*/
  static new(n: number, native_scripts: NativeScripts): ScriptNOfK;
}
/**
*/
export class ScriptPubkey {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {ScriptPubkey}
*/
  static from_bytes(bytes: Uint8Array): ScriptPubkey;
/**
* @returns {Ed25519KeyHash}
*/
  addr_keyhash(): Ed25519KeyHash;
/**
* @param {Ed25519KeyHash} addr_keyhash
* @returns {ScriptPubkey}
*/
  static new(addr_keyhash: Ed25519KeyHash): ScriptPubkey;
}
/**
*/
export class SingleHostAddr {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {SingleHostAddr}
*/
  static from_bytes(bytes: Uint8Array): SingleHostAddr;
/**
* @returns {number | undefined}
*/
  port(): number | undefined;
/**
* @returns {Ipv4 | undefined}
*/
  ipv4(): Ipv4 | undefined;
/**
* @returns {Ipv6 | undefined}
*/
  ipv6(): Ipv6 | undefined;
/**
* @param {number | undefined} port
* @param {Ipv4 | undefined} ipv4
* @param {Ipv6 | undefined} ipv6
* @returns {SingleHostAddr}
*/
  static new(port?: number, ipv4?: Ipv4, ipv6?: Ipv6): SingleHostAddr;
}
/**
*/
export class SingleHostName {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {SingleHostName}
*/
  static from_bytes(bytes: Uint8Array): SingleHostName;
/**
* @returns {number | undefined}
*/
  port(): number | undefined;
/**
* @returns {DNSRecordAorAAAA}
*/
  dns_name(): DNSRecordAorAAAA;
/**
* @param {number | undefined} port
* @param {DNSRecordAorAAAA} dns_name
* @returns {SingleHostName}
*/
  static new(port: number | undefined, dns_name: DNSRecordAorAAAA): SingleHostName;
}
/**
*/
export class StakeCredential {
  free(): void;
/**
* @param {Ed25519KeyHash} hash
* @returns {StakeCredential}
*/
  static from_keyhash(hash: Ed25519KeyHash): StakeCredential;
/**
* @param {ScriptHash} hash
* @returns {StakeCredential}
*/
  static from_scripthash(hash: ScriptHash): StakeCredential;
/**
* @returns {Ed25519KeyHash | undefined}
*/
  to_keyhash(): Ed25519KeyHash | undefined;
/**
* @returns {ScriptHash | undefined}
*/
  to_scripthash(): ScriptHash | undefined;
/**
* @returns {number}
*/
  kind(): number;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {StakeCredential}
*/
  static from_bytes(bytes: Uint8Array): StakeCredential;
}
/**
*/
export class StakeCredentials {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {StakeCredentials}
*/
  static from_bytes(bytes: Uint8Array): StakeCredentials;
/**
* @returns {StakeCredentials}
*/
  static new(): StakeCredentials;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {StakeCredential}
*/
  get(index: number): StakeCredential;
/**
* @param {StakeCredential} elem
*/
  add(elem: StakeCredential): void;
}
/**
*/
export class StakeDelegation {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {StakeDelegation}
*/
  static from_bytes(bytes: Uint8Array): StakeDelegation;
/**
* @returns {StakeCredential}
*/
  stake_credential(): StakeCredential;
/**
* @returns {Ed25519KeyHash}
*/
  pool_keyhash(): Ed25519KeyHash;
/**
* @param {StakeCredential} stake_credential
* @param {Ed25519KeyHash} pool_keyhash
* @returns {StakeDelegation}
*/
  static new(stake_credential: StakeCredential, pool_keyhash: Ed25519KeyHash): StakeDelegation;
}
/**
*/
export class StakeDeregistration {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {StakeDeregistration}
*/
  static from_bytes(bytes: Uint8Array): StakeDeregistration;
/**
* @returns {StakeCredential}
*/
  stake_credential(): StakeCredential;
/**
* @param {StakeCredential} stake_credential
* @returns {StakeDeregistration}
*/
  static new(stake_credential: StakeCredential): StakeDeregistration;
}
/**
*/
export class StakeRegistration {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {StakeRegistration}
*/
  static from_bytes(bytes: Uint8Array): StakeRegistration;
/**
* @returns {StakeCredential}
*/
  stake_credential(): StakeCredential;
/**
* @param {StakeCredential} stake_credential
* @returns {StakeRegistration}
*/
  static new(stake_credential: StakeCredential): StakeRegistration;
}
/**
*/
export class Strings {
  free(): void;
/**
* @returns {Strings}
*/
  static new(): Strings;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {string}
*/
  get(index: number): string;
/**
* @param {string} elem
*/
  add(elem: string): void;
}
/**
*/
export class TimelockExpiry {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {TimelockExpiry}
*/
  static from_bytes(bytes: Uint8Array): TimelockExpiry;
/**
* @returns {number}
*/
  slot(): number;
/**
* @param {number} slot
* @returns {TimelockExpiry}
*/
  static new(slot: number): TimelockExpiry;
}
/**
*/
export class TimelockStart {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {TimelockStart}
*/
  static from_bytes(bytes: Uint8Array): TimelockStart;
/**
* @returns {number}
*/
  slot(): number;
/**
* @param {number} slot
* @returns {TimelockStart}
*/
  static new(slot: number): TimelockStart;
}
/**
*/
export class Transaction {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Transaction}
*/
  static from_bytes(bytes: Uint8Array): Transaction;
/**
* @returns {TransactionBody}
*/
  body(): TransactionBody;
/**
* @returns {TransactionWitnessSet}
*/
  witness_set(): TransactionWitnessSet;
/**
* @returns {boolean}
*/
  is_valid(): boolean;
/**
* @param {boolean} valid
*/
  set_is_valid(valid: boolean): void;
/**
* @returns {AuxiliaryData | undefined}
*/
  auxiliary_data(): AuxiliaryData | undefined;
/**
* @param {TransactionBody} body
* @param {TransactionWitnessSet} witness_set
* @param {AuxiliaryData | undefined} auxiliary_data
* @returns {Transaction}
*/
  static new(body: TransactionBody, witness_set: TransactionWitnessSet, auxiliary_data?: AuxiliaryData): Transaction;
}
/**
*/
export class TransactionBodies {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {TransactionBodies}
*/
  static from_bytes(bytes: Uint8Array): TransactionBodies;
/**
* @returns {TransactionBodies}
*/
  static new(): TransactionBodies;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {TransactionBody}
*/
  get(index: number): TransactionBody;
/**
* @param {TransactionBody} elem
*/
  add(elem: TransactionBody): void;
}
/**
*/
export class TransactionBody {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {TransactionBody}
*/
  static from_bytes(bytes: Uint8Array): TransactionBody;
/**
* @returns {TransactionInputs}
*/
  inputs(): TransactionInputs;
/**
* @returns {TransactionOutputs}
*/
  outputs(): TransactionOutputs;
/**
* @returns {BigNum}
*/
  fee(): BigNum;
/**
* @returns {number | undefined}
*/
  ttl(): number | undefined;
/**
* @param {Certificates} certs
*/
  set_certs(certs: Certificates): void;
/**
* @returns {Certificates | undefined}
*/
  certs(): Certificates | undefined;
/**
* @param {Withdrawals} withdrawals
*/
  set_withdrawals(withdrawals: Withdrawals): void;
/**
* @returns {Withdrawals | undefined}
*/
  withdrawals(): Withdrawals | undefined;
/**
* @param {Update} update
*/
  set_update(update: Update): void;
/**
* @returns {Update | undefined}
*/
  update(): Update | undefined;
/**
* @param {AuxiliaryDataHash} auxiliary_data_hash
*/
  set_auxiliary_data_hash(auxiliary_data_hash: AuxiliaryDataHash): void;
/**
* @returns {AuxiliaryDataHash | undefined}
*/
  auxiliary_data_hash(): AuxiliaryDataHash | undefined;
/**
* @param {number} validity_start_interval
*/
  set_validity_start_interval(validity_start_interval: number): void;
/**
* @returns {number | undefined}
*/
  validity_start_interval(): number | undefined;
/**
* @param {Mint} mint
*/
  set_mint(mint: Mint): void;
/**
* @returns {Mint | undefined}
*/
  multiassets(): Mint | undefined;
/**
* @param {ScriptDataHash} script_data_hash
*/
  set_script_data_hash(script_data_hash: ScriptDataHash): void;
/**
* @returns {ScriptDataHash | undefined}
*/
  script_data_hash(): ScriptDataHash | undefined;
/**
* @param {TransactionInputs} collateral
*/
  set_collateral(collateral: TransactionInputs): void;
/**
* @returns {TransactionInputs | undefined}
*/
  collateral(): TransactionInputs | undefined;
/**
* @param {Ed25519KeyHashes} required_signers
*/
  set_required_signers(required_signers: Ed25519KeyHashes): void;
/**
* @returns {Ed25519KeyHashes | undefined}
*/
  required_signers(): Ed25519KeyHashes | undefined;
/**
* @param {NetworkId} network_id
*/
  set_network_id(network_id: NetworkId): void;
/**
* @returns {NetworkId | undefined}
*/
  network_id(): NetworkId | undefined;
/**
* @param {TransactionInputs} inputs
* @param {TransactionOutputs} outputs
* @param {BigNum} fee
* @param {number | undefined} ttl
* @returns {TransactionBody}
*/
  static new(inputs: TransactionInputs, outputs: TransactionOutputs, fee: BigNum, ttl?: number): TransactionBody;
}
/**
*/
export class TransactionBuilder {
  free(): void;
/**
* @param {Ed25519KeyHash} hash
* @param {TransactionInput} input
* @param {Value} amount
*/
  add_key_input(hash: Ed25519KeyHash, input: TransactionInput, amount: Value): void;
/**
* @param {ScriptHash} hash
* @param {TransactionInput} input
* @param {Value} amount
*/
  add_script_input(hash: ScriptHash, input: TransactionInput, amount: Value): void;
/**
* @param {ByronAddress} hash
* @param {TransactionInput} input
* @param {Value} amount
*/
  add_bootstrap_input(hash: ByronAddress, input: TransactionInput, amount: Value): void;
/**
* @param {Address} address
* @param {TransactionInput} input
* @param {Value} amount
*/
  add_input(address: Address, input: TransactionInput, amount: Value): void;
/**
* calculates how much the fee would increase if you added a given output
* @param {Address} address
* @param {TransactionInput} input
* @param {Value} amount
* @returns {BigNum}
*/
  fee_for_input(address: Address, input: TransactionInput, amount: Value): BigNum;
/**
* @param {TransactionOutput} output
*/
  add_output(output: TransactionOutput): void;
/**
* calculates how much the fee would increase if you added a given output
* @param {TransactionOutput} output
* @returns {BigNum}
*/
  fee_for_output(output: TransactionOutput): BigNum;
/**
* @param {BigNum} fee
*/
  set_fee(fee: BigNum): void;
/**
* @param {number} ttl
*/
  set_ttl(ttl: number): void;
/**
* @param {number} validity_start_interval
*/
  set_validity_start_interval(validity_start_interval: number): void;
/**
* @param {Certificates} certs
*/
  set_certs(certs: Certificates): void;
/**
* @param {Withdrawals} withdrawals
*/
  set_withdrawals(withdrawals: Withdrawals): void;
/**
* @param {TransactionInputs} collateral
*/
  set_collateral(collateral: TransactionInputs): void;
/**
* @param {PlutusList} plutus_data
*/
  set_plutus_data(plutus_data: PlutusList): void;
/**
* @param {Redeemers} redeemers
*/
  set_redeemers(redeemers: Redeemers): void;
/**
* @param {PlutusScripts} plutus_scripts
*/
  set_plutus_scripts(plutus_scripts: PlutusScripts): void;
/**
* @param {Ed25519KeyHashes} required_signers
*/
  set_required_signers(required_signers: Ed25519KeyHashes): void;
/**
* @param {AuxiliaryData} auxiliary_data
*/
  set_auxiliary_data(auxiliary_data: AuxiliaryData): void;
/**
* @param {TransactionInput} input
* @returns {number}
*/
  index_of_input(input: TransactionInput): number;
/**
* @param {LinearFee} linear_fee
* @param {BigNum} minimum_utxo_val
* @param {BigNum} pool_deposit
* @param {BigNum} key_deposit
* @param {number} max_value_size
* @param {number} max_tx_size
* @param {number} price_mem
* @param {number} price_step
* @param {LanguageViews | undefined} language_views
* @returns {TransactionBuilder}
*/
  static new(linear_fee: LinearFee, minimum_utxo_val: BigNum, pool_deposit: BigNum, key_deposit: BigNum, max_value_size: number, max_tx_size: number, price_mem: number, price_step: number, language_views?: LanguageViews): TransactionBuilder;
/**
* does not include refunds or withdrawals
* @returns {Value}
*/
  get_explicit_input(): Value;
/**
* withdrawals and refunds
* @returns {Value}
*/
  get_implicit_input(): Value;
/**
* does not include fee
* @returns {Value}
*/
  get_explicit_output(): Value;
/**
* @returns {BigNum}
*/
  get_deposit(): BigNum;
/**
* @returns {BigNum | undefined}
*/
  get_fee_if_set(): BigNum | undefined;
/**
* Warning: this function will mutate the /fee/ field
* @param {Address} address
* @returns {boolean}
*/
  add_change_if_needed(address: Address): boolean;
/**
* @returns {number}
*/
  full_size(): number;
/**
* @returns {Uint32Array}
*/
  output_sizes(): Uint32Array;
/**
* @returns {TransactionBody}
*/
  build(): TransactionBody;
/**
* warning: sum of all parts of a transaction must equal 0. You cannot just set the fee to the min value and forget about it
* warning: min_fee may be slightly larger than the actual minimum fee (ex: a few lovelaces)
* this is done to simplify the library code, but can be fixed later
* @returns {BigNum}
*/
  min_fee(): BigNum;
}
/**
*/
export class TransactionHash {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {string} prefix
* @returns {string}
*/
  to_bech32(prefix: string): string;
/**
* @param {string} bech_str
* @returns {TransactionHash}
*/
  static from_bech32(bech_str: string): TransactionHash;
/**
* @param {Uint8Array} bytes
* @returns {TransactionHash}
*/
  static from_bytes(bytes: Uint8Array): TransactionHash;
}
/**
*/
export class TransactionInput {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {TransactionInput}
*/
  static from_bytes(bytes: Uint8Array): TransactionInput;
/**
* @returns {TransactionHash}
*/
  transaction_id(): TransactionHash;
/**
* @returns {number}
*/
  index(): number;
/**
* @param {TransactionHash} transaction_id
* @param {number} index
* @returns {TransactionInput}
*/
  static new(transaction_id: TransactionHash, index: number): TransactionInput;
}
/**
*/
export class TransactionInputs {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {TransactionInputs}
*/
  static from_bytes(bytes: Uint8Array): TransactionInputs;
/**
* @returns {TransactionInputs}
*/
  static new(): TransactionInputs;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {TransactionInput}
*/
  get(index: number): TransactionInput;
/**
* @param {TransactionInput} elem
*/
  add(elem: TransactionInput): void;
}
/**
*/
export class TransactionMetadatum {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {TransactionMetadatum}
*/
  static from_bytes(bytes: Uint8Array): TransactionMetadatum;
/**
* @param {MetadataMap} map
* @returns {TransactionMetadatum}
*/
  static new_map(map: MetadataMap): TransactionMetadatum;
/**
* @param {MetadataList} list
* @returns {TransactionMetadatum}
*/
  static new_list(list: MetadataList): TransactionMetadatum;
/**
* @param {Int} int
* @returns {TransactionMetadatum}
*/
  static new_int(int: Int): TransactionMetadatum;
/**
* @param {Uint8Array} bytes
* @returns {TransactionMetadatum}
*/
  static new_bytes(bytes: Uint8Array): TransactionMetadatum;
/**
* @param {string} text
* @returns {TransactionMetadatum}
*/
  static new_text(text: string): TransactionMetadatum;
/**
* @returns {number}
*/
  kind(): number;
/**
* @returns {MetadataMap}
*/
  as_map(): MetadataMap;
/**
* @returns {MetadataList}
*/
  as_list(): MetadataList;
/**
* @returns {Int}
*/
  as_int(): Int;
/**
* @returns {Uint8Array}
*/
  as_bytes(): Uint8Array;
/**
* @returns {string}
*/
  as_text(): string;
}
/**
*/
export class TransactionMetadatumLabels {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {TransactionMetadatumLabels}
*/
  static from_bytes(bytes: Uint8Array): TransactionMetadatumLabels;
/**
* @returns {TransactionMetadatumLabels}
*/
  static new(): TransactionMetadatumLabels;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {BigNum}
*/
  get(index: number): BigNum;
/**
* @param {BigNum} elem
*/
  add(elem: BigNum): void;
}
/**
*/
export class TransactionOutput {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {TransactionOutput}
*/
  static from_bytes(bytes: Uint8Array): TransactionOutput;
/**
* @returns {Address}
*/
  address(): Address;
/**
* @returns {Value}
*/
  amount(): Value;
/**
* @returns {DataHash | undefined}
*/
  data_hash(): DataHash | undefined;
/**
* @param {DataHash} data_hash
*/
  set_data_hash(data_hash: DataHash): void;
/**
* @param {Address} address
* @param {Value} amount
* @returns {TransactionOutput}
*/
  static new(address: Address, amount: Value): TransactionOutput;
}
/**
*/
export class TransactionOutputs {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {TransactionOutputs}
*/
  static from_bytes(bytes: Uint8Array): TransactionOutputs;
/**
* @returns {TransactionOutputs}
*/
  static new(): TransactionOutputs;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {TransactionOutput}
*/
  get(index: number): TransactionOutput;
/**
* @param {TransactionOutput} elem
*/
  add(elem: TransactionOutput): void;
}
/**
*/
export class TransactionUnspentOutput {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {TransactionUnspentOutput}
*/
  static from_bytes(bytes: Uint8Array): TransactionUnspentOutput;
/**
* @param {TransactionInput} input
* @param {TransactionOutput} output
* @returns {TransactionUnspentOutput}
*/
  static new(input: TransactionInput, output: TransactionOutput): TransactionUnspentOutput;
/**
* @returns {TransactionInput}
*/
  input(): TransactionInput;
/**
* @returns {TransactionOutput}
*/
  output(): TransactionOutput;
}
/**
*/
export class TransactionWitnessSet {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {TransactionWitnessSet}
*/
  static from_bytes(bytes: Uint8Array): TransactionWitnessSet;
/**
* @param {Vkeywitnesses} vkeys
*/
  set_vkeys(vkeys: Vkeywitnesses): void;
/**
* @returns {Vkeywitnesses | undefined}
*/
  vkeys(): Vkeywitnesses | undefined;
/**
* @param {NativeScripts} native_scripts
*/
  set_native_scripts(native_scripts: NativeScripts): void;
/**
* @returns {NativeScripts | undefined}
*/
  native_scripts(): NativeScripts | undefined;
/**
* @param {BootstrapWitnesses} bootstraps
*/
  set_bootstraps(bootstraps: BootstrapWitnesses): void;
/**
* @returns {BootstrapWitnesses | undefined}
*/
  bootstraps(): BootstrapWitnesses | undefined;
/**
* @param {PlutusScripts} plutus_scripts
*/
  set_plutus_scripts(plutus_scripts: PlutusScripts): void;
/**
* @returns {PlutusScripts | undefined}
*/
  plutus_scripts(): PlutusScripts | undefined;
/**
* @param {PlutusList} plutus_data
*/
  set_plutus_data(plutus_data: PlutusList): void;
/**
* @returns {PlutusList | undefined}
*/
  plutus_data(): PlutusList | undefined;
/**
* @param {Redeemers} redeemers
*/
  set_redeemers(redeemers: Redeemers): void;
/**
* @returns {Redeemers | undefined}
*/
  redeemers(): Redeemers | undefined;
/**
* @returns {TransactionWitnessSet}
*/
  static new(): TransactionWitnessSet;
}
/**
*/
export class TransactionWitnessSets {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {TransactionWitnessSets}
*/
  static from_bytes(bytes: Uint8Array): TransactionWitnessSets;
/**
* @returns {TransactionWitnessSets}
*/
  static new(): TransactionWitnessSets;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {TransactionWitnessSet}
*/
  get(index: number): TransactionWitnessSet;
/**
* @param {TransactionWitnessSet} elem
*/
  add(elem: TransactionWitnessSet): void;
}
/**
*/
export class URL {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {URL}
*/
  static from_bytes(bytes: Uint8Array): URL;
/**
* @param {string} url
* @returns {URL}
*/
  static new(url: string): URL;
/**
* @returns {string}
*/
  url(): string;
}
/**
*/
export class UnitInterval {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {UnitInterval}
*/
  static from_bytes(bytes: Uint8Array): UnitInterval;
/**
* @returns {BigNum}
*/
  numerator(): BigNum;
/**
* @returns {BigNum}
*/
  denominator(): BigNum;
/**
* @param {BigNum} numerator
* @param {BigNum} denominator
* @returns {UnitInterval}
*/
  static new(numerator: BigNum, denominator: BigNum): UnitInterval;
}
/**
*/
export class Update {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Update}
*/
  static from_bytes(bytes: Uint8Array): Update;
/**
* @returns {ProposedProtocolParameterUpdates}
*/
  proposed_protocol_parameter_updates(): ProposedProtocolParameterUpdates;
/**
* @returns {number}
*/
  epoch(): number;
/**
* @param {ProposedProtocolParameterUpdates} proposed_protocol_parameter_updates
* @param {number} epoch
* @returns {Update}
*/
  static new(proposed_protocol_parameter_updates: ProposedProtocolParameterUpdates, epoch: number): Update;
}
/**
*/
export class VRFCert {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {VRFCert}
*/
  static from_bytes(bytes: Uint8Array): VRFCert;
/**
* @returns {Uint8Array}
*/
  output(): Uint8Array;
/**
* @returns {Uint8Array}
*/
  proof(): Uint8Array;
/**
* @param {Uint8Array} output
* @param {Uint8Array} proof
* @returns {VRFCert}
*/
  static new(output: Uint8Array, proof: Uint8Array): VRFCert;
}
/**
*/
export class VRFKeyHash {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {string} prefix
* @returns {string}
*/
  to_bech32(prefix: string): string;
/**
* @param {string} bech_str
* @returns {VRFKeyHash}
*/
  static from_bech32(bech_str: string): VRFKeyHash;
/**
* @param {Uint8Array} bytes
* @returns {VRFKeyHash}
*/
  static from_bytes(bytes: Uint8Array): VRFKeyHash;
}
/**
*/
export class VRFVKey {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {string} prefix
* @returns {string}
*/
  to_bech32(prefix: string): string;
/**
* @param {string} bech_str
* @returns {VRFVKey}
*/
  static from_bech32(bech_str: string): VRFVKey;
/**
* @param {Uint8Array} bytes
* @returns {VRFVKey}
*/
  static from_bytes(bytes: Uint8Array): VRFVKey;
}
/**
*/
export class Value {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Value}
*/
  static from_bytes(bytes: Uint8Array): Value;
/**
* @param {BigNum} coin
* @returns {Value}
*/
  static new(coin: BigNum): Value;
/**
* @returns {BigNum}
*/
  coin(): BigNum;
/**
* @param {BigNum} coin
*/
  set_coin(coin: BigNum): void;
/**
* @returns {MultiAsset | undefined}
*/
  multiasset(): MultiAsset | undefined;
/**
* @param {MultiAsset} multiasset
*/
  set_multiasset(multiasset: MultiAsset): void;
/**
* @param {Value} rhs
* @returns {Value}
*/
  checked_add(rhs: Value): Value;
/**
* @param {Value} rhs_value
* @returns {Value}
*/
  checked_sub(rhs_value: Value): Value;
/**
* @param {Value} rhs_value
* @returns {Value}
*/
  clamped_sub(rhs_value: Value): Value;
/**
* note: values are only partially comparable
* @param {Value} rhs_value
* @returns {number | undefined}
*/
  compare(rhs_value: Value): number | undefined;
}
/**
*/
export class Vkey {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Vkey}
*/
  static from_bytes(bytes: Uint8Array): Vkey;
/**
* @param {PublicKey} pk
* @returns {Vkey}
*/
  static new(pk: PublicKey): Vkey;
/**
* @returns {PublicKey}
*/
  public_key(): PublicKey;
}
/**
*/
export class Vkeys {
  free(): void;
/**
* @returns {Vkeys}
*/
  static new(): Vkeys;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {Vkey}
*/
  get(index: number): Vkey;
/**
* @param {Vkey} elem
*/
  add(elem: Vkey): void;
}
/**
*/
export class Vkeywitness {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Vkeywitness}
*/
  static from_bytes(bytes: Uint8Array): Vkeywitness;
/**
* @param {Vkey} vkey
* @param {Ed25519Signature} signature
* @returns {Vkeywitness}
*/
  static new(vkey: Vkey, signature: Ed25519Signature): Vkeywitness;
/**
* @returns {Vkey}
*/
  vkey(): Vkey;
/**
* @returns {Ed25519Signature}
*/
  signature(): Ed25519Signature;
}
/**
*/
export class Vkeywitnesses {
  free(): void;
/**
* @returns {Vkeywitnesses}
*/
  static new(): Vkeywitnesses;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {Vkeywitness}
*/
  get(index: number): Vkeywitness;
/**
* @param {Vkeywitness} elem
*/
  add(elem: Vkeywitness): void;
}
/**
*/
export class Withdrawals {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Withdrawals}
*/
  static from_bytes(bytes: Uint8Array): Withdrawals;
/**
* @returns {Withdrawals}
*/
  static new(): Withdrawals;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {RewardAddress} key
* @param {BigNum} value
* @returns {BigNum | undefined}
*/
  insert(key: RewardAddress, value: BigNum): BigNum | undefined;
/**
* @param {RewardAddress} key
* @returns {BigNum | undefined}
*/
  get(key: RewardAddress): BigNum | undefined;
/**
* @returns {RewardAddresses}
*/
  keys(): RewardAddresses;
}
