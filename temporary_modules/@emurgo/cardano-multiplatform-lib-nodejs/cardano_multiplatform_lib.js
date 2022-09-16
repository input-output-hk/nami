let imports = {};
imports['__wbindgen_placeholder__'] = module.exports;
let wasm;
const { TextDecoder, TextEncoder } = require(`util`);

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_32(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__haaf4f94fe6f806b8(arg0, arg1, addHeapObject(arg2));
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}
/**
* @param {Uint8Array} bytes
* @returns {TransactionMetadatum}
*/
module.exports.encode_arbitrary_bytes_as_metadatum = function(bytes) {
    var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    var ret = wasm.encode_arbitrary_bytes_as_metadatum(ptr0, len0);
    return TransactionMetadatum.__wrap(ret);
};

/**
* @param {TransactionMetadatum} metadata
* @returns {Uint8Array}
*/
module.exports.decode_arbitrary_bytes_from_metadatum = function(metadata) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        _assertClass(metadata, TransactionMetadatum);
        wasm.decode_arbitrary_bytes_from_metadatum(retptr, metadata.ptr);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v0 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);
        return v0;
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
};

/**
* @param {string} json
* @param {number} schema
* @returns {TransactionMetadatum}
*/
module.exports.encode_json_str_to_metadatum = function(json, schema) {
    var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    var ret = wasm.encode_json_str_to_metadatum(ptr0, len0, schema);
    return TransactionMetadatum.__wrap(ret);
};

/**
* @param {TransactionMetadatum} metadatum
* @param {number} schema
* @returns {string}
*/
module.exports.decode_metadatum_to_json_str = function(metadatum, schema) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        _assertClass(metadatum, TransactionMetadatum);
        wasm.decode_metadatum_to_json_str(retptr, metadatum.ptr, schema);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(r0, r1);
    }
};

let cachegetUint32Memory0 = null;
function getUint32Memory0() {
    if (cachegetUint32Memory0 === null || cachegetUint32Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachegetUint32Memory0;
}

function getArrayU32FromWasm0(ptr, len) {
    return getUint32Memory0().subarray(ptr / 4, ptr / 4 + len);
}
/**
* @param {string} password
* @param {string} salt
* @param {string} nonce
* @param {string} data
* @returns {string}
*/
module.exports.encrypt_with_password = function(password, salt, nonce, data) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        var ptr0 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passStringToWasm0(salt, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = passStringToWasm0(nonce, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        var ptr3 = passStringToWasm0(data, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        wasm.encrypt_with_password(retptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(r0, r1);
    }
};

/**
* @param {string} password
* @param {string} data
* @returns {string}
*/
module.exports.decrypt_with_password = function(password, data) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        var ptr0 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passStringToWasm0(data, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        wasm.decrypt_with_password(retptr, ptr0, len0, ptr1, len1);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(r0, r1);
    }
};

/**
* @param {TransactionHash} tx_body_hash
* @param {ByronAddress} addr
* @param {LegacyDaedalusPrivateKey} key
* @returns {BootstrapWitness}
*/
module.exports.make_daedalus_bootstrap_witness = function(tx_body_hash, addr, key) {
    _assertClass(tx_body_hash, TransactionHash);
    _assertClass(addr, ByronAddress);
    _assertClass(key, LegacyDaedalusPrivateKey);
    var ret = wasm.make_daedalus_bootstrap_witness(tx_body_hash.ptr, addr.ptr, key.ptr);
    return BootstrapWitness.__wrap(ret);
};

/**
* @param {TransactionHash} tx_body_hash
* @param {ByronAddress} addr
* @param {Bip32PrivateKey} key
* @returns {BootstrapWitness}
*/
module.exports.make_icarus_bootstrap_witness = function(tx_body_hash, addr, key) {
    _assertClass(tx_body_hash, TransactionHash);
    _assertClass(addr, ByronAddress);
    _assertClass(key, Bip32PrivateKey);
    var ret = wasm.make_icarus_bootstrap_witness(tx_body_hash.ptr, addr.ptr, key.ptr);
    return BootstrapWitness.__wrap(ret);
};

/**
* @param {TransactionHash} tx_body_hash
* @param {PrivateKey} sk
* @returns {Vkeywitness}
*/
module.exports.make_vkey_witness = function(tx_body_hash, sk) {
    _assertClass(tx_body_hash, TransactionHash);
    _assertClass(sk, PrivateKey);
    var ret = wasm.make_vkey_witness(tx_body_hash.ptr, sk.ptr);
    return Vkeywitness.__wrap(ret);
};

/**
* @param {AuxiliaryData} auxiliary_data
* @returns {AuxiliaryDataHash}
*/
module.exports.hash_auxiliary_data = function(auxiliary_data) {
    _assertClass(auxiliary_data, AuxiliaryData);
    var ret = wasm.hash_auxiliary_data(auxiliary_data.ptr);
    return AuxiliaryDataHash.__wrap(ret);
};

/**
* @param {TransactionBody} tx_body
* @returns {TransactionHash}
*/
module.exports.hash_transaction = function(tx_body) {
    _assertClass(tx_body, TransactionBody);
    var ret = wasm.hash_transaction(tx_body.ptr);
    return TransactionHash.__wrap(ret);
};

/**
* @param {PlutusData} plutus_data
* @returns {DataHash}
*/
module.exports.hash_plutus_data = function(plutus_data) {
    _assertClass(plutus_data, PlutusData);
    var ret = wasm.hash_plutus_data(plutus_data.ptr);
    return DataHash.__wrap(ret);
};

/**
* @param {Uint8Array} data
* @returns {Uint8Array}
*/
module.exports.hash_blake2b256 = function(data) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.hash_blake2b256(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v1 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);
        return v1;
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
};

/**
* @param {Uint8Array} data
* @returns {Uint8Array}
*/
module.exports.hash_blake2b224 = function(data) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.hash_blake2b224(retptr, ptr0, len0);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var v1 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1);
        return v1;
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
};

/**
* @param {Redeemers} redeemers
* @param {Costmdls} cost_models
* @param {PlutusList | undefined} datums
* @returns {ScriptDataHash}
*/
module.exports.hash_script_data = function(redeemers, cost_models, datums) {
    _assertClass(redeemers, Redeemers);
    _assertClass(cost_models, Costmdls);
    let ptr0 = 0;
    if (!isLikeNone(datums)) {
        _assertClass(datums, PlutusList);
        ptr0 = datums.ptr;
        datums.ptr = 0;
    }
    var ret = wasm.hash_script_data(redeemers.ptr, cost_models.ptr, ptr0);
    return ScriptDataHash.__wrap(ret);
};

/**
* @param {TransactionBody} txbody
* @param {BigNum} pool_deposit
* @param {BigNum} key_deposit
* @returns {Value}
*/
module.exports.get_implicit_input = function(txbody, pool_deposit, key_deposit) {
    _assertClass(txbody, TransactionBody);
    _assertClass(pool_deposit, BigNum);
    _assertClass(key_deposit, BigNum);
    var ret = wasm.get_implicit_input(txbody.ptr, pool_deposit.ptr, key_deposit.ptr);
    return Value.__wrap(ret);
};

/**
* @param {TransactionBody} txbody
* @param {BigNum} pool_deposit
* @param {BigNum} key_deposit
* @returns {BigNum}
*/
module.exports.get_deposit = function(txbody, pool_deposit, key_deposit) {
    _assertClass(txbody, TransactionBody);
    _assertClass(pool_deposit, BigNum);
    _assertClass(key_deposit, BigNum);
    var ret = wasm.get_deposit(txbody.ptr, pool_deposit.ptr, key_deposit.ptr);
    return BigNum.__wrap(ret);
};

/**
* @param {TransactionOutput} output
* @param {BigNum} coins_per_utxo_byte
* @returns {BigNum}
*/
module.exports.min_ada_required = function(output, coins_per_utxo_byte) {
    _assertClass(output, TransactionOutput);
    _assertClass(coins_per_utxo_byte, BigNum);
    var ret = wasm.min_ada_required(output.ptr, coins_per_utxo_byte.ptr);
    return BigNum.__wrap(ret);
};

/**
* Receives a script JSON string
* and returns a NativeScript.
* Cardano Wallet and Node styles are supported.
*
* * wallet: https://github.com/input-output-hk/cardano-wallet/blob/master/specifications/api/swagger.yaml
* * node: https://github.com/input-output-hk/cardano-node/blob/master/doc/reference/simple-scripts.md
*
* self_xpub is expected to be a Bip32PublicKey as hex-encoded bytes
* @param {string} json
* @param {string} self_xpub
* @param {number} schema
* @returns {NativeScript}
*/
module.exports.encode_json_str_to_native_script = function(json, self_xpub, schema) {
    var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    var ptr1 = passStringToWasm0(self_xpub, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    var ret = wasm.encode_json_str_to_native_script(ptr0, len0, ptr1, len1, schema);
    return NativeScript.__wrap(ret);
};

/**
* @param {string} json
* @param {number} schema
* @returns {PlutusData}
*/
module.exports.encode_json_str_to_plutus_datum = function(json, schema) {
    var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    var ret = wasm.encode_json_str_to_plutus_datum(ptr0, len0, schema);
    return PlutusData.__wrap(ret);
};

/**
* @param {PlutusData} datum
* @param {number} schema
* @returns {string}
*/
module.exports.decode_plutus_datum_to_json_str = function(datum, schema) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        _assertClass(datum, PlutusData);
        wasm.decode_plutus_datum_to_json_str(retptr, datum.ptr, schema);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(r0, r1);
    }
};

/**
* @param {Transaction} tx
* @param {LinearFee} linear_fee
* @param {ExUnitPrices} ex_unit_prices
* @returns {BigNum}
*/
module.exports.min_fee = function(tx, linear_fee, ex_unit_prices) {
    _assertClass(tx, Transaction);
    _assertClass(linear_fee, LinearFee);
    _assertClass(ex_unit_prices, ExUnitPrices);
    var ret = wasm.min_fee(tx.ptr, linear_fee.ptr, ex_unit_prices.ptr);
    return BigNum.__wrap(ret);
};

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}
function __wbg_adapter_1364(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures__invoke2_mut__h7a735230209646c7(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

/**
*/
module.exports.CertificateKind = Object.freeze({ StakeRegistration:0,"0":"StakeRegistration",StakeDeregistration:1,"1":"StakeDeregistration",StakeDelegation:2,"2":"StakeDelegation",PoolRegistration:3,"3":"PoolRegistration",PoolRetirement:4,"4":"PoolRetirement",GenesisKeyDelegation:5,"5":"GenesisKeyDelegation",MoveInstantaneousRewardsCert:6,"6":"MoveInstantaneousRewardsCert", });
/**
*/
module.exports.MIRPot = Object.freeze({ Reserves:0,"0":"Reserves",Treasury:1,"1":"Treasury", });
/**
*/
module.exports.MIRKind = Object.freeze({ ToOtherPot:0,"0":"ToOtherPot",ToStakeCredentials:1,"1":"ToStakeCredentials", });
/**
*/
module.exports.RelayKind = Object.freeze({ SingleHostAddr:0,"0":"SingleHostAddr",SingleHostName:1,"1":"SingleHostName",MultiHostName:2,"2":"MultiHostName", });
/**
*/
module.exports.NativeScriptKind = Object.freeze({ ScriptPubkey:0,"0":"ScriptPubkey",ScriptAll:1,"1":"ScriptAll",ScriptAny:2,"2":"ScriptAny",ScriptNOfK:3,"3":"ScriptNOfK",TimelockStart:4,"4":"TimelockStart",TimelockExpiry:5,"5":"TimelockExpiry", });
/**
*/
module.exports.NetworkIdKind = Object.freeze({ Testnet:0,"0":"Testnet",Mainnet:1,"1":"Mainnet", });
/**
*/
module.exports.TransactionMetadatumKind = Object.freeze({ MetadataMap:0,"0":"MetadataMap",MetadataList:1,"1":"MetadataList",Int:2,"2":"Int",Bytes:3,"3":"Bytes",Text:4,"4":"Text", });
/**
*/
module.exports.MetadataJsonSchema = Object.freeze({ NoConversions:0,"0":"NoConversions",BasicConversions:1,"1":"BasicConversions",DetailedSchema:2,"2":"DetailedSchema", });
/**
*/
module.exports.StakeCredKind = Object.freeze({ Key:0,"0":"Key",Script:1,"1":"Script", });
/**
*/
module.exports.ScriptWitnessKind = Object.freeze({ NativeWitness:0,"0":"NativeWitness",PlutusWitness:1,"1":"PlutusWitness", });
/**
* Each new language uses a different namespace for hashing its script
* This is because you could have a language where the same bytes have different semantics
* So this avoids scripts in different languages mapping to the same hash
* Note that the enum value here is different than the enum value for deciding the cost model of a script
* https://github.com/input-output-hk/cardano-ledger/blob/9c3b4737b13b30f71529e76c5330f403165e28a6/eras/alonzo/impl/src/Cardano/Ledger/Alonzo.hs#L127
*/
module.exports.ScriptHashNamespace = Object.freeze({ NativeScript:0,"0":"NativeScript",PlutusV1:1,"1":"PlutusV1",PlutusV2:2,"2":"PlutusV2", });
/**
* Used to choose the schema for a script JSON string
*/
module.exports.ScriptSchema = Object.freeze({ Wallet:0,"0":"Wallet",Node:1,"1":"Node", });
/**
*/
module.exports.LanguageKind = Object.freeze({ PlutusV1:0,"0":"PlutusV1",PlutusV2:1,"1":"PlutusV2", });
/**
*/
module.exports.PlutusDataKind = Object.freeze({ ConstrPlutusData:0,"0":"ConstrPlutusData",Map:1,"1":"Map",List:2,"2":"List",Integer:3,"3":"Integer",Bytes:4,"4":"Bytes", });
/**
*/
module.exports.RedeemerTagKind = Object.freeze({ Spend:0,"0":"Spend",Mint:1,"1":"Mint",Cert:2,"2":"Cert",Reward:3,"3":"Reward", });
/**
* JSON <-> PlutusData conversion schemas.
* Follows ScriptDataJsonSchema in cardano-cli defined at:
* https://github.com/input-output-hk/cardano-node/blob/master/cardano-api/src/Cardano/Api/ScriptData.hs#L254
*
* All methods here have the following restrictions due to limitations on dependencies:
* * JSON numbers above u64::MAX (positive) or below i64::MIN (negative) will throw errors
* * Hex strings for bytes don't accept odd-length (half-byte) strings.
*      cardano-cli seems to support these however but it seems to be different than just 0-padding
*      on either side when tested so proceed with caution
*/
module.exports.PlutusDatumSchema = Object.freeze({
/**
* ScriptDataJsonNoSchema in cardano-node.
*
* This is the format used by --script-data-value in cardano-cli
* This tries to accept most JSON but does not support the full spectrum of Plutus datums.
* From JSON:
* * null/true/false/floats NOT supported
* * strings starting with 0x are treated as hex bytes. All other strings are encoded as their utf8 bytes.
* To JSON:
* * ConstrPlutusData not supported in ANY FORM (neither keys nor values)
* * Lists not supported in keys
* * Maps not supported in keys
*/
BasicConversions:0,"0":"BasicConversions",
/**
* ScriptDataJsonDetailedSchema in cardano-node.
*
* This is the format used by --script-data-file in cardano-cli
* This covers almost all (only minor exceptions) Plutus datums, but the JSON must conform to a strict schema.
* The schema specifies that ALL keys and ALL values must be contained in a JSON map with 2 cases:
* 1. For ConstrPlutusData there must be two fields "constructor" contianing a number and "fields" containing its fields
*    e.g. { "constructor": 2, "fields": [{"int": 2}, {"list": [{"bytes": "CAFEF00D"}]}]}
* 2. For all other cases there must be only one field named "int", "bytes", "list" or "map"
*    Integer's value is a JSON number e.g. {"int": 100}
*    Bytes' value is a hex string representing the bytes WITHOUT any prefix e.g. {"bytes": "CAFEF00D"}
*    Lists' value is a JSON list of its elements encoded via the same schema e.g. {"list": [{"bytes": "CAFEF00D"}]}
*    Maps' value is a JSON list of objects, one for each key-value pair in the map, with keys "k" and "v"
*          respectively with their values being the plutus datum encoded via this same schema
*          e.g. {"map": [
*              {"k": {"int": 2}, "v": {"int": 5}},
*              {"k": {"map": [{"k": {"list": [{"int": 1}]}, "v": {"bytes": "FF03"}}]}, "v": {"list": []}}
*          ]}
* From JSON:
* * null/true/false/floats NOT supported
* * the JSON must conform to a very specific schema
* To JSON:
* * all Plutus datums should be fully supported outside of the integer range limitations outlined above.
*/
DetailedSchema:1,"1":"DetailedSchema", });
/**
*/
module.exports.ScriptKind = Object.freeze({ NativeScript:0,"0":"NativeScript",PlutusScriptV1:1,"1":"PlutusScriptV1",PlutusScriptV2:2,"2":"PlutusScriptV2", });
/**
*/
module.exports.DatumKind = Object.freeze({ Hash:0,"0":"Hash",Data:1,"1":"Data", });
/**
*/
class Address {

    static __wrap(ptr) {
        const obj = Object.create(Address.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_address_free(ptr);
    }
    /**
    * @param {Uint8Array} data
    * @returns {Address}
    */
    static from_bytes(data) {
        var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.address_from_bytes(ptr0, len0);
        return Address.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.address_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.address_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {Address}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.address_from_json(ptr0, len0);
        return Address.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.address_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string | undefined} prefix
    * @returns {string}
    */
    to_bech32(prefix) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = isLikeNone(prefix) ? 0 : passStringToWasm0(prefix, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.address_to_bech32(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} bech_str
    * @returns {Address}
    */
    static from_bech32(bech_str) {
        var ptr0 = passStringToWasm0(bech_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.address_from_bech32(ptr0, len0);
        return Address.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    network_id() {
        var ret = wasm.address_network_id(this.ptr);
        return ret;
    }
    /**
    * @returns {ByronAddress | undefined}
    */
    as_byron() {
        var ret = wasm.address_as_byron(this.ptr);
        return ret === 0 ? undefined : ByronAddress.__wrap(ret);
    }
    /**
    * @returns {RewardAddress | undefined}
    */
    as_reward() {
        var ret = wasm.address_as_reward(this.ptr);
        return ret === 0 ? undefined : RewardAddress.__wrap(ret);
    }
    /**
    * @returns {PointerAddress | undefined}
    */
    as_pointer() {
        var ret = wasm.address_as_pointer(this.ptr);
        return ret === 0 ? undefined : PointerAddress.__wrap(ret);
    }
    /**
    * @returns {EnterpriseAddress | undefined}
    */
    as_enterprise() {
        var ret = wasm.address_as_enterprise(this.ptr);
        return ret === 0 ? undefined : EnterpriseAddress.__wrap(ret);
    }
    /**
    * @returns {BaseAddress | undefined}
    */
    as_base() {
        var ret = wasm.address_as_base(this.ptr);
        return ret === 0 ? undefined : BaseAddress.__wrap(ret);
    }
}
module.exports.Address = Address;
/**
*/
class AssetName {

    static __wrap(ptr) {
        const obj = Object.create(AssetName.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_assetname_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.assetname_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {AssetName}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.assetname_from_bytes(ptr0, len0);
        return AssetName.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.assetname_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.assetname_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {AssetName}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.assetname_from_json(ptr0, len0);
        return AssetName.__wrap(ret);
    }
    /**
    * @param {Uint8Array} name
    * @returns {AssetName}
    */
    static new(name) {
        var ptr0 = passArray8ToWasm0(name, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.assetname_new(ptr0, len0);
        return AssetName.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    name() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.assetname_name(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.AssetName = AssetName;
/**
*/
class AssetNames {

    static __wrap(ptr) {
        const obj = Object.create(AssetNames.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_assetnames_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.assetnames_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {AssetNames}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.assetnames_from_bytes(ptr0, len0);
        return AssetNames.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.assetnames_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.assetnames_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {AssetNames}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.assetnames_from_json(ptr0, len0);
        return AssetNames.__wrap(ret);
    }
    /**
    * @returns {AssetNames}
    */
    static new() {
        var ret = wasm.assetnames_new();
        return AssetNames.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.assetnames_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {AssetName}
    */
    get(index) {
        var ret = wasm.assetnames_get(this.ptr, index);
        return AssetName.__wrap(ret);
    }
    /**
    * @param {AssetName} elem
    */
    add(elem) {
        _assertClass(elem, AssetName);
        wasm.assetnames_add(this.ptr, elem.ptr);
    }
}
module.exports.AssetNames = AssetNames;
/**
*/
class Assets {

    static __wrap(ptr) {
        const obj = Object.create(Assets.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_assets_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.assets_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Assets}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.assets_from_bytes(ptr0, len0);
        return Assets.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.assets_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.assets_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {Assets}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.assets_from_json(ptr0, len0);
        return Assets.__wrap(ret);
    }
    /**
    * @returns {Assets}
    */
    static new() {
        var ret = wasm.assets_new();
        return Assets.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.assets_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {AssetName} key
    * @param {BigNum} value
    * @returns {BigNum | undefined}
    */
    insert(key, value) {
        _assertClass(key, AssetName);
        _assertClass(value, BigNum);
        var ret = wasm.assets_insert(this.ptr, key.ptr, value.ptr);
        return ret === 0 ? undefined : BigNum.__wrap(ret);
    }
    /**
    * @param {AssetName} key
    * @returns {BigNum | undefined}
    */
    get(key) {
        _assertClass(key, AssetName);
        var ret = wasm.assets_get(this.ptr, key.ptr);
        return ret === 0 ? undefined : BigNum.__wrap(ret);
    }
    /**
    * @returns {AssetNames}
    */
    keys() {
        var ret = wasm.assets_keys(this.ptr);
        return AssetNames.__wrap(ret);
    }
}
module.exports.Assets = Assets;
/**
*/
class AuxiliaryData {

    static __wrap(ptr) {
        const obj = Object.create(AuxiliaryData.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_auxiliarydata_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.auxiliarydata_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {AuxiliaryData}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.auxiliarydata_from_bytes(ptr0, len0);
        return AuxiliaryData.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.auxiliarydata_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.auxiliarydata_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {AuxiliaryData}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.auxiliarydata_from_json(ptr0, len0);
        return AuxiliaryData.__wrap(ret);
    }
    /**
    * @returns {AuxiliaryData}
    */
    static new() {
        var ret = wasm.auxiliarydata_new();
        return AuxiliaryData.__wrap(ret);
    }
    /**
    * @returns {GeneralTransactionMetadata | undefined}
    */
    metadata() {
        var ret = wasm.auxiliarydata_metadata(this.ptr);
        return ret === 0 ? undefined : GeneralTransactionMetadata.__wrap(ret);
    }
    /**
    * @param {GeneralTransactionMetadata} metadata
    */
    set_metadata(metadata) {
        _assertClass(metadata, GeneralTransactionMetadata);
        wasm.auxiliarydata_set_metadata(this.ptr, metadata.ptr);
    }
    /**
    * @returns {NativeScripts | undefined}
    */
    native_scripts() {
        var ret = wasm.auxiliarydata_native_scripts(this.ptr);
        return ret === 0 ? undefined : NativeScripts.__wrap(ret);
    }
    /**
    * @param {NativeScripts} native_scripts
    */
    set_native_scripts(native_scripts) {
        _assertClass(native_scripts, NativeScripts);
        wasm.auxiliarydata_set_native_scripts(this.ptr, native_scripts.ptr);
    }
    /**
    * @returns {PlutusScripts | undefined}
    */
    plutus_scripts() {
        var ret = wasm.auxiliarydata_plutus_scripts(this.ptr);
        return ret === 0 ? undefined : PlutusScripts.__wrap(ret);
    }
    /**
    * @param {PlutusScripts} plutus_scripts
    */
    set_plutus_scripts(plutus_scripts) {
        _assertClass(plutus_scripts, PlutusScripts);
        wasm.auxiliarydata_set_plutus_scripts(this.ptr, plutus_scripts.ptr);
    }
    /**
    * @param {PlutusScripts} plutus_scripts
    */
    set_plutus_v2_scripts(plutus_scripts) {
        _assertClass(plutus_scripts, PlutusScripts);
        wasm.auxiliarydata_set_plutus_v2_scripts(this.ptr, plutus_scripts.ptr);
    }
}
module.exports.AuxiliaryData = AuxiliaryData;
/**
*/
class AuxiliaryDataHash {

    static __wrap(ptr) {
        const obj = Object.create(AuxiliaryDataHash.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_auxiliarydatahash_free(ptr);
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {AuxiliaryDataHash}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.auxiliarydatahash_from_bytes(ptr0, len0);
        return AuxiliaryDataHash.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.auxiliarydatahash_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} prefix
    * @returns {string}
    */
    to_bech32(prefix) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(prefix, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.auxiliarydatahash_to_bech32(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} bech_str
    * @returns {AuxiliaryDataHash}
    */
    static from_bech32(bech_str) {
        var ptr0 = passStringToWasm0(bech_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.auxiliarydatahash_from_bech32(ptr0, len0);
        return AuxiliaryDataHash.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_hex() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.auxiliarydatahash_to_hex(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} hex
    * @returns {AuxiliaryDataHash}
    */
    static from_hex(hex) {
        var ptr0 = passStringToWasm0(hex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.auxiliarydatahash_from_hex(ptr0, len0);
        return AuxiliaryDataHash.__wrap(ret);
    }
}
module.exports.AuxiliaryDataHash = AuxiliaryDataHash;
/**
*/
class AuxiliaryDataSet {

    static __wrap(ptr) {
        const obj = Object.create(AuxiliaryDataSet.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_auxiliarydataset_free(ptr);
    }
    /**
    * @returns {AuxiliaryDataSet}
    */
    static new() {
        var ret = wasm.auxiliarydataset_new();
        return AuxiliaryDataSet.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.auxiliarydataset_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {BigNum} tx_index
    * @param {AuxiliaryData} data
    * @returns {AuxiliaryData | undefined}
    */
    insert(tx_index, data) {
        _assertClass(tx_index, BigNum);
        _assertClass(data, AuxiliaryData);
        var ret = wasm.auxiliarydataset_insert(this.ptr, tx_index.ptr, data.ptr);
        return ret === 0 ? undefined : AuxiliaryData.__wrap(ret);
    }
    /**
    * @param {BigNum} tx_index
    * @returns {AuxiliaryData | undefined}
    */
    get(tx_index) {
        _assertClass(tx_index, BigNum);
        var ret = wasm.auxiliarydataset_get(this.ptr, tx_index.ptr);
        return ret === 0 ? undefined : AuxiliaryData.__wrap(ret);
    }
    /**
    * @returns {TransactionIndexes}
    */
    indices() {
        var ret = wasm.auxiliarydataset_indices(this.ptr);
        return TransactionIndexes.__wrap(ret);
    }
}
module.exports.AuxiliaryDataSet = AuxiliaryDataSet;
/**
*/
class BaseAddress {

    static __wrap(ptr) {
        const obj = Object.create(BaseAddress.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_baseaddress_free(ptr);
    }
    /**
    * @param {number} network
    * @param {StakeCredential} payment
    * @param {StakeCredential} stake
    * @returns {BaseAddress}
    */
    static new(network, payment, stake) {
        _assertClass(payment, StakeCredential);
        _assertClass(stake, StakeCredential);
        var ret = wasm.baseaddress_new(network, payment.ptr, stake.ptr);
        return BaseAddress.__wrap(ret);
    }
    /**
    * @returns {StakeCredential}
    */
    payment_cred() {
        var ret = wasm.baseaddress_payment_cred(this.ptr);
        return StakeCredential.__wrap(ret);
    }
    /**
    * @returns {StakeCredential}
    */
    stake_cred() {
        var ret = wasm.baseaddress_stake_cred(this.ptr);
        return StakeCredential.__wrap(ret);
    }
    /**
    * @returns {Address}
    */
    to_address() {
        var ret = wasm.baseaddress_to_address(this.ptr);
        return Address.__wrap(ret);
    }
    /**
    * @param {Address} addr
    * @returns {BaseAddress | undefined}
    */
    static from_address(addr) {
        _assertClass(addr, Address);
        var ret = wasm.baseaddress_from_address(addr.ptr);
        return ret === 0 ? undefined : BaseAddress.__wrap(ret);
    }
}
module.exports.BaseAddress = BaseAddress;
/**
*/
class BigInt {

    static __wrap(ptr) {
        const obj = Object.create(BigInt.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bigint_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bigint_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {BigInt}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.bigint_from_bytes(ptr0, len0);
        return BigInt.__wrap(ret);
    }
    /**
    * @returns {BigNum | undefined}
    */
    as_u64() {
        var ret = wasm.bigint_as_u64(this.ptr);
        return ret === 0 ? undefined : BigNum.__wrap(ret);
    }
    /**
    * @returns {Int | undefined}
    */
    as_int() {
        var ret = wasm.bigint_as_int(this.ptr);
        return ret === 0 ? undefined : Int.__wrap(ret);
    }
    /**
    * @param {string} text
    * @returns {BigInt}
    */
    static from_str(text) {
        var ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.bigint_from_str(ptr0, len0);
        return BigInt.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_str() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bigint_to_str(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
module.exports.BigInt = BigInt;
/**
*/
class BigNum {

    static __wrap(ptr) {
        const obj = Object.create(BigNum.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bignum_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bignum_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {BigNum}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.bignum_from_bytes(ptr0, len0);
        return BigNum.__wrap(ret);
    }
    /**
    * @param {string} string
    * @returns {BigNum}
    */
    static from_str(string) {
        var ptr0 = passStringToWasm0(string, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.bignum_from_str(ptr0, len0);
        return BigNum.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_str() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bignum_to_str(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {BigNum}
    */
    static zero() {
        var ret = wasm.bignum_zero();
        return BigNum.__wrap(ret);
    }
    /**
    * @returns {boolean}
    */
    is_zero() {
        var ret = wasm.bignum_is_zero(this.ptr);
        return ret !== 0;
    }
    /**
    * @param {BigNum} other
    * @returns {BigNum}
    */
    checked_mul(other) {
        _assertClass(other, BigNum);
        var ret = wasm.bignum_checked_mul(this.ptr, other.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @param {BigNum} other
    * @returns {BigNum}
    */
    checked_add(other) {
        _assertClass(other, BigNum);
        var ret = wasm.bignum_checked_add(this.ptr, other.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @param {BigNum} other
    * @returns {BigNum}
    */
    checked_sub(other) {
        _assertClass(other, BigNum);
        var ret = wasm.bignum_checked_sub(this.ptr, other.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @param {BigNum} other
    * @returns {BigNum}
    */
    checked_div(other) {
        _assertClass(other, BigNum);
        var ret = wasm.bignum_checked_div(this.ptr, other.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @param {BigNum} other
    * @returns {BigNum}
    */
    checked_div_ceil(other) {
        _assertClass(other, BigNum);
        var ret = wasm.bignum_checked_div_ceil(this.ptr, other.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * returns 0 if it would otherwise underflow
    * @param {BigNum} other
    * @returns {BigNum}
    */
    clamped_sub(other) {
        _assertClass(other, BigNum);
        var ret = wasm.bignum_clamped_sub(this.ptr, other.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @param {BigNum} rhs_value
    * @returns {number}
    */
    compare(rhs_value) {
        _assertClass(rhs_value, BigNum);
        var ret = wasm.bignum_compare(this.ptr, rhs_value.ptr);
        return ret;
    }
}
module.exports.BigNum = BigNum;
/**
*/
class Bip32PrivateKey {

    static __wrap(ptr) {
        const obj = Object.create(Bip32PrivateKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bip32privatekey_free(ptr);
    }
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
    derive(index) {
        var ret = wasm.bip32privatekey_derive(this.ptr, index);
        return Bip32PrivateKey.__wrap(ret);
    }
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
    static from_128_xprv(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.bip32privatekey_from_128_xprv(ptr0, len0);
        return Bip32PrivateKey.__wrap(ret);
    }
    /**
    * see from_128_xprv
    * @returns {Uint8Array}
    */
    to_128_xprv() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip32privatekey_to_128_xprv(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Bip32PrivateKey}
    */
    static generate_ed25519_bip32() {
        var ret = wasm.bip32privatekey_generate_ed25519_bip32();
        return Bip32PrivateKey.__wrap(ret);
    }
    /**
    * @returns {PrivateKey}
    */
    to_raw_key() {
        var ret = wasm.bip32privatekey_to_raw_key(this.ptr);
        return PrivateKey.__wrap(ret);
    }
    /**
    * @returns {Bip32PublicKey}
    */
    to_public() {
        var ret = wasm.bip32privatekey_to_public(this.ptr);
        return Bip32PublicKey.__wrap(ret);
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Bip32PrivateKey}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.bip32privatekey_from_bytes(ptr0, len0);
        return Bip32PrivateKey.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    as_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip32privatekey_as_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} bech32_str
    * @returns {Bip32PrivateKey}
    */
    static from_bech32(bech32_str) {
        var ptr0 = passStringToWasm0(bech32_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.bip32privatekey_from_bech32(ptr0, len0);
        return Bip32PrivateKey.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_bech32() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip32privatekey_to_bech32(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {Uint8Array} entropy
    * @param {Uint8Array} password
    * @returns {Bip32PrivateKey}
    */
    static from_bip39_entropy(entropy, password) {
        var ptr0 = passArray8ToWasm0(entropy, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passArray8ToWasm0(password, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.bip32privatekey_from_bip39_entropy(ptr0, len0, ptr1, len1);
        return Bip32PrivateKey.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    chaincode() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip32privatekey_chaincode(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.Bip32PrivateKey = Bip32PrivateKey;
/**
*/
class Bip32PublicKey {

    static __wrap(ptr) {
        const obj = Object.create(Bip32PublicKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bip32publickey_free(ptr);
    }
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
    derive(index) {
        var ret = wasm.bip32publickey_derive(this.ptr, index);
        return Bip32PublicKey.__wrap(ret);
    }
    /**
    * @returns {PublicKey}
    */
    to_raw_key() {
        var ret = wasm.bip32publickey_to_raw_key(this.ptr);
        return PublicKey.__wrap(ret);
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Bip32PublicKey}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.bip32publickey_from_bytes(ptr0, len0);
        return Bip32PublicKey.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    as_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip32publickey_as_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} bech32_str
    * @returns {Bip32PublicKey}
    */
    static from_bech32(bech32_str) {
        var ptr0 = passStringToWasm0(bech32_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.bip32publickey_from_bech32(ptr0, len0);
        return Bip32PublicKey.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_bech32() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip32publickey_to_bech32(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Uint8Array}
    */
    chaincode() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bip32publickey_chaincode(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.Bip32PublicKey = Bip32PublicKey;
/**
*/
class Block {

    static __wrap(ptr) {
        const obj = Object.create(Block.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_block_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.block_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Block}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.block_from_bytes(ptr0, len0);
        return Block.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.block_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.block_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {Block}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.block_from_json(ptr0, len0);
        return Block.__wrap(ret);
    }
    /**
    * @returns {Header}
    */
    header() {
        var ret = wasm.block_header(this.ptr);
        return Header.__wrap(ret);
    }
    /**
    * @returns {TransactionBodies}
    */
    transaction_bodies() {
        var ret = wasm.block_transaction_bodies(this.ptr);
        return TransactionBodies.__wrap(ret);
    }
    /**
    * @returns {TransactionWitnessSets}
    */
    transaction_witness_sets() {
        var ret = wasm.block_transaction_witness_sets(this.ptr);
        return TransactionWitnessSets.__wrap(ret);
    }
    /**
    * @returns {AuxiliaryDataSet}
    */
    auxiliary_data_set() {
        var ret = wasm.block_auxiliary_data_set(this.ptr);
        return AuxiliaryDataSet.__wrap(ret);
    }
    /**
    * @returns {TransactionIndexes}
    */
    invalid_transactions() {
        var ret = wasm.block_invalid_transactions(this.ptr);
        return TransactionIndexes.__wrap(ret);
    }
    /**
    * @param {Header} header
    * @param {TransactionBodies} transaction_bodies
    * @param {TransactionWitnessSets} transaction_witness_sets
    * @param {AuxiliaryDataSet} auxiliary_data_set
    * @param {TransactionIndexes} invalid_transactions
    * @returns {Block}
    */
    static new(header, transaction_bodies, transaction_witness_sets, auxiliary_data_set, invalid_transactions) {
        _assertClass(header, Header);
        _assertClass(transaction_bodies, TransactionBodies);
        _assertClass(transaction_witness_sets, TransactionWitnessSets);
        _assertClass(auxiliary_data_set, AuxiliaryDataSet);
        _assertClass(invalid_transactions, TransactionIndexes);
        var ret = wasm.block_new(header.ptr, transaction_bodies.ptr, transaction_witness_sets.ptr, auxiliary_data_set.ptr, invalid_transactions.ptr);
        return Block.__wrap(ret);
    }
}
module.exports.Block = Block;
/**
*/
class BlockHash {

    static __wrap(ptr) {
        const obj = Object.create(BlockHash.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_blockhash_free(ptr);
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {BlockHash}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.blockhash_from_bytes(ptr0, len0);
        return BlockHash.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.blockhash_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} prefix
    * @returns {string}
    */
    to_bech32(prefix) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(prefix, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.blockhash_to_bech32(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} bech_str
    * @returns {BlockHash}
    */
    static from_bech32(bech_str) {
        var ptr0 = passStringToWasm0(bech_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.blockhash_from_bech32(ptr0, len0);
        return BlockHash.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_hex() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.blockhash_to_hex(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} hex
    * @returns {BlockHash}
    */
    static from_hex(hex) {
        var ptr0 = passStringToWasm0(hex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.blockhash_from_hex(ptr0, len0);
        return BlockHash.__wrap(ret);
    }
}
module.exports.BlockHash = BlockHash;
/**
*/
class Blockfrost {

    static __wrap(ptr) {
        const obj = Object.create(Blockfrost.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_blockfrost_free(ptr);
    }
    /**
    * @param {string} url
    * @param {string} project_id
    * @returns {Blockfrost}
    */
    static new(url, project_id) {
        var ptr0 = passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passStringToWasm0(project_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.blockfrost_new(ptr0, len0, ptr1, len1);
        return Blockfrost.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    url() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.blockfrost_url(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {string}
    */
    project_id() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.blockfrost_project_id(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
module.exports.Blockfrost = Blockfrost;
/**
*/
class BootstrapWitness {

    static __wrap(ptr) {
        const obj = Object.create(BootstrapWitness.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bootstrapwitness_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bootstrapwitness_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {BootstrapWitness}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.bootstrapwitness_from_bytes(ptr0, len0);
        return BootstrapWitness.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bootstrapwitness_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.bootstrapwitness_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {BootstrapWitness}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.bootstrapwitness_from_json(ptr0, len0);
        return BootstrapWitness.__wrap(ret);
    }
    /**
    * @returns {Vkey}
    */
    vkey() {
        var ret = wasm.bootstrapwitness_vkey(this.ptr);
        return Vkey.__wrap(ret);
    }
    /**
    * @returns {Ed25519Signature}
    */
    signature() {
        var ret = wasm.bootstrapwitness_signature(this.ptr);
        return Ed25519Signature.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    chain_code() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bootstrapwitness_chain_code(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Uint8Array}
    */
    attributes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.bootstrapwitness_attributes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Vkey} vkey
    * @param {Ed25519Signature} signature
    * @param {Uint8Array} chain_code
    * @param {Uint8Array} attributes
    * @returns {BootstrapWitness}
    */
    static new(vkey, signature, chain_code, attributes) {
        _assertClass(vkey, Vkey);
        _assertClass(signature, Ed25519Signature);
        var ptr0 = passArray8ToWasm0(chain_code, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passArray8ToWasm0(attributes, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.bootstrapwitness_new(vkey.ptr, signature.ptr, ptr0, len0, ptr1, len1);
        return BootstrapWitness.__wrap(ret);
    }
}
module.exports.BootstrapWitness = BootstrapWitness;
/**
*/
class BootstrapWitnesses {

    static __wrap(ptr) {
        const obj = Object.create(BootstrapWitnesses.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_bootstrapwitnesses_free(ptr);
    }
    /**
    * @returns {BootstrapWitnesses}
    */
    static new() {
        var ret = wasm.bootstrapwitnesses_new();
        return BootstrapWitnesses.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.bootstrapwitnesses_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {BootstrapWitness}
    */
    get(index) {
        var ret = wasm.bootstrapwitnesses_get(this.ptr, index);
        return BootstrapWitness.__wrap(ret);
    }
    /**
    * @param {BootstrapWitness} elem
    */
    add(elem) {
        _assertClass(elem, BootstrapWitness);
        wasm.bootstrapwitnesses_add(this.ptr, elem.ptr);
    }
}
module.exports.BootstrapWitnesses = BootstrapWitnesses;
/**
*/
class ByronAddress {

    static __wrap(ptr) {
        const obj = Object.create(ByronAddress.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_byronaddress_free(ptr);
    }
    /**
    * @returns {string}
    */
    to_base58() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.byronaddress_to_base58(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.byronaddress_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {ByronAddress}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.byronaddress_from_bytes(ptr0, len0);
        return ByronAddress.__wrap(ret);
    }
    /**
    * returns the byron protocol magic embedded in the address, or mainnet id if none is present
    * note: for bech32 addresses, you need to use network_id instead
    * @returns {number}
    */
    byron_protocol_magic() {
        var ret = wasm.byronaddress_byron_protocol_magic(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {Uint8Array}
    */
    attributes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.byronaddress_attributes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {number}
    */
    network_id() {
        var ret = wasm.byronaddress_network_id(this.ptr);
        return ret;
    }
    /**
    * @param {string} s
    * @returns {ByronAddress}
    */
    static from_base58(s) {
        var ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.byronaddress_from_base58(ptr0, len0);
        return ByronAddress.__wrap(ret);
    }
    /**
    * @param {Bip32PublicKey} key
    * @param {number} protocol_magic
    * @returns {ByronAddress}
    */
    static icarus_from_key(key, protocol_magic) {
        _assertClass(key, Bip32PublicKey);
        var ret = wasm.byronaddress_icarus_from_key(key.ptr, protocol_magic);
        return ByronAddress.__wrap(ret);
    }
    /**
    * @param {string} s
    * @returns {boolean}
    */
    static is_valid(s) {
        var ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.byronaddress_is_valid(ptr0, len0);
        return ret !== 0;
    }
    /**
    * @returns {Address}
    */
    to_address() {
        var ret = wasm.byronaddress_to_address(this.ptr);
        return Address.__wrap(ret);
    }
    /**
    * @param {Address} addr
    * @returns {ByronAddress | undefined}
    */
    static from_address(addr) {
        _assertClass(addr, Address);
        var ret = wasm.byronaddress_from_address(addr.ptr);
        return ret === 0 ? undefined : ByronAddress.__wrap(ret);
    }
}
module.exports.ByronAddress = ByronAddress;
/**
*/
class Certificate {

    static __wrap(ptr) {
        const obj = Object.create(Certificate.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_certificate_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.certificate_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Certificate}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.certificate_from_bytes(ptr0, len0);
        return Certificate.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.certificate_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.certificate_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {Certificate}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.certificate_from_json(ptr0, len0);
        return Certificate.__wrap(ret);
    }
    /**
    * @param {StakeRegistration} stake_registration
    * @returns {Certificate}
    */
    static new_stake_registration(stake_registration) {
        _assertClass(stake_registration, StakeRegistration);
        var ret = wasm.certificate_new_stake_registration(stake_registration.ptr);
        return Certificate.__wrap(ret);
    }
    /**
    * @param {StakeDeregistration} stake_deregistration
    * @returns {Certificate}
    */
    static new_stake_deregistration(stake_deregistration) {
        _assertClass(stake_deregistration, StakeDeregistration);
        var ret = wasm.certificate_new_stake_deregistration(stake_deregistration.ptr);
        return Certificate.__wrap(ret);
    }
    /**
    * @param {StakeDelegation} stake_delegation
    * @returns {Certificate}
    */
    static new_stake_delegation(stake_delegation) {
        _assertClass(stake_delegation, StakeDelegation);
        var ret = wasm.certificate_new_stake_delegation(stake_delegation.ptr);
        return Certificate.__wrap(ret);
    }
    /**
    * @param {PoolRegistration} pool_registration
    * @returns {Certificate}
    */
    static new_pool_registration(pool_registration) {
        _assertClass(pool_registration, PoolRegistration);
        var ret = wasm.certificate_new_pool_registration(pool_registration.ptr);
        return Certificate.__wrap(ret);
    }
    /**
    * @param {PoolRetirement} pool_retirement
    * @returns {Certificate}
    */
    static new_pool_retirement(pool_retirement) {
        _assertClass(pool_retirement, PoolRetirement);
        var ret = wasm.certificate_new_pool_retirement(pool_retirement.ptr);
        return Certificate.__wrap(ret);
    }
    /**
    * @param {GenesisKeyDelegation} genesis_key_delegation
    * @returns {Certificate}
    */
    static new_genesis_key_delegation(genesis_key_delegation) {
        _assertClass(genesis_key_delegation, GenesisKeyDelegation);
        var ret = wasm.certificate_new_genesis_key_delegation(genesis_key_delegation.ptr);
        return Certificate.__wrap(ret);
    }
    /**
    * @param {MoveInstantaneousRewardsCert} move_instantaneous_rewards_cert
    * @returns {Certificate}
    */
    static new_move_instantaneous_rewards_cert(move_instantaneous_rewards_cert) {
        _assertClass(move_instantaneous_rewards_cert, MoveInstantaneousRewardsCert);
        var ret = wasm.certificate_new_move_instantaneous_rewards_cert(move_instantaneous_rewards_cert.ptr);
        return Certificate.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    kind() {
        var ret = wasm.certificate_kind(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {StakeRegistration | undefined}
    */
    as_stake_registration() {
        var ret = wasm.certificate_as_stake_registration(this.ptr);
        return ret === 0 ? undefined : StakeRegistration.__wrap(ret);
    }
    /**
    * @returns {StakeDeregistration | undefined}
    */
    as_stake_deregistration() {
        var ret = wasm.certificate_as_stake_deregistration(this.ptr);
        return ret === 0 ? undefined : StakeDeregistration.__wrap(ret);
    }
    /**
    * @returns {StakeDelegation | undefined}
    */
    as_stake_delegation() {
        var ret = wasm.certificate_as_stake_delegation(this.ptr);
        return ret === 0 ? undefined : StakeDelegation.__wrap(ret);
    }
    /**
    * @returns {PoolRegistration | undefined}
    */
    as_pool_registration() {
        var ret = wasm.certificate_as_pool_registration(this.ptr);
        return ret === 0 ? undefined : PoolRegistration.__wrap(ret);
    }
    /**
    * @returns {PoolRetirement | undefined}
    */
    as_pool_retirement() {
        var ret = wasm.certificate_as_pool_retirement(this.ptr);
        return ret === 0 ? undefined : PoolRetirement.__wrap(ret);
    }
    /**
    * @returns {GenesisKeyDelegation | undefined}
    */
    as_genesis_key_delegation() {
        var ret = wasm.certificate_as_genesis_key_delegation(this.ptr);
        return ret === 0 ? undefined : GenesisKeyDelegation.__wrap(ret);
    }
    /**
    * @returns {MoveInstantaneousRewardsCert | undefined}
    */
    as_move_instantaneous_rewards_cert() {
        var ret = wasm.certificate_as_move_instantaneous_rewards_cert(this.ptr);
        return ret === 0 ? undefined : MoveInstantaneousRewardsCert.__wrap(ret);
    }
}
module.exports.Certificate = Certificate;
/**
*/
class Certificates {

    static __wrap(ptr) {
        const obj = Object.create(Certificates.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_certificates_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.certificates_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Certificates}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.certificates_from_bytes(ptr0, len0);
        return Certificates.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.certificates_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.certificates_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {Certificates}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.certificates_from_json(ptr0, len0);
        return Certificates.__wrap(ret);
    }
    /**
    * @returns {Certificates}
    */
    static new() {
        var ret = wasm.certificates_new();
        return Certificates.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.certificates_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {Certificate}
    */
    get(index) {
        var ret = wasm.certificates_get(this.ptr, index);
        return Certificate.__wrap(ret);
    }
    /**
    * @param {Certificate} elem
    */
    add(elem) {
        _assertClass(elem, Certificate);
        wasm.certificates_add(this.ptr, elem.ptr);
    }
}
module.exports.Certificates = Certificates;
/**
*/
class ConstrPlutusData {

    static __wrap(ptr) {
        const obj = Object.create(ConstrPlutusData.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_constrplutusdata_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.constrplutusdata_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {ConstrPlutusData}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.constrplutusdata_from_bytes(ptr0, len0);
        return ConstrPlutusData.__wrap(ret);
    }
    /**
    * @returns {BigNum}
    */
    alternative() {
        var ret = wasm.constrplutusdata_alternative(this.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @returns {PlutusList}
    */
    data() {
        var ret = wasm.constrplutusdata_data(this.ptr);
        return PlutusList.__wrap(ret);
    }
    /**
    * @param {BigNum} alternative
    * @param {PlutusList} data
    * @returns {ConstrPlutusData}
    */
    static new(alternative, data) {
        _assertClass(alternative, BigNum);
        _assertClass(data, PlutusList);
        var ret = wasm.constrplutusdata_new(alternative.ptr, data.ptr);
        return ConstrPlutusData.__wrap(ret);
    }
}
module.exports.ConstrPlutusData = ConstrPlutusData;
/**
*/
class CostModel {

    static __wrap(ptr) {
        const obj = Object.create(CostModel.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_costmodel_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.costmodel_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {CostModel}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.costmodel_from_bytes(ptr0, len0);
        return CostModel.__wrap(ret);
    }
    /**
    * @returns {CostModel}
    */
    static new() {
        var ret = wasm.costmodel_new();
        return CostModel.__wrap(ret);
    }
    /**
    * @returns {CostModel}
    */
    static new_plutus_v2() {
        var ret = wasm.costmodel_new_plutus_v2();
        return CostModel.__wrap(ret);
    }
    /**
    * @param {number} operation
    * @param {Int} cost
    * @returns {Int}
    */
    set(operation, cost) {
        _assertClass(cost, Int);
        var ret = wasm.costmodel_set(this.ptr, operation, cost.ptr);
        return Int.__wrap(ret);
    }
    /**
    * @param {number} operation
    * @returns {Int}
    */
    get(operation) {
        var ret = wasm.costmodel_get(this.ptr, operation);
        return Int.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.costmodel_len(this.ptr);
        return ret >>> 0;
    }
}
module.exports.CostModel = CostModel;
/**
*/
class Costmdls {

    static __wrap(ptr) {
        const obj = Object.create(Costmdls.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_costmdls_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.costmdls_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Costmdls}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.costmdls_from_bytes(ptr0, len0);
        return Costmdls.__wrap(ret);
    }
    /**
    * @returns {Costmdls}
    */
    static new() {
        var ret = wasm.costmdls_new();
        return Costmdls.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.costmdls_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {Language} key
    * @param {CostModel} value
    * @returns {CostModel | undefined}
    */
    insert(key, value) {
        _assertClass(key, Language);
        _assertClass(value, CostModel);
        var ret = wasm.costmdls_insert(this.ptr, key.ptr, value.ptr);
        return ret === 0 ? undefined : CostModel.__wrap(ret);
    }
    /**
    * @param {Language} key
    * @returns {CostModel | undefined}
    */
    get(key) {
        _assertClass(key, Language);
        var ret = wasm.costmdls_get(this.ptr, key.ptr);
        return ret === 0 ? undefined : CostModel.__wrap(ret);
    }
    /**
    * @returns {Languages}
    */
    keys() {
        var ret = wasm.costmdls_keys(this.ptr);
        return Languages.__wrap(ret);
    }
}
module.exports.Costmdls = Costmdls;
/**
*/
class DNSRecordAorAAAA {

    static __wrap(ptr) {
        const obj = Object.create(DNSRecordAorAAAA.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_dnsrecordaoraaaa_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.dnsrecordaoraaaa_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {DNSRecordAorAAAA}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.dnsrecordaoraaaa_from_bytes(ptr0, len0);
        return DNSRecordAorAAAA.__wrap(ret);
    }
    /**
    * @param {string} dns_name
    * @returns {DNSRecordAorAAAA}
    */
    static new(dns_name) {
        var ptr0 = passStringToWasm0(dns_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.dnsrecordaoraaaa_new(ptr0, len0);
        return DNSRecordAorAAAA.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    record() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.dnsrecordaoraaaa_record(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
module.exports.DNSRecordAorAAAA = DNSRecordAorAAAA;
/**
*/
class DNSRecordSRV {

    static __wrap(ptr) {
        const obj = Object.create(DNSRecordSRV.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_dnsrecordsrv_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.dnsrecordsrv_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {DNSRecordSRV}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.dnsrecordsrv_from_bytes(ptr0, len0);
        return DNSRecordSRV.__wrap(ret);
    }
    /**
    * @param {string} dns_name
    * @returns {DNSRecordSRV}
    */
    static new(dns_name) {
        var ptr0 = passStringToWasm0(dns_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.dnsrecordsrv_new(ptr0, len0);
        return DNSRecordSRV.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    record() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.dnsrecordsrv_record(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
module.exports.DNSRecordSRV = DNSRecordSRV;
/**
*/
class Data {

    static __wrap(ptr) {
        const obj = Object.create(Data.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_data_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.data_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Data}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.data_from_bytes(ptr0, len0);
        return Data.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.data_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.data_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {Data}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.data_from_json(ptr0, len0);
        return Data.__wrap(ret);
    }
    /**
    * @param {PlutusData} plutus_data
    * @returns {Data}
    */
    static new(plutus_data) {
        _assertClass(plutus_data, PlutusData);
        var ret = wasm.data_new(plutus_data.ptr);
        return Data.__wrap(ret);
    }
    /**
    * @returns {PlutusData}
    */
    get() {
        var ret = wasm.data_get(this.ptr);
        return PlutusData.__wrap(ret);
    }
}
module.exports.Data = Data;
/**
*/
class DataHash {

    static __wrap(ptr) {
        const obj = Object.create(DataHash.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_datahash_free(ptr);
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {DataHash}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.datahash_from_bytes(ptr0, len0);
        return DataHash.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.datahash_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} prefix
    * @returns {string}
    */
    to_bech32(prefix) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(prefix, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.datahash_to_bech32(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} bech_str
    * @returns {DataHash}
    */
    static from_bech32(bech_str) {
        var ptr0 = passStringToWasm0(bech_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.datahash_from_bech32(ptr0, len0);
        return DataHash.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_hex() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.datahash_to_hex(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} hex
    * @returns {DataHash}
    */
    static from_hex(hex) {
        var ptr0 = passStringToWasm0(hex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.datahash_from_hex(ptr0, len0);
        return DataHash.__wrap(ret);
    }
}
module.exports.DataHash = DataHash;
/**
*/
class Datum {

    static __wrap(ptr) {
        const obj = Object.create(Datum.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_datum_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.datum_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Datum}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.datum_from_bytes(ptr0, len0);
        return Datum.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.datum_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.datum_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {Datum}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.datum_from_json(ptr0, len0);
        return Datum.__wrap(ret);
    }
    /**
    * @param {DataHash} data_hash
    * @returns {Datum}
    */
    static new_data_hash(data_hash) {
        _assertClass(data_hash, DataHash);
        var ret = wasm.datum_new_data_hash(data_hash.ptr);
        return Datum.__wrap(ret);
    }
    /**
    * @param {Data} data
    * @returns {Datum}
    */
    static new_data(data) {
        _assertClass(data, Data);
        var ret = wasm.datum_new_data(data.ptr);
        return Datum.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    kind() {
        var ret = wasm.datum_kind(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {DataHash | undefined}
    */
    as_data_hash() {
        var ret = wasm.datum_as_data_hash(this.ptr);
        return ret === 0 ? undefined : DataHash.__wrap(ret);
    }
    /**
    * @returns {Data | undefined}
    */
    as_data() {
        var ret = wasm.datum_as_data(this.ptr);
        return ret === 0 ? undefined : Data.__wrap(ret);
    }
}
module.exports.Datum = Datum;
/**
*/
class Ed25519KeyHash {

    static __wrap(ptr) {
        const obj = Object.create(Ed25519KeyHash.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ed25519keyhash_free(ptr);
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Ed25519KeyHash}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.ed25519keyhash_from_bytes(ptr0, len0);
        return Ed25519KeyHash.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ed25519keyhash_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} prefix
    * @returns {string}
    */
    to_bech32(prefix) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(prefix, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.ed25519keyhash_to_bech32(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} bech_str
    * @returns {Ed25519KeyHash}
    */
    static from_bech32(bech_str) {
        var ptr0 = passStringToWasm0(bech_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.ed25519keyhash_from_bech32(ptr0, len0);
        return Ed25519KeyHash.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_hex() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ed25519keyhash_to_hex(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} hex
    * @returns {Ed25519KeyHash}
    */
    static from_hex(hex) {
        var ptr0 = passStringToWasm0(hex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.ed25519keyhash_from_hex(ptr0, len0);
        return Ed25519KeyHash.__wrap(ret);
    }
}
module.exports.Ed25519KeyHash = Ed25519KeyHash;
/**
*/
class Ed25519KeyHashes {

    static __wrap(ptr) {
        const obj = Object.create(Ed25519KeyHashes.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ed25519keyhashes_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ed25519keyhashes_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Ed25519KeyHashes}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.ed25519keyhashes_from_bytes(ptr0, len0);
        return Ed25519KeyHashes.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ed25519keyhashes_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.ed25519keyhashes_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {Ed25519KeyHashes}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.ed25519keyhashes_from_json(ptr0, len0);
        return Ed25519KeyHashes.__wrap(ret);
    }
    /**
    * @returns {Ed25519KeyHashes}
    */
    static new() {
        var ret = wasm.ed25519keyhashes_new();
        return Ed25519KeyHashes.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.ed25519keyhashes_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {Ed25519KeyHash}
    */
    get(index) {
        var ret = wasm.ed25519keyhashes_get(this.ptr, index);
        return Ed25519KeyHash.__wrap(ret);
    }
    /**
    * @param {Ed25519KeyHash} elem
    */
    add(elem) {
        _assertClass(elem, Ed25519KeyHash);
        wasm.ed25519keyhashes_add(this.ptr, elem.ptr);
    }
}
module.exports.Ed25519KeyHashes = Ed25519KeyHashes;
/**
*/
class Ed25519Signature {

    static __wrap(ptr) {
        const obj = Object.create(Ed25519Signature.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ed25519signature_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ed25519signature_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {string}
    */
    to_bech32() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ed25519signature_to_bech32(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {string}
    */
    to_hex() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ed25519signature_to_hex(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} bech32_str
    * @returns {Ed25519Signature}
    */
    static from_bech32(bech32_str) {
        var ptr0 = passStringToWasm0(bech32_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.ed25519signature_from_bech32(ptr0, len0);
        return Ed25519Signature.__wrap(ret);
    }
    /**
    * @param {string} input
    * @returns {Ed25519Signature}
    */
    static from_hex(input) {
        var ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.ed25519signature_from_hex(ptr0, len0);
        return Ed25519Signature.__wrap(ret);
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Ed25519Signature}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.ed25519signature_from_bytes(ptr0, len0);
        return Ed25519Signature.__wrap(ret);
    }
}
module.exports.Ed25519Signature = Ed25519Signature;
/**
*/
class EnterpriseAddress {

    static __wrap(ptr) {
        const obj = Object.create(EnterpriseAddress.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_enterpriseaddress_free(ptr);
    }
    /**
    * @param {number} network
    * @param {StakeCredential} payment
    * @returns {EnterpriseAddress}
    */
    static new(network, payment) {
        _assertClass(payment, StakeCredential);
        var ret = wasm.enterpriseaddress_new(network, payment.ptr);
        return EnterpriseAddress.__wrap(ret);
    }
    /**
    * @returns {StakeCredential}
    */
    payment_cred() {
        var ret = wasm.enterpriseaddress_payment_cred(this.ptr);
        return StakeCredential.__wrap(ret);
    }
    /**
    * @returns {Address}
    */
    to_address() {
        var ret = wasm.enterpriseaddress_to_address(this.ptr);
        return Address.__wrap(ret);
    }
    /**
    * @param {Address} addr
    * @returns {EnterpriseAddress | undefined}
    */
    static from_address(addr) {
        _assertClass(addr, Address);
        var ret = wasm.enterpriseaddress_from_address(addr.ptr);
        return ret === 0 ? undefined : EnterpriseAddress.__wrap(ret);
    }
}
module.exports.EnterpriseAddress = EnterpriseAddress;
/**
*/
class ExUnitPrices {

    static __wrap(ptr) {
        const obj = Object.create(ExUnitPrices.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_exunitprices_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.exunitprices_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {ExUnitPrices}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.exunitprices_from_bytes(ptr0, len0);
        return ExUnitPrices.__wrap(ret);
    }
    /**
    * @returns {UnitInterval}
    */
    mem_price() {
        var ret = wasm.exunitprices_mem_price(this.ptr);
        return UnitInterval.__wrap(ret);
    }
    /**
    * @returns {UnitInterval}
    */
    step_price() {
        var ret = wasm.exunitprices_step_price(this.ptr);
        return UnitInterval.__wrap(ret);
    }
    /**
    * @param {UnitInterval} mem_price
    * @param {UnitInterval} step_price
    * @returns {ExUnitPrices}
    */
    static new(mem_price, step_price) {
        _assertClass(mem_price, UnitInterval);
        _assertClass(step_price, UnitInterval);
        var ret = wasm.exunitprices_new(mem_price.ptr, step_price.ptr);
        return ExUnitPrices.__wrap(ret);
    }
    /**
    * @param {number} mem_price
    * @param {number} step_price
    * @returns {ExUnitPrices}
    */
    static from_float(mem_price, step_price) {
        var ret = wasm.exunitprices_from_float(mem_price, step_price);
        return ExUnitPrices.__wrap(ret);
    }
}
module.exports.ExUnitPrices = ExUnitPrices;
/**
*/
class ExUnits {

    static __wrap(ptr) {
        const obj = Object.create(ExUnits.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_exunits_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.exunits_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {ExUnits}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.exunits_from_bytes(ptr0, len0);
        return ExUnits.__wrap(ret);
    }
    /**
    * @returns {BigNum}
    */
    mem() {
        var ret = wasm.exunits_mem(this.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @returns {BigNum}
    */
    steps() {
        var ret = wasm.exunits_steps(this.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @param {BigNum} mem
    * @param {BigNum} steps
    * @returns {ExUnits}
    */
    static new(mem, steps) {
        _assertClass(mem, BigNum);
        _assertClass(steps, BigNum);
        var ret = wasm.exunits_new(mem.ptr, steps.ptr);
        return ExUnits.__wrap(ret);
    }
}
module.exports.ExUnits = ExUnits;
/**
*/
class GeneralTransactionMetadata {

    static __wrap(ptr) {
        const obj = Object.create(GeneralTransactionMetadata.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_generaltransactionmetadata_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.generaltransactionmetadata_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {GeneralTransactionMetadata}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.generaltransactionmetadata_from_bytes(ptr0, len0);
        return GeneralTransactionMetadata.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.generaltransactionmetadata_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.generaltransactionmetadata_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {GeneralTransactionMetadata}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.generaltransactionmetadata_from_json(ptr0, len0);
        return GeneralTransactionMetadata.__wrap(ret);
    }
    /**
    * @returns {GeneralTransactionMetadata}
    */
    static new() {
        var ret = wasm.generaltransactionmetadata_new();
        return GeneralTransactionMetadata.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.generaltransactionmetadata_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {BigNum} key
    * @param {TransactionMetadatum} value
    * @returns {TransactionMetadatum | undefined}
    */
    insert(key, value) {
        _assertClass(key, BigNum);
        _assertClass(value, TransactionMetadatum);
        var ret = wasm.generaltransactionmetadata_insert(this.ptr, key.ptr, value.ptr);
        return ret === 0 ? undefined : TransactionMetadatum.__wrap(ret);
    }
    /**
    * @param {BigNum} key
    * @returns {TransactionMetadatum | undefined}
    */
    get(key) {
        _assertClass(key, BigNum);
        var ret = wasm.generaltransactionmetadata_get(this.ptr, key.ptr);
        return ret === 0 ? undefined : TransactionMetadatum.__wrap(ret);
    }
    /**
    * @returns {TransactionMetadatumLabels}
    */
    keys() {
        var ret = wasm.generaltransactionmetadata_keys(this.ptr);
        return TransactionMetadatumLabels.__wrap(ret);
    }
}
module.exports.GeneralTransactionMetadata = GeneralTransactionMetadata;
/**
*/
class GenesisDelegateHash {

    static __wrap(ptr) {
        const obj = Object.create(GenesisDelegateHash.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_genesisdelegatehash_free(ptr);
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {GenesisDelegateHash}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.genesisdelegatehash_from_bytes(ptr0, len0);
        return GenesisDelegateHash.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.genesisdelegatehash_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} prefix
    * @returns {string}
    */
    to_bech32(prefix) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(prefix, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.genesisdelegatehash_to_bech32(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} bech_str
    * @returns {GenesisDelegateHash}
    */
    static from_bech32(bech_str) {
        var ptr0 = passStringToWasm0(bech_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.genesisdelegatehash_from_bech32(ptr0, len0);
        return GenesisDelegateHash.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_hex() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.genesisdelegatehash_to_hex(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} hex
    * @returns {GenesisDelegateHash}
    */
    static from_hex(hex) {
        var ptr0 = passStringToWasm0(hex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.genesisdelegatehash_from_hex(ptr0, len0);
        return GenesisDelegateHash.__wrap(ret);
    }
}
module.exports.GenesisDelegateHash = GenesisDelegateHash;
/**
*/
class GenesisHash {

    static __wrap(ptr) {
        const obj = Object.create(GenesisHash.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_genesishash_free(ptr);
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {GenesisHash}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.genesishash_from_bytes(ptr0, len0);
        return GenesisHash.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.genesishash_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} prefix
    * @returns {string}
    */
    to_bech32(prefix) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(prefix, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.genesishash_to_bech32(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} bech_str
    * @returns {GenesisHash}
    */
    static from_bech32(bech_str) {
        var ptr0 = passStringToWasm0(bech_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.genesishash_from_bech32(ptr0, len0);
        return GenesisHash.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_hex() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.genesishash_to_hex(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} hex
    * @returns {GenesisHash}
    */
    static from_hex(hex) {
        var ptr0 = passStringToWasm0(hex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.genesishash_from_hex(ptr0, len0);
        return GenesisHash.__wrap(ret);
    }
}
module.exports.GenesisHash = GenesisHash;
/**
*/
class GenesisHashes {

    static __wrap(ptr) {
        const obj = Object.create(GenesisHashes.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_genesishashes_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.genesishashes_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {GenesisHashes}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.genesishashes_from_bytes(ptr0, len0);
        return GenesisHashes.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.genesishashes_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.genesishashes_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {GenesisHashes}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.genesishashes_from_json(ptr0, len0);
        return GenesisHashes.__wrap(ret);
    }
    /**
    * @returns {GenesisHashes}
    */
    static new() {
        var ret = wasm.genesishashes_new();
        return GenesisHashes.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.genesishashes_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {GenesisHash}
    */
    get(index) {
        var ret = wasm.genesishashes_get(this.ptr, index);
        return GenesisHash.__wrap(ret);
    }
    /**
    * @param {GenesisHash} elem
    */
    add(elem) {
        _assertClass(elem, GenesisHash);
        wasm.genesishashes_add(this.ptr, elem.ptr);
    }
}
module.exports.GenesisHashes = GenesisHashes;
/**
*/
class GenesisKeyDelegation {

    static __wrap(ptr) {
        const obj = Object.create(GenesisKeyDelegation.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_genesiskeydelegation_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.genesiskeydelegation_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {GenesisKeyDelegation}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.genesiskeydelegation_from_bytes(ptr0, len0);
        return GenesisKeyDelegation.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.genesiskeydelegation_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.genesiskeydelegation_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {GenesisKeyDelegation}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.genesiskeydelegation_from_json(ptr0, len0);
        return GenesisKeyDelegation.__wrap(ret);
    }
    /**
    * @returns {GenesisHash}
    */
    genesishash() {
        var ret = wasm.genesiskeydelegation_genesishash(this.ptr);
        return GenesisHash.__wrap(ret);
    }
    /**
    * @returns {GenesisDelegateHash}
    */
    genesis_delegate_hash() {
        var ret = wasm.genesiskeydelegation_genesis_delegate_hash(this.ptr);
        return GenesisDelegateHash.__wrap(ret);
    }
    /**
    * @returns {VRFKeyHash}
    */
    vrf_keyhash() {
        var ret = wasm.genesiskeydelegation_vrf_keyhash(this.ptr);
        return VRFKeyHash.__wrap(ret);
    }
    /**
    * @param {GenesisHash} genesishash
    * @param {GenesisDelegateHash} genesis_delegate_hash
    * @param {VRFKeyHash} vrf_keyhash
    * @returns {GenesisKeyDelegation}
    */
    static new(genesishash, genesis_delegate_hash, vrf_keyhash) {
        _assertClass(genesishash, GenesisHash);
        _assertClass(genesis_delegate_hash, GenesisDelegateHash);
        _assertClass(vrf_keyhash, VRFKeyHash);
        var ret = wasm.genesiskeydelegation_new(genesishash.ptr, genesis_delegate_hash.ptr, vrf_keyhash.ptr);
        return GenesisKeyDelegation.__wrap(ret);
    }
}
module.exports.GenesisKeyDelegation = GenesisKeyDelegation;
/**
*/
class Header {

    static __wrap(ptr) {
        const obj = Object.create(Header.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_header_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.header_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Header}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.header_from_bytes(ptr0, len0);
        return Header.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.header_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.header_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {Header}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.header_from_json(ptr0, len0);
        return Header.__wrap(ret);
    }
    /**
    * @returns {HeaderBody}
    */
    header_body() {
        var ret = wasm.header_header_body(this.ptr);
        return HeaderBody.__wrap(ret);
    }
    /**
    * @returns {KESSignature}
    */
    body_signature() {
        var ret = wasm.header_body_signature(this.ptr);
        return KESSignature.__wrap(ret);
    }
    /**
    * @param {HeaderBody} header_body
    * @param {KESSignature} body_signature
    * @returns {Header}
    */
    static new(header_body, body_signature) {
        _assertClass(header_body, HeaderBody);
        _assertClass(body_signature, KESSignature);
        var ret = wasm.header_new(header_body.ptr, body_signature.ptr);
        return Header.__wrap(ret);
    }
}
module.exports.Header = Header;
/**
*/
class HeaderBody {

    static __wrap(ptr) {
        const obj = Object.create(HeaderBody.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_headerbody_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.headerbody_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {HeaderBody}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.headerbody_from_bytes(ptr0, len0);
        return HeaderBody.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.headerbody_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.headerbody_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {HeaderBody}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.headerbody_from_json(ptr0, len0);
        return HeaderBody.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    block_number() {
        var ret = wasm.headerbody_block_number(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {BigNum}
    */
    slot() {
        var ret = wasm.headerbody_slot(this.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @returns {BlockHash | undefined}
    */
    prev_hash() {
        var ret = wasm.headerbody_prev_hash(this.ptr);
        return ret === 0 ? undefined : BlockHash.__wrap(ret);
    }
    /**
    * @returns {Vkey}
    */
    issuer_vkey() {
        var ret = wasm.headerbody_issuer_vkey(this.ptr);
        return Vkey.__wrap(ret);
    }
    /**
    * @returns {VRFVKey}
    */
    vrf_vkey() {
        var ret = wasm.headerbody_vrf_vkey(this.ptr);
        return VRFVKey.__wrap(ret);
    }
    /**
    * @returns {VRFCert}
    */
    nonce_vrf() {
        var ret = wasm.headerbody_nonce_vrf(this.ptr);
        return VRFCert.__wrap(ret);
    }
    /**
    * @returns {VRFCert}
    */
    leader_vrf() {
        var ret = wasm.headerbody_leader_vrf(this.ptr);
        return VRFCert.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    block_body_size() {
        var ret = wasm.headerbody_block_body_size(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {BlockHash}
    */
    block_body_hash() {
        var ret = wasm.headerbody_block_body_hash(this.ptr);
        return BlockHash.__wrap(ret);
    }
    /**
    * @returns {OperationalCert}
    */
    operational_cert() {
        var ret = wasm.headerbody_operational_cert(this.ptr);
        return OperationalCert.__wrap(ret);
    }
    /**
    * @returns {ProtocolVersion}
    */
    protocol_version() {
        var ret = wasm.headerbody_protocol_version(this.ptr);
        return ProtocolVersion.__wrap(ret);
    }
    /**
    * @param {number} block_number
    * @param {BigNum} slot
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
    static new(block_number, slot, prev_hash, issuer_vkey, vrf_vkey, nonce_vrf, leader_vrf, block_body_size, block_body_hash, operational_cert, protocol_version) {
        _assertClass(slot, BigNum);
        let ptr0 = 0;
        if (!isLikeNone(prev_hash)) {
            _assertClass(prev_hash, BlockHash);
            ptr0 = prev_hash.ptr;
            prev_hash.ptr = 0;
        }
        _assertClass(issuer_vkey, Vkey);
        _assertClass(vrf_vkey, VRFVKey);
        _assertClass(nonce_vrf, VRFCert);
        _assertClass(leader_vrf, VRFCert);
        _assertClass(block_body_hash, BlockHash);
        _assertClass(operational_cert, OperationalCert);
        _assertClass(protocol_version, ProtocolVersion);
        var ret = wasm.headerbody_new(block_number, slot.ptr, ptr0, issuer_vkey.ptr, vrf_vkey.ptr, nonce_vrf.ptr, leader_vrf.ptr, block_body_size, block_body_hash.ptr, operational_cert.ptr, protocol_version.ptr);
        return HeaderBody.__wrap(ret);
    }
}
module.exports.HeaderBody = HeaderBody;
/**
*/
class Int {

    static __wrap(ptr) {
        const obj = Object.create(Int.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_int_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.int_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Int}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.int_from_bytes(ptr0, len0);
        return Int.__wrap(ret);
    }
    /**
    * @param {BigNum} x
    * @returns {Int}
    */
    static new(x) {
        _assertClass(x, BigNum);
        var ret = wasm.int_new(x.ptr);
        return Int.__wrap(ret);
    }
    /**
    * @param {BigNum} x
    * @returns {Int}
    */
    static new_negative(x) {
        _assertClass(x, BigNum);
        var ret = wasm.int_new_negative(x.ptr);
        return Int.__wrap(ret);
    }
    /**
    * @param {number} x
    * @returns {Int}
    */
    static new_i32(x) {
        var ret = wasm.int_new_i32(x);
        return Int.__wrap(ret);
    }
    /**
    * @returns {boolean}
    */
    is_positive() {
        var ret = wasm.int_is_positive(this.ptr);
        return ret !== 0;
    }
    /**
    * BigNum can only contain unsigned u64 values
    *
    * This function will return the BigNum representation
    * only in case the underlying i128 value is positive.
    *
    * Otherwise nothing will be returned (undefined).
    * @returns {BigNum | undefined}
    */
    as_positive() {
        var ret = wasm.int_as_positive(this.ptr);
        return ret === 0 ? undefined : BigNum.__wrap(ret);
    }
    /**
    * BigNum can only contain unsigned u64 values
    *
    * This function will return the *absolute* BigNum representation
    * only in case the underlying i128 value is negative.
    *
    * Otherwise nothing will be returned (undefined).
    * @returns {BigNum | undefined}
    */
    as_negative() {
        var ret = wasm.int_as_negative(this.ptr);
        return ret === 0 ? undefined : BigNum.__wrap(ret);
    }
    /**
    * !!! DEPRECATED !!!
    * Returns an i32 value in case the underlying original i128 value is within the limits.
    * Otherwise will just return an empty value (undefined).
    * @returns {number | undefined}
    */
    as_i32() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.int_as_i32(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return r0 === 0 ? undefined : r1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Returns the underlying value converted to i32 if possible (within limits)
    * Otherwise will just return an empty value (undefined).
    * @returns {number | undefined}
    */
    as_i32_or_nothing() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.int_as_i32_or_nothing(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return r0 === 0 ? undefined : r1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Returns the underlying value converted to i32 if possible (within limits)
    * JsError in case of out of boundary overflow
    * @returns {number}
    */
    as_i32_or_fail() {
        var ret = wasm.int_as_i32_or_fail(this.ptr);
        return ret;
    }
    /**
    * Returns string representation of the underlying i128 value directly.
    * Might contain the minus sign (-) in case of negative value.
    * @returns {string}
    */
    to_str() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.int_to_str(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} string
    * @returns {Int}
    */
    static from_str(string) {
        var ptr0 = passStringToWasm0(string, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.int_from_str(ptr0, len0);
        return Int.__wrap(ret);
    }
}
module.exports.Int = Int;
/**
*/
class Ipv4 {

    static __wrap(ptr) {
        const obj = Object.create(Ipv4.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ipv4_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ipv4_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Ipv4}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.ipv4_from_bytes(ptr0, len0);
        return Ipv4.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ipv4_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.ipv4_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {Ipv4}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.ipv4_from_json(ptr0, len0);
        return Ipv4.__wrap(ret);
    }
    /**
    * @param {Uint8Array} data
    * @returns {Ipv4}
    */
    static new(data) {
        var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.ipv4_new(ptr0, len0);
        return Ipv4.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    ip() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ipv4_ip(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.Ipv4 = Ipv4;
/**
*/
class Ipv6 {

    static __wrap(ptr) {
        const obj = Object.create(Ipv6.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_ipv6_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ipv6_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Ipv6}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.ipv6_from_bytes(ptr0, len0);
        return Ipv6.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ipv6_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.ipv6_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {Ipv6}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.ipv6_from_json(ptr0, len0);
        return Ipv6.__wrap(ret);
    }
    /**
    * @param {Uint8Array} data
    * @returns {Ipv6}
    */
    static new(data) {
        var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.ipv6_new(ptr0, len0);
        return Ipv6.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    ip() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.ipv6_ip(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.Ipv6 = Ipv6;
/**
*/
class KESSignature {

    static __wrap(ptr) {
        const obj = Object.create(KESSignature.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_kessignature_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.kessignature_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {KESSignature}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.kessignature_from_bytes(ptr0, len0);
        return KESSignature.__wrap(ret);
    }
}
module.exports.KESSignature = KESSignature;
/**
*/
class KESVKey {

    static __wrap(ptr) {
        const obj = Object.create(KESVKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_kesvkey_free(ptr);
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {KESVKey}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.kesvkey_from_bytes(ptr0, len0);
        return KESVKey.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.kesvkey_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} prefix
    * @returns {string}
    */
    to_bech32(prefix) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(prefix, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.kesvkey_to_bech32(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} bech_str
    * @returns {KESVKey}
    */
    static from_bech32(bech_str) {
        var ptr0 = passStringToWasm0(bech_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.kesvkey_from_bech32(ptr0, len0);
        return KESVKey.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_hex() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.kesvkey_to_hex(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} hex
    * @returns {KESVKey}
    */
    static from_hex(hex) {
        var ptr0 = passStringToWasm0(hex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.kesvkey_from_hex(ptr0, len0);
        return KESVKey.__wrap(ret);
    }
}
module.exports.KESVKey = KESVKey;
/**
*/
class Language {

    static __wrap(ptr) {
        const obj = Object.create(Language.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_language_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.language_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Language}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.language_from_bytes(ptr0, len0);
        return Language.__wrap(ret);
    }
    /**
    * @returns {Language}
    */
    static new_plutus_v1() {
        var ret = wasm.language_new_plutus_v1();
        return Language.__wrap(ret);
    }
    /**
    * @returns {Language}
    */
    static new_plutus_v2() {
        var ret = wasm.language_new_plutus_v2();
        return Language.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    kind() {
        var ret = wasm.language_kind(this.ptr);
        return ret >>> 0;
    }
}
module.exports.Language = Language;
/**
*/
class Languages {

    static __wrap(ptr) {
        const obj = Object.create(Languages.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_languages_free(ptr);
    }
    /**
    * @returns {Languages}
    */
    static new() {
        var ret = wasm.languages_new();
        return Languages.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.languages_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {Language}
    */
    get(index) {
        var ret = wasm.languages_get(this.ptr, index);
        return Language.__wrap(ret);
    }
    /**
    * @param {Language} elem
    */
    add(elem) {
        _assertClass(elem, Language);
        var ptr0 = elem.ptr;
        elem.ptr = 0;
        wasm.languages_add(this.ptr, ptr0);
    }
}
module.exports.Languages = Languages;
/**
*/
class LegacyDaedalusPrivateKey {

    static __wrap(ptr) {
        const obj = Object.create(LegacyDaedalusPrivateKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_legacydaedalusprivatekey_free(ptr);
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {LegacyDaedalusPrivateKey}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.legacydaedalusprivatekey_from_bytes(ptr0, len0);
        return LegacyDaedalusPrivateKey.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    as_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.legacydaedalusprivatekey_as_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Uint8Array}
    */
    chaincode() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.legacydaedalusprivatekey_chaincode(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.LegacyDaedalusPrivateKey = LegacyDaedalusPrivateKey;
/**
*/
class LinearFee {

    static __wrap(ptr) {
        const obj = Object.create(LinearFee.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_linearfee_free(ptr);
    }
    /**
    * @returns {BigNum}
    */
    constant() {
        var ret = wasm.linearfee_constant(this.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @returns {BigNum}
    */
    coefficient() {
        var ret = wasm.linearfee_coefficient(this.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @param {BigNum} coefficient
    * @param {BigNum} constant
    * @returns {LinearFee}
    */
    static new(coefficient, constant) {
        _assertClass(coefficient, BigNum);
        _assertClass(constant, BigNum);
        var ret = wasm.linearfee_new(coefficient.ptr, constant.ptr);
        return LinearFee.__wrap(ret);
    }
}
module.exports.LinearFee = LinearFee;
/**
*/
class MIRToStakeCredentials {

    static __wrap(ptr) {
        const obj = Object.create(MIRToStakeCredentials.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_mirtostakecredentials_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mirtostakecredentials_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {MIRToStakeCredentials}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.mirtostakecredentials_from_bytes(ptr0, len0);
        return MIRToStakeCredentials.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mirtostakecredentials_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.mirtostakecredentials_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {MIRToStakeCredentials}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.mirtostakecredentials_from_json(ptr0, len0);
        return MIRToStakeCredentials.__wrap(ret);
    }
    /**
    * @returns {MIRToStakeCredentials}
    */
    static new() {
        var ret = wasm.mirtostakecredentials_new();
        return MIRToStakeCredentials.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.mirtostakecredentials_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {StakeCredential} cred
    * @param {Int} delta
    * @returns {Int | undefined}
    */
    insert(cred, delta) {
        _assertClass(cred, StakeCredential);
        _assertClass(delta, Int);
        var ret = wasm.mirtostakecredentials_insert(this.ptr, cred.ptr, delta.ptr);
        return ret === 0 ? undefined : Int.__wrap(ret);
    }
    /**
    * @param {StakeCredential} cred
    * @returns {Int | undefined}
    */
    get(cred) {
        _assertClass(cred, StakeCredential);
        var ret = wasm.mirtostakecredentials_get(this.ptr, cred.ptr);
        return ret === 0 ? undefined : Int.__wrap(ret);
    }
    /**
    * @returns {StakeCredentials}
    */
    keys() {
        var ret = wasm.mirtostakecredentials_keys(this.ptr);
        return StakeCredentials.__wrap(ret);
    }
}
module.exports.MIRToStakeCredentials = MIRToStakeCredentials;
/**
*/
class MetadataList {

    static __wrap(ptr) {
        const obj = Object.create(MetadataList.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_metadatalist_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.metadatalist_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {MetadataList}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.metadatalist_from_bytes(ptr0, len0);
        return MetadataList.__wrap(ret);
    }
    /**
    * @returns {MetadataList}
    */
    static new() {
        var ret = wasm.metadatalist_new();
        return MetadataList.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.metadatalist_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {TransactionMetadatum}
    */
    get(index) {
        var ret = wasm.metadatalist_get(this.ptr, index);
        return TransactionMetadatum.__wrap(ret);
    }
    /**
    * @param {TransactionMetadatum} elem
    */
    add(elem) {
        _assertClass(elem, TransactionMetadatum);
        wasm.metadatalist_add(this.ptr, elem.ptr);
    }
}
module.exports.MetadataList = MetadataList;
/**
*/
class MetadataMap {

    static __wrap(ptr) {
        const obj = Object.create(MetadataMap.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_metadatamap_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.metadatamap_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {MetadataMap}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.metadatamap_from_bytes(ptr0, len0);
        return MetadataMap.__wrap(ret);
    }
    /**
    * @returns {MetadataMap}
    */
    static new() {
        var ret = wasm.metadatamap_new();
        return MetadataMap.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.metadatamap_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {TransactionMetadatum} key
    * @param {TransactionMetadatum} value
    * @returns {TransactionMetadatum | undefined}
    */
    insert(key, value) {
        _assertClass(key, TransactionMetadatum);
        _assertClass(value, TransactionMetadatum);
        var ret = wasm.metadatamap_insert(this.ptr, key.ptr, value.ptr);
        return ret === 0 ? undefined : TransactionMetadatum.__wrap(ret);
    }
    /**
    * @param {string} key
    * @param {TransactionMetadatum} value
    * @returns {TransactionMetadatum | undefined}
    */
    insert_str(key, value) {
        var ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _assertClass(value, TransactionMetadatum);
        var ret = wasm.metadatamap_insert_str(this.ptr, ptr0, len0, value.ptr);
        return ret === 0 ? undefined : TransactionMetadatum.__wrap(ret);
    }
    /**
    * @param {number} key
    * @param {TransactionMetadatum} value
    * @returns {TransactionMetadatum | undefined}
    */
    insert_i32(key, value) {
        _assertClass(value, TransactionMetadatum);
        var ret = wasm.metadatamap_insert_i32(this.ptr, key, value.ptr);
        return ret === 0 ? undefined : TransactionMetadatum.__wrap(ret);
    }
    /**
    * @param {TransactionMetadatum} key
    * @returns {TransactionMetadatum}
    */
    get(key) {
        _assertClass(key, TransactionMetadatum);
        var ret = wasm.metadatamap_get(this.ptr, key.ptr);
        return TransactionMetadatum.__wrap(ret);
    }
    /**
    * @param {string} key
    * @returns {TransactionMetadatum}
    */
    get_str(key) {
        var ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.metadatamap_get_str(this.ptr, ptr0, len0);
        return TransactionMetadatum.__wrap(ret);
    }
    /**
    * @param {number} key
    * @returns {TransactionMetadatum}
    */
    get_i32(key) {
        var ret = wasm.metadatamap_get_i32(this.ptr, key);
        return TransactionMetadatum.__wrap(ret);
    }
    /**
    * @param {TransactionMetadatum} key
    * @returns {boolean}
    */
    has(key) {
        _assertClass(key, TransactionMetadatum);
        var ret = wasm.metadatamap_has(this.ptr, key.ptr);
        return ret !== 0;
    }
    /**
    * @returns {MetadataList}
    */
    keys() {
        var ret = wasm.metadatamap_keys(this.ptr);
        return MetadataList.__wrap(ret);
    }
}
module.exports.MetadataMap = MetadataMap;
/**
*/
class Mint {

    static __wrap(ptr) {
        const obj = Object.create(Mint.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_mint_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mint_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Mint}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.mint_from_bytes(ptr0, len0);
        return Mint.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.mint_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.mint_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {Mint}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.mint_from_json(ptr0, len0);
        return Mint.__wrap(ret);
    }
    /**
    * @returns {Mint}
    */
    static new() {
        var ret = wasm.mint_new();
        return Mint.__wrap(ret);
    }
    /**
    * @param {ScriptHash} key
    * @param {MintAssets} value
    * @returns {Mint}
    */
    static new_from_entry(key, value) {
        _assertClass(key, ScriptHash);
        _assertClass(value, MintAssets);
        var ret = wasm.mint_new_from_entry(key.ptr, value.ptr);
        return Mint.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.mint_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {ScriptHash} key
    * @param {MintAssets} value
    * @returns {MintAssets | undefined}
    */
    insert(key, value) {
        _assertClass(key, ScriptHash);
        _assertClass(value, MintAssets);
        var ret = wasm.mint_insert(this.ptr, key.ptr, value.ptr);
        return ret === 0 ? undefined : MintAssets.__wrap(ret);
    }
    /**
    * @param {ScriptHash} key
    * @returns {MintAssets | undefined}
    */
    get(key) {
        _assertClass(key, ScriptHash);
        var ret = wasm.mint_get(this.ptr, key.ptr);
        return ret === 0 ? undefined : MintAssets.__wrap(ret);
    }
    /**
    * @returns {ScriptHashes}
    */
    keys() {
        var ret = wasm.mint_keys(this.ptr);
        return ScriptHashes.__wrap(ret);
    }
    /**
    * Returns the multiasset where only positive (minting) entries are present
    * @returns {MultiAsset}
    */
    as_positive_multiasset() {
        var ret = wasm.mint_as_positive_multiasset(this.ptr);
        return MultiAsset.__wrap(ret);
    }
    /**
    * Returns the multiasset where only negative (burning) entries are present
    * @returns {MultiAsset}
    */
    as_negative_multiasset() {
        var ret = wasm.mint_as_negative_multiasset(this.ptr);
        return MultiAsset.__wrap(ret);
    }
}
module.exports.Mint = Mint;
/**
*/
class MintAssets {

    static __wrap(ptr) {
        const obj = Object.create(MintAssets.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_mintassets_free(ptr);
    }
    /**
    * @returns {MintAssets}
    */
    static new() {
        var ret = wasm.mintassets_new();
        return MintAssets.__wrap(ret);
    }
    /**
    * @param {AssetName} key
    * @param {Int} value
    * @returns {MintAssets}
    */
    static new_from_entry(key, value) {
        _assertClass(key, AssetName);
        _assertClass(value, Int);
        var ptr0 = value.ptr;
        value.ptr = 0;
        var ret = wasm.mintassets_new_from_entry(key.ptr, ptr0);
        return MintAssets.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.mintassets_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {AssetName} key
    * @param {Int} value
    * @returns {Int | undefined}
    */
    insert(key, value) {
        _assertClass(key, AssetName);
        _assertClass(value, Int);
        var ptr0 = value.ptr;
        value.ptr = 0;
        var ret = wasm.mintassets_insert(this.ptr, key.ptr, ptr0);
        return ret === 0 ? undefined : Int.__wrap(ret);
    }
    /**
    * @param {AssetName} key
    * @returns {Int | undefined}
    */
    get(key) {
        _assertClass(key, AssetName);
        var ret = wasm.mintassets_get(this.ptr, key.ptr);
        return ret === 0 ? undefined : Int.__wrap(ret);
    }
    /**
    * @returns {AssetNames}
    */
    keys() {
        var ret = wasm.mintassets_keys(this.ptr);
        return AssetNames.__wrap(ret);
    }
}
module.exports.MintAssets = MintAssets;
/**
*/
class MoveInstantaneousReward {

    static __wrap(ptr) {
        const obj = Object.create(MoveInstantaneousReward.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_moveinstantaneousreward_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.moveinstantaneousreward_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {MoveInstantaneousReward}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.moveinstantaneousreward_from_bytes(ptr0, len0);
        return MoveInstantaneousReward.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.moveinstantaneousreward_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.moveinstantaneousreward_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {MoveInstantaneousReward}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.moveinstantaneousreward_from_json(ptr0, len0);
        return MoveInstantaneousReward.__wrap(ret);
    }
    /**
    * @param {number} pot
    * @param {BigNum} amount
    * @returns {MoveInstantaneousReward}
    */
    static new_to_other_pot(pot, amount) {
        _assertClass(amount, BigNum);
        var ret = wasm.moveinstantaneousreward_new_to_other_pot(pot, amount.ptr);
        return MoveInstantaneousReward.__wrap(ret);
    }
    /**
    * @param {number} pot
    * @param {MIRToStakeCredentials} amounts
    * @returns {MoveInstantaneousReward}
    */
    static new_to_stake_creds(pot, amounts) {
        _assertClass(amounts, MIRToStakeCredentials);
        var ret = wasm.moveinstantaneousreward_new_to_stake_creds(pot, amounts.ptr);
        return MoveInstantaneousReward.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    pot() {
        var ret = wasm.moveinstantaneousreward_pot(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    kind() {
        var ret = wasm.moveinstantaneousreward_kind(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {BigNum | undefined}
    */
    as_to_other_pot() {
        var ret = wasm.moveinstantaneousreward_as_to_other_pot(this.ptr);
        return ret === 0 ? undefined : BigNum.__wrap(ret);
    }
    /**
    * @returns {MIRToStakeCredentials | undefined}
    */
    as_to_stake_creds() {
        var ret = wasm.moveinstantaneousreward_as_to_stake_creds(this.ptr);
        return ret === 0 ? undefined : MIRToStakeCredentials.__wrap(ret);
    }
}
module.exports.MoveInstantaneousReward = MoveInstantaneousReward;
/**
*/
class MoveInstantaneousRewardsCert {

    static __wrap(ptr) {
        const obj = Object.create(MoveInstantaneousRewardsCert.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_moveinstantaneousrewardscert_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.moveinstantaneousrewardscert_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {MoveInstantaneousRewardsCert}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.moveinstantaneousrewardscert_from_bytes(ptr0, len0);
        return MoveInstantaneousRewardsCert.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.moveinstantaneousrewardscert_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.moveinstantaneousrewardscert_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {MoveInstantaneousRewardsCert}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.moveinstantaneousrewardscert_from_json(ptr0, len0);
        return MoveInstantaneousRewardsCert.__wrap(ret);
    }
    /**
    * @returns {MoveInstantaneousReward}
    */
    move_instantaneous_reward() {
        var ret = wasm.moveinstantaneousrewardscert_move_instantaneous_reward(this.ptr);
        return MoveInstantaneousReward.__wrap(ret);
    }
    /**
    * @param {MoveInstantaneousReward} move_instantaneous_reward
    * @returns {MoveInstantaneousRewardsCert}
    */
    static new(move_instantaneous_reward) {
        _assertClass(move_instantaneous_reward, MoveInstantaneousReward);
        var ret = wasm.moveinstantaneousrewardscert_new(move_instantaneous_reward.ptr);
        return MoveInstantaneousRewardsCert.__wrap(ret);
    }
}
module.exports.MoveInstantaneousRewardsCert = MoveInstantaneousRewardsCert;
/**
*/
class MultiAsset {

    static __wrap(ptr) {
        const obj = Object.create(MultiAsset.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_multiasset_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.multiasset_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {MultiAsset}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.multiasset_from_bytes(ptr0, len0);
        return MultiAsset.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.multiasset_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.multiasset_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {MultiAsset}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.multiasset_from_json(ptr0, len0);
        return MultiAsset.__wrap(ret);
    }
    /**
    * @returns {MultiAsset}
    */
    static new() {
        var ret = wasm.multiasset_new();
        return MultiAsset.__wrap(ret);
    }
    /**
    * the number of unique policy IDs in the multiasset
    * @returns {number}
    */
    len() {
        var ret = wasm.multiasset_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * set (and replace if it exists) all assets with policy {policy_id} to a copy of {assets}
    * @param {ScriptHash} policy_id
    * @param {Assets} assets
    * @returns {Assets | undefined}
    */
    insert(policy_id, assets) {
        _assertClass(policy_id, ScriptHash);
        _assertClass(assets, Assets);
        var ret = wasm.multiasset_insert(this.ptr, policy_id.ptr, assets.ptr);
        return ret === 0 ? undefined : Assets.__wrap(ret);
    }
    /**
    * all assets under {policy_id}, if any exist, or else None (undefined in JS)
    * @param {ScriptHash} policy_id
    * @returns {Assets | undefined}
    */
    get(policy_id) {
        _assertClass(policy_id, ScriptHash);
        var ret = wasm.multiasset_get(this.ptr, policy_id.ptr);
        return ret === 0 ? undefined : Assets.__wrap(ret);
    }
    /**
    * sets the asset {asset_name} to {value} under policy {policy_id}
    * returns the previous amount if it was set, or else None (undefined in JS)
    * @param {ScriptHash} policy_id
    * @param {AssetName} asset_name
    * @param {BigNum} value
    * @returns {BigNum | undefined}
    */
    set_asset(policy_id, asset_name, value) {
        _assertClass(policy_id, ScriptHash);
        _assertClass(asset_name, AssetName);
        _assertClass(value, BigNum);
        var ptr0 = value.ptr;
        value.ptr = 0;
        var ret = wasm.multiasset_set_asset(this.ptr, policy_id.ptr, asset_name.ptr, ptr0);
        return ret === 0 ? undefined : BigNum.__wrap(ret);
    }
    /**
    * returns the amount of asset {asset_name} under policy {policy_id}
    * If such an asset does not exist, 0 is returned.
    * @param {ScriptHash} policy_id
    * @param {AssetName} asset_name
    * @returns {BigNum}
    */
    get_asset(policy_id, asset_name) {
        _assertClass(policy_id, ScriptHash);
        _assertClass(asset_name, AssetName);
        var ret = wasm.multiasset_get_asset(this.ptr, policy_id.ptr, asset_name.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * returns all policy IDs used by assets in this multiasset
    * @returns {ScriptHashes}
    */
    keys() {
        var ret = wasm.multiasset_keys(this.ptr);
        return ScriptHashes.__wrap(ret);
    }
    /**
    * removes an asset from the list if the result is 0 or less
    * does not modify this object, instead the result is returned
    * @param {MultiAsset} rhs_ma
    * @returns {MultiAsset}
    */
    sub(rhs_ma) {
        _assertClass(rhs_ma, MultiAsset);
        var ret = wasm.multiasset_sub(this.ptr, rhs_ma.ptr);
        return MultiAsset.__wrap(ret);
    }
}
module.exports.MultiAsset = MultiAsset;
/**
*/
class MultiHostName {

    static __wrap(ptr) {
        const obj = Object.create(MultiHostName.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_multihostname_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.multihostname_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {MultiHostName}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.multihostname_from_bytes(ptr0, len0);
        return MultiHostName.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.multihostname_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.multihostname_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {MultiHostName}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.multihostname_from_json(ptr0, len0);
        return MultiHostName.__wrap(ret);
    }
    /**
    * @returns {DNSRecordSRV}
    */
    dns_name() {
        var ret = wasm.multihostname_dns_name(this.ptr);
        return DNSRecordSRV.__wrap(ret);
    }
    /**
    * @param {DNSRecordSRV} dns_name
    * @returns {MultiHostName}
    */
    static new(dns_name) {
        _assertClass(dns_name, DNSRecordSRV);
        var ret = wasm.multihostname_new(dns_name.ptr);
        return MultiHostName.__wrap(ret);
    }
}
module.exports.MultiHostName = MultiHostName;
/**
*/
class NativeScript {

    static __wrap(ptr) {
        const obj = Object.create(NativeScript.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_nativescript_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.nativescript_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {NativeScript}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.nativescript_from_bytes(ptr0, len0);
        return NativeScript.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.nativescript_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.nativescript_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {NativeScript}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.nativescript_from_json(ptr0, len0);
        return NativeScript.__wrap(ret);
    }
    /**
    * @param {number} namespace
    * @returns {ScriptHash}
    */
    hash(namespace) {
        var ret = wasm.nativescript_hash(this.ptr, namespace);
        return ScriptHash.__wrap(ret);
    }
    /**
    * @param {ScriptPubkey} script_pubkey
    * @returns {NativeScript}
    */
    static new_script_pubkey(script_pubkey) {
        _assertClass(script_pubkey, ScriptPubkey);
        var ret = wasm.nativescript_new_script_pubkey(script_pubkey.ptr);
        return NativeScript.__wrap(ret);
    }
    /**
    * @param {ScriptAll} script_all
    * @returns {NativeScript}
    */
    static new_script_all(script_all) {
        _assertClass(script_all, ScriptAll);
        var ret = wasm.nativescript_new_script_all(script_all.ptr);
        return NativeScript.__wrap(ret);
    }
    /**
    * @param {ScriptAny} script_any
    * @returns {NativeScript}
    */
    static new_script_any(script_any) {
        _assertClass(script_any, ScriptAny);
        var ret = wasm.nativescript_new_script_any(script_any.ptr);
        return NativeScript.__wrap(ret);
    }
    /**
    * @param {ScriptNOfK} script_n_of_k
    * @returns {NativeScript}
    */
    static new_script_n_of_k(script_n_of_k) {
        _assertClass(script_n_of_k, ScriptNOfK);
        var ret = wasm.nativescript_new_script_n_of_k(script_n_of_k.ptr);
        return NativeScript.__wrap(ret);
    }
    /**
    * @param {TimelockStart} timelock_start
    * @returns {NativeScript}
    */
    static new_timelock_start(timelock_start) {
        _assertClass(timelock_start, TimelockStart);
        var ret = wasm.nativescript_new_timelock_start(timelock_start.ptr);
        return NativeScript.__wrap(ret);
    }
    /**
    * @param {TimelockExpiry} timelock_expiry
    * @returns {NativeScript}
    */
    static new_timelock_expiry(timelock_expiry) {
        _assertClass(timelock_expiry, TimelockExpiry);
        var ret = wasm.nativescript_new_timelock_expiry(timelock_expiry.ptr);
        return NativeScript.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    kind() {
        var ret = wasm.nativescript_kind(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {ScriptPubkey | undefined}
    */
    as_script_pubkey() {
        var ret = wasm.nativescript_as_script_pubkey(this.ptr);
        return ret === 0 ? undefined : ScriptPubkey.__wrap(ret);
    }
    /**
    * @returns {ScriptAll | undefined}
    */
    as_script_all() {
        var ret = wasm.nativescript_as_script_all(this.ptr);
        return ret === 0 ? undefined : ScriptAll.__wrap(ret);
    }
    /**
    * @returns {ScriptAny | undefined}
    */
    as_script_any() {
        var ret = wasm.nativescript_as_script_any(this.ptr);
        return ret === 0 ? undefined : ScriptAny.__wrap(ret);
    }
    /**
    * @returns {ScriptNOfK | undefined}
    */
    as_script_n_of_k() {
        var ret = wasm.nativescript_as_script_n_of_k(this.ptr);
        return ret === 0 ? undefined : ScriptNOfK.__wrap(ret);
    }
    /**
    * @returns {TimelockStart | undefined}
    */
    as_timelock_start() {
        var ret = wasm.nativescript_as_timelock_start(this.ptr);
        return ret === 0 ? undefined : TimelockStart.__wrap(ret);
    }
    /**
    * @returns {TimelockExpiry | undefined}
    */
    as_timelock_expiry() {
        var ret = wasm.nativescript_as_timelock_expiry(this.ptr);
        return ret === 0 ? undefined : TimelockExpiry.__wrap(ret);
    }
    /**
    * Returns an array of unique Ed25519KeyHashes
    * contained within this script recursively on any depth level.
    * The order of the keys in the result is not determined in any way.
    * @returns {Ed25519KeyHashes}
    */
    get_required_signers() {
        var ret = wasm.nativescript_get_required_signers(this.ptr);
        return Ed25519KeyHashes.__wrap(ret);
    }
}
module.exports.NativeScript = NativeScript;
/**
*/
class NativeScripts {

    static __wrap(ptr) {
        const obj = Object.create(NativeScripts.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_nativescripts_free(ptr);
    }
    /**
    * @returns {NativeScripts}
    */
    static new() {
        var ret = wasm.nativescripts_new();
        return NativeScripts.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.nativescripts_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {NativeScript}
    */
    get(index) {
        var ret = wasm.nativescripts_get(this.ptr, index);
        return NativeScript.__wrap(ret);
    }
    /**
    * @param {NativeScript} elem
    */
    add(elem) {
        _assertClass(elem, NativeScript);
        wasm.nativescripts_add(this.ptr, elem.ptr);
    }
}
module.exports.NativeScripts = NativeScripts;
/**
*/
class NetworkId {

    static __wrap(ptr) {
        const obj = Object.create(NetworkId.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_networkid_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.networkid_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {NetworkId}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.networkid_from_bytes(ptr0, len0);
        return NetworkId.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.networkid_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.networkid_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {NetworkId}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.networkid_from_json(ptr0, len0);
        return NetworkId.__wrap(ret);
    }
    /**
    * @returns {NetworkId}
    */
    static testnet() {
        var ret = wasm.networkid_testnet();
        return NetworkId.__wrap(ret);
    }
    /**
    * @returns {NetworkId}
    */
    static mainnet() {
        var ret = wasm.networkid_mainnet();
        return NetworkId.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    kind() {
        var ret = wasm.networkid_kind(this.ptr);
        return ret >>> 0;
    }
}
module.exports.NetworkId = NetworkId;
/**
*/
class NetworkInfo {

    static __wrap(ptr) {
        const obj = Object.create(NetworkInfo.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_networkinfo_free(ptr);
    }
    /**
    * @param {number} network_id
    * @param {number} protocol_magic
    * @returns {NetworkInfo}
    */
    static new(network_id, protocol_magic) {
        var ret = wasm.networkinfo_new(network_id, protocol_magic);
        return NetworkInfo.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    network_id() {
        var ret = wasm.networkinfo_network_id(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    protocol_magic() {
        var ret = wasm.networkinfo_protocol_magic(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {NetworkInfo}
    */
    static testnet() {
        var ret = wasm.networkinfo_testnet();
        return NetworkInfo.__wrap(ret);
    }
    /**
    * @returns {NetworkInfo}
    */
    static mainnet() {
        var ret = wasm.networkinfo_mainnet();
        return NetworkInfo.__wrap(ret);
    }
}
module.exports.NetworkInfo = NetworkInfo;
/**
*/
class Nonce {

    static __wrap(ptr) {
        const obj = Object.create(Nonce.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_nonce_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.nonce_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Nonce}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.nonce_from_bytes(ptr0, len0);
        return Nonce.__wrap(ret);
    }
    /**
    * @returns {Nonce}
    */
    static new_identity() {
        var ret = wasm.nonce_new_identity();
        return Nonce.__wrap(ret);
    }
    /**
    * @param {Uint8Array} hash
    * @returns {Nonce}
    */
    static new_from_hash(hash) {
        var ptr0 = passArray8ToWasm0(hash, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.nonce_new_from_hash(ptr0, len0);
        return Nonce.__wrap(ret);
    }
    /**
    * @returns {Uint8Array | undefined}
    */
    get_hash() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.nonce_get_hash(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            let v0;
            if (r0 !== 0) {
                v0 = getArrayU8FromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1);
            }
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.Nonce = Nonce;
/**
*/
class OperationalCert {

    static __wrap(ptr) {
        const obj = Object.create(OperationalCert.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_operationalcert_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.operationalcert_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {OperationalCert}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.operationalcert_from_bytes(ptr0, len0);
        return OperationalCert.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.operationalcert_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.operationalcert_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {OperationalCert}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.operationalcert_from_json(ptr0, len0);
        return OperationalCert.__wrap(ret);
    }
    /**
    * @returns {KESVKey}
    */
    hot_vkey() {
        var ret = wasm.operationalcert_hot_vkey(this.ptr);
        return KESVKey.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    sequence_number() {
        var ret = wasm.operationalcert_sequence_number(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    kes_period() {
        var ret = wasm.operationalcert_kes_period(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {Ed25519Signature}
    */
    sigma() {
        var ret = wasm.operationalcert_sigma(this.ptr);
        return Ed25519Signature.__wrap(ret);
    }
    /**
    * @param {KESVKey} hot_vkey
    * @param {number} sequence_number
    * @param {number} kes_period
    * @param {Ed25519Signature} sigma
    * @returns {OperationalCert}
    */
    static new(hot_vkey, sequence_number, kes_period, sigma) {
        _assertClass(hot_vkey, KESVKey);
        _assertClass(sigma, Ed25519Signature);
        var ret = wasm.operationalcert_new(hot_vkey.ptr, sequence_number, kes_period, sigma.ptr);
        return OperationalCert.__wrap(ret);
    }
}
module.exports.OperationalCert = OperationalCert;
/**
*/
class PlutusData {

    static __wrap(ptr) {
        const obj = Object.create(PlutusData.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_plutusdata_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.plutusdata_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {PlutusData}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.plutusdata_from_bytes(ptr0, len0);
        return PlutusData.__wrap(ret);
    }
    /**
    * @param {ConstrPlutusData} constr_plutus_data
    * @returns {PlutusData}
    */
    static new_constr_plutus_data(constr_plutus_data) {
        _assertClass(constr_plutus_data, ConstrPlutusData);
        var ret = wasm.plutusdata_new_constr_plutus_data(constr_plutus_data.ptr);
        return PlutusData.__wrap(ret);
    }
    /**
    * @param {PlutusMap} map
    * @returns {PlutusData}
    */
    static new_map(map) {
        _assertClass(map, PlutusMap);
        var ret = wasm.plutusdata_new_map(map.ptr);
        return PlutusData.__wrap(ret);
    }
    /**
    * @param {PlutusList} list
    * @returns {PlutusData}
    */
    static new_list(list) {
        _assertClass(list, PlutusList);
        var ret = wasm.plutusdata_new_list(list.ptr);
        return PlutusData.__wrap(ret);
    }
    /**
    * @param {BigInt} integer
    * @returns {PlutusData}
    */
    static new_integer(integer) {
        _assertClass(integer, BigInt);
        var ret = wasm.plutusdata_new_integer(integer.ptr);
        return PlutusData.__wrap(ret);
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {PlutusData}
    */
    static new_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.plutusdata_new_bytes(ptr0, len0);
        return PlutusData.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    kind() {
        var ret = wasm.plutusdata_kind(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {ConstrPlutusData | undefined}
    */
    as_constr_plutus_data() {
        var ret = wasm.plutusdata_as_constr_plutus_data(this.ptr);
        return ret === 0 ? undefined : ConstrPlutusData.__wrap(ret);
    }
    /**
    * @returns {PlutusMap | undefined}
    */
    as_map() {
        var ret = wasm.plutusdata_as_map(this.ptr);
        return ret === 0 ? undefined : PlutusMap.__wrap(ret);
    }
    /**
    * @returns {PlutusList | undefined}
    */
    as_list() {
        var ret = wasm.plutusdata_as_list(this.ptr);
        return ret === 0 ? undefined : PlutusList.__wrap(ret);
    }
    /**
    * @returns {BigInt | undefined}
    */
    as_integer() {
        var ret = wasm.plutusdata_as_integer(this.ptr);
        return ret === 0 ? undefined : BigInt.__wrap(ret);
    }
    /**
    * @returns {Uint8Array | undefined}
    */
    as_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.plutusdata_as_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            let v0;
            if (r0 !== 0) {
                v0 = getArrayU8FromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1);
            }
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.PlutusData = PlutusData;
/**
*/
class PlutusList {

    static __wrap(ptr) {
        const obj = Object.create(PlutusList.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_plutuslist_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.plutuslist_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {PlutusList}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.plutuslist_from_bytes(ptr0, len0);
        return PlutusList.__wrap(ret);
    }
    /**
    * @returns {PlutusList}
    */
    static new() {
        var ret = wasm.plutuslist_new();
        return PlutusList.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.plutuslist_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {PlutusData}
    */
    get(index) {
        var ret = wasm.plutuslist_get(this.ptr, index);
        return PlutusData.__wrap(ret);
    }
    /**
    * @param {PlutusData} elem
    */
    add(elem) {
        _assertClass(elem, PlutusData);
        wasm.plutuslist_add(this.ptr, elem.ptr);
    }
}
module.exports.PlutusList = PlutusList;
/**
*/
class PlutusMap {

    static __wrap(ptr) {
        const obj = Object.create(PlutusMap.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_plutusmap_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.plutusmap_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {PlutusMap}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.plutusmap_from_bytes(ptr0, len0);
        return PlutusMap.__wrap(ret);
    }
    /**
    * @returns {PlutusMap}
    */
    static new() {
        var ret = wasm.plutusmap_new();
        return PlutusMap.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.plutusmap_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {PlutusData} key
    * @param {PlutusData} value
    * @returns {PlutusData | undefined}
    */
    insert(key, value) {
        _assertClass(key, PlutusData);
        _assertClass(value, PlutusData);
        var ret = wasm.plutusmap_insert(this.ptr, key.ptr, value.ptr);
        return ret === 0 ? undefined : PlutusData.__wrap(ret);
    }
    /**
    * @param {PlutusData} key
    * @returns {PlutusData | undefined}
    */
    get(key) {
        _assertClass(key, PlutusData);
        var ret = wasm.plutusmap_get(this.ptr, key.ptr);
        return ret === 0 ? undefined : PlutusData.__wrap(ret);
    }
    /**
    * @returns {PlutusList}
    */
    keys() {
        var ret = wasm.plutusmap_keys(this.ptr);
        return PlutusList.__wrap(ret);
    }
}
module.exports.PlutusMap = PlutusMap;
/**
*/
class PlutusScript {

    static __wrap(ptr) {
        const obj = Object.create(PlutusScript.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_plutusscript_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.plutusscript_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {PlutusScript}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.plutusscript_from_bytes(ptr0, len0);
        return PlutusScript.__wrap(ret);
    }
    /**
    * @param {number} namespace
    * @returns {ScriptHash}
    */
    hash(namespace) {
        var ret = wasm.plutusscript_hash(this.ptr, namespace);
        return ScriptHash.__wrap(ret);
    }
    /**
    *
    *     * Creates a new Plutus script from the RAW bytes of the compiled script.
    *     * This does NOT include any CBOR encoding around these bytes (e.g. from "cborBytes" in cardano-cli)
    *     * If you creating this from those you should use PlutusScript::from_bytes() instead.
    *
    * @param {Uint8Array} bytes
    * @returns {PlutusScript}
    */
    static new(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.plutusscript_new(ptr0, len0);
        return PlutusScript.__wrap(ret);
    }
    /**
    *
    *     * The raw bytes of this compiled Plutus script.
    *     * If you need "cborBytes" for cardano-cli use PlutusScript::to_bytes() instead.
    *
    * @returns {Uint8Array}
    */
    bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.plutusscript_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.PlutusScript = PlutusScript;
/**
*/
class PlutusScripts {

    static __wrap(ptr) {
        const obj = Object.create(PlutusScripts.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_plutusscripts_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.plutusscripts_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {PlutusScripts}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.plutusscripts_from_bytes(ptr0, len0);
        return PlutusScripts.__wrap(ret);
    }
    /**
    * @returns {PlutusScripts}
    */
    static new() {
        var ret = wasm.plutusscripts_new();
        return PlutusScripts.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.plutusscripts_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {PlutusScript}
    */
    get(index) {
        var ret = wasm.plutusscripts_get(this.ptr, index);
        return PlutusScript.__wrap(ret);
    }
    /**
    * @param {PlutusScript} elem
    */
    add(elem) {
        _assertClass(elem, PlutusScript);
        wasm.plutusscripts_add(this.ptr, elem.ptr);
    }
}
module.exports.PlutusScripts = PlutusScripts;
/**
*/
class PlutusWitness {

    static __wrap(ptr) {
        const obj = Object.create(PlutusWitness.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_plutuswitness_free(ptr);
    }
    /**
    * Plutus V1 witness or witness where no script is attached and so version doesn't matter
    * @param {PlutusData} redeemer
    * @param {PlutusData | undefined} plutus_data
    * @param {PlutusScript | undefined} script
    * @returns {PlutusWitness}
    */
    static new(redeemer, plutus_data, script) {
        _assertClass(redeemer, PlutusData);
        let ptr0 = 0;
        if (!isLikeNone(plutus_data)) {
            _assertClass(plutus_data, PlutusData);
            ptr0 = plutus_data.ptr;
            plutus_data.ptr = 0;
        }
        let ptr1 = 0;
        if (!isLikeNone(script)) {
            _assertClass(script, PlutusScript);
            ptr1 = script.ptr;
            script.ptr = 0;
        }
        var ret = wasm.plutuswitness_new(redeemer.ptr, ptr0, ptr1);
        return PlutusWitness.__wrap(ret);
    }
    /**
    * @param {PlutusData} redeemer
    * @param {PlutusData | undefined} plutus_data
    * @param {PlutusScript | undefined} script
    * @returns {PlutusWitness}
    */
    static new_plutus_v2(redeemer, plutus_data, script) {
        _assertClass(redeemer, PlutusData);
        let ptr0 = 0;
        if (!isLikeNone(plutus_data)) {
            _assertClass(plutus_data, PlutusData);
            ptr0 = plutus_data.ptr;
            plutus_data.ptr = 0;
        }
        let ptr1 = 0;
        if (!isLikeNone(script)) {
            _assertClass(script, PlutusScript);
            ptr1 = script.ptr;
            script.ptr = 0;
        }
        var ret = wasm.plutuswitness_new_plutus_v2(redeemer.ptr, ptr0, ptr1);
        return PlutusWitness.__wrap(ret);
    }
    /**
    * @returns {PlutusData | undefined}
    */
    plutus_data() {
        var ret = wasm.plutuswitness_plutus_data(this.ptr);
        return ret === 0 ? undefined : PlutusData.__wrap(ret);
    }
    /**
    * @returns {PlutusData}
    */
    redeemer() {
        var ret = wasm.plutuswitness_redeemer(this.ptr);
        return PlutusData.__wrap(ret);
    }
    /**
    * @returns {PlutusScript | undefined}
    */
    script() {
        var ret = wasm.plutuswitness_script(this.ptr);
        return ret === 0 ? undefined : PlutusScript.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    version() {
        var ret = wasm.plutuswitness_version(this.ptr);
        return ret >>> 0;
    }
}
module.exports.PlutusWitness = PlutusWitness;
/**
*/
class Pointer {

    static __wrap(ptr) {
        const obj = Object.create(Pointer.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pointer_free(ptr);
    }
    /**
    * @param {BigNum} slot
    * @param {BigNum} tx_index
    * @param {BigNum} cert_index
    * @returns {Pointer}
    */
    static new(slot, tx_index, cert_index) {
        _assertClass(slot, BigNum);
        _assertClass(tx_index, BigNum);
        _assertClass(cert_index, BigNum);
        var ret = wasm.pointer_new(slot.ptr, tx_index.ptr, cert_index.ptr);
        return Pointer.__wrap(ret);
    }
    /**
    * @returns {BigNum}
    */
    slot() {
        var ret = wasm.pointer_slot(this.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @returns {BigNum}
    */
    tx_index() {
        var ret = wasm.pointer_tx_index(this.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @returns {BigNum}
    */
    cert_index() {
        var ret = wasm.pointer_cert_index(this.ptr);
        return BigNum.__wrap(ret);
    }
}
module.exports.Pointer = Pointer;
/**
*/
class PointerAddress {

    static __wrap(ptr) {
        const obj = Object.create(PointerAddress.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pointeraddress_free(ptr);
    }
    /**
    * @param {number} network
    * @param {StakeCredential} payment
    * @param {Pointer} stake
    * @returns {PointerAddress}
    */
    static new(network, payment, stake) {
        _assertClass(payment, StakeCredential);
        _assertClass(stake, Pointer);
        var ret = wasm.pointeraddress_new(network, payment.ptr, stake.ptr);
        return PointerAddress.__wrap(ret);
    }
    /**
    * @returns {StakeCredential}
    */
    payment_cred() {
        var ret = wasm.pointeraddress_payment_cred(this.ptr);
        return StakeCredential.__wrap(ret);
    }
    /**
    * @returns {Pointer}
    */
    stake_pointer() {
        var ret = wasm.pointeraddress_stake_pointer(this.ptr);
        return Pointer.__wrap(ret);
    }
    /**
    * @returns {Address}
    */
    to_address() {
        var ret = wasm.pointeraddress_to_address(this.ptr);
        return Address.__wrap(ret);
    }
    /**
    * @param {Address} addr
    * @returns {PointerAddress | undefined}
    */
    static from_address(addr) {
        _assertClass(addr, Address);
        var ret = wasm.pointeraddress_from_address(addr.ptr);
        return ret === 0 ? undefined : PointerAddress.__wrap(ret);
    }
}
module.exports.PointerAddress = PointerAddress;
/**
*/
class PoolMetadata {

    static __wrap(ptr) {
        const obj = Object.create(PoolMetadata.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_poolmetadata_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.poolmetadata_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {PoolMetadata}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.poolmetadata_from_bytes(ptr0, len0);
        return PoolMetadata.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.poolmetadata_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.poolmetadata_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {PoolMetadata}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.poolmetadata_from_json(ptr0, len0);
        return PoolMetadata.__wrap(ret);
    }
    /**
    * @returns {URL}
    */
    url() {
        var ret = wasm.poolmetadata_url(this.ptr);
        return URL.__wrap(ret);
    }
    /**
    * @returns {PoolMetadataHash}
    */
    pool_metadata_hash() {
        var ret = wasm.poolmetadata_pool_metadata_hash(this.ptr);
        return PoolMetadataHash.__wrap(ret);
    }
    /**
    * @param {URL} url
    * @param {PoolMetadataHash} pool_metadata_hash
    * @returns {PoolMetadata}
    */
    static new(url, pool_metadata_hash) {
        _assertClass(url, URL);
        _assertClass(pool_metadata_hash, PoolMetadataHash);
        var ret = wasm.poolmetadata_new(url.ptr, pool_metadata_hash.ptr);
        return PoolMetadata.__wrap(ret);
    }
}
module.exports.PoolMetadata = PoolMetadata;
/**
*/
class PoolMetadataHash {

    static __wrap(ptr) {
        const obj = Object.create(PoolMetadataHash.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_poolmetadatahash_free(ptr);
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {PoolMetadataHash}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.poolmetadatahash_from_bytes(ptr0, len0);
        return PoolMetadataHash.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.poolmetadatahash_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} prefix
    * @returns {string}
    */
    to_bech32(prefix) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(prefix, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.poolmetadatahash_to_bech32(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} bech_str
    * @returns {PoolMetadataHash}
    */
    static from_bech32(bech_str) {
        var ptr0 = passStringToWasm0(bech_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.poolmetadatahash_from_bech32(ptr0, len0);
        return PoolMetadataHash.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_hex() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.poolmetadatahash_to_hex(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} hex
    * @returns {PoolMetadataHash}
    */
    static from_hex(hex) {
        var ptr0 = passStringToWasm0(hex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.poolmetadatahash_from_hex(ptr0, len0);
        return PoolMetadataHash.__wrap(ret);
    }
}
module.exports.PoolMetadataHash = PoolMetadataHash;
/**
*/
class PoolParams {

    static __wrap(ptr) {
        const obj = Object.create(PoolParams.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_poolparams_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.poolparams_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {PoolParams}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.poolparams_from_bytes(ptr0, len0);
        return PoolParams.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.poolparams_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.poolparams_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {PoolParams}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.poolparams_from_json(ptr0, len0);
        return PoolParams.__wrap(ret);
    }
    /**
    * @returns {Ed25519KeyHash}
    */
    operator() {
        var ret = wasm.poolparams_operator(this.ptr);
        return Ed25519KeyHash.__wrap(ret);
    }
    /**
    * @returns {VRFKeyHash}
    */
    vrf_keyhash() {
        var ret = wasm.poolparams_vrf_keyhash(this.ptr);
        return VRFKeyHash.__wrap(ret);
    }
    /**
    * @returns {BigNum}
    */
    pledge() {
        var ret = wasm.poolparams_pledge(this.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @returns {BigNum}
    */
    cost() {
        var ret = wasm.poolparams_cost(this.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @returns {UnitInterval}
    */
    margin() {
        var ret = wasm.poolparams_margin(this.ptr);
        return UnitInterval.__wrap(ret);
    }
    /**
    * @returns {RewardAddress}
    */
    reward_account() {
        var ret = wasm.poolparams_reward_account(this.ptr);
        return RewardAddress.__wrap(ret);
    }
    /**
    * @returns {Ed25519KeyHashes}
    */
    pool_owners() {
        var ret = wasm.poolparams_pool_owners(this.ptr);
        return Ed25519KeyHashes.__wrap(ret);
    }
    /**
    * @returns {Relays}
    */
    relays() {
        var ret = wasm.poolparams_relays(this.ptr);
        return Relays.__wrap(ret);
    }
    /**
    * @returns {PoolMetadata | undefined}
    */
    pool_metadata() {
        var ret = wasm.poolparams_pool_metadata(this.ptr);
        return ret === 0 ? undefined : PoolMetadata.__wrap(ret);
    }
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
    static new(operator, vrf_keyhash, pledge, cost, margin, reward_account, pool_owners, relays, pool_metadata) {
        _assertClass(operator, Ed25519KeyHash);
        _assertClass(vrf_keyhash, VRFKeyHash);
        _assertClass(pledge, BigNum);
        _assertClass(cost, BigNum);
        _assertClass(margin, UnitInterval);
        _assertClass(reward_account, RewardAddress);
        _assertClass(pool_owners, Ed25519KeyHashes);
        _assertClass(relays, Relays);
        let ptr0 = 0;
        if (!isLikeNone(pool_metadata)) {
            _assertClass(pool_metadata, PoolMetadata);
            ptr0 = pool_metadata.ptr;
            pool_metadata.ptr = 0;
        }
        var ret = wasm.poolparams_new(operator.ptr, vrf_keyhash.ptr, pledge.ptr, cost.ptr, margin.ptr, reward_account.ptr, pool_owners.ptr, relays.ptr, ptr0);
        return PoolParams.__wrap(ret);
    }
}
module.exports.PoolParams = PoolParams;
/**
*/
class PoolRegistration {

    static __wrap(ptr) {
        const obj = Object.create(PoolRegistration.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_poolregistration_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.poolregistration_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {PoolRegistration}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.poolregistration_from_bytes(ptr0, len0);
        return PoolRegistration.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.poolregistration_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.poolregistration_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {PoolRegistration}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.poolregistration_from_json(ptr0, len0);
        return PoolRegistration.__wrap(ret);
    }
    /**
    * @returns {PoolParams}
    */
    pool_params() {
        var ret = wasm.poolregistration_pool_params(this.ptr);
        return PoolParams.__wrap(ret);
    }
    /**
    * @param {PoolParams} pool_params
    * @returns {PoolRegistration}
    */
    static new(pool_params) {
        _assertClass(pool_params, PoolParams);
        var ret = wasm.poolregistration_new(pool_params.ptr);
        return PoolRegistration.__wrap(ret);
    }
    /**
    * @param {boolean} update
    */
    set_is_update(update) {
        wasm.poolregistration_set_is_update(this.ptr, update);
    }
}
module.exports.PoolRegistration = PoolRegistration;
/**
*/
class PoolRetirement {

    static __wrap(ptr) {
        const obj = Object.create(PoolRetirement.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_poolretirement_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.poolretirement_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {PoolRetirement}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.poolretirement_from_bytes(ptr0, len0);
        return PoolRetirement.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.poolretirement_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.poolretirement_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {PoolRetirement}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.poolretirement_from_json(ptr0, len0);
        return PoolRetirement.__wrap(ret);
    }
    /**
    * @returns {Ed25519KeyHash}
    */
    pool_keyhash() {
        var ret = wasm.poolretirement_pool_keyhash(this.ptr);
        return Ed25519KeyHash.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    epoch() {
        var ret = wasm.poolretirement_epoch(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {Ed25519KeyHash} pool_keyhash
    * @param {number} epoch
    * @returns {PoolRetirement}
    */
    static new(pool_keyhash, epoch) {
        _assertClass(pool_keyhash, Ed25519KeyHash);
        var ret = wasm.poolretirement_new(pool_keyhash.ptr, epoch);
        return PoolRetirement.__wrap(ret);
    }
}
module.exports.PoolRetirement = PoolRetirement;
/**
*/
class PrivateKey {

    static __wrap(ptr) {
        const obj = Object.create(PrivateKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_privatekey_free(ptr);
    }
    /**
    * @returns {PublicKey}
    */
    to_public() {
        var ret = wasm.privatekey_to_public(this.ptr);
        return PublicKey.__wrap(ret);
    }
    /**
    * @returns {PrivateKey}
    */
    static generate_ed25519() {
        var ret = wasm.privatekey_generate_ed25519();
        return PrivateKey.__wrap(ret);
    }
    /**
    * @returns {PrivateKey}
    */
    static generate_ed25519extended() {
        var ret = wasm.privatekey_generate_ed25519extended();
        return PrivateKey.__wrap(ret);
    }
    /**
    * Get private key from its bech32 representation
    * ```javascript
    * PrivateKey.from_bech32(&#39;ed25519_sk1ahfetf02qwwg4dkq7mgp4a25lx5vh9920cr5wnxmpzz9906qvm8qwvlts0&#39;);
    * ```
    * For an extended 25519 key
    * ```javascript
    * PrivateKey.from_bech32(&#39;ed25519e_sk1gqwl4szuwwh6d0yk3nsqcc6xxc3fpvjlevgwvt60df59v8zd8f8prazt8ln3lmz096ux3xvhhvm3ca9wj2yctdh3pnw0szrma07rt5gl748fp&#39;);
    * ```
    * @param {string} bech32_str
    * @returns {PrivateKey}
    */
    static from_bech32(bech32_str) {
        var ptr0 = passStringToWasm0(bech32_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.privatekey_from_bech32(ptr0, len0);
        return PrivateKey.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_bech32() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.privatekey_to_bech32(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Uint8Array}
    */
    as_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.privatekey_as_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {PrivateKey}
    */
    static from_extended_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.privatekey_from_extended_bytes(ptr0, len0);
        return PrivateKey.__wrap(ret);
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {PrivateKey}
    */
    static from_normal_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.privatekey_from_normal_bytes(ptr0, len0);
        return PrivateKey.__wrap(ret);
    }
    /**
    * @param {Uint8Array} message
    * @returns {Ed25519Signature}
    */
    sign(message) {
        var ptr0 = passArray8ToWasm0(message, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.privatekey_sign(this.ptr, ptr0, len0);
        return Ed25519Signature.__wrap(ret);
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {PrivateKey}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.privatekey_from_bytes(ptr0, len0);
        return PrivateKey.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.privatekey_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.PrivateKey = PrivateKey;
/**
*/
class ProposedProtocolParameterUpdates {

    static __wrap(ptr) {
        const obj = Object.create(ProposedProtocolParameterUpdates.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_proposedprotocolparameterupdates_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.proposedprotocolparameterupdates_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {ProposedProtocolParameterUpdates}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.proposedprotocolparameterupdates_from_bytes(ptr0, len0);
        return ProposedProtocolParameterUpdates.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.proposedprotocolparameterupdates_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.proposedprotocolparameterupdates_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {ProposedProtocolParameterUpdates}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.proposedprotocolparameterupdates_from_json(ptr0, len0);
        return ProposedProtocolParameterUpdates.__wrap(ret);
    }
    /**
    * @returns {ProposedProtocolParameterUpdates}
    */
    static new() {
        var ret = wasm.proposedprotocolparameterupdates_new();
        return ProposedProtocolParameterUpdates.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.proposedprotocolparameterupdates_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {GenesisHash} key
    * @param {ProtocolParamUpdate} value
    * @returns {ProtocolParamUpdate | undefined}
    */
    insert(key, value) {
        _assertClass(key, GenesisHash);
        _assertClass(value, ProtocolParamUpdate);
        var ret = wasm.proposedprotocolparameterupdates_insert(this.ptr, key.ptr, value.ptr);
        return ret === 0 ? undefined : ProtocolParamUpdate.__wrap(ret);
    }
    /**
    * @param {GenesisHash} key
    * @returns {ProtocolParamUpdate | undefined}
    */
    get(key) {
        _assertClass(key, GenesisHash);
        var ret = wasm.proposedprotocolparameterupdates_get(this.ptr, key.ptr);
        return ret === 0 ? undefined : ProtocolParamUpdate.__wrap(ret);
    }
    /**
    * @returns {GenesisHashes}
    */
    keys() {
        var ret = wasm.proposedprotocolparameterupdates_keys(this.ptr);
        return GenesisHashes.__wrap(ret);
    }
}
module.exports.ProposedProtocolParameterUpdates = ProposedProtocolParameterUpdates;
/**
*/
class ProtocolParamUpdate {

    static __wrap(ptr) {
        const obj = Object.create(ProtocolParamUpdate.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_protocolparamupdate_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.protocolparamupdate_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {ProtocolParamUpdate}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.protocolparamupdate_from_bytes(ptr0, len0);
        return ProtocolParamUpdate.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.protocolparamupdate_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.protocolparamupdate_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {ProtocolParamUpdate}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.protocolparamupdate_from_json(ptr0, len0);
        return ProtocolParamUpdate.__wrap(ret);
    }
    /**
    * @param {BigNum} minfee_a
    */
    set_minfee_a(minfee_a) {
        _assertClass(minfee_a, BigNum);
        wasm.protocolparamupdate_set_minfee_a(this.ptr, minfee_a.ptr);
    }
    /**
    * @returns {BigNum | undefined}
    */
    minfee_a() {
        var ret = wasm.protocolparamupdate_minfee_a(this.ptr);
        return ret === 0 ? undefined : BigNum.__wrap(ret);
    }
    /**
    * @param {BigNum} minfee_b
    */
    set_minfee_b(minfee_b) {
        _assertClass(minfee_b, BigNum);
        wasm.protocolparamupdate_set_minfee_b(this.ptr, minfee_b.ptr);
    }
    /**
    * @returns {BigNum | undefined}
    */
    minfee_b() {
        var ret = wasm.protocolparamupdate_minfee_b(this.ptr);
        return ret === 0 ? undefined : BigNum.__wrap(ret);
    }
    /**
    * @param {number} max_block_body_size
    */
    set_max_block_body_size(max_block_body_size) {
        wasm.protocolparamupdate_set_max_block_body_size(this.ptr, max_block_body_size);
    }
    /**
    * @returns {number | undefined}
    */
    max_block_body_size() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.protocolparamupdate_max_block_body_size(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return r0 === 0 ? undefined : r1 >>> 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number} max_tx_size
    */
    set_max_tx_size(max_tx_size) {
        wasm.protocolparamupdate_set_max_tx_size(this.ptr, max_tx_size);
    }
    /**
    * @returns {number | undefined}
    */
    max_tx_size() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.protocolparamupdate_max_tx_size(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return r0 === 0 ? undefined : r1 >>> 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number} max_block_header_size
    */
    set_max_block_header_size(max_block_header_size) {
        wasm.protocolparamupdate_set_max_block_header_size(this.ptr, max_block_header_size);
    }
    /**
    * @returns {number | undefined}
    */
    max_block_header_size() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.protocolparamupdate_max_block_header_size(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return r0 === 0 ? undefined : r1 >>> 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {BigNum} key_deposit
    */
    set_key_deposit(key_deposit) {
        _assertClass(key_deposit, BigNum);
        wasm.protocolparamupdate_set_key_deposit(this.ptr, key_deposit.ptr);
    }
    /**
    * @returns {BigNum | undefined}
    */
    key_deposit() {
        var ret = wasm.protocolparamupdate_key_deposit(this.ptr);
        return ret === 0 ? undefined : BigNum.__wrap(ret);
    }
    /**
    * @param {BigNum} pool_deposit
    */
    set_pool_deposit(pool_deposit) {
        _assertClass(pool_deposit, BigNum);
        wasm.protocolparamupdate_set_pool_deposit(this.ptr, pool_deposit.ptr);
    }
    /**
    * @returns {BigNum | undefined}
    */
    pool_deposit() {
        var ret = wasm.protocolparamupdate_pool_deposit(this.ptr);
        return ret === 0 ? undefined : BigNum.__wrap(ret);
    }
    /**
    * @param {number} max_epoch
    */
    set_max_epoch(max_epoch) {
        wasm.protocolparamupdate_set_max_epoch(this.ptr, max_epoch);
    }
    /**
    * @returns {number | undefined}
    */
    max_epoch() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.protocolparamupdate_max_epoch(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return r0 === 0 ? undefined : r1 >>> 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number} n_opt
    */
    set_n_opt(n_opt) {
        wasm.protocolparamupdate_set_n_opt(this.ptr, n_opt);
    }
    /**
    * @returns {number | undefined}
    */
    n_opt() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.protocolparamupdate_n_opt(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return r0 === 0 ? undefined : r1 >>> 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {UnitInterval} pool_pledge_influence
    */
    set_pool_pledge_influence(pool_pledge_influence) {
        _assertClass(pool_pledge_influence, UnitInterval);
        wasm.protocolparamupdate_set_pool_pledge_influence(this.ptr, pool_pledge_influence.ptr);
    }
    /**
    * @returns {UnitInterval | undefined}
    */
    pool_pledge_influence() {
        var ret = wasm.protocolparamupdate_pool_pledge_influence(this.ptr);
        return ret === 0 ? undefined : UnitInterval.__wrap(ret);
    }
    /**
    * @param {UnitInterval} expansion_rate
    */
    set_expansion_rate(expansion_rate) {
        _assertClass(expansion_rate, UnitInterval);
        wasm.protocolparamupdate_set_expansion_rate(this.ptr, expansion_rate.ptr);
    }
    /**
    * @returns {UnitInterval | undefined}
    */
    expansion_rate() {
        var ret = wasm.protocolparamupdate_expansion_rate(this.ptr);
        return ret === 0 ? undefined : UnitInterval.__wrap(ret);
    }
    /**
    * @param {UnitInterval} treasury_growth_rate
    */
    set_treasury_growth_rate(treasury_growth_rate) {
        _assertClass(treasury_growth_rate, UnitInterval);
        wasm.protocolparamupdate_set_treasury_growth_rate(this.ptr, treasury_growth_rate.ptr);
    }
    /**
    * @returns {UnitInterval | undefined}
    */
    treasury_growth_rate() {
        var ret = wasm.protocolparamupdate_treasury_growth_rate(this.ptr);
        return ret === 0 ? undefined : UnitInterval.__wrap(ret);
    }
    /**
    * @param {UnitInterval} d
    */
    set_d(d) {
        _assertClass(d, UnitInterval);
        wasm.protocolparamupdate_set_d(this.ptr, d.ptr);
    }
    /**
    * @returns {UnitInterval | undefined}
    */
    d() {
        var ret = wasm.protocolparamupdate_d(this.ptr);
        return ret === 0 ? undefined : UnitInterval.__wrap(ret);
    }
    /**
    * @param {Nonce} extra_entropy
    */
    set_extra_entropy(extra_entropy) {
        _assertClass(extra_entropy, Nonce);
        wasm.protocolparamupdate_set_extra_entropy(this.ptr, extra_entropy.ptr);
    }
    /**
    * @returns {Nonce | undefined}
    */
    extra_entropy() {
        var ret = wasm.protocolparamupdate_extra_entropy(this.ptr);
        return ret === 0 ? undefined : Nonce.__wrap(ret);
    }
    /**
    * @param {ProtocolVersion} protocol_version
    */
    set_protocol_version(protocol_version) {
        _assertClass(protocol_version, ProtocolVersion);
        wasm.protocolparamupdate_set_protocol_version(this.ptr, protocol_version.ptr);
    }
    /**
    * @returns {ProtocolVersion | undefined}
    */
    protocol_version() {
        var ret = wasm.protocolparamupdate_protocol_version(this.ptr);
        return ret === 0 ? undefined : ProtocolVersion.__wrap(ret);
    }
    /**
    * @param {BigNum} min_pool_cost
    */
    set_min_pool_cost(min_pool_cost) {
        _assertClass(min_pool_cost, BigNum);
        wasm.protocolparamupdate_set_min_pool_cost(this.ptr, min_pool_cost.ptr);
    }
    /**
    * @returns {BigNum | undefined}
    */
    min_pool_cost() {
        var ret = wasm.protocolparamupdate_min_pool_cost(this.ptr);
        return ret === 0 ? undefined : BigNum.__wrap(ret);
    }
    /**
    * @param {BigNum} ada_per_utxo_byte
    */
    set_ada_per_utxo_byte(ada_per_utxo_byte) {
        _assertClass(ada_per_utxo_byte, BigNum);
        wasm.protocolparamupdate_set_ada_per_utxo_byte(this.ptr, ada_per_utxo_byte.ptr);
    }
    /**
    * @returns {BigNum | undefined}
    */
    ada_per_utxo_byte() {
        var ret = wasm.protocolparamupdate_ada_per_utxo_byte(this.ptr);
        return ret === 0 ? undefined : BigNum.__wrap(ret);
    }
    /**
    * @param {Costmdls} cost_models
    */
    set_cost_models(cost_models) {
        _assertClass(cost_models, Costmdls);
        wasm.protocolparamupdate_set_cost_models(this.ptr, cost_models.ptr);
    }
    /**
    * @returns {Costmdls | undefined}
    */
    cost_models() {
        var ret = wasm.protocolparamupdate_cost_models(this.ptr);
        return ret === 0 ? undefined : Costmdls.__wrap(ret);
    }
    /**
    * @param {ExUnitPrices} execution_costs
    */
    set_execution_costs(execution_costs) {
        _assertClass(execution_costs, ExUnitPrices);
        wasm.protocolparamupdate_set_execution_costs(this.ptr, execution_costs.ptr);
    }
    /**
    * @returns {ExUnitPrices | undefined}
    */
    execution_costs() {
        var ret = wasm.protocolparamupdate_execution_costs(this.ptr);
        return ret === 0 ? undefined : ExUnitPrices.__wrap(ret);
    }
    /**
    * @param {ExUnits} max_tx_ex_units
    */
    set_max_tx_ex_units(max_tx_ex_units) {
        _assertClass(max_tx_ex_units, ExUnits);
        wasm.protocolparamupdate_set_max_tx_ex_units(this.ptr, max_tx_ex_units.ptr);
    }
    /**
    * @returns {ExUnits | undefined}
    */
    max_tx_ex_units() {
        var ret = wasm.protocolparamupdate_max_tx_ex_units(this.ptr);
        return ret === 0 ? undefined : ExUnits.__wrap(ret);
    }
    /**
    * @param {ExUnits} max_block_ex_units
    */
    set_max_block_ex_units(max_block_ex_units) {
        _assertClass(max_block_ex_units, ExUnits);
        wasm.protocolparamupdate_set_max_block_ex_units(this.ptr, max_block_ex_units.ptr);
    }
    /**
    * @returns {ExUnits | undefined}
    */
    max_block_ex_units() {
        var ret = wasm.protocolparamupdate_max_block_ex_units(this.ptr);
        return ret === 0 ? undefined : ExUnits.__wrap(ret);
    }
    /**
    * @param {number} max_value_size
    */
    set_max_value_size(max_value_size) {
        wasm.protocolparamupdate_set_max_value_size(this.ptr, max_value_size);
    }
    /**
    * @returns {number | undefined}
    */
    max_value_size() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.protocolparamupdate_max_value_size(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return r0 === 0 ? undefined : r1 >>> 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number} collateral_percentage
    */
    set_collateral_percentage(collateral_percentage) {
        wasm.protocolparamupdate_set_collateral_percentage(this.ptr, collateral_percentage);
    }
    /**
    * @returns {number | undefined}
    */
    collateral_percentage() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.protocolparamupdate_collateral_percentage(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return r0 === 0 ? undefined : r1 >>> 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number} max_collateral_inputs
    */
    set_max_collateral_inputs(max_collateral_inputs) {
        wasm.protocolparamupdate_set_max_collateral_inputs(this.ptr, max_collateral_inputs);
    }
    /**
    * @returns {number | undefined}
    */
    max_collateral_inputs() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.protocolparamupdate_max_collateral_inputs(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return r0 === 0 ? undefined : r1 >>> 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {ProtocolParamUpdate}
    */
    static new() {
        var ret = wasm.protocolparamupdate_new();
        return ProtocolParamUpdate.__wrap(ret);
    }
}
module.exports.ProtocolParamUpdate = ProtocolParamUpdate;
/**
*/
class ProtocolVersion {

    static __wrap(ptr) {
        const obj = Object.create(ProtocolVersion.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_protocolversion_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.protocolversion_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {ProtocolVersion}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.protocolversion_from_bytes(ptr0, len0);
        return ProtocolVersion.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.protocolversion_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.protocolversion_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {ProtocolVersion}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.protocolversion_from_json(ptr0, len0);
        return ProtocolVersion.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    major() {
        var ret = wasm.protocolversion_major(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    minor() {
        var ret = wasm.protocolversion_minor(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} major
    * @param {number} minor
    * @returns {ProtocolVersion}
    */
    static new(major, minor) {
        var ret = wasm.protocolversion_new(major, minor);
        return ProtocolVersion.__wrap(ret);
    }
}
module.exports.ProtocolVersion = ProtocolVersion;
/**
* ED25519 key used as public key
*/
class PublicKey {

    static __wrap(ptr) {
        const obj = Object.create(PublicKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_publickey_free(ptr);
    }
    /**
    * Get public key from its bech32 representation
    * Example:
    * ```javascript
    * const pkey = PublicKey.from_bech32(&#39;ed25519_pk1dgaagyh470y66p899txcl3r0jaeaxu6yd7z2dxyk55qcycdml8gszkxze2&#39;);
    * ```
    * @param {string} bech32_str
    * @returns {PublicKey}
    */
    static from_bech32(bech32_str) {
        var ptr0 = passStringToWasm0(bech32_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.publickey_from_bech32(ptr0, len0);
        return PublicKey.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_bech32() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.publickey_to_bech32(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Uint8Array}
    */
    as_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.publickey_as_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {PublicKey}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.publickey_from_bytes(ptr0, len0);
        return PublicKey.__wrap(ret);
    }
    /**
    * @param {Uint8Array} data
    * @param {Ed25519Signature} signature
    * @returns {boolean}
    */
    verify(data, signature) {
        var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        _assertClass(signature, Ed25519Signature);
        var ret = wasm.publickey_verify(this.ptr, ptr0, len0, signature.ptr);
        return ret !== 0;
    }
    /**
    * @returns {Ed25519KeyHash}
    */
    hash() {
        var ret = wasm.publickey_hash(this.ptr);
        return Ed25519KeyHash.__wrap(ret);
    }
}
module.exports.PublicKey = PublicKey;
/**
*/
class PublicKeys {

    static __wrap(ptr) {
        const obj = Object.create(PublicKeys.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_publickeys_free(ptr);
    }
    /**
    */
    constructor() {
        var ret = wasm.publickeys_new();
        return PublicKeys.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    size() {
        var ret = wasm.publickeys_size(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {PublicKey}
    */
    get(index) {
        var ret = wasm.publickeys_get(this.ptr, index);
        return PublicKey.__wrap(ret);
    }
    /**
    * @param {PublicKey} key
    */
    add(key) {
        _assertClass(key, PublicKey);
        wasm.publickeys_add(this.ptr, key.ptr);
    }
}
module.exports.PublicKeys = PublicKeys;
/**
*/
class Redeemer {

    static __wrap(ptr) {
        const obj = Object.create(Redeemer.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_redeemer_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.redeemer_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Redeemer}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.redeemer_from_bytes(ptr0, len0);
        return Redeemer.__wrap(ret);
    }
    /**
    * @returns {RedeemerTag}
    */
    tag() {
        var ret = wasm.redeemer_tag(this.ptr);
        return RedeemerTag.__wrap(ret);
    }
    /**
    * @returns {BigNum}
    */
    index() {
        var ret = wasm.redeemer_index(this.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @returns {PlutusData}
    */
    data() {
        var ret = wasm.redeemer_data(this.ptr);
        return PlutusData.__wrap(ret);
    }
    /**
    * @returns {ExUnits}
    */
    ex_units() {
        var ret = wasm.redeemer_ex_units(this.ptr);
        return ExUnits.__wrap(ret);
    }
    /**
    * @param {RedeemerTag} tag
    * @param {BigNum} index
    * @param {PlutusData} data
    * @param {ExUnits} ex_units
    * @returns {Redeemer}
    */
    static new(tag, index, data, ex_units) {
        _assertClass(tag, RedeemerTag);
        _assertClass(index, BigNum);
        _assertClass(data, PlutusData);
        _assertClass(ex_units, ExUnits);
        var ret = wasm.redeemer_new(tag.ptr, index.ptr, data.ptr, ex_units.ptr);
        return Redeemer.__wrap(ret);
    }
}
module.exports.Redeemer = Redeemer;
/**
*/
class RedeemerTag {

    static __wrap(ptr) {
        const obj = Object.create(RedeemerTag.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_redeemertag_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.redeemertag_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {RedeemerTag}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.redeemertag_from_bytes(ptr0, len0);
        return RedeemerTag.__wrap(ret);
    }
    /**
    * @returns {RedeemerTag}
    */
    static new_spend() {
        var ret = wasm.redeemertag_new_spend();
        return RedeemerTag.__wrap(ret);
    }
    /**
    * @returns {RedeemerTag}
    */
    static new_mint() {
        var ret = wasm.redeemertag_new_mint();
        return RedeemerTag.__wrap(ret);
    }
    /**
    * @returns {RedeemerTag}
    */
    static new_cert() {
        var ret = wasm.redeemertag_new_cert();
        return RedeemerTag.__wrap(ret);
    }
    /**
    * @returns {RedeemerTag}
    */
    static new_reward() {
        var ret = wasm.redeemertag_new_reward();
        return RedeemerTag.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    kind() {
        var ret = wasm.redeemertag_kind(this.ptr);
        return ret >>> 0;
    }
}
module.exports.RedeemerTag = RedeemerTag;
/**
*/
class RedeemerWitnessKey {

    static __wrap(ptr) {
        const obj = Object.create(RedeemerWitnessKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_redeemerwitnesskey_free(ptr);
    }
    /**
    * @returns {RedeemerTag}
    */
    tag() {
        var ret = wasm.redeemerwitnesskey_tag(this.ptr);
        return RedeemerTag.__wrap(ret);
    }
    /**
    * @returns {BigNum}
    */
    index() {
        var ret = wasm.redeemerwitnesskey_index(this.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @param {RedeemerTag} tag
    * @param {BigNum} index
    * @returns {RedeemerWitnessKey}
    */
    static new(tag, index) {
        _assertClass(tag, RedeemerTag);
        _assertClass(index, BigNum);
        var ret = wasm.redeemerwitnesskey_new(tag.ptr, index.ptr);
        return RedeemerWitnessKey.__wrap(ret);
    }
}
module.exports.RedeemerWitnessKey = RedeemerWitnessKey;
/**
*/
class Redeemers {

    static __wrap(ptr) {
        const obj = Object.create(Redeemers.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_redeemers_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.redeemers_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Redeemers}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.redeemers_from_bytes(ptr0, len0);
        return Redeemers.__wrap(ret);
    }
    /**
    * @returns {Redeemers}
    */
    static new() {
        var ret = wasm.redeemers_new();
        return Redeemers.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.redeemers_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {Redeemer}
    */
    get(index) {
        var ret = wasm.redeemers_get(this.ptr, index);
        return Redeemer.__wrap(ret);
    }
    /**
    * @param {Redeemer} elem
    */
    add(elem) {
        _assertClass(elem, Redeemer);
        wasm.redeemers_add(this.ptr, elem.ptr);
    }
}
module.exports.Redeemers = Redeemers;
/**
*/
class Relay {

    static __wrap(ptr) {
        const obj = Object.create(Relay.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_relay_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.relay_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Relay}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.relay_from_bytes(ptr0, len0);
        return Relay.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.relay_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.relay_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {Relay}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.relay_from_json(ptr0, len0);
        return Relay.__wrap(ret);
    }
    /**
    * @param {SingleHostAddr} single_host_addr
    * @returns {Relay}
    */
    static new_single_host_addr(single_host_addr) {
        _assertClass(single_host_addr, SingleHostAddr);
        var ret = wasm.relay_new_single_host_addr(single_host_addr.ptr);
        return Relay.__wrap(ret);
    }
    /**
    * @param {SingleHostName} single_host_name
    * @returns {Relay}
    */
    static new_single_host_name(single_host_name) {
        _assertClass(single_host_name, SingleHostName);
        var ret = wasm.relay_new_single_host_name(single_host_name.ptr);
        return Relay.__wrap(ret);
    }
    /**
    * @param {MultiHostName} multi_host_name
    * @returns {Relay}
    */
    static new_multi_host_name(multi_host_name) {
        _assertClass(multi_host_name, MultiHostName);
        var ret = wasm.relay_new_multi_host_name(multi_host_name.ptr);
        return Relay.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    kind() {
        var ret = wasm.relay_kind(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {SingleHostAddr | undefined}
    */
    as_single_host_addr() {
        var ret = wasm.relay_as_single_host_addr(this.ptr);
        return ret === 0 ? undefined : SingleHostAddr.__wrap(ret);
    }
    /**
    * @returns {SingleHostName | undefined}
    */
    as_single_host_name() {
        var ret = wasm.relay_as_single_host_name(this.ptr);
        return ret === 0 ? undefined : SingleHostName.__wrap(ret);
    }
    /**
    * @returns {MultiHostName | undefined}
    */
    as_multi_host_name() {
        var ret = wasm.relay_as_multi_host_name(this.ptr);
        return ret === 0 ? undefined : MultiHostName.__wrap(ret);
    }
}
module.exports.Relay = Relay;
/**
*/
class Relays {

    static __wrap(ptr) {
        const obj = Object.create(Relays.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_relays_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.relays_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Relays}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.relays_from_bytes(ptr0, len0);
        return Relays.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.relays_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.relays_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {Relays}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.relays_from_json(ptr0, len0);
        return Relays.__wrap(ret);
    }
    /**
    * @returns {Relays}
    */
    static new() {
        var ret = wasm.relays_new();
        return Relays.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.relays_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {Relay}
    */
    get(index) {
        var ret = wasm.relays_get(this.ptr, index);
        return Relay.__wrap(ret);
    }
    /**
    * @param {Relay} elem
    */
    add(elem) {
        _assertClass(elem, Relay);
        wasm.relays_add(this.ptr, elem.ptr);
    }
}
module.exports.Relays = Relays;
/**
*/
class RequiredWitnessSet {

    static __wrap(ptr) {
        const obj = Object.create(RequiredWitnessSet.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_requiredwitnessset_free(ptr);
    }
    /**
    * @param {Vkeywitness} vkey
    */
    add_vkey(vkey) {
        _assertClass(vkey, Vkeywitness);
        wasm.requiredwitnessset_add_vkey(this.ptr, vkey.ptr);
    }
    /**
    * @param {Vkey} vkey
    */
    add_vkey_key(vkey) {
        _assertClass(vkey, Vkey);
        wasm.requiredwitnessset_add_vkey_key(this.ptr, vkey.ptr);
    }
    /**
    * @param {Ed25519KeyHash} hash
    */
    add_vkey_key_hash(hash) {
        _assertClass(hash, Ed25519KeyHash);
        wasm.requiredwitnessset_add_vkey_key_hash(this.ptr, hash.ptr);
    }
    /**
    * @param {BootstrapWitness} bootstrap
    */
    add_bootstrap(bootstrap) {
        _assertClass(bootstrap, BootstrapWitness);
        wasm.requiredwitnessset_add_bootstrap(this.ptr, bootstrap.ptr);
    }
    /**
    * @param {Vkey} bootstrap
    */
    add_bootstrap_key(bootstrap) {
        _assertClass(bootstrap, Vkey);
        wasm.requiredwitnessset_add_bootstrap_key(this.ptr, bootstrap.ptr);
    }
    /**
    * @param {Ed25519KeyHash} hash
    */
    add_bootstrap_key_hash(hash) {
        _assertClass(hash, Ed25519KeyHash);
        wasm.requiredwitnessset_add_bootstrap_key_hash(this.ptr, hash.ptr);
    }
    /**
    * @param {NativeScript} native_script
    */
    add_native_script(native_script) {
        _assertClass(native_script, NativeScript);
        wasm.requiredwitnessset_add_native_script(this.ptr, native_script.ptr);
    }
    /**
    * @param {ScriptHash} native_script
    */
    add_native_script_hash(native_script) {
        _assertClass(native_script, ScriptHash);
        wasm.requiredwitnessset_add_native_script_hash(this.ptr, native_script.ptr);
    }
    /**
    * @param {PlutusScript} plutus_script
    */
    add_plutus_script(plutus_script) {
        _assertClass(plutus_script, PlutusScript);
        wasm.requiredwitnessset_add_plutus_script(this.ptr, plutus_script.ptr);
    }
    /**
    * @param {PlutusScript} plutus_script
    */
    add_plutus_v2_script(plutus_script) {
        _assertClass(plutus_script, PlutusScript);
        wasm.requiredwitnessset_add_plutus_v2_script(this.ptr, plutus_script.ptr);
    }
    /**
    * @param {ScriptHash} plutus_script
    */
    add_plutus_hash(plutus_script) {
        _assertClass(plutus_script, ScriptHash);
        wasm.requiredwitnessset_add_plutus_hash(this.ptr, plutus_script.ptr);
    }
    /**
    * @param {PlutusData} plutus_datum
    */
    add_plutus_datum(plutus_datum) {
        _assertClass(plutus_datum, PlutusData);
        wasm.requiredwitnessset_add_plutus_datum(this.ptr, plutus_datum.ptr);
    }
    /**
    * @param {DataHash} plutus_datum
    */
    add_plutus_datum_hash(plutus_datum) {
        _assertClass(plutus_datum, DataHash);
        wasm.requiredwitnessset_add_plutus_datum_hash(this.ptr, plutus_datum.ptr);
    }
    /**
    * @param {Redeemer} redeemer
    */
    add_redeemer(redeemer) {
        _assertClass(redeemer, Redeemer);
        wasm.requiredwitnessset_add_redeemer(this.ptr, redeemer.ptr);
    }
    /**
    * @param {RedeemerWitnessKey} redeemer
    */
    add_redeemer_tag(redeemer) {
        _assertClass(redeemer, RedeemerWitnessKey);
        wasm.requiredwitnessset_add_redeemer_tag(this.ptr, redeemer.ptr);
    }
    /**
    * @param {RequiredWitnessSet} requirements
    */
    add_all(requirements) {
        _assertClass(requirements, RequiredWitnessSet);
        wasm.requiredwitnessset_add_all(this.ptr, requirements.ptr);
    }
    /**
    * @returns {RequiredWitnessSet}
    */
    static new() {
        var ret = wasm.requiredwitnessset_new();
        return RequiredWitnessSet.__wrap(ret);
    }
}
module.exports.RequiredWitnessSet = RequiredWitnessSet;
/**
*/
class RewardAddress {

    static __wrap(ptr) {
        const obj = Object.create(RewardAddress.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rewardaddress_free(ptr);
    }
    /**
    * @param {number} network
    * @param {StakeCredential} payment
    * @returns {RewardAddress}
    */
    static new(network, payment) {
        _assertClass(payment, StakeCredential);
        var ret = wasm.rewardaddress_new(network, payment.ptr);
        return RewardAddress.__wrap(ret);
    }
    /**
    * @returns {StakeCredential}
    */
    payment_cred() {
        var ret = wasm.rewardaddress_payment_cred(this.ptr);
        return StakeCredential.__wrap(ret);
    }
    /**
    * @returns {Address}
    */
    to_address() {
        var ret = wasm.rewardaddress_to_address(this.ptr);
        return Address.__wrap(ret);
    }
    /**
    * @param {Address} addr
    * @returns {RewardAddress | undefined}
    */
    static from_address(addr) {
        _assertClass(addr, Address);
        var ret = wasm.rewardaddress_from_address(addr.ptr);
        return ret === 0 ? undefined : RewardAddress.__wrap(ret);
    }
}
module.exports.RewardAddress = RewardAddress;
/**
*/
class RewardAddresses {

    static __wrap(ptr) {
        const obj = Object.create(RewardAddresses.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rewardaddresses_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rewardaddresses_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {RewardAddresses}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.rewardaddresses_from_bytes(ptr0, len0);
        return RewardAddresses.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.rewardaddresses_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.rewardaddresses_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {RewardAddresses}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.rewardaddresses_from_json(ptr0, len0);
        return RewardAddresses.__wrap(ret);
    }
    /**
    * @returns {RewardAddresses}
    */
    static new() {
        var ret = wasm.rewardaddresses_new();
        return RewardAddresses.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.rewardaddresses_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {RewardAddress}
    */
    get(index) {
        var ret = wasm.rewardaddresses_get(this.ptr, index);
        return RewardAddress.__wrap(ret);
    }
    /**
    * @param {RewardAddress} elem
    */
    add(elem) {
        _assertClass(elem, RewardAddress);
        wasm.rewardaddresses_add(this.ptr, elem.ptr);
    }
}
module.exports.RewardAddresses = RewardAddresses;
/**
*/
class Script {

    static __wrap(ptr) {
        const obj = Object.create(Script.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_script_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.script_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Script}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.script_from_bytes(ptr0, len0);
        return Script.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.script_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.script_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {Script}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.script_from_json(ptr0, len0);
        return Script.__wrap(ret);
    }
    /**
    * @param {NativeScript} native_script
    * @returns {Script}
    */
    static new_native(native_script) {
        _assertClass(native_script, NativeScript);
        var ret = wasm.script_new_native(native_script.ptr);
        return Script.__wrap(ret);
    }
    /**
    * @param {PlutusScript} plutus_script
    * @returns {Script}
    */
    static new_plutus_v1(plutus_script) {
        _assertClass(plutus_script, PlutusScript);
        var ret = wasm.script_new_plutus_v1(plutus_script.ptr);
        return Script.__wrap(ret);
    }
    /**
    * @param {PlutusScript} plutus_script
    * @returns {Script}
    */
    static new_plutus_v2(plutus_script) {
        _assertClass(plutus_script, PlutusScript);
        var ret = wasm.script_new_plutus_v2(plutus_script.ptr);
        return Script.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    kind() {
        var ret = wasm.script_kind(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {NativeScript | undefined}
    */
    as_native() {
        var ret = wasm.script_as_native(this.ptr);
        return ret === 0 ? undefined : NativeScript.__wrap(ret);
    }
    /**
    * @returns {PlutusScript | undefined}
    */
    as_plutus_v1() {
        var ret = wasm.script_as_plutus_v1(this.ptr);
        return ret === 0 ? undefined : PlutusScript.__wrap(ret);
    }
    /**
    * @returns {PlutusScript | undefined}
    */
    as_plutus_v2() {
        var ret = wasm.script_as_plutus_v2(this.ptr);
        return ret === 0 ? undefined : PlutusScript.__wrap(ret);
    }
}
module.exports.Script = Script;
/**
*/
class ScriptAll {

    static __wrap(ptr) {
        const obj = Object.create(ScriptAll.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_scriptall_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scriptall_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {ScriptAll}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.scriptall_from_bytes(ptr0, len0);
        return ScriptAll.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scriptall_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.scriptall_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {ScriptAll}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.scriptall_from_json(ptr0, len0);
        return ScriptAll.__wrap(ret);
    }
    /**
    * @returns {NativeScripts}
    */
    native_scripts() {
        var ret = wasm.scriptall_native_scripts(this.ptr);
        return NativeScripts.__wrap(ret);
    }
    /**
    * @param {NativeScripts} native_scripts
    * @returns {ScriptAll}
    */
    static new(native_scripts) {
        _assertClass(native_scripts, NativeScripts);
        var ret = wasm.scriptall_new(native_scripts.ptr);
        return ScriptAll.__wrap(ret);
    }
}
module.exports.ScriptAll = ScriptAll;
/**
*/
class ScriptAny {

    static __wrap(ptr) {
        const obj = Object.create(ScriptAny.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_scriptany_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scriptany_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {ScriptAny}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.scriptany_from_bytes(ptr0, len0);
        return ScriptAny.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scriptany_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.scriptany_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {ScriptAny}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.scriptany_from_json(ptr0, len0);
        return ScriptAny.__wrap(ret);
    }
    /**
    * @returns {NativeScripts}
    */
    native_scripts() {
        var ret = wasm.scriptany_native_scripts(this.ptr);
        return NativeScripts.__wrap(ret);
    }
    /**
    * @param {NativeScripts} native_scripts
    * @returns {ScriptAny}
    */
    static new(native_scripts) {
        _assertClass(native_scripts, NativeScripts);
        var ret = wasm.scriptany_new(native_scripts.ptr);
        return ScriptAny.__wrap(ret);
    }
}
module.exports.ScriptAny = ScriptAny;
/**
*/
class ScriptDataHash {

    static __wrap(ptr) {
        const obj = Object.create(ScriptDataHash.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_scriptdatahash_free(ptr);
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {ScriptDataHash}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.scriptdatahash_from_bytes(ptr0, len0);
        return ScriptDataHash.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scriptdatahash_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} prefix
    * @returns {string}
    */
    to_bech32(prefix) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(prefix, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.scriptdatahash_to_bech32(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} bech_str
    * @returns {ScriptDataHash}
    */
    static from_bech32(bech_str) {
        var ptr0 = passStringToWasm0(bech_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.scriptdatahash_from_bech32(ptr0, len0);
        return ScriptDataHash.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_hex() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scriptdatahash_to_hex(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} hex
    * @returns {ScriptDataHash}
    */
    static from_hex(hex) {
        var ptr0 = passStringToWasm0(hex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.scriptdatahash_from_hex(ptr0, len0);
        return ScriptDataHash.__wrap(ret);
    }
}
module.exports.ScriptDataHash = ScriptDataHash;
/**
*/
class ScriptHash {

    static __wrap(ptr) {
        const obj = Object.create(ScriptHash.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_scripthash_free(ptr);
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {ScriptHash}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.scripthash_from_bytes(ptr0, len0);
        return ScriptHash.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scripthash_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} prefix
    * @returns {string}
    */
    to_bech32(prefix) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(prefix, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.scripthash_to_bech32(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} bech_str
    * @returns {ScriptHash}
    */
    static from_bech32(bech_str) {
        var ptr0 = passStringToWasm0(bech_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.scripthash_from_bech32(ptr0, len0);
        return ScriptHash.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_hex() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scripthash_to_hex(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} hex
    * @returns {ScriptHash}
    */
    static from_hex(hex) {
        var ptr0 = passStringToWasm0(hex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.scripthash_from_hex(ptr0, len0);
        return ScriptHash.__wrap(ret);
    }
}
module.exports.ScriptHash = ScriptHash;
/**
*/
class ScriptHashes {

    static __wrap(ptr) {
        const obj = Object.create(ScriptHashes.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_scripthashes_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scripthashes_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {ScriptHashes}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.scripthashes_from_bytes(ptr0, len0);
        return ScriptHashes.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scripthashes_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.scripthashes_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {ScriptHashes}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.scripthashes_from_json(ptr0, len0);
        return ScriptHashes.__wrap(ret);
    }
    /**
    * @returns {ScriptHashes}
    */
    static new() {
        var ret = wasm.scripthashes_new();
        return ScriptHashes.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.scripthashes_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {ScriptHash}
    */
    get(index) {
        var ret = wasm.scripthashes_get(this.ptr, index);
        return ScriptHash.__wrap(ret);
    }
    /**
    * @param {ScriptHash} elem
    */
    add(elem) {
        _assertClass(elem, ScriptHash);
        wasm.scripthashes_add(this.ptr, elem.ptr);
    }
}
module.exports.ScriptHashes = ScriptHashes;
/**
*/
class ScriptNOfK {

    static __wrap(ptr) {
        const obj = Object.create(ScriptNOfK.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_scriptnofk_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scriptnofk_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {ScriptNOfK}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.scriptnofk_from_bytes(ptr0, len0);
        return ScriptNOfK.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scriptnofk_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.scriptnofk_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {ScriptNOfK}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.scriptnofk_from_json(ptr0, len0);
        return ScriptNOfK.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    n() {
        var ret = wasm.scriptnofk_n(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {NativeScripts}
    */
    native_scripts() {
        var ret = wasm.scriptnofk_native_scripts(this.ptr);
        return NativeScripts.__wrap(ret);
    }
    /**
    * @param {number} n
    * @param {NativeScripts} native_scripts
    * @returns {ScriptNOfK}
    */
    static new(n, native_scripts) {
        _assertClass(native_scripts, NativeScripts);
        var ret = wasm.scriptnofk_new(n, native_scripts.ptr);
        return ScriptNOfK.__wrap(ret);
    }
}
module.exports.ScriptNOfK = ScriptNOfK;
/**
*/
class ScriptPubkey {

    static __wrap(ptr) {
        const obj = Object.create(ScriptPubkey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_scriptpubkey_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scriptpubkey_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {ScriptPubkey}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.scriptpubkey_from_bytes(ptr0, len0);
        return ScriptPubkey.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scriptpubkey_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.scriptpubkey_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {ScriptPubkey}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.scriptpubkey_from_json(ptr0, len0);
        return ScriptPubkey.__wrap(ret);
    }
    /**
    * @returns {Ed25519KeyHash}
    */
    addr_keyhash() {
        var ret = wasm.scriptpubkey_addr_keyhash(this.ptr);
        return Ed25519KeyHash.__wrap(ret);
    }
    /**
    * @param {Ed25519KeyHash} addr_keyhash
    * @returns {ScriptPubkey}
    */
    static new(addr_keyhash) {
        _assertClass(addr_keyhash, Ed25519KeyHash);
        var ret = wasm.scriptpubkey_new(addr_keyhash.ptr);
        return ScriptPubkey.__wrap(ret);
    }
}
module.exports.ScriptPubkey = ScriptPubkey;
/**
*/
class ScriptRef {

    static __wrap(ptr) {
        const obj = Object.create(ScriptRef.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_scriptref_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scriptref_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {ScriptRef}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.scriptref_from_bytes(ptr0, len0);
        return ScriptRef.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scriptref_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.scriptref_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {ScriptRef}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.scriptref_from_json(ptr0, len0);
        return ScriptRef.__wrap(ret);
    }
    /**
    * @param {Script} script
    * @returns {ScriptRef}
    */
    static new(script) {
        _assertClass(script, Script);
        var ret = wasm.scriptref_new(script.ptr);
        return ScriptRef.__wrap(ret);
    }
    /**
    * @returns {Script}
    */
    get() {
        var ret = wasm.scriptref_get(this.ptr);
        return Script.__wrap(ret);
    }
}
module.exports.ScriptRef = ScriptRef;
/**
*/
class ScriptWitness {

    static __wrap(ptr) {
        const obj = Object.create(ScriptWitness.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_scriptwitness_free(ptr);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.scriptwitness_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.scriptwitness_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {ScriptWitness}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.scriptwitness_from_json(ptr0, len0);
        return ScriptWitness.__wrap(ret);
    }
    /**
    * @param {NativeScript} native_script
    * @returns {ScriptWitness}
    */
    static new_native_witness(native_script) {
        _assertClass(native_script, NativeScript);
        var ret = wasm.scriptwitness_new_native_witness(native_script.ptr);
        return ScriptWitness.__wrap(ret);
    }
    /**
    * @param {PlutusWitness} plutus_witness
    * @returns {ScriptWitness}
    */
    static new_plutus_witness(plutus_witness) {
        _assertClass(plutus_witness, PlutusWitness);
        var ret = wasm.scriptwitness_new_plutus_witness(plutus_witness.ptr);
        return ScriptWitness.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    kind() {
        var ret = wasm.scriptwitness_kind(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {NativeScript | undefined}
    */
    as_native_witness() {
        var ret = wasm.scriptwitness_as_native_witness(this.ptr);
        return ret === 0 ? undefined : NativeScript.__wrap(ret);
    }
    /**
    * @returns {PlutusWitness | undefined}
    */
    as_plutus_witness() {
        var ret = wasm.scriptwitness_as_plutus_witness(this.ptr);
        return ret === 0 ? undefined : PlutusWitness.__wrap(ret);
    }
}
module.exports.ScriptWitness = ScriptWitness;
/**
*/
class SingleHostAddr {

    static __wrap(ptr) {
        const obj = Object.create(SingleHostAddr.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_singlehostaddr_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.singlehostaddr_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {SingleHostAddr}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.singlehostaddr_from_bytes(ptr0, len0);
        return SingleHostAddr.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.singlehostaddr_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.singlehostaddr_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {SingleHostAddr}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.singlehostaddr_from_json(ptr0, len0);
        return SingleHostAddr.__wrap(ret);
    }
    /**
    * @returns {number | undefined}
    */
    port() {
        var ret = wasm.singlehostaddr_port(this.ptr);
        return ret === 0xFFFFFF ? undefined : ret;
    }
    /**
    * @returns {Ipv4 | undefined}
    */
    ipv4() {
        var ret = wasm.singlehostaddr_ipv4(this.ptr);
        return ret === 0 ? undefined : Ipv4.__wrap(ret);
    }
    /**
    * @returns {Ipv6 | undefined}
    */
    ipv6() {
        var ret = wasm.singlehostaddr_ipv6(this.ptr);
        return ret === 0 ? undefined : Ipv6.__wrap(ret);
    }
    /**
    * @param {number | undefined} port
    * @param {Ipv4 | undefined} ipv4
    * @param {Ipv6 | undefined} ipv6
    * @returns {SingleHostAddr}
    */
    static new(port, ipv4, ipv6) {
        let ptr0 = 0;
        if (!isLikeNone(ipv4)) {
            _assertClass(ipv4, Ipv4);
            ptr0 = ipv4.ptr;
            ipv4.ptr = 0;
        }
        let ptr1 = 0;
        if (!isLikeNone(ipv6)) {
            _assertClass(ipv6, Ipv6);
            ptr1 = ipv6.ptr;
            ipv6.ptr = 0;
        }
        var ret = wasm.singlehostaddr_new(isLikeNone(port) ? 0xFFFFFF : port, ptr0, ptr1);
        return SingleHostAddr.__wrap(ret);
    }
}
module.exports.SingleHostAddr = SingleHostAddr;
/**
*/
class SingleHostName {

    static __wrap(ptr) {
        const obj = Object.create(SingleHostName.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_singlehostname_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.singlehostname_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {SingleHostName}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.singlehostname_from_bytes(ptr0, len0);
        return SingleHostName.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.singlehostname_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.singlehostname_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {SingleHostName}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.singlehostname_from_json(ptr0, len0);
        return SingleHostName.__wrap(ret);
    }
    /**
    * @returns {number | undefined}
    */
    port() {
        var ret = wasm.singlehostname_port(this.ptr);
        return ret === 0xFFFFFF ? undefined : ret;
    }
    /**
    * @returns {DNSRecordAorAAAA}
    */
    dns_name() {
        var ret = wasm.singlehostname_dns_name(this.ptr);
        return DNSRecordAorAAAA.__wrap(ret);
    }
    /**
    * @param {number | undefined} port
    * @param {DNSRecordAorAAAA} dns_name
    * @returns {SingleHostName}
    */
    static new(port, dns_name) {
        _assertClass(dns_name, DNSRecordAorAAAA);
        var ret = wasm.singlehostname_new(isLikeNone(port) ? 0xFFFFFF : port, dns_name.ptr);
        return SingleHostName.__wrap(ret);
    }
}
module.exports.SingleHostName = SingleHostName;
/**
*/
class StakeCredential {

    static __wrap(ptr) {
        const obj = Object.create(StakeCredential.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_stakecredential_free(ptr);
    }
    /**
    * @param {Ed25519KeyHash} hash
    * @returns {StakeCredential}
    */
    static from_keyhash(hash) {
        _assertClass(hash, Ed25519KeyHash);
        var ret = wasm.stakecredential_from_keyhash(hash.ptr);
        return StakeCredential.__wrap(ret);
    }
    /**
    * @param {ScriptHash} hash
    * @returns {StakeCredential}
    */
    static from_scripthash(hash) {
        _assertClass(hash, ScriptHash);
        var ret = wasm.stakecredential_from_scripthash(hash.ptr);
        return StakeCredential.__wrap(ret);
    }
    /**
    * @returns {Ed25519KeyHash | undefined}
    */
    to_keyhash() {
        var ret = wasm.stakecredential_to_keyhash(this.ptr);
        return ret === 0 ? undefined : Ed25519KeyHash.__wrap(ret);
    }
    /**
    * @returns {ScriptHash | undefined}
    */
    to_scripthash() {
        var ret = wasm.stakecredential_to_scripthash(this.ptr);
        return ret === 0 ? undefined : ScriptHash.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    kind() {
        var ret = wasm.stakecredential_kind(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.stakecredential_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {StakeCredential}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.stakecredential_from_bytes(ptr0, len0);
        return StakeCredential.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.stakecredential_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.stakecredential_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {StakeCredential}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.stakecredential_from_json(ptr0, len0);
        return StakeCredential.__wrap(ret);
    }
}
module.exports.StakeCredential = StakeCredential;
/**
*/
class StakeCredentials {

    static __wrap(ptr) {
        const obj = Object.create(StakeCredentials.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_stakecredentials_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.stakecredentials_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {StakeCredentials}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.stakecredentials_from_bytes(ptr0, len0);
        return StakeCredentials.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.stakecredentials_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.stakecredentials_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {StakeCredentials}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.stakecredentials_from_json(ptr0, len0);
        return StakeCredentials.__wrap(ret);
    }
    /**
    * @returns {StakeCredentials}
    */
    static new() {
        var ret = wasm.stakecredentials_new();
        return StakeCredentials.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.stakecredentials_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {StakeCredential}
    */
    get(index) {
        var ret = wasm.stakecredentials_get(this.ptr, index);
        return StakeCredential.__wrap(ret);
    }
    /**
    * @param {StakeCredential} elem
    */
    add(elem) {
        _assertClass(elem, StakeCredential);
        wasm.stakecredentials_add(this.ptr, elem.ptr);
    }
}
module.exports.StakeCredentials = StakeCredentials;
/**
*/
class StakeDelegation {

    static __wrap(ptr) {
        const obj = Object.create(StakeDelegation.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_stakedelegation_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.stakedelegation_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {StakeDelegation}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.stakedelegation_from_bytes(ptr0, len0);
        return StakeDelegation.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.stakedelegation_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.stakedelegation_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {StakeDelegation}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.stakedelegation_from_json(ptr0, len0);
        return StakeDelegation.__wrap(ret);
    }
    /**
    * @returns {StakeCredential}
    */
    stake_credential() {
        var ret = wasm.stakedelegation_stake_credential(this.ptr);
        return StakeCredential.__wrap(ret);
    }
    /**
    * @returns {Ed25519KeyHash}
    */
    pool_keyhash() {
        var ret = wasm.stakedelegation_pool_keyhash(this.ptr);
        return Ed25519KeyHash.__wrap(ret);
    }
    /**
    * @param {StakeCredential} stake_credential
    * @param {Ed25519KeyHash} pool_keyhash
    * @returns {StakeDelegation}
    */
    static new(stake_credential, pool_keyhash) {
        _assertClass(stake_credential, StakeCredential);
        _assertClass(pool_keyhash, Ed25519KeyHash);
        var ret = wasm.stakedelegation_new(stake_credential.ptr, pool_keyhash.ptr);
        return StakeDelegation.__wrap(ret);
    }
}
module.exports.StakeDelegation = StakeDelegation;
/**
*/
class StakeDeregistration {

    static __wrap(ptr) {
        const obj = Object.create(StakeDeregistration.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_stakederegistration_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.stakederegistration_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {StakeDeregistration}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.stakederegistration_from_bytes(ptr0, len0);
        return StakeDeregistration.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.stakederegistration_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.stakederegistration_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {StakeDeregistration}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.stakederegistration_from_json(ptr0, len0);
        return StakeDeregistration.__wrap(ret);
    }
    /**
    * @returns {StakeCredential}
    */
    stake_credential() {
        var ret = wasm.stakederegistration_stake_credential(this.ptr);
        return StakeCredential.__wrap(ret);
    }
    /**
    * @param {StakeCredential} stake_credential
    * @returns {StakeDeregistration}
    */
    static new(stake_credential) {
        _assertClass(stake_credential, StakeCredential);
        var ret = wasm.stakederegistration_new(stake_credential.ptr);
        return StakeDeregistration.__wrap(ret);
    }
}
module.exports.StakeDeregistration = StakeDeregistration;
/**
*/
class StakeRegistration {

    static __wrap(ptr) {
        const obj = Object.create(StakeRegistration.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_stakeregistration_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.stakeregistration_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {StakeRegistration}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.stakeregistration_from_bytes(ptr0, len0);
        return StakeRegistration.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.stakeregistration_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.stakeregistration_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {StakeRegistration}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.stakeregistration_from_json(ptr0, len0);
        return StakeRegistration.__wrap(ret);
    }
    /**
    * @returns {StakeCredential}
    */
    stake_credential() {
        var ret = wasm.stakeregistration_stake_credential(this.ptr);
        return StakeCredential.__wrap(ret);
    }
    /**
    * @param {StakeCredential} stake_credential
    * @returns {StakeRegistration}
    */
    static new(stake_credential) {
        _assertClass(stake_credential, StakeCredential);
        var ret = wasm.stakeregistration_new(stake_credential.ptr);
        return StakeRegistration.__wrap(ret);
    }
}
module.exports.StakeRegistration = StakeRegistration;
/**
*/
class Strings {

    static __wrap(ptr) {
        const obj = Object.create(Strings.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_strings_free(ptr);
    }
    /**
    * @returns {Strings}
    */
    static new() {
        var ret = wasm.strings_new();
        return Strings.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.strings_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {string}
    */
    get(index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.strings_get(retptr, this.ptr, index);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} elem
    */
    add(elem) {
        var ptr0 = passStringToWasm0(elem, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.strings_add(this.ptr, ptr0, len0);
    }
}
module.exports.Strings = Strings;
/**
*/
class TimelockExpiry {

    static __wrap(ptr) {
        const obj = Object.create(TimelockExpiry.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_timelockexpiry_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.timelockexpiry_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {TimelockExpiry}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.timelockexpiry_from_bytes(ptr0, len0);
        return TimelockExpiry.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.timelockexpiry_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.timelockexpiry_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {TimelockExpiry}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.timelockexpiry_from_json(ptr0, len0);
        return TimelockExpiry.__wrap(ret);
    }
    /**
    * @returns {BigNum}
    */
    slot() {
        var ret = wasm.timelockexpiry_slot(this.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @param {BigNum} slot
    * @returns {TimelockExpiry}
    */
    static new(slot) {
        _assertClass(slot, BigNum);
        var ret = wasm.timelockexpiry_new(slot.ptr);
        return TimelockExpiry.__wrap(ret);
    }
}
module.exports.TimelockExpiry = TimelockExpiry;
/**
*/
class TimelockStart {

    static __wrap(ptr) {
        const obj = Object.create(TimelockStart.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_timelockstart_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.timelockstart_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {TimelockStart}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.timelockstart_from_bytes(ptr0, len0);
        return TimelockStart.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.timelockstart_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.timelockstart_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {TimelockStart}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.timelockstart_from_json(ptr0, len0);
        return TimelockStart.__wrap(ret);
    }
    /**
    * @returns {BigNum}
    */
    slot() {
        var ret = wasm.timelockstart_slot(this.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @param {BigNum} slot
    * @returns {TimelockStart}
    */
    static new(slot) {
        _assertClass(slot, BigNum);
        var ret = wasm.timelockstart_new(slot.ptr);
        return TimelockStart.__wrap(ret);
    }
}
module.exports.TimelockStart = TimelockStart;
/**
*/
class Transaction {

    static __wrap(ptr) {
        const obj = Object.create(Transaction.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transaction_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transaction_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Transaction}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transaction_from_bytes(ptr0, len0);
        return Transaction.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transaction_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.transaction_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {Transaction}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transaction_from_json(ptr0, len0);
        return Transaction.__wrap(ret);
    }
    /**
    * @returns {TransactionBody}
    */
    body() {
        var ret = wasm.transaction_body(this.ptr);
        return TransactionBody.__wrap(ret);
    }
    /**
    * @returns {TransactionWitnessSet}
    */
    witness_set() {
        var ret = wasm.transaction_witness_set(this.ptr);
        return TransactionWitnessSet.__wrap(ret);
    }
    /**
    * @returns {boolean}
    */
    is_valid() {
        var ret = wasm.transaction_is_valid(this.ptr);
        return ret !== 0;
    }
    /**
    * @returns {AuxiliaryData | undefined}
    */
    auxiliary_data() {
        var ret = wasm.transaction_auxiliary_data(this.ptr);
        return ret === 0 ? undefined : AuxiliaryData.__wrap(ret);
    }
    /**
    * @param {boolean} valid
    */
    set_is_valid(valid) {
        wasm.transaction_set_is_valid(this.ptr, valid);
    }
    /**
    * @param {TransactionBody} body
    * @param {TransactionWitnessSet} witness_set
    * @param {AuxiliaryData | undefined} auxiliary_data
    * @returns {Transaction}
    */
    static new(body, witness_set, auxiliary_data) {
        _assertClass(body, TransactionBody);
        _assertClass(witness_set, TransactionWitnessSet);
        let ptr0 = 0;
        if (!isLikeNone(auxiliary_data)) {
            _assertClass(auxiliary_data, AuxiliaryData);
            ptr0 = auxiliary_data.ptr;
            auxiliary_data.ptr = 0;
        }
        var ret = wasm.transaction_new(body.ptr, witness_set.ptr, ptr0);
        return Transaction.__wrap(ret);
    }
}
module.exports.Transaction = Transaction;
/**
*/
class TransactionBodies {

    static __wrap(ptr) {
        const obj = Object.create(TransactionBodies.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactionbodies_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionbodies_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {TransactionBodies}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactionbodies_from_bytes(ptr0, len0);
        return TransactionBodies.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionbodies_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.transactionbodies_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {TransactionBodies}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactionbodies_from_json(ptr0, len0);
        return TransactionBodies.__wrap(ret);
    }
    /**
    * @returns {TransactionBodies}
    */
    static new() {
        var ret = wasm.transactionbodies_new();
        return TransactionBodies.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.transactionbodies_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {TransactionBody}
    */
    get(index) {
        var ret = wasm.transactionbodies_get(this.ptr, index);
        return TransactionBody.__wrap(ret);
    }
    /**
    * @param {TransactionBody} elem
    */
    add(elem) {
        _assertClass(elem, TransactionBody);
        wasm.transactionbodies_add(this.ptr, elem.ptr);
    }
}
module.exports.TransactionBodies = TransactionBodies;
/**
*/
class TransactionBody {

    static __wrap(ptr) {
        const obj = Object.create(TransactionBody.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactionbody_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionbody_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {TransactionBody}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactionbody_from_bytes(ptr0, len0);
        return TransactionBody.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionbody_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.transactionbody_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {TransactionBody}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactionbody_from_json(ptr0, len0);
        return TransactionBody.__wrap(ret);
    }
    /**
    * @returns {TransactionInputs}
    */
    inputs() {
        var ret = wasm.transactionbody_inputs(this.ptr);
        return TransactionInputs.__wrap(ret);
    }
    /**
    * @returns {TransactionOutputs}
    */
    outputs() {
        var ret = wasm.transactionbody_outputs(this.ptr);
        return TransactionOutputs.__wrap(ret);
    }
    /**
    * @returns {BigNum}
    */
    fee() {
        var ret = wasm.transactionbody_fee(this.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @returns {BigNum | undefined}
    */
    ttl() {
        var ret = wasm.transactionbody_ttl(this.ptr);
        return ret === 0 ? undefined : BigNum.__wrap(ret);
    }
    /**
    * @param {Certificates} certs
    */
    set_certs(certs) {
        _assertClass(certs, Certificates);
        wasm.transactionbody_set_certs(this.ptr, certs.ptr);
    }
    /**
    * @returns {Certificates | undefined}
    */
    certs() {
        var ret = wasm.transactionbody_certs(this.ptr);
        return ret === 0 ? undefined : Certificates.__wrap(ret);
    }
    /**
    * @param {Withdrawals} withdrawals
    */
    set_withdrawals(withdrawals) {
        _assertClass(withdrawals, Withdrawals);
        wasm.transactionbody_set_withdrawals(this.ptr, withdrawals.ptr);
    }
    /**
    * @returns {Withdrawals | undefined}
    */
    withdrawals() {
        var ret = wasm.transactionbody_withdrawals(this.ptr);
        return ret === 0 ? undefined : Withdrawals.__wrap(ret);
    }
    /**
    * @param {Update} update
    */
    set_update(update) {
        _assertClass(update, Update);
        wasm.transactionbody_set_update(this.ptr, update.ptr);
    }
    /**
    * @returns {Update | undefined}
    */
    update() {
        var ret = wasm.transactionbody_update(this.ptr);
        return ret === 0 ? undefined : Update.__wrap(ret);
    }
    /**
    * @param {AuxiliaryDataHash} auxiliary_data_hash
    */
    set_auxiliary_data_hash(auxiliary_data_hash) {
        _assertClass(auxiliary_data_hash, AuxiliaryDataHash);
        wasm.transactionbody_set_auxiliary_data_hash(this.ptr, auxiliary_data_hash.ptr);
    }
    /**
    * @returns {AuxiliaryDataHash | undefined}
    */
    auxiliary_data_hash() {
        var ret = wasm.transactionbody_auxiliary_data_hash(this.ptr);
        return ret === 0 ? undefined : AuxiliaryDataHash.__wrap(ret);
    }
    /**
    * @param {BigNum} validity_start_interval
    */
    set_validity_start_interval(validity_start_interval) {
        _assertClass(validity_start_interval, BigNum);
        wasm.transactionbody_set_validity_start_interval(this.ptr, validity_start_interval.ptr);
    }
    /**
    * @returns {BigNum | undefined}
    */
    validity_start_interval() {
        var ret = wasm.transactionbody_validity_start_interval(this.ptr);
        return ret === 0 ? undefined : BigNum.__wrap(ret);
    }
    /**
    * @param {Mint} mint
    */
    set_mint(mint) {
        _assertClass(mint, Mint);
        wasm.transactionbody_set_mint(this.ptr, mint.ptr);
    }
    /**
    * @returns {Mint | undefined}
    */
    mint() {
        var ret = wasm.transactionbody_mint(this.ptr);
        return ret === 0 ? undefined : Mint.__wrap(ret);
    }
    /**
    * @param {ScriptDataHash} script_data_hash
    */
    set_script_data_hash(script_data_hash) {
        _assertClass(script_data_hash, ScriptDataHash);
        wasm.transactionbody_set_script_data_hash(this.ptr, script_data_hash.ptr);
    }
    /**
    * @returns {ScriptDataHash | undefined}
    */
    script_data_hash() {
        var ret = wasm.transactionbody_script_data_hash(this.ptr);
        return ret === 0 ? undefined : ScriptDataHash.__wrap(ret);
    }
    /**
    * @param {TransactionInputs} collateral
    */
    set_collateral(collateral) {
        _assertClass(collateral, TransactionInputs);
        wasm.transactionbody_set_collateral(this.ptr, collateral.ptr);
    }
    /**
    * @returns {TransactionInputs | undefined}
    */
    collateral() {
        var ret = wasm.transactionbody_collateral(this.ptr);
        return ret === 0 ? undefined : TransactionInputs.__wrap(ret);
    }
    /**
    * @param {Ed25519KeyHashes} required_signers
    */
    set_required_signers(required_signers) {
        _assertClass(required_signers, Ed25519KeyHashes);
        wasm.transactionbody_set_required_signers(this.ptr, required_signers.ptr);
    }
    /**
    * @returns {Ed25519KeyHashes | undefined}
    */
    required_signers() {
        var ret = wasm.transactionbody_required_signers(this.ptr);
        return ret === 0 ? undefined : Ed25519KeyHashes.__wrap(ret);
    }
    /**
    * @param {NetworkId} network_id
    */
    set_network_id(network_id) {
        _assertClass(network_id, NetworkId);
        wasm.transactionbody_set_network_id(this.ptr, network_id.ptr);
    }
    /**
    * @returns {NetworkId | undefined}
    */
    network_id() {
        var ret = wasm.transactionbody_network_id(this.ptr);
        return ret === 0 ? undefined : NetworkId.__wrap(ret);
    }
    /**
    * @param {TransactionOutput} collateral_return
    */
    set_collateral_return(collateral_return) {
        _assertClass(collateral_return, TransactionOutput);
        wasm.transactionbody_set_collateral_return(this.ptr, collateral_return.ptr);
    }
    /**
    * @returns {TransactionOutput | undefined}
    */
    collateral_return() {
        var ret = wasm.transactionbody_collateral_return(this.ptr);
        return ret === 0 ? undefined : TransactionOutput.__wrap(ret);
    }
    /**
    * @param {BigNum} total_collateral
    */
    set_total_collateral(total_collateral) {
        _assertClass(total_collateral, BigNum);
        wasm.transactionbody_set_total_collateral(this.ptr, total_collateral.ptr);
    }
    /**
    * @returns {BigNum | undefined}
    */
    total_collateral() {
        var ret = wasm.transactionbody_total_collateral(this.ptr);
        return ret === 0 ? undefined : BigNum.__wrap(ret);
    }
    /**
    * @param {TransactionInputs} reference_inputs
    */
    set_reference_inputs(reference_inputs) {
        _assertClass(reference_inputs, TransactionInputs);
        wasm.transactionbody_set_reference_inputs(this.ptr, reference_inputs.ptr);
    }
    /**
    * @returns {TransactionInputs | undefined}
    */
    reference_inputs() {
        var ret = wasm.transactionbody_reference_inputs(this.ptr);
        return ret === 0 ? undefined : TransactionInputs.__wrap(ret);
    }
    /**
    * @param {TransactionInputs} inputs
    * @param {TransactionOutputs} outputs
    * @param {BigNum} fee
    * @param {BigNum | undefined} ttl
    * @returns {TransactionBody}
    */
    static new(inputs, outputs, fee, ttl) {
        _assertClass(inputs, TransactionInputs);
        _assertClass(outputs, TransactionOutputs);
        _assertClass(fee, BigNum);
        let ptr0 = 0;
        if (!isLikeNone(ttl)) {
            _assertClass(ttl, BigNum);
            ptr0 = ttl.ptr;
            ttl.ptr = 0;
        }
        var ret = wasm.transactionbody_new(inputs.ptr, outputs.ptr, fee.ptr, ptr0);
        return TransactionBody.__wrap(ret);
    }
    /**
    * @returns {Uint8Array | undefined}
    */
    raw() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionbody_raw(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            let v0;
            if (r0 !== 0) {
                v0 = getArrayU8FromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1);
            }
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.TransactionBody = TransactionBody;
/**
*/
class TransactionBuilder {

    static __wrap(ptr) {
        const obj = Object.create(TransactionBuilder.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactionbuilder_free(ptr);
    }
    /**
    * This automatically selects and adds inputs from {inputs} consisting of just enough to cover
    * the outputs that have already been added.
    * This should be called after adding all certs/outputs/etc and will be an error otherwise.
    * Adding a change output must be called after via TransactionBuilder::balance()
    * inputs to cover the minimum fees. This does not, however, set the txbuilder's fee.
    *
    * change_address is required here in order to determine the min ada requirement precisely
    * @param {TransactionUnspentOutputs} inputs
    * @param {Address} change_address
    */
    add_inputs_from(inputs, change_address) {
        _assertClass(inputs, TransactionUnspentOutputs);
        _assertClass(change_address, Address);
        wasm.transactionbuilder_add_inputs_from(this.ptr, inputs.ptr, change_address.ptr);
    }
    /**
    * @param {TransactionUnspentOutput} utxo
    * @param {ScriptWitness | undefined} script_witness
    */
    add_input(utxo, script_witness) {
        _assertClass(utxo, TransactionUnspentOutput);
        let ptr0 = 0;
        if (!isLikeNone(script_witness)) {
            _assertClass(script_witness, ScriptWitness);
            ptr0 = script_witness.ptr;
            script_witness.ptr = 0;
        }
        wasm.transactionbuilder_add_input(this.ptr, utxo.ptr, ptr0);
    }
    /**
    * @param {TransactionUnspentOutput} utxo
    */
    add_reference_input(utxo) {
        _assertClass(utxo, TransactionUnspentOutput);
        wasm.transactionbuilder_add_reference_input(this.ptr, utxo.ptr);
    }
    /**
    * calculates how much the fee would increase if you added a given output
    * @param {Address} address
    * @param {TransactionInput} input
    * @param {Value} amount
    * @returns {BigNum}
    */
    fee_for_input(address, input, amount) {
        _assertClass(address, Address);
        _assertClass(input, TransactionInput);
        _assertClass(amount, Value);
        var ret = wasm.transactionbuilder_fee_for_input(this.ptr, address.ptr, input.ptr, amount.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * Add explicit output via a TransactionOutput object
    * @param {TransactionOutput} output
    */
    add_output(output) {
        _assertClass(output, TransactionOutput);
        wasm.transactionbuilder_add_output(this.ptr, output.ptr);
    }
    /**
    * Add plutus scripts via a PlutusScripts object
    * @param {PlutusScript} plutus_script
    */
    add_plutus_script(plutus_script) {
        _assertClass(plutus_script, PlutusScript);
        wasm.transactionbuilder_add_plutus_script(this.ptr, plutus_script.ptr);
    }
    /**
    * Add plutus v2 scripts via a PlutusScripts object
    * @param {PlutusScript} plutus_script
    */
    add_plutus_v2_script(plutus_script) {
        _assertClass(plutus_script, PlutusScript);
        wasm.transactionbuilder_add_plutus_v2_script(this.ptr, plutus_script.ptr);
    }
    /**
    * Add plutus data via a PlutusData object
    * @param {PlutusData} plutus_data
    */
    add_plutus_data(plutus_data) {
        _assertClass(plutus_data, PlutusData);
        wasm.transactionbuilder_add_plutus_data(this.ptr, plutus_data.ptr);
    }
    /**
    * Add native scripts via a NativeScripts object
    * @param {NativeScript} native_script
    */
    add_native_script(native_script) {
        _assertClass(native_script, NativeScript);
        wasm.transactionbuilder_add_native_script(this.ptr, native_script.ptr);
    }
    /**
    * Add certificate via a Certificates object
    * @param {Certificate} certificate
    * @param {ScriptWitness | undefined} script_witness
    */
    add_certificate(certificate, script_witness) {
        _assertClass(certificate, Certificate);
        let ptr0 = 0;
        if (!isLikeNone(script_witness)) {
            _assertClass(script_witness, ScriptWitness);
            ptr0 = script_witness.ptr;
            script_witness.ptr = 0;
        }
        wasm.transactionbuilder_add_certificate(this.ptr, certificate.ptr, ptr0);
    }
    /**
    * calculates how much the fee would increase if you added a given output
    * @param {TransactionOutput} output
    * @returns {BigNum}
    */
    fee_for_output(output) {
        _assertClass(output, TransactionOutput);
        var ret = wasm.transactionbuilder_fee_for_output(this.ptr, output.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @param {BigNum} ttl
    */
    set_ttl(ttl) {
        _assertClass(ttl, BigNum);
        wasm.transactionbuilder_set_ttl(this.ptr, ttl.ptr);
    }
    /**
    * @param {BigNum} validity_start_interval
    */
    set_validity_start_interval(validity_start_interval) {
        _assertClass(validity_start_interval, BigNum);
        wasm.transactionbuilder_set_validity_start_interval(this.ptr, validity_start_interval.ptr);
    }
    /**
    * @param {RewardAddress} reward_address
    * @param {BigNum} coin
    * @param {ScriptWitness | undefined} script_witness
    */
    add_withdrawal(reward_address, coin, script_witness) {
        _assertClass(reward_address, RewardAddress);
        _assertClass(coin, BigNum);
        let ptr0 = 0;
        if (!isLikeNone(script_witness)) {
            _assertClass(script_witness, ScriptWitness);
            ptr0 = script_witness.ptr;
            script_witness.ptr = 0;
        }
        wasm.transactionbuilder_add_withdrawal(this.ptr, reward_address.ptr, coin.ptr, ptr0);
    }
    /**
    * @returns {AuxiliaryData | undefined}
    */
    auxiliary_data() {
        var ret = wasm.transactionbuilder_auxiliary_data(this.ptr);
        return ret === 0 ? undefined : AuxiliaryData.__wrap(ret);
    }
    /**
    * Set explicit auxiliary data via an AuxiliaryData object
    * It might contain some metadata plus native or Plutus scripts
    * @param {AuxiliaryData} auxiliary_data
    */
    set_auxiliary_data(auxiliary_data) {
        _assertClass(auxiliary_data, AuxiliaryData);
        wasm.transactionbuilder_set_auxiliary_data(this.ptr, auxiliary_data.ptr);
    }
    /**
    * Set metadata using a GeneralTransactionMetadata object
    * It will be set to the existing or new auxiliary data in this builder
    * @param {GeneralTransactionMetadata} metadata
    */
    set_metadata(metadata) {
        _assertClass(metadata, GeneralTransactionMetadata);
        wasm.transactionbuilder_set_metadata(this.ptr, metadata.ptr);
    }
    /**
    * Add a single metadatum using TransactionMetadatumLabel and TransactionMetadatum objects
    * It will be securely added to existing or new metadata in this builder
    * @param {BigNum} key
    * @param {TransactionMetadatum} val
    */
    add_metadatum(key, val) {
        _assertClass(key, BigNum);
        _assertClass(val, TransactionMetadatum);
        wasm.transactionbuilder_add_metadatum(this.ptr, key.ptr, val.ptr);
    }
    /**
    * Add a single JSON metadatum using a TransactionMetadatumLabel and a String
    * It will be securely added to existing or new metadata in this builder
    * @param {BigNum} key
    * @param {string} val
    */
    add_json_metadatum(key, val) {
        _assertClass(key, BigNum);
        var ptr0 = passStringToWasm0(val, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.transactionbuilder_add_json_metadatum(this.ptr, key.ptr, ptr0, len0);
    }
    /**
    * Add a single JSON metadatum using a TransactionMetadatumLabel, a String, and a MetadataJsonSchema object
    * It will be securely added to existing or new metadata in this builder
    * @param {BigNum} key
    * @param {string} val
    * @param {number} schema
    */
    add_json_metadatum_with_schema(key, val, schema) {
        _assertClass(key, BigNum);
        var ptr0 = passStringToWasm0(val, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.transactionbuilder_add_json_metadatum_with_schema(this.ptr, key.ptr, ptr0, len0, schema);
    }
    /**
    * Returns a copy of the current mint state in the builder
    * @returns {Mint | undefined}
    */
    mint() {
        var ret = wasm.transactionbuilder_mint(this.ptr);
        return ret === 0 ? undefined : Mint.__wrap(ret);
    }
    /**
    * @returns {Certificates | undefined}
    */
    certificates() {
        var ret = wasm.transactionbuilder_certificates(this.ptr);
        return ret === 0 ? undefined : Certificates.__wrap(ret);
    }
    /**
    * @returns {Withdrawals | undefined}
    */
    withdrawals() {
        var ret = wasm.transactionbuilder_withdrawals(this.ptr);
        return ret === 0 ? undefined : Withdrawals.__wrap(ret);
    }
    /**
    * Returns a copy of the current witness native scripts in the builder
    * @returns {NativeScripts | undefined}
    */
    native_scripts() {
        var ret = wasm.transactionbuilder_native_scripts(this.ptr);
        return ret === 0 ? undefined : NativeScripts.__wrap(ret);
    }
    /**
    * Add a mint entry to this builder using a PolicyID and MintAssets object
    * It will be securely added to existing or new Mint in this builder
    * It will securely add assets to an existing PolicyID
    * But it will replace/overwrite any existing mint assets with the same PolicyID
    * first redeemer applied to a PolicyID is taken for all further assets added to the same PolicyID
    * @param {ScriptHash} policy_id
    * @param {MintAssets} mint_assets
    * @param {ScriptWitness | undefined} script_witness
    */
    add_mint(policy_id, mint_assets, script_witness) {
        _assertClass(policy_id, ScriptHash);
        _assertClass(mint_assets, MintAssets);
        let ptr0 = 0;
        if (!isLikeNone(script_witness)) {
            _assertClass(script_witness, ScriptWitness);
            ptr0 = script_witness.ptr;
            script_witness.ptr = 0;
        }
        wasm.transactionbuilder_add_mint(this.ptr, policy_id.ptr, mint_assets.ptr, ptr0);
    }
    /**
    * @param {TransactionBuilderConfig} cfg
    * @returns {TransactionBuilder}
    */
    static new(cfg) {
        _assertClass(cfg, TransactionBuilderConfig);
        var ret = wasm.transactionbuilder_new(cfg.ptr);
        return TransactionBuilder.__wrap(ret);
    }
    /**
    * @returns {ScriptDataHash | undefined}
    */
    script_data_hash() {
        var ret = wasm.transactionbuilder_script_data_hash(this.ptr);
        return ret === 0 ? undefined : ScriptDataHash.__wrap(ret);
    }
    /**
    * @param {TransactionUnspentOutput} utxo
    */
    add_collateral(utxo) {
        _assertClass(utxo, TransactionUnspentOutput);
        wasm.transactionbuilder_add_collateral(this.ptr, utxo.ptr);
    }
    /**
    * @returns {TransactionInputs | undefined}
    */
    get_collateral() {
        var ret = wasm.transactionbuilder_get_collateral(this.ptr);
        return ret === 0 ? undefined : TransactionInputs.__wrap(ret);
    }
    /**
    * @param {Ed25519KeyHash} required_signer
    */
    add_required_signer(required_signer) {
        _assertClass(required_signer, Ed25519KeyHash);
        wasm.transactionbuilder_add_required_signer(this.ptr, required_signer.ptr);
    }
    /**
    * @returns {Ed25519KeyHashes | undefined}
    */
    required_signers() {
        var ret = wasm.transactionbuilder_required_signers(this.ptr);
        return ret === 0 ? undefined : Ed25519KeyHashes.__wrap(ret);
    }
    /**
    * @param {NetworkId} network_id
    */
    set_network_id(network_id) {
        _assertClass(network_id, NetworkId);
        var ptr0 = network_id.ptr;
        network_id.ptr = 0;
        wasm.transactionbuilder_set_network_id(this.ptr, ptr0);
    }
    /**
    * @returns {NetworkId | undefined}
    */
    network_id() {
        var ret = wasm.transactionbuilder_network_id(this.ptr);
        return ret === 0 ? undefined : NetworkId.__wrap(ret);
    }
    /**
    * @returns {Redeemers | undefined}
    */
    redeemers() {
        var ret = wasm.transactionbuilder_redeemers(this.ptr);
        return ret === 0 ? undefined : Redeemers.__wrap(ret);
    }
    /**
    * does not include refunds or withdrawals
    * @returns {Value}
    */
    get_explicit_input() {
        var ret = wasm.transactionbuilder_get_explicit_input(this.ptr);
        return Value.__wrap(ret);
    }
    /**
    * withdrawals and refunds
    * @returns {Value}
    */
    get_implicit_input() {
        var ret = wasm.transactionbuilder_get_implicit_input(this.ptr);
        return Value.__wrap(ret);
    }
    /**
    * Return explicit input plus implicit input plus mint
    * @returns {Value}
    */
    get_total_input() {
        var ret = wasm.transactionbuilder_get_total_input(this.ptr);
        return Value.__wrap(ret);
    }
    /**
    * Return explicit output plus implicit output plus burn (does not consider fee directly)
    * @returns {Value}
    */
    get_total_output() {
        var ret = wasm.transactionbuilder_get_total_output(this.ptr);
        return Value.__wrap(ret);
    }
    /**
    * does not include fee
    * @returns {Value}
    */
    get_explicit_output() {
        var ret = wasm.transactionbuilder_get_explicit_output(this.ptr);
        return Value.__wrap(ret);
    }
    /**
    * @returns {BigNum}
    */
    get_deposit() {
        var ret = wasm.transactionbuilder_get_deposit(this.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @returns {BigNum | undefined}
    */
    get_fee_if_set() {
        var ret = wasm.transactionbuilder_get_fee_if_set(this.ptr);
        return ret === 0 ? undefined : BigNum.__wrap(ret);
    }
    /**
    * Warning: this function will mutate the /fee/ field
    * Make sure to call this function last after setting all other tx-body properties
    * Editing inputs, outputs, mint, etc. after change been calculated
    * might cause a mismatch in calculated fee versus the required fee
    * @param {Address} change_address
    * @param {Datum | undefined} datum
    */
    balance(change_address, datum) {
        _assertClass(change_address, Address);
        let ptr0 = 0;
        if (!isLikeNone(datum)) {
            _assertClass(datum, Datum);
            ptr0 = datum.ptr;
            datum.ptr = 0;
        }
        wasm.transactionbuilder_balance(this.ptr, change_address.ptr, ptr0);
    }
    /**
    * Returns the TransactionBody.
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionbuilder_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {number}
    */
    full_size() {
        var ret = wasm.transactionbuilder_full_size(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {Uint32Array}
    */
    output_sizes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionbuilder_output_sizes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU32FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {TransactionOutputs}
    */
    outputs() {
        var ret = wasm.transactionbuilder_outputs(this.ptr);
        return TransactionOutputs.__wrap(ret);
    }
    /**
    * Returns full Transaction object with the body and the auxiliary data
    *
    * NOTE: witness_set will contain all mint_scripts if any been added or set
    *
    * takes fetched ex units into consideration
    *
    * add collateral utxos and collateral change receiver in case you redeem from plutus script utxos
    *
    * async call
    *
    * NOTE: is_valid set to true
    * @param {TransactionUnspentOutputs | undefined} collateral_utxos
    * @param {Address | undefined} collateral_change_address
    * @returns {Promise<Transaction>}
    */
    construct(collateral_utxos, collateral_change_address) {
        const ptr = this.__destroy_into_raw();
        let ptr0 = 0;
        if (!isLikeNone(collateral_utxos)) {
            _assertClass(collateral_utxos, TransactionUnspentOutputs);
            ptr0 = collateral_utxos.ptr;
            collateral_utxos.ptr = 0;
        }
        let ptr1 = 0;
        if (!isLikeNone(collateral_change_address)) {
            _assertClass(collateral_change_address, Address);
            ptr1 = collateral_change_address.ptr;
            collateral_change_address.ptr = 0;
        }
        var ret = wasm.transactionbuilder_construct(ptr, ptr0, ptr1);
        return takeObject(ret);
    }
    /**
    * Returns full Transaction object with the body and the auxiliary data
    * NOTE: witness_set will contain all mint_scripts if any been added or set
    * NOTE: is_valid set to true
    * @returns {Transaction}
    */
    build_tx() {
        var ret = wasm.transactionbuilder_build_tx(this.ptr);
        return Transaction.__wrap(ret);
    }
    /**
    * warning: sum of all parts of a transaction must equal 0. You cannot just set the fee to the min value and forget about it
    * warning: min_fee may be slightly larger than the actual minimum fee (ex: a few lovelaces)
    * this is done to simplify the library code, but can be fixed later
    * @returns {BigNum}
    */
    min_fee() {
        var ret = wasm.transactionbuilder_min_fee(this.ptr);
        return BigNum.__wrap(ret);
    }
}
module.exports.TransactionBuilder = TransactionBuilder;
/**
*/
class TransactionBuilderConfig {

    static __wrap(ptr) {
        const obj = Object.create(TransactionBuilderConfig.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactionbuilderconfig_free(ptr);
    }
}
module.exports.TransactionBuilderConfig = TransactionBuilderConfig;
/**
*/
class TransactionBuilderConfigBuilder {

    static __wrap(ptr) {
        const obj = Object.create(TransactionBuilderConfigBuilder.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactionbuilderconfigbuilder_free(ptr);
    }
    /**
    * @returns {TransactionBuilderConfigBuilder}
    */
    static new() {
        var ret = wasm.transactionbuilderconfigbuilder_new();
        return TransactionBuilderConfigBuilder.__wrap(ret);
    }
    /**
    * @param {LinearFee} fee_algo
    * @returns {TransactionBuilderConfigBuilder}
    */
    fee_algo(fee_algo) {
        _assertClass(fee_algo, LinearFee);
        var ret = wasm.transactionbuilderconfigbuilder_fee_algo(this.ptr, fee_algo.ptr);
        return TransactionBuilderConfigBuilder.__wrap(ret);
    }
    /**
    * @param {BigNum} coins_per_utxo_byte
    * @returns {TransactionBuilderConfigBuilder}
    */
    coins_per_utxo_byte(coins_per_utxo_byte) {
        _assertClass(coins_per_utxo_byte, BigNum);
        var ret = wasm.transactionbuilderconfigbuilder_coins_per_utxo_byte(this.ptr, coins_per_utxo_byte.ptr);
        return TransactionBuilderConfigBuilder.__wrap(ret);
    }
    /**
    * @param {BigNum} pool_deposit
    * @returns {TransactionBuilderConfigBuilder}
    */
    pool_deposit(pool_deposit) {
        _assertClass(pool_deposit, BigNum);
        var ret = wasm.transactionbuilderconfigbuilder_pool_deposit(this.ptr, pool_deposit.ptr);
        return TransactionBuilderConfigBuilder.__wrap(ret);
    }
    /**
    * @param {BigNum} key_deposit
    * @returns {TransactionBuilderConfigBuilder}
    */
    key_deposit(key_deposit) {
        _assertClass(key_deposit, BigNum);
        var ret = wasm.transactionbuilderconfigbuilder_key_deposit(this.ptr, key_deposit.ptr);
        return TransactionBuilderConfigBuilder.__wrap(ret);
    }
    /**
    * @param {number} max_value_size
    * @returns {TransactionBuilderConfigBuilder}
    */
    max_value_size(max_value_size) {
        var ret = wasm.transactionbuilderconfigbuilder_max_value_size(this.ptr, max_value_size);
        return TransactionBuilderConfigBuilder.__wrap(ret);
    }
    /**
    * @param {number} max_tx_size
    * @returns {TransactionBuilderConfigBuilder}
    */
    max_tx_size(max_tx_size) {
        var ret = wasm.transactionbuilderconfigbuilder_max_tx_size(this.ptr, max_tx_size);
        return TransactionBuilderConfigBuilder.__wrap(ret);
    }
    /**
    * @param {ExUnitPrices} ex_unit_prices
    * @returns {TransactionBuilderConfigBuilder}
    */
    ex_unit_prices(ex_unit_prices) {
        _assertClass(ex_unit_prices, ExUnitPrices);
        var ret = wasm.transactionbuilderconfigbuilder_ex_unit_prices(this.ptr, ex_unit_prices.ptr);
        return TransactionBuilderConfigBuilder.__wrap(ret);
    }
    /**
    * @param {Costmdls} costmdls
    * @returns {TransactionBuilderConfigBuilder}
    */
    costmdls(costmdls) {
        _assertClass(costmdls, Costmdls);
        var ret = wasm.transactionbuilderconfigbuilder_costmdls(this.ptr, costmdls.ptr);
        return TransactionBuilderConfigBuilder.__wrap(ret);
    }
    /**
    * @param {number} collateral_percentage
    * @returns {TransactionBuilderConfigBuilder}
    */
    collateral_percentage(collateral_percentage) {
        var ret = wasm.transactionbuilderconfigbuilder_collateral_percentage(this.ptr, collateral_percentage);
        return TransactionBuilderConfigBuilder.__wrap(ret);
    }
    /**
    * @param {number} max_collateral_inputs
    * @returns {TransactionBuilderConfigBuilder}
    */
    max_collateral_inputs(max_collateral_inputs) {
        var ret = wasm.transactionbuilderconfigbuilder_max_collateral_inputs(this.ptr, max_collateral_inputs);
        return TransactionBuilderConfigBuilder.__wrap(ret);
    }
    /**
    * @param {Blockfrost} blockfrost
    * @returns {TransactionBuilderConfigBuilder}
    */
    blockfrost(blockfrost) {
        _assertClass(blockfrost, Blockfrost);
        var ret = wasm.transactionbuilderconfigbuilder_blockfrost(this.ptr, blockfrost.ptr);
        return TransactionBuilderConfigBuilder.__wrap(ret);
    }
    /**
    * @returns {TransactionBuilderConfig}
    */
    build() {
        var ret = wasm.transactionbuilderconfigbuilder_build(this.ptr);
        return TransactionBuilderConfig.__wrap(ret);
    }
}
module.exports.TransactionBuilderConfigBuilder = TransactionBuilderConfigBuilder;
/**
*/
class TransactionHash {

    static __wrap(ptr) {
        const obj = Object.create(TransactionHash.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactionhash_free(ptr);
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {TransactionHash}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactionhash_from_bytes(ptr0, len0);
        return TransactionHash.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionhash_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} prefix
    * @returns {string}
    */
    to_bech32(prefix) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(prefix, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.transactionhash_to_bech32(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} bech_str
    * @returns {TransactionHash}
    */
    static from_bech32(bech_str) {
        var ptr0 = passStringToWasm0(bech_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactionhash_from_bech32(ptr0, len0);
        return TransactionHash.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_hex() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionhash_to_hex(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} hex
    * @returns {TransactionHash}
    */
    static from_hex(hex) {
        var ptr0 = passStringToWasm0(hex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactionhash_from_hex(ptr0, len0);
        return TransactionHash.__wrap(ret);
    }
}
module.exports.TransactionHash = TransactionHash;
/**
*/
class TransactionIndexes {

    static __wrap(ptr) {
        const obj = Object.create(TransactionIndexes.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactionindexes_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionindexes_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {TransactionIndexes}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactionindexes_from_bytes(ptr0, len0);
        return TransactionIndexes.__wrap(ret);
    }
    /**
    * @returns {TransactionIndexes}
    */
    static new() {
        var ret = wasm.transactionindexes_new();
        return TransactionIndexes.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.transactionindexes_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {BigNum}
    */
    get(index) {
        var ret = wasm.transactionindexes_get(this.ptr, index);
        return BigNum.__wrap(ret);
    }
    /**
    * @param {BigNum} elem
    */
    add(elem) {
        _assertClass(elem, BigNum);
        wasm.transactionindexes_add(this.ptr, elem.ptr);
    }
}
module.exports.TransactionIndexes = TransactionIndexes;
/**
*/
class TransactionInput {

    static __wrap(ptr) {
        const obj = Object.create(TransactionInput.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactioninput_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactioninput_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {TransactionInput}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactioninput_from_bytes(ptr0, len0);
        return TransactionInput.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactioninput_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.transactioninput_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {TransactionInput}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactioninput_from_json(ptr0, len0);
        return TransactionInput.__wrap(ret);
    }
    /**
    * @returns {TransactionHash}
    */
    transaction_id() {
        var ret = wasm.transactioninput_transaction_id(this.ptr);
        return TransactionHash.__wrap(ret);
    }
    /**
    * @returns {BigNum}
    */
    index() {
        var ret = wasm.transactioninput_index(this.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @param {TransactionHash} transaction_id
    * @param {BigNum} index
    * @returns {TransactionInput}
    */
    static new(transaction_id, index) {
        _assertClass(transaction_id, TransactionHash);
        _assertClass(index, BigNum);
        var ret = wasm.transactioninput_new(transaction_id.ptr, index.ptr);
        return TransactionInput.__wrap(ret);
    }
}
module.exports.TransactionInput = TransactionInput;
/**
*/
class TransactionInputs {

    static __wrap(ptr) {
        const obj = Object.create(TransactionInputs.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactioninputs_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactioninputs_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {TransactionInputs}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactioninputs_from_bytes(ptr0, len0);
        return TransactionInputs.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactioninputs_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.transactioninputs_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {TransactionInputs}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactioninputs_from_json(ptr0, len0);
        return TransactionInputs.__wrap(ret);
    }
    /**
    * @returns {TransactionInputs}
    */
    static new() {
        var ret = wasm.transactioninputs_new();
        return TransactionInputs.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.transactioninputs_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {TransactionInput}
    */
    get(index) {
        var ret = wasm.transactioninputs_get(this.ptr, index);
        return TransactionInput.__wrap(ret);
    }
    /**
    * @param {TransactionInput} elem
    */
    add(elem) {
        _assertClass(elem, TransactionInput);
        wasm.transactioninputs_add(this.ptr, elem.ptr);
    }
}
module.exports.TransactionInputs = TransactionInputs;
/**
*/
class TransactionMetadatum {

    static __wrap(ptr) {
        const obj = Object.create(TransactionMetadatum.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactionmetadatum_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionmetadatum_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {TransactionMetadatum}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactionmetadatum_from_bytes(ptr0, len0);
        return TransactionMetadatum.__wrap(ret);
    }
    /**
    * @param {MetadataMap} map
    * @returns {TransactionMetadatum}
    */
    static new_map(map) {
        _assertClass(map, MetadataMap);
        var ret = wasm.transactionmetadatum_new_map(map.ptr);
        return TransactionMetadatum.__wrap(ret);
    }
    /**
    * @param {MetadataList} list
    * @returns {TransactionMetadatum}
    */
    static new_list(list) {
        _assertClass(list, MetadataList);
        var ret = wasm.transactionmetadatum_new_list(list.ptr);
        return TransactionMetadatum.__wrap(ret);
    }
    /**
    * @param {Int} int
    * @returns {TransactionMetadatum}
    */
    static new_int(int) {
        _assertClass(int, Int);
        var ret = wasm.transactionmetadatum_new_int(int.ptr);
        return TransactionMetadatum.__wrap(ret);
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {TransactionMetadatum}
    */
    static new_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactionmetadatum_new_bytes(ptr0, len0);
        return TransactionMetadatum.__wrap(ret);
    }
    /**
    * @param {string} text
    * @returns {TransactionMetadatum}
    */
    static new_text(text) {
        var ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactionmetadatum_new_text(ptr0, len0);
        return TransactionMetadatum.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    kind() {
        var ret = wasm.transactionmetadatum_kind(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {MetadataMap}
    */
    as_map() {
        var ret = wasm.transactionmetadatum_as_map(this.ptr);
        return MetadataMap.__wrap(ret);
    }
    /**
    * @returns {MetadataList}
    */
    as_list() {
        var ret = wasm.transactionmetadatum_as_list(this.ptr);
        return MetadataList.__wrap(ret);
    }
    /**
    * @returns {Int}
    */
    as_int() {
        var ret = wasm.transactionmetadatum_as_int(this.ptr);
        return Int.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    as_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionmetadatum_as_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {string}
    */
    as_text() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionmetadatum_as_text(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
module.exports.TransactionMetadatum = TransactionMetadatum;
/**
*/
class TransactionMetadatumLabels {

    static __wrap(ptr) {
        const obj = Object.create(TransactionMetadatumLabels.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactionmetadatumlabels_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionmetadatumlabels_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {TransactionMetadatumLabels}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactionmetadatumlabels_from_bytes(ptr0, len0);
        return TransactionMetadatumLabels.__wrap(ret);
    }
    /**
    * @returns {TransactionMetadatumLabels}
    */
    static new() {
        var ret = wasm.transactionmetadatumlabels_new();
        return TransactionMetadatumLabels.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.transactionmetadatumlabels_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {BigNum}
    */
    get(index) {
        var ret = wasm.transactionmetadatumlabels_get(this.ptr, index);
        return BigNum.__wrap(ret);
    }
    /**
    * @param {BigNum} elem
    */
    add(elem) {
        _assertClass(elem, BigNum);
        wasm.transactionmetadatumlabels_add(this.ptr, elem.ptr);
    }
}
module.exports.TransactionMetadatumLabels = TransactionMetadatumLabels;
/**
*/
class TransactionOutput {

    static __wrap(ptr) {
        const obj = Object.create(TransactionOutput.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactionoutput_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionoutput_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {TransactionOutput}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactionoutput_from_bytes(ptr0, len0);
        return TransactionOutput.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionoutput_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.transactionoutput_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {TransactionOutput}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactionoutput_from_json(ptr0, len0);
        return TransactionOutput.__wrap(ret);
    }
    /**
    * @returns {Address}
    */
    address() {
        var ret = wasm.transactionoutput_address(this.ptr);
        return Address.__wrap(ret);
    }
    /**
    * @returns {Value}
    */
    amount() {
        var ret = wasm.transactionoutput_amount(this.ptr);
        return Value.__wrap(ret);
    }
    /**
    * @returns {Datum | undefined}
    */
    datum() {
        var ret = wasm.transactionoutput_datum(this.ptr);
        return ret === 0 ? undefined : Datum.__wrap(ret);
    }
    /**
    * @returns {ScriptRef | undefined}
    */
    script_ref() {
        var ret = wasm.transactionoutput_script_ref(this.ptr);
        return ret === 0 ? undefined : ScriptRef.__wrap(ret);
    }
    /**
    * @param {Datum} datum
    */
    set_datum(datum) {
        _assertClass(datum, Datum);
        wasm.transactionoutput_set_datum(this.ptr, datum.ptr);
    }
    /**
    * @param {ScriptRef} script_ref
    */
    set_script_ref(script_ref) {
        _assertClass(script_ref, ScriptRef);
        wasm.transactionoutput_set_script_ref(this.ptr, script_ref.ptr);
    }
    /**
    * @param {Address} address
    * @param {Value} amount
    * @returns {TransactionOutput}
    */
    static new(address, amount) {
        _assertClass(address, Address);
        _assertClass(amount, Value);
        var ret = wasm.transactionoutput_new(address.ptr, amount.ptr);
        return TransactionOutput.__wrap(ret);
    }
    /**
    * legacy support: serialize output as array array
    *
    * does not support inline datum and script_ref!
    * @returns {Uint8Array}
    */
    to_legacy_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionoutput_to_legacy_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.TransactionOutput = TransactionOutput;
/**
*/
class TransactionOutputAmountBuilder {

    static __wrap(ptr) {
        const obj = Object.create(TransactionOutputAmountBuilder.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactionoutputamountbuilder_free(ptr);
    }
    /**
    * @param {Value} amount
    * @returns {TransactionOutputAmountBuilder}
    */
    with_value(amount) {
        _assertClass(amount, Value);
        var ret = wasm.transactionoutputamountbuilder_with_value(this.ptr, amount.ptr);
        return TransactionOutputAmountBuilder.__wrap(ret);
    }
    /**
    * @param {BigNum} coin
    * @returns {TransactionOutputAmountBuilder}
    */
    with_coin(coin) {
        _assertClass(coin, BigNum);
        var ret = wasm.transactionoutputamountbuilder_with_coin(this.ptr, coin.ptr);
        return TransactionOutputAmountBuilder.__wrap(ret);
    }
    /**
    * @param {BigNum} coin
    * @param {MultiAsset} multiasset
    * @returns {TransactionOutputAmountBuilder}
    */
    with_coin_and_asset(coin, multiasset) {
        _assertClass(coin, BigNum);
        _assertClass(multiasset, MultiAsset);
        var ret = wasm.transactionoutputamountbuilder_with_coin_and_asset(this.ptr, coin.ptr, multiasset.ptr);
        return TransactionOutputAmountBuilder.__wrap(ret);
    }
    /**
    * @param {MultiAsset} multiasset
    * @param {BigNum} coins_per_utxo_word
    * @returns {TransactionOutputAmountBuilder}
    */
    with_asset_and_min_required_coin(multiasset, coins_per_utxo_word) {
        _assertClass(multiasset, MultiAsset);
        _assertClass(coins_per_utxo_word, BigNum);
        var ret = wasm.transactionoutputamountbuilder_with_asset_and_min_required_coin(this.ptr, multiasset.ptr, coins_per_utxo_word.ptr);
        return TransactionOutputAmountBuilder.__wrap(ret);
    }
    /**
    * @returns {TransactionOutput}
    */
    build() {
        var ret = wasm.transactionoutputamountbuilder_build(this.ptr);
        return TransactionOutput.__wrap(ret);
    }
}
module.exports.TransactionOutputAmountBuilder = TransactionOutputAmountBuilder;
/**
* We introduce a builder-pattern format for creating transaction outputs
* This is because:
* 1. Some fields (i.e. data hash) are optional, and we can't easily expose Option<> in WASM
* 2. Some fields like amounts have many ways it could be set (some depending on other field values being known)
* 3. Easier to adapt as the output format gets more complicated in future Cardano releases
*/
class TransactionOutputBuilder {

    static __wrap(ptr) {
        const obj = Object.create(TransactionOutputBuilder.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactionoutputbuilder_free(ptr);
    }
    /**
    * @returns {TransactionOutputBuilder}
    */
    static new() {
        var ret = wasm.transactionoutputbuilder_new();
        return TransactionOutputBuilder.__wrap(ret);
    }
    /**
    * @param {Address} address
    * @returns {TransactionOutputBuilder}
    */
    with_address(address) {
        _assertClass(address, Address);
        var ret = wasm.transactionoutputbuilder_with_address(this.ptr, address.ptr);
        return TransactionOutputBuilder.__wrap(ret);
    }
    /**
    * @param {Datum} data_hash
    * @returns {TransactionOutputBuilder}
    */
    with_datum(data_hash) {
        _assertClass(data_hash, Datum);
        var ret = wasm.transactionoutputbuilder_with_datum(this.ptr, data_hash.ptr);
        return TransactionOutputBuilder.__wrap(ret);
    }
    /**
    * @returns {TransactionOutputAmountBuilder}
    */
    next() {
        var ret = wasm.transactionoutputbuilder_next(this.ptr);
        return TransactionOutputAmountBuilder.__wrap(ret);
    }
}
module.exports.TransactionOutputBuilder = TransactionOutputBuilder;
/**
*/
class TransactionOutputs {

    static __wrap(ptr) {
        const obj = Object.create(TransactionOutputs.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactionoutputs_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionoutputs_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {TransactionOutputs}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactionoutputs_from_bytes(ptr0, len0);
        return TransactionOutputs.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionoutputs_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.transactionoutputs_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {TransactionOutputs}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactionoutputs_from_json(ptr0, len0);
        return TransactionOutputs.__wrap(ret);
    }
    /**
    * @returns {TransactionOutputs}
    */
    static new() {
        var ret = wasm.transactionoutputs_new();
        return TransactionOutputs.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.transactionoutputs_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {TransactionOutput}
    */
    get(index) {
        var ret = wasm.transactionoutputs_get(this.ptr, index);
        return TransactionOutput.__wrap(ret);
    }
    /**
    * @param {TransactionOutput} elem
    */
    add(elem) {
        _assertClass(elem, TransactionOutput);
        wasm.transactionoutputs_add(this.ptr, elem.ptr);
    }
}
module.exports.TransactionOutputs = TransactionOutputs;
/**
*/
class TransactionUnspentOutput {

    static __wrap(ptr) {
        const obj = Object.create(TransactionUnspentOutput.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactionunspentoutput_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionunspentoutput_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {TransactionUnspentOutput}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactionunspentoutput_from_bytes(ptr0, len0);
        return TransactionUnspentOutput.__wrap(ret);
    }
    /**
    * @param {TransactionInput} input
    * @param {TransactionOutput} output
    * @returns {TransactionUnspentOutput}
    */
    static new(input, output) {
        _assertClass(input, TransactionInput);
        _assertClass(output, TransactionOutput);
        var ret = wasm.transactionunspentoutput_new(input.ptr, output.ptr);
        return TransactionUnspentOutput.__wrap(ret);
    }
    /**
    * @returns {TransactionInput}
    */
    input() {
        var ret = wasm.transactionunspentoutput_input(this.ptr);
        return TransactionInput.__wrap(ret);
    }
    /**
    * @returns {TransactionOutput}
    */
    output() {
        var ret = wasm.transactionunspentoutput_output(this.ptr);
        return TransactionOutput.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    to_legacy_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionunspentoutput_to_legacy_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.TransactionUnspentOutput = TransactionUnspentOutput;
/**
*/
class TransactionUnspentOutputs {

    static __wrap(ptr) {
        const obj = Object.create(TransactionUnspentOutputs.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactionunspentoutputs_free(ptr);
    }
    /**
    * @returns {TransactionUnspentOutputs}
    */
    static new() {
        var ret = wasm.transactionunspentoutputs_new();
        return TransactionUnspentOutputs.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.transactionunspentoutputs_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {TransactionUnspentOutput}
    */
    get(index) {
        var ret = wasm.transactionunspentoutputs_get(this.ptr, index);
        return TransactionUnspentOutput.__wrap(ret);
    }
    /**
    * @param {TransactionUnspentOutput} elem
    */
    add(elem) {
        _assertClass(elem, TransactionUnspentOutput);
        wasm.transactionunspentoutputs_add(this.ptr, elem.ptr);
    }
}
module.exports.TransactionUnspentOutputs = TransactionUnspentOutputs;
/**
*/
class TransactionWitnessSet {

    static __wrap(ptr) {
        const obj = Object.create(TransactionWitnessSet.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactionwitnessset_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionwitnessset_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {TransactionWitnessSet}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactionwitnessset_from_bytes(ptr0, len0);
        return TransactionWitnessSet.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionwitnessset_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.transactionwitnessset_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {TransactionWitnessSet}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactionwitnessset_from_json(ptr0, len0);
        return TransactionWitnessSet.__wrap(ret);
    }
    /**
    * @param {Vkeywitnesses} vkeys
    */
    set_vkeys(vkeys) {
        _assertClass(vkeys, Vkeywitnesses);
        wasm.transactionwitnessset_set_vkeys(this.ptr, vkeys.ptr);
    }
    /**
    * @returns {Vkeywitnesses | undefined}
    */
    vkeys() {
        var ret = wasm.transactionwitnessset_vkeys(this.ptr);
        return ret === 0 ? undefined : Vkeywitnesses.__wrap(ret);
    }
    /**
    * @param {NativeScripts} native_scripts
    */
    set_native_scripts(native_scripts) {
        _assertClass(native_scripts, NativeScripts);
        wasm.transactionwitnessset_set_native_scripts(this.ptr, native_scripts.ptr);
    }
    /**
    * @returns {NativeScripts | undefined}
    */
    native_scripts() {
        var ret = wasm.transactionwitnessset_native_scripts(this.ptr);
        return ret === 0 ? undefined : NativeScripts.__wrap(ret);
    }
    /**
    * @param {BootstrapWitnesses} bootstraps
    */
    set_bootstraps(bootstraps) {
        _assertClass(bootstraps, BootstrapWitnesses);
        wasm.transactionwitnessset_set_bootstraps(this.ptr, bootstraps.ptr);
    }
    /**
    * @returns {BootstrapWitnesses | undefined}
    */
    bootstraps() {
        var ret = wasm.transactionwitnessset_bootstraps(this.ptr);
        return ret === 0 ? undefined : BootstrapWitnesses.__wrap(ret);
    }
    /**
    * @param {PlutusScripts} plutus_scripts
    */
    set_plutus_scripts(plutus_scripts) {
        _assertClass(plutus_scripts, PlutusScripts);
        wasm.transactionwitnessset_set_plutus_scripts(this.ptr, plutus_scripts.ptr);
    }
    /**
    * @returns {PlutusScripts | undefined}
    */
    plutus_scripts() {
        var ret = wasm.transactionwitnessset_plutus_scripts(this.ptr);
        return ret === 0 ? undefined : PlutusScripts.__wrap(ret);
    }
    /**
    * @param {PlutusList} plutus_data
    */
    set_plutus_data(plutus_data) {
        _assertClass(plutus_data, PlutusList);
        wasm.transactionwitnessset_set_plutus_data(this.ptr, plutus_data.ptr);
    }
    /**
    * @returns {PlutusList | undefined}
    */
    plutus_data() {
        var ret = wasm.transactionwitnessset_plutus_data(this.ptr);
        return ret === 0 ? undefined : PlutusList.__wrap(ret);
    }
    /**
    * @param {Redeemers} redeemers
    */
    set_redeemers(redeemers) {
        _assertClass(redeemers, Redeemers);
        wasm.transactionwitnessset_set_redeemers(this.ptr, redeemers.ptr);
    }
    /**
    * @param {PlutusScripts} plutus_scripts
    */
    set_plutus_v2_scripts(plutus_scripts) {
        _assertClass(plutus_scripts, PlutusScripts);
        wasm.transactionwitnessset_set_plutus_v2_scripts(this.ptr, plutus_scripts.ptr);
    }
    /**
    * @returns {Redeemers | undefined}
    */
    redeemers() {
        var ret = wasm.transactionwitnessset_redeemers(this.ptr);
        return ret === 0 ? undefined : Redeemers.__wrap(ret);
    }
    /**
    * @returns {PlutusScripts | undefined}
    */
    plutus_v2_scripts() {
        var ret = wasm.transactionwitnessset_plutus_v2_scripts(this.ptr);
        return ret === 0 ? undefined : PlutusScripts.__wrap(ret);
    }
    /**
    * @returns {TransactionWitnessSet}
    */
    static new() {
        var ret = wasm.transactionwitnessset_new();
        return TransactionWitnessSet.__wrap(ret);
    }
}
module.exports.TransactionWitnessSet = TransactionWitnessSet;
/**
* Builder de-duplicates witnesses as they are added
*/
class TransactionWitnessSetBuilder {

    static __wrap(ptr) {
        const obj = Object.create(TransactionWitnessSetBuilder.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactionwitnesssetbuilder_free(ptr);
    }
    /**
    * @param {Vkeywitness} vkey
    */
    add_vkey(vkey) {
        _assertClass(vkey, Vkeywitness);
        wasm.transactionwitnesssetbuilder_add_vkey(this.ptr, vkey.ptr);
    }
    /**
    * @param {BootstrapWitness} bootstrap
    */
    add_bootstrap(bootstrap) {
        _assertClass(bootstrap, BootstrapWitness);
        wasm.transactionwitnesssetbuilder_add_bootstrap(this.ptr, bootstrap.ptr);
    }
    /**
    * @param {NativeScript} native_script
    */
    add_native_script(native_script) {
        _assertClass(native_script, NativeScript);
        wasm.transactionwitnesssetbuilder_add_native_script(this.ptr, native_script.ptr);
    }
    /**
    * @param {PlutusScript} plutus_script
    */
    add_plutus_script(plutus_script) {
        _assertClass(plutus_script, PlutusScript);
        wasm.transactionwitnesssetbuilder_add_plutus_script(this.ptr, plutus_script.ptr);
    }
    /**
    * @param {PlutusScript} plutus_script
    */
    add_plutus_v2_script(plutus_script) {
        _assertClass(plutus_script, PlutusScript);
        wasm.transactionwitnesssetbuilder_add_plutus_v2_script(this.ptr, plutus_script.ptr);
    }
    /**
    * @param {PlutusData} plutus_datum
    */
    add_plutus_datum(plutus_datum) {
        _assertClass(plutus_datum, PlutusData);
        wasm.transactionwitnesssetbuilder_add_plutus_datum(this.ptr, plutus_datum.ptr);
    }
    /**
    * @param {Redeemer} redeemer
    */
    add_redeemer(redeemer) {
        _assertClass(redeemer, Redeemer);
        wasm.transactionwitnesssetbuilder_add_redeemer(this.ptr, redeemer.ptr);
    }
    /**
    * @param {RequiredWitnessSet} required_wits
    */
    add_required_wits(required_wits) {
        _assertClass(required_wits, RequiredWitnessSet);
        wasm.transactionwitnesssetbuilder_add_required_wits(this.ptr, required_wits.ptr);
    }
    /**
    * @returns {TransactionWitnessSetBuilder}
    */
    static new() {
        var ret = wasm.transactionwitnesssetbuilder_new();
        return TransactionWitnessSetBuilder.__wrap(ret);
    }
    /**
    * @param {TransactionWitnessSet} wit_set
    */
    add_existing(wit_set) {
        _assertClass(wit_set, TransactionWitnessSet);
        wasm.transactionwitnesssetbuilder_add_existing(this.ptr, wit_set.ptr);
    }
    /**
    * @returns {TransactionWitnessSet}
    */
    build() {
        var ret = wasm.transactionwitnesssetbuilder_build(this.ptr);
        return TransactionWitnessSet.__wrap(ret);
    }
}
module.exports.TransactionWitnessSetBuilder = TransactionWitnessSetBuilder;
/**
*/
class TransactionWitnessSets {

    static __wrap(ptr) {
        const obj = Object.create(TransactionWitnessSets.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactionwitnesssets_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionwitnesssets_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {TransactionWitnessSets}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactionwitnesssets_from_bytes(ptr0, len0);
        return TransactionWitnessSets.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.transactionwitnesssets_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.transactionwitnesssets_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {TransactionWitnessSets}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.transactionwitnesssets_from_json(ptr0, len0);
        return TransactionWitnessSets.__wrap(ret);
    }
    /**
    * @returns {TransactionWitnessSets}
    */
    static new() {
        var ret = wasm.transactionwitnesssets_new();
        return TransactionWitnessSets.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.transactionwitnesssets_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {TransactionWitnessSet}
    */
    get(index) {
        var ret = wasm.transactionwitnesssets_get(this.ptr, index);
        return TransactionWitnessSet.__wrap(ret);
    }
    /**
    * @param {TransactionWitnessSet} elem
    */
    add(elem) {
        _assertClass(elem, TransactionWitnessSet);
        wasm.transactionwitnesssets_add(this.ptr, elem.ptr);
    }
}
module.exports.TransactionWitnessSets = TransactionWitnessSets;
/**
*/
class URL {

    static __wrap(ptr) {
        const obj = Object.create(URL.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_url_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.url_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {URL}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.url_from_bytes(ptr0, len0);
        return URL.__wrap(ret);
    }
    /**
    * @param {string} url
    * @returns {URL}
    */
    static new(url) {
        var ptr0 = passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.url_new(ptr0, len0);
        return URL.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    url() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.url_url(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
module.exports.URL = URL;
/**
*/
class UnitInterval {

    static __wrap(ptr) {
        const obj = Object.create(UnitInterval.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_unitinterval_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.unitinterval_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {UnitInterval}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.unitinterval_from_bytes(ptr0, len0);
        return UnitInterval.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.unitinterval_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.unitinterval_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {UnitInterval}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.unitinterval_from_json(ptr0, len0);
        return UnitInterval.__wrap(ret);
    }
    /**
    * @returns {BigNum}
    */
    numerator() {
        var ret = wasm.unitinterval_numerator(this.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @returns {BigNum}
    */
    denominator() {
        var ret = wasm.unitinterval_denominator(this.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @param {BigNum} numerator
    * @param {BigNum} denominator
    * @returns {UnitInterval}
    */
    static new(numerator, denominator) {
        _assertClass(numerator, BigNum);
        _assertClass(denominator, BigNum);
        var ret = wasm.unitinterval_new(numerator.ptr, denominator.ptr);
        return UnitInterval.__wrap(ret);
    }
    /**
    * @param {number} float_number
    * @returns {UnitInterval}
    */
    static from_float(float_number) {
        var ret = wasm.unitinterval_from_float(float_number);
        return UnitInterval.__wrap(ret);
    }
}
module.exports.UnitInterval = UnitInterval;
/**
*/
class Update {

    static __wrap(ptr) {
        const obj = Object.create(Update.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_update_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.update_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Update}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.update_from_bytes(ptr0, len0);
        return Update.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.update_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.update_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {Update}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.update_from_json(ptr0, len0);
        return Update.__wrap(ret);
    }
    /**
    * @returns {ProposedProtocolParameterUpdates}
    */
    proposed_protocol_parameter_updates() {
        var ret = wasm.update_proposed_protocol_parameter_updates(this.ptr);
        return ProposedProtocolParameterUpdates.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    epoch() {
        var ret = wasm.update_epoch(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {ProposedProtocolParameterUpdates} proposed_protocol_parameter_updates
    * @param {number} epoch
    * @returns {Update}
    */
    static new(proposed_protocol_parameter_updates, epoch) {
        _assertClass(proposed_protocol_parameter_updates, ProposedProtocolParameterUpdates);
        var ret = wasm.update_new(proposed_protocol_parameter_updates.ptr, epoch);
        return Update.__wrap(ret);
    }
}
module.exports.Update = Update;
/**
*/
class VRFCert {

    static __wrap(ptr) {
        const obj = Object.create(VRFCert.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vrfcert_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vrfcert_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {VRFCert}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.vrfcert_from_bytes(ptr0, len0);
        return VRFCert.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vrfcert_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.vrfcert_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {VRFCert}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.vrfcert_from_json(ptr0, len0);
        return VRFCert.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    output() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vrfcert_output(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Uint8Array}
    */
    proof() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vrfcert_proof(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} output
    * @param {Uint8Array} proof
    * @returns {VRFCert}
    */
    static new(output, proof) {
        var ptr0 = passArray8ToWasm0(output, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passArray8ToWasm0(proof, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.vrfcert_new(ptr0, len0, ptr1, len1);
        return VRFCert.__wrap(ret);
    }
}
module.exports.VRFCert = VRFCert;
/**
*/
class VRFKeyHash {

    static __wrap(ptr) {
        const obj = Object.create(VRFKeyHash.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vrfkeyhash_free(ptr);
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {VRFKeyHash}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.vrfkeyhash_from_bytes(ptr0, len0);
        return VRFKeyHash.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vrfkeyhash_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} prefix
    * @returns {string}
    */
    to_bech32(prefix) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = passStringToWasm0(prefix, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            wasm.vrfkeyhash_to_bech32(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} bech_str
    * @returns {VRFKeyHash}
    */
    static from_bech32(bech_str) {
        var ptr0 = passStringToWasm0(bech_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.vrfkeyhash_from_bech32(ptr0, len0);
        return VRFKeyHash.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_hex() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vrfkeyhash_to_hex(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} hex
    * @returns {VRFKeyHash}
    */
    static from_hex(hex) {
        var ptr0 = passStringToWasm0(hex, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.vrfkeyhash_from_hex(ptr0, len0);
        return VRFKeyHash.__wrap(ret);
    }
}
module.exports.VRFKeyHash = VRFKeyHash;
/**
*/
class VRFVKey {

    static __wrap(ptr) {
        const obj = Object.create(VRFVKey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vrfvkey_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vrfvkey_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {VRFVKey}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.vrfvkey_from_bytes(ptr0, len0);
        return VRFVKey.__wrap(ret);
    }
    /**
    * @returns {VRFKeyHash}
    */
    hash() {
        var ret = wasm.vrfvkey_hash(this.ptr);
        return VRFKeyHash.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    to_raw_key() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vrfvkey_to_raw_key(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
module.exports.VRFVKey = VRFVKey;
/**
*/
class Value {

    static __wrap(ptr) {
        const obj = Object.create(Value.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_value_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.value_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Value}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.value_from_bytes(ptr0, len0);
        return Value.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.value_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.value_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {Value}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.value_from_json(ptr0, len0);
        return Value.__wrap(ret);
    }
    /**
    * @param {BigNum} coin
    * @returns {Value}
    */
    static new(coin) {
        _assertClass(coin, BigNum);
        var ret = wasm.value_new(coin.ptr);
        return Value.__wrap(ret);
    }
    /**
    * @param {MultiAsset} multiasset
    * @returns {Value}
    */
    static new_from_assets(multiasset) {
        _assertClass(multiasset, MultiAsset);
        var ret = wasm.value_new_from_assets(multiasset.ptr);
        return Value.__wrap(ret);
    }
    /**
    * @returns {Value}
    */
    static zero() {
        var ret = wasm.value_zero();
        return Value.__wrap(ret);
    }
    /**
    * @returns {boolean}
    */
    is_zero() {
        var ret = wasm.value_is_zero(this.ptr);
        return ret !== 0;
    }
    /**
    * @returns {BigNum}
    */
    coin() {
        var ret = wasm.value_coin(this.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @param {BigNum} coin
    */
    set_coin(coin) {
        _assertClass(coin, BigNum);
        wasm.value_set_coin(this.ptr, coin.ptr);
    }
    /**
    * @returns {MultiAsset | undefined}
    */
    multiasset() {
        var ret = wasm.value_multiasset(this.ptr);
        return ret === 0 ? undefined : MultiAsset.__wrap(ret);
    }
    /**
    * @param {MultiAsset} multiasset
    */
    set_multiasset(multiasset) {
        _assertClass(multiasset, MultiAsset);
        wasm.value_set_multiasset(this.ptr, multiasset.ptr);
    }
    /**
    * @param {Value} rhs
    * @returns {Value}
    */
    checked_add(rhs) {
        _assertClass(rhs, Value);
        var ret = wasm.value_checked_add(this.ptr, rhs.ptr);
        return Value.__wrap(ret);
    }
    /**
    * @param {Value} rhs_value
    * @returns {Value}
    */
    checked_sub(rhs_value) {
        _assertClass(rhs_value, Value);
        var ret = wasm.value_checked_sub(this.ptr, rhs_value.ptr);
        return Value.__wrap(ret);
    }
    /**
    * @param {Value} rhs_value
    * @returns {Value}
    */
    clamped_sub(rhs_value) {
        _assertClass(rhs_value, Value);
        var ret = wasm.value_clamped_sub(this.ptr, rhs_value.ptr);
        return Value.__wrap(ret);
    }
    /**
    * note: values are only partially comparable
    * @param {Value} rhs_value
    * @returns {number | undefined}
    */
    compare(rhs_value) {
        _assertClass(rhs_value, Value);
        var ret = wasm.value_compare(this.ptr, rhs_value.ptr);
        return ret === 0xFFFFFF ? undefined : ret;
    }
}
module.exports.Value = Value;
/**
*/
class Vkey {

    static __wrap(ptr) {
        const obj = Object.create(Vkey.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vkey_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vkey_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Vkey}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.vkey_from_bytes(ptr0, len0);
        return Vkey.__wrap(ret);
    }
    /**
    * @param {PublicKey} pk
    * @returns {Vkey}
    */
    static new(pk) {
        _assertClass(pk, PublicKey);
        var ret = wasm.vkey_new(pk.ptr);
        return Vkey.__wrap(ret);
    }
    /**
    * @returns {PublicKey}
    */
    public_key() {
        var ret = wasm.vkey_public_key(this.ptr);
        return PublicKey.__wrap(ret);
    }
}
module.exports.Vkey = Vkey;
/**
*/
class Vkeys {

    static __wrap(ptr) {
        const obj = Object.create(Vkeys.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vkeys_free(ptr);
    }
    /**
    * @returns {Vkeys}
    */
    static new() {
        var ret = wasm.vkeys_new();
        return Vkeys.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.vkeys_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {Vkey}
    */
    get(index) {
        var ret = wasm.vkeys_get(this.ptr, index);
        return Vkey.__wrap(ret);
    }
    /**
    * @param {Vkey} elem
    */
    add(elem) {
        _assertClass(elem, Vkey);
        wasm.vkeys_add(this.ptr, elem.ptr);
    }
}
module.exports.Vkeys = Vkeys;
/**
*/
class Vkeywitness {

    static __wrap(ptr) {
        const obj = Object.create(Vkeywitness.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vkeywitness_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vkeywitness_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Vkeywitness}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.vkeywitness_from_bytes(ptr0, len0);
        return Vkeywitness.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.vkeywitness_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.vkeywitness_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {Vkeywitness}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.vkeywitness_from_json(ptr0, len0);
        return Vkeywitness.__wrap(ret);
    }
    /**
    * @param {Vkey} vkey
    * @param {Ed25519Signature} signature
    * @returns {Vkeywitness}
    */
    static new(vkey, signature) {
        _assertClass(vkey, Vkey);
        _assertClass(signature, Ed25519Signature);
        var ret = wasm.vkeywitness_new(vkey.ptr, signature.ptr);
        return Vkeywitness.__wrap(ret);
    }
    /**
    * @returns {Vkey}
    */
    vkey() {
        var ret = wasm.vkeywitness_vkey(this.ptr);
        return Vkey.__wrap(ret);
    }
    /**
    * @returns {Ed25519Signature}
    */
    signature() {
        var ret = wasm.vkeywitness_signature(this.ptr);
        return Ed25519Signature.__wrap(ret);
    }
}
module.exports.Vkeywitness = Vkeywitness;
/**
*/
class Vkeywitnesses {

    static __wrap(ptr) {
        const obj = Object.create(Vkeywitnesses.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vkeywitnesses_free(ptr);
    }
    /**
    * @returns {Vkeywitnesses}
    */
    static new() {
        var ret = wasm.vkeywitnesses_new();
        return Vkeywitnesses.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.vkeywitnesses_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {Vkeywitness}
    */
    get(index) {
        var ret = wasm.vkeywitnesses_get(this.ptr, index);
        return Vkeywitness.__wrap(ret);
    }
    /**
    * @param {Vkeywitness} elem
    */
    add(elem) {
        _assertClass(elem, Vkeywitness);
        wasm.vkeywitnesses_add(this.ptr, elem.ptr);
    }
}
module.exports.Vkeywitnesses = Vkeywitnesses;
/**
*/
class Withdrawals {

    static __wrap(ptr) {
        const obj = Object.create(Withdrawals.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_withdrawals_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.withdrawals_to_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {Withdrawals}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.withdrawals_from_bytes(ptr0, len0);
        return Withdrawals.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_json() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.withdrawals_to_json(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {any}
    */
    to_js_value() {
        var ret = wasm.withdrawals_to_js_value(this.ptr);
        return takeObject(ret);
    }
    /**
    * @param {string} json
    * @returns {Withdrawals}
    */
    static from_json(json) {
        var ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.withdrawals_from_json(ptr0, len0);
        return Withdrawals.__wrap(ret);
    }
    /**
    * @returns {Withdrawals}
    */
    static new() {
        var ret = wasm.withdrawals_new();
        return Withdrawals.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.withdrawals_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {RewardAddress} key
    * @param {BigNum} value
    * @returns {BigNum | undefined}
    */
    insert(key, value) {
        _assertClass(key, RewardAddress);
        _assertClass(value, BigNum);
        var ret = wasm.withdrawals_insert(this.ptr, key.ptr, value.ptr);
        return ret === 0 ? undefined : BigNum.__wrap(ret);
    }
    /**
    * @param {RewardAddress} key
    * @returns {BigNum | undefined}
    */
    get(key) {
        _assertClass(key, RewardAddress);
        var ret = wasm.withdrawals_get(this.ptr, key.ptr);
        return ret === 0 ? undefined : BigNum.__wrap(ret);
    }
    /**
    * @returns {RewardAddresses}
    */
    keys() {
        var ret = wasm.withdrawals_keys(this.ptr);
        return RewardAddresses.__wrap(ret);
    }
}
module.exports.Withdrawals = Withdrawals;

module.exports.__wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

module.exports.__wbg_transaction_new = function(arg0) {
    var ret = Transaction.__wrap(arg0);
    return addHeapObject(ret);
};

module.exports.__wbindgen_string_new = function(arg0, arg1) {
    var ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

module.exports.__wbindgen_string_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    var ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

module.exports.__wbg_fetch_da4b562f370dc6f1 = function(arg0, arg1) {
    var ret = getObject(arg0).fetch(getObject(arg1));
    return addHeapObject(ret);
};

module.exports.__wbindgen_json_parse = function(arg0, arg1) {
    var ret = JSON.parse(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

module.exports.__wbindgen_json_serialize = function(arg0, arg1) {
    const obj = getObject(arg1);
    var ret = JSON.stringify(obj === undefined ? null : obj);
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

module.exports.__wbg_process_70251ed1291754d5 = function(arg0) {
    var ret = getObject(arg0).process;
    return addHeapObject(ret);
};

module.exports.__wbindgen_is_object = function(arg0) {
    const val = getObject(arg0);
    var ret = typeof(val) === 'object' && val !== null;
    return ret;
};

module.exports.__wbg_versions_b23f2588cdb2ddbb = function(arg0) {
    var ret = getObject(arg0).versions;
    return addHeapObject(ret);
};

module.exports.__wbg_node_61b8c9a82499895d = function(arg0) {
    var ret = getObject(arg0).node;
    return addHeapObject(ret);
};

module.exports.__wbindgen_is_string = function(arg0) {
    var ret = typeof(getObject(arg0)) === 'string';
    return ret;
};

module.exports.__wbg_require_2a93bc09fee45aca = function() { return handleError(function (arg0, arg1, arg2) {
    var ret = getObject(arg0).require(getStringFromWasm0(arg1, arg2));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_crypto_2f56257a38275dbd = function(arg0) {
    var ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

module.exports.__wbg_msCrypto_d07655bf62361f21 = function(arg0) {
    var ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};

module.exports.__wbg_getRandomValues_fb6b088efb6bead2 = function() { return handleError(function (arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
}, arguments) };

module.exports.__wbg_static_accessor_NODE_MODULE_33b45247c55045b0 = function() {
    var ret = module;
    return addHeapObject(ret);
};

module.exports.__wbg_randomFillSync_654a7797990fb8db = function() { return handleError(function (arg0, arg1, arg2) {
    getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
}, arguments) };

module.exports.__wbindgen_object_clone_ref = function(arg0) {
    var ret = getObject(arg0);
    return addHeapObject(ret);
};

module.exports.__wbg_instanceof_Response_d61ff4c524b8dbc4 = function(arg0) {
    var ret = getObject(arg0) instanceof Response;
    return ret;
};

module.exports.__wbg_json_0662bf961a0f5285 = function() { return handleError(function (arg0) {
    var ret = getObject(arg0).json();
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_set_5d0410fa55f5533e = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).set(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

module.exports.__wbg_headers_0fdd616fbc057820 = function(arg0) {
    var ret = getObject(arg0).headers;
    return addHeapObject(ret);
};

module.exports.__wbg_newwithstrandinit_155cb1478824b198 = function() { return handleError(function (arg0, arg1, arg2) {
    var ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbindgen_cb_drop = function(arg0) {
    const obj = takeObject(arg0).original;
    if (obj.cnt-- == 1) {
        obj.a = 0;
        return true;
    }
    var ret = false;
    return ret;
};

module.exports.__wbg_call_ba36642bd901572b = function() { return handleError(function (arg0, arg1) {
    var ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_self_bb69a836a72ec6e9 = function() { return handleError(function () {
    var ret = self.self;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_window_3304fc4b414c9693 = function() { return handleError(function () {
    var ret = window.window;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_globalThis_e0d21cabc6630763 = function() { return handleError(function () {
    var ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_global_8463719227271676 = function() { return handleError(function () {
    var ret = global.global;
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbindgen_is_undefined = function(arg0) {
    var ret = getObject(arg0) === undefined;
    return ret;
};

module.exports.__wbg_newnoargs_9fdd8f3961dd1bee = function(arg0, arg1) {
    var ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

module.exports.__wbg_call_3fc07b7d5fc9022d = function() { return handleError(function (arg0, arg1, arg2) {
    var ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

module.exports.__wbg_new_edbe38a4e21329dd = function() {
    var ret = new Object();
    return addHeapObject(ret);
};

module.exports.__wbg_new_c143a4f563f78c4e = function(arg0, arg1) {
    try {
        var state0 = {a: arg0, b: arg1};
        var cb0 = (arg0, arg1) => {
            const a = state0.a;
            state0.a = 0;
            try {
                return __wbg_adapter_1364(a, state0.b, arg0, arg1);
            } finally {
                state0.a = a;
            }
        };
        var ret = new Promise(cb0);
        return addHeapObject(ret);
    } finally {
        state0.a = state0.b = 0;
    }
};

module.exports.__wbg_resolve_cae3d8f752f5db88 = function(arg0) {
    var ret = Promise.resolve(getObject(arg0));
    return addHeapObject(ret);
};

module.exports.__wbg_then_c2361a9d5c9a4fcb = function(arg0, arg1) {
    var ret = getObject(arg0).then(getObject(arg1));
    return addHeapObject(ret);
};

module.exports.__wbg_then_6c9a4bf55755f9b8 = function(arg0, arg1, arg2) {
    var ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
};

module.exports.__wbg_buffer_9e184d6f785de5ed = function(arg0) {
    var ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

module.exports.__wbg_new_e8101319e4cf95fc = function(arg0) {
    var ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

module.exports.__wbg_set_e8ae7b27314e8b98 = function(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

module.exports.__wbg_length_2d56cb37075fcfb1 = function(arg0) {
    var ret = getObject(arg0).length;
    return ret;
};

module.exports.__wbg_newwithlength_a8d1dbcbe703a5c6 = function(arg0) {
    var ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
};

module.exports.__wbg_subarray_901ede8318da52a6 = function(arg0, arg1, arg2) {
    var ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

module.exports.__wbg_set_73349fc4814e0fc6 = function() { return handleError(function (arg0, arg1, arg2) {
    var ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
    return ret;
}, arguments) };

module.exports.__wbg_new_3a746f2619705add = function(arg0, arg1) {
    var ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

module.exports.__wbg_call_f54d3a6dadb199ca = function(arg0, arg1) {
    var ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
};

module.exports.__wbindgen_jsval_eq = function(arg0, arg1) {
    var ret = getObject(arg0) === getObject(arg1);
    return ret;
};

module.exports.__wbg_self_ac379e780a0d8b94 = function(arg0) {
    var ret = getObject(arg0).self;
    return addHeapObject(ret);
};

module.exports.__wbg_crypto_1e4302b85d4f64a2 = function(arg0) {
    var ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

module.exports.__wbg_getRandomValues_1b4ba144162a5c9e = function(arg0) {
    var ret = getObject(arg0).getRandomValues;
    return addHeapObject(ret);
};

module.exports.__wbg_require_6461b1e9a0d7c34a = function(arg0, arg1) {
    var ret = require(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

module.exports.__wbg_randomFillSync_1b52c8482374c55b = function(arg0, arg1, arg2) {
    getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
};

module.exports.__wbg_getRandomValues_1ef11e888e5228e9 = function(arg0, arg1, arg2) {
    getObject(arg0).getRandomValues(getArrayU8FromWasm0(arg1, arg2));
};

module.exports.__wbindgen_debug_string = function(arg0, arg1) {
    var ret = debugString(getObject(arg1));
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

module.exports.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

module.exports.__wbindgen_rethrow = function(arg0) {
    throw takeObject(arg0);
};

module.exports.__wbindgen_memory = function() {
    var ret = wasm.memory;
    return addHeapObject(ret);
};

module.exports.__wbindgen_closure_wrapper8449 = function(arg0, arg1, arg2) {
    var ret = makeMutClosure(arg0, arg1, 459, __wbg_adapter_32);
    return addHeapObject(ret);
};

const path = require('path').join(__dirname, 'cardano_multiplatform_lib_bg.wasm');
const bytes = require('fs').readFileSync(path);

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
wasm = wasmInstance.exports;
module.exports.__wasm = wasm;

