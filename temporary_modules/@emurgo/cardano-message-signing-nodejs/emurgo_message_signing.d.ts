/* tslint:disable */
/* eslint-disable */
/**
*/
export enum LabelKind {
  Int,
  Text,
}
/**
*/
export enum SignedMessageKind {
  COSESIGN,
  COSESIGN1,
}
/**
*/
export enum SigContext {
  Signature,
  Signature1,
  CounterSignature,
}
/**
*/
export enum CBORSpecialType {
  Bool,
  Float,
  Unassigned,
  Break,
  Undefined,
  Null,
}
/**
*/
export enum CBORValueKind {
  Int,
  Bytes,
  Text,
  Array,
  Object,
  TaggedCBOR,
  Special,
}
/**
*/
export enum AlgorithmId {
/**
*r" EdDSA (Pure EdDSA, not HashedEdDSA) - the algorithm used for Cardano addresses
*/
  EdDSA,
/**
*r" ChaCha20/Poly1305 w/ 256-bit key, 128-bit tag
*/
  ChaCha20Poly1305,
}
/**
*/
export enum KeyType {
/**
*r" octet key pair
*/
  OKP,
/**
*r" 2-coord EC
*/
  EC2,
  Symmetric,
}
/**
*/
export enum ECKey {
  CRV,
  X,
  Y,
  D,
}
/**
*/
export enum CurveType {
  P256,
  P384,
  P521,
  X25519,
  X448,
  Ed25519,
  Ed448,
}
/**
*/
export enum KeyOperation {
  Sign,
  Verify,
  Encrypt,
  Decrypt,
  WrapKey,
  UnwrapKey,
  DeriveKey,
  DeriveBits,
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
* @param {BigNum} other
* @returns {BigNum}
*/
  checked_mul(other: BigNum): BigNum;
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
}
/**
*/
export class CBORArray {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {CBORArray}
*/
  static from_bytes(bytes: Uint8Array): CBORArray;
/**
* @returns {CBORArray}
*/
  static new(): CBORArray;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {CBORValue}
*/
  get(index: number): CBORValue;
/**
* @param {CBORValue} elem
*/
  add(elem: CBORValue): void;
/**
* @param {boolean} use_definite
*/
  set_definite_encoding(use_definite: boolean): void;
/**
* @returns {boolean}
*/
  is_definite(): boolean;
}
/**
*/
export class CBORObject {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {CBORObject}
*/
  static from_bytes(bytes: Uint8Array): CBORObject;
/**
* @returns {CBORObject}
*/
  static new(): CBORObject;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {CBORValue} key
* @param {CBORValue} value
* @returns {CBORValue | undefined}
*/
  insert(key: CBORValue, value: CBORValue): CBORValue | undefined;
/**
* @param {CBORValue} key
* @returns {CBORValue | undefined}
*/
  get(key: CBORValue): CBORValue | undefined;
/**
* @returns {CBORArray}
*/
  keys(): CBORArray;
/**
* @param {boolean} use_definite
*/
  set_definite_encoding(use_definite: boolean): void;
/**
* @returns {boolean}
*/
  is_definite(): boolean;
}
/**
*/
export class CBORSpecial {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {CBORSpecial}
*/
  static from_bytes(bytes: Uint8Array): CBORSpecial;
/**
* @param {boolean} b
* @returns {CBORSpecial}
*/
  static new_bool(b: boolean): CBORSpecial;
/**
* @param {number} u
* @returns {CBORSpecial}
*/
  static new_unassigned(u: number): CBORSpecial;
/**
* @returns {CBORSpecial}
*/
  static new_break(): CBORSpecial;
/**
* @returns {CBORSpecial}
*/
  static new_null(): CBORSpecial;
/**
* @returns {CBORSpecial}
*/
  static new_undefined(): CBORSpecial;
/**
* @returns {number}
*/
  kind(): number;
/**
* @returns {boolean | undefined}
*/
  as_bool(): boolean | undefined;
/**
* @returns {number | undefined}
*/
  as_float(): number | undefined;
/**
* @returns {number | undefined}
*/
  as_unassigned(): number | undefined;
}
/**
*/
export class CBORValue {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {CBORValue}
*/
  static from_bytes(bytes: Uint8Array): CBORValue;
/**
* @param {Int} int
* @returns {CBORValue}
*/
  static new_int(int: Int): CBORValue;
/**
* @param {Uint8Array} bytes
* @returns {CBORValue}
*/
  static new_bytes(bytes: Uint8Array): CBORValue;
/**
* @param {string} text
* @returns {CBORValue}
*/
  static new_text(text: string): CBORValue;
/**
* @param {CBORArray} arr
* @returns {CBORValue}
*/
  static new_array(arr: CBORArray): CBORValue;
/**
* @param {CBORObject} obj
* @returns {CBORValue}
*/
  static new_object(obj: CBORObject): CBORValue;
/**
* @param {TaggedCBOR} tagged
* @returns {CBORValue}
*/
  static new_tagged(tagged: TaggedCBOR): CBORValue;
/**
* @param {CBORSpecial} special
* @returns {CBORValue}
*/
  static new_special(special: CBORSpecial): CBORValue;
/**
* @returns {number}
*/
  kind(): number;
/**
* @returns {Int | undefined}
*/
  as_int(): Int | undefined;
/**
* @returns {Uint8Array | undefined}
*/
  as_bytes(): Uint8Array | undefined;
/**
* @returns {string | undefined}
*/
  as_text(): string | undefined;
/**
* @returns {CBORArray | undefined}
*/
  as_array(): CBORArray | undefined;
/**
* @returns {CBORObject | undefined}
*/
  as_object(): CBORObject | undefined;
/**
* @returns {TaggedCBOR | undefined}
*/
  as_tagged(): TaggedCBOR | undefined;
/**
* @returns {CBORSpecial | undefined}
*/
  as_special(): CBORSpecial | undefined;
}
/**
*/
export class COSEEncrypt {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {COSEEncrypt}
*/
  static from_bytes(bytes: Uint8Array): COSEEncrypt;
/**
* @returns {Headers}
*/
  headers(): Headers;
/**
* @returns {Uint8Array | undefined}
*/
  ciphertext(): Uint8Array | undefined;
/**
* @returns {COSERecipients}
*/
  recipients(): COSERecipients;
/**
* @param {Headers} headers
* @param {Uint8Array | undefined} ciphertext
* @param {COSERecipients} recipients
* @returns {COSEEncrypt}
*/
  static new(headers: Headers, ciphertext: Uint8Array | undefined, recipients: COSERecipients): COSEEncrypt;
}
/**
*/
export class COSEEncrypt0 {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {COSEEncrypt0}
*/
  static from_bytes(bytes: Uint8Array): COSEEncrypt0;
/**
* @returns {Headers}
*/
  headers(): Headers;
/**
* @returns {Uint8Array | undefined}
*/
  ciphertext(): Uint8Array | undefined;
/**
* @param {Headers} headers
* @param {Uint8Array | undefined} ciphertext
* @returns {COSEEncrypt0}
*/
  static new(headers: Headers, ciphertext?: Uint8Array): COSEEncrypt0;
}
/**
*/
export class COSEKey {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {COSEKey}
*/
  static from_bytes(bytes: Uint8Array): COSEKey;
/**
* @param {Label} key_type
*/
  set_key_type(key_type: Label): void;
/**
* @returns {Label}
*/
  key_type(): Label;
/**
* @param {Uint8Array} key_id
*/
  set_key_id(key_id: Uint8Array): void;
/**
* @returns {Uint8Array | undefined}
*/
  key_id(): Uint8Array | undefined;
/**
* @param {Label} algorithm_id
*/
  set_algorithm_id(algorithm_id: Label): void;
/**
* @returns {Label | undefined}
*/
  algorithm_id(): Label | undefined;
/**
* @param {Labels} key_ops
*/
  set_key_ops(key_ops: Labels): void;
/**
* @returns {Labels | undefined}
*/
  key_ops(): Labels | undefined;
/**
* @param {Uint8Array} base_init_vector
*/
  set_base_init_vector(base_init_vector: Uint8Array): void;
/**
* @returns {Uint8Array | undefined}
*/
  base_init_vector(): Uint8Array | undefined;
/**
* @param {Label} label
* @returns {CBORValue | undefined}
*/
  header(label: Label): CBORValue | undefined;
/**
* @param {Label} label
* @param {CBORValue} value
*/
  set_header(label: Label, value: CBORValue): void;
/**
* @param {Label} key_type
* @returns {COSEKey}
*/
  static new(key_type: Label): COSEKey;
}
/**
*/
export class COSERecipient {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {COSERecipient}
*/
  static from_bytes(bytes: Uint8Array): COSERecipient;
/**
* @returns {Headers}
*/
  headers(): Headers;
/**
* @returns {Uint8Array | undefined}
*/
  ciphertext(): Uint8Array | undefined;
/**
* @param {Headers} headers
* @param {Uint8Array | undefined} ciphertext
* @returns {COSERecipient}
*/
  static new(headers: Headers, ciphertext?: Uint8Array): COSERecipient;
}
/**
*/
export class COSERecipients {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {COSERecipients}
*/
  static from_bytes(bytes: Uint8Array): COSERecipients;
/**
* @returns {COSERecipients}
*/
  static new(): COSERecipients;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {COSERecipient}
*/
  get(index: number): COSERecipient;
/**
* @param {COSERecipient} elem
*/
  add(elem: COSERecipient): void;
}
/**
*/
export class COSESign {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {COSESign}
*/
  static from_bytes(bytes: Uint8Array): COSESign;
/**
* @returns {Headers}
*/
  headers(): Headers;
/**
* @returns {Uint8Array | undefined}
*/
  payload(): Uint8Array | undefined;
/**
* @returns {COSESignatures}
*/
  signatures(): COSESignatures;
/**
* @param {Headers} headers
* @param {Uint8Array | undefined} payload
* @param {COSESignatures} signatures
* @returns {COSESign}
*/
  static new(headers: Headers, payload: Uint8Array | undefined, signatures: COSESignatures): COSESign;
}
/**
*/
export class COSESign1 {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {COSESign1}
*/
  static from_bytes(bytes: Uint8Array): COSESign1;
/**
* @returns {Headers}
*/
  headers(): Headers;
/**
* @returns {Uint8Array | undefined}
*/
  payload(): Uint8Array | undefined;
/**
* @returns {Uint8Array}
*/
  signature(): Uint8Array;
/**
* For verifying, we will want to reverse-construct this SigStructure to check the signature against
* # Arguments
* * `external_aad` - External application data - see RFC 8152 section 4.3. Set to None if not using this.
* @param {Uint8Array | undefined} external_aad
* @param {Uint8Array | undefined} external_payload
* @returns {SigStructure}
*/
  signed_data(external_aad?: Uint8Array, external_payload?: Uint8Array): SigStructure;
/**
* @param {Headers} headers
* @param {Uint8Array | undefined} payload
* @param {Uint8Array} signature
* @returns {COSESign1}
*/
  static new(headers: Headers, payload: Uint8Array | undefined, signature: Uint8Array): COSESign1;
}
/**
*/
export class COSESign1Builder {
  free(): void;
/**
* @param {Headers} headers
* @param {Uint8Array} payload
* @param {boolean} is_payload_external
* @returns {COSESign1Builder}
*/
  static new(headers: Headers, payload: Uint8Array, is_payload_external: boolean): COSESign1Builder;
/**
*/
  hash_payload(): void;
/**
* @param {Uint8Array} external_aad
*/
  set_external_aad(external_aad: Uint8Array): void;
/**
* @returns {SigStructure}
*/
  make_data_to_sign(): SigStructure;
/**
* @param {Uint8Array} signed_sig_structure
* @returns {COSESign1}
*/
  build(signed_sig_structure: Uint8Array): COSESign1;
}
/**
*/
export class COSESignBuilder {
  free(): void;
/**
* @param {Headers} headers
* @param {Uint8Array} payload
* @param {boolean} is_payload_external
* @returns {COSESignBuilder}
*/
  static new(headers: Headers, payload: Uint8Array, is_payload_external: boolean): COSESignBuilder;
/**
*/
  hash_payload(): void;
/**
* @param {Uint8Array} external_aad
*/
  set_external_aad(external_aad: Uint8Array): void;
/**
* @returns {SigStructure}
*/
  make_data_to_sign(): SigStructure;
/**
* @param {COSESignatures} signed_sig_structure
* @returns {COSESign}
*/
  build(signed_sig_structure: COSESignatures): COSESign;
}
/**
*/
export class COSESignature {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {COSESignature}
*/
  static from_bytes(bytes: Uint8Array): COSESignature;
/**
* @returns {Headers}
*/
  headers(): Headers;
/**
* @returns {Uint8Array}
*/
  signature(): Uint8Array;
/**
* @param {Headers} headers
* @param {Uint8Array} signature
* @returns {COSESignature}
*/
  static new(headers: Headers, signature: Uint8Array): COSESignature;
}
/**
*/
export class COSESignatures {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {COSESignatures}
*/
  static from_bytes(bytes: Uint8Array): COSESignatures;
/**
* @returns {COSESignatures}
*/
  static new(): COSESignatures;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {COSESignature}
*/
  get(index: number): COSESignature;
/**
* @param {COSESignature} elem
*/
  add(elem: COSESignature): void;
}
/**
*/
export class CounterSignature {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {CounterSignature}
*/
  static from_bytes(bytes: Uint8Array): CounterSignature;
/**
* @param {COSESignature} cose_signature
* @returns {CounterSignature}
*/
  static new_single(cose_signature: COSESignature): CounterSignature;
/**
* @param {COSESignatures} cose_signatures
* @returns {CounterSignature}
*/
  static new_multi(cose_signatures: COSESignatures): CounterSignature;
/**
* @returns {COSESignatures}
*/
  signatures(): COSESignatures;
}
/**
*/
export class EdDSA25519Key {
  free(): void;
/**
* @param {Uint8Array} pubkey_bytes
* @returns {EdDSA25519Key}
*/
  static new(pubkey_bytes: Uint8Array): EdDSA25519Key;
/**
* @param {Uint8Array} private_key_bytes
*/
  set_private_key(private_key_bytes: Uint8Array): void;
/**
*/
  is_for_signing(): void;
/**
*/
  is_for_verifying(): void;
/**
* @returns {COSEKey}
*/
  build(): COSEKey;
}
/**
*/
export class HeaderMap {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {HeaderMap}
*/
  static from_bytes(bytes: Uint8Array): HeaderMap;
/**
* @param {Label} algorithm_id
*/
  set_algorithm_id(algorithm_id: Label): void;
/**
* @returns {Label | undefined}
*/
  algorithm_id(): Label | undefined;
/**
* @param {Labels} criticality
*/
  set_criticality(criticality: Labels): void;
/**
* @returns {Labels | undefined}
*/
  criticality(): Labels | undefined;
/**
* @param {Label} content_type
*/
  set_content_type(content_type: Label): void;
/**
* @returns {Label | undefined}
*/
  content_type(): Label | undefined;
/**
* @param {Uint8Array} key_id
*/
  set_key_id(key_id: Uint8Array): void;
/**
* @returns {Uint8Array | undefined}
*/
  key_id(): Uint8Array | undefined;
/**
* @param {Uint8Array} init_vector
*/
  set_init_vector(init_vector: Uint8Array): void;
/**
* @returns {Uint8Array | undefined}
*/
  init_vector(): Uint8Array | undefined;
/**
* @param {Uint8Array} partial_init_vector
*/
  set_partial_init_vector(partial_init_vector: Uint8Array): void;
/**
* @returns {Uint8Array | undefined}
*/
  partial_init_vector(): Uint8Array | undefined;
/**
* @param {CounterSignature} counter_signature
*/
  set_counter_signature(counter_signature: CounterSignature): void;
/**
* @returns {CounterSignature | undefined}
*/
  counter_signature(): CounterSignature | undefined;
/**
* @param {Label} label
* @returns {CBORValue | undefined}
*/
  header(label: Label): CBORValue | undefined;
/**
* @param {Label} label
* @param {CBORValue} value
*/
  set_header(label: Label, value: CBORValue): void;
/**
* @returns {Labels}
*/
  keys(): Labels;
/**
* @returns {HeaderMap}
*/
  static new(): HeaderMap;
}
/**
*/
export class Headers {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Headers}
*/
  static from_bytes(bytes: Uint8Array): Headers;
/**
* @returns {ProtectedHeaderMap}
*/
  protected(): ProtectedHeaderMap;
/**
* @returns {HeaderMap}
*/
  unprotected(): HeaderMap;
/**
* @param {ProtectedHeaderMap} protected_
* @param {HeaderMap} unprotected_
* @returns {Headers}
*/
  static new(protected_: ProtectedHeaderMap, unprotected_: HeaderMap): Headers;
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
export class Label {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Label}
*/
  static from_bytes(bytes: Uint8Array): Label;
/**
* @param {Int} int
* @returns {Label}
*/
  static new_int(int: Int): Label;
/**
* @param {string} text
* @returns {Label}
*/
  static new_text(text: string): Label;
/**
* @returns {number}
*/
  kind(): number;
/**
* @returns {Int | undefined}
*/
  as_int(): Int | undefined;
/**
* @returns {string | undefined}
*/
  as_text(): string | undefined;
/**
* @param {number} id
* @returns {Label}
*/
  static from_algorithm_id(id: number): Label;
/**
* @param {number} key_type
* @returns {Label}
*/
  static from_key_type(key_type: number): Label;
/**
* @param {number} ec_key
* @returns {Label}
*/
  static from_ec_key(ec_key: number): Label;
/**
* @param {number} curve_type
* @returns {Label}
*/
  static from_curve_type(curve_type: number): Label;
/**
* @param {number} key_op
* @returns {Label}
*/
  static from_key_operation(key_op: number): Label;
}
/**
*/
export class Labels {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {Labels}
*/
  static from_bytes(bytes: Uint8Array): Labels;
/**
* @returns {Labels}
*/
  static new(): Labels;
/**
* @returns {number}
*/
  len(): number;
/**
* @param {number} index
* @returns {Label}
*/
  get(index: number): Label;
/**
* @param {Label} elem
*/
  add(elem: Label): void;
}
/**
*/
export class PasswordEncryption {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {PasswordEncryption}
*/
  static from_bytes(bytes: Uint8Array): PasswordEncryption;
/**
* @param {COSEEncrypt0} data
* @returns {PasswordEncryption}
*/
  static new(data: COSEEncrypt0): PasswordEncryption;
}
/**
*/
export class ProtectedHeaderMap {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {ProtectedHeaderMap}
*/
  static from_bytes(bytes: Uint8Array): ProtectedHeaderMap;
/**
* @returns {ProtectedHeaderMap}
*/
  static new_empty(): ProtectedHeaderMap;
/**
* @param {HeaderMap} header_map
* @returns {ProtectedHeaderMap}
*/
  static new(header_map: HeaderMap): ProtectedHeaderMap;
/**
* @returns {HeaderMap}
*/
  deserialized_headers(): HeaderMap;
}
/**
*/
export class PubKeyEncryption {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {PubKeyEncryption}
*/
  static from_bytes(bytes: Uint8Array): PubKeyEncryption;
/**
* @param {COSEEncrypt} data
* @returns {PubKeyEncryption}
*/
  static new(data: COSEEncrypt): PubKeyEncryption;
}
/**
*/
export class SigStructure {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {SigStructure}
*/
  static from_bytes(bytes: Uint8Array): SigStructure;
/**
* @returns {number}
*/
  context(): number;
/**
* @returns {ProtectedHeaderMap}
*/
  body_protected(): ProtectedHeaderMap;
/**
* @returns {ProtectedHeaderMap | undefined}
*/
  sign_protected(): ProtectedHeaderMap | undefined;
/**
* @returns {Uint8Array}
*/
  external_aad(): Uint8Array;
/**
* @returns {Uint8Array}
*/
  payload(): Uint8Array;
/**
* @param {ProtectedHeaderMap} sign_protected
*/
  set_sign_protected(sign_protected: ProtectedHeaderMap): void;
/**
* @param {number} context
* @param {ProtectedHeaderMap} body_protected
* @param {Uint8Array} external_aad
* @param {Uint8Array} payload
* @returns {SigStructure}
*/
  static new(context: number, body_protected: ProtectedHeaderMap, external_aad: Uint8Array, payload: Uint8Array): SigStructure;
}
/**
*/
export class SignedMessage {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {SignedMessage}
*/
  static from_bytes(bytes: Uint8Array): SignedMessage;
/**
* @param {COSESign} cose_sign
* @returns {SignedMessage}
*/
  static new_cose_sign(cose_sign: COSESign): SignedMessage;
/**
* @param {COSESign1} cose_sign1
* @returns {SignedMessage}
*/
  static new_cose_sign1(cose_sign1: COSESign1): SignedMessage;
/**
* @param {string} s
* @returns {SignedMessage}
*/
  static from_user_facing_encoding(s: string): SignedMessage;
/**
* @returns {string}
*/
  to_user_facing_encoding(): string;
/**
* @returns {number}
*/
  kind(): number;
/**
* @returns {COSESign | undefined}
*/
  as_cose_sign(): COSESign | undefined;
/**
* @returns {COSESign1 | undefined}
*/
  as_cose_sign1(): COSESign1 | undefined;
}
/**
*/
export class TaggedCBOR {
  free(): void;
/**
* @returns {Uint8Array}
*/
  to_bytes(): Uint8Array;
/**
* @param {Uint8Array} bytes
* @returns {TaggedCBOR}
*/
  static from_bytes(bytes: Uint8Array): TaggedCBOR;
/**
* @returns {BigNum}
*/
  tag(): BigNum;
/**
* @returns {CBORValue}
*/
  value(): CBORValue;
/**
* @param {BigNum} tag
* @param {CBORValue} value
* @returns {TaggedCBOR}
*/
  static new(tag: BigNum, value: CBORValue): TaggedCBOR;
}
