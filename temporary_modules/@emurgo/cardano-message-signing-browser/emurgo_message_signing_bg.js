import * as wasm from './emurgo_message_signing_bg.wasm';

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

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

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

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

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

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
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

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachegetFloat64Memory0 = null;
function getFloat64Memory0() {
    if (cachegetFloat64Memory0 === null || cachegetFloat64Memory0.buffer !== wasm.memory.buffer) {
        cachegetFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachegetFloat64Memory0;
}
/**
*/
export const LabelKind = Object.freeze({ Int:0,"0":"Int",Text:1,"1":"Text", });
/**
*/
export const SignedMessageKind = Object.freeze({ COSESIGN:0,"0":"COSESIGN",COSESIGN1:1,"1":"COSESIGN1", });
/**
*/
export const SigContext = Object.freeze({ Signature:0,"0":"Signature",Signature1:1,"1":"Signature1",CounterSignature:2,"2":"CounterSignature", });
/**
*/
export const CBORSpecialType = Object.freeze({ Bool:0,"0":"Bool",Float:1,"1":"Float",Unassigned:2,"2":"Unassigned",Break:3,"3":"Break",Undefined:4,"4":"Undefined",Null:5,"5":"Null", });
/**
*/
export const CBORValueKind = Object.freeze({ Int:0,"0":"Int",Bytes:1,"1":"Bytes",Text:2,"2":"Text",Array:3,"3":"Array",Object:4,"4":"Object",TaggedCBOR:5,"5":"TaggedCBOR",Special:6,"6":"Special", });
/**
*/
export const AlgorithmId = Object.freeze({
/**
*r" EdDSA (Pure EdDSA, not HashedEdDSA) - the algorithm used for Cardano addresses
*/
EdDSA:0,"0":"EdDSA",
/**
*r" ChaCha20/Poly1305 w/ 256-bit key, 128-bit tag
*/
ChaCha20Poly1305:1,"1":"ChaCha20Poly1305", });
/**
*/
export const KeyType = Object.freeze({
/**
*r" octet key pair
*/
OKP:0,"0":"OKP",
/**
*r" 2-coord EC
*/
EC2:1,"1":"EC2",Symmetric:2,"2":"Symmetric", });
/**
*/
export const ECKey = Object.freeze({ CRV:0,"0":"CRV",X:1,"1":"X",Y:2,"2":"Y",D:3,"3":"D", });
/**
*/
export const CurveType = Object.freeze({ P256:0,"0":"P256",P384:1,"1":"P384",P521:2,"2":"P521",X25519:3,"3":"X25519",X448:4,"4":"X448",Ed25519:5,"5":"Ed25519",Ed448:6,"6":"Ed448", });
/**
*/
export const KeyOperation = Object.freeze({ Sign:0,"0":"Sign",Verify:1,"1":"Verify",Encrypt:2,"2":"Encrypt",Decrypt:3,"3":"Decrypt",WrapKey:4,"4":"WrapKey",UnwrapKey:5,"5":"UnwrapKey",DeriveKey:6,"6":"DeriveKey",DeriveBits:7,"7":"DeriveBits", });
/**
*/
export class BigNum {

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
}
/**
*/
export class CBORArray {

    static __wrap(ptr) {
        const obj = Object.create(CBORArray.prototype);
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
        wasm.__wbg_cborarray_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cborarray_to_bytes(retptr, this.ptr);
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
    * @returns {CBORArray}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.cborarray_from_bytes(ptr0, len0);
        return CBORArray.__wrap(ret);
    }
    /**
    * @returns {CBORArray}
    */
    static new() {
        var ret = wasm.cborarray_new();
        return CBORArray.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.cborarray_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {CBORValue}
    */
    get(index) {
        var ret = wasm.cborarray_get(this.ptr, index);
        return CBORValue.__wrap(ret);
    }
    /**
    * @param {CBORValue} elem
    */
    add(elem) {
        _assertClass(elem, CBORValue);
        wasm.cborarray_add(this.ptr, elem.ptr);
    }
    /**
    * @param {boolean} use_definite
    */
    set_definite_encoding(use_definite) {
        wasm.cborarray_set_definite_encoding(this.ptr, use_definite);
    }
    /**
    * @returns {boolean}
    */
    is_definite() {
        var ret = wasm.cborarray_is_definite(this.ptr);
        return ret !== 0;
    }
}
/**
*/
export class CBORObject {

    static __wrap(ptr) {
        const obj = Object.create(CBORObject.prototype);
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
        wasm.__wbg_cborobject_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cborobject_to_bytes(retptr, this.ptr);
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
    * @returns {CBORObject}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.cborobject_from_bytes(ptr0, len0);
        return CBORObject.__wrap(ret);
    }
    /**
    * @returns {CBORObject}
    */
    static new() {
        var ret = wasm.cborobject_new();
        return CBORObject.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.cborobject_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {CBORValue} key
    * @param {CBORValue} value
    * @returns {CBORValue | undefined}
    */
    insert(key, value) {
        _assertClass(key, CBORValue);
        _assertClass(value, CBORValue);
        var ret = wasm.cborobject_insert(this.ptr, key.ptr, value.ptr);
        return ret === 0 ? undefined : CBORValue.__wrap(ret);
    }
    /**
    * @param {CBORValue} key
    * @returns {CBORValue | undefined}
    */
    get(key) {
        _assertClass(key, CBORValue);
        var ret = wasm.cborobject_get(this.ptr, key.ptr);
        return ret === 0 ? undefined : CBORValue.__wrap(ret);
    }
    /**
    * @returns {CBORArray}
    */
    keys() {
        var ret = wasm.cborobject_keys(this.ptr);
        return CBORArray.__wrap(ret);
    }
    /**
    * @param {boolean} use_definite
    */
    set_definite_encoding(use_definite) {
        wasm.cborobject_set_definite_encoding(this.ptr, use_definite);
    }
    /**
    * @returns {boolean}
    */
    is_definite() {
        var ret = wasm.cborobject_is_definite(this.ptr);
        return ret !== 0;
    }
}
/**
*/
export class CBORSpecial {

    static __wrap(ptr) {
        const obj = Object.create(CBORSpecial.prototype);
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
        wasm.__wbg_cborspecial_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cborspecial_to_bytes(retptr, this.ptr);
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
    * @returns {CBORSpecial}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.cborspecial_from_bytes(ptr0, len0);
        return CBORSpecial.__wrap(ret);
    }
    /**
    * @param {boolean} b
    * @returns {CBORSpecial}
    */
    static new_bool(b) {
        var ret = wasm.cborspecial_new_bool(b);
        return CBORSpecial.__wrap(ret);
    }
    /**
    * @param {number} u
    * @returns {CBORSpecial}
    */
    static new_unassigned(u) {
        var ret = wasm.cborspecial_new_unassigned(u);
        return CBORSpecial.__wrap(ret);
    }
    /**
    * @returns {CBORSpecial}
    */
    static new_break() {
        var ret = wasm.cborspecial_new_break();
        return CBORSpecial.__wrap(ret);
    }
    /**
    * @returns {CBORSpecial}
    */
    static new_null() {
        var ret = wasm.cborspecial_new_null();
        return CBORSpecial.__wrap(ret);
    }
    /**
    * @returns {CBORSpecial}
    */
    static new_undefined() {
        var ret = wasm.cborspecial_new_undefined();
        return CBORSpecial.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    kind() {
        var ret = wasm.cborspecial_kind(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {boolean | undefined}
    */
    as_bool() {
        var ret = wasm.cborspecial_as_bool(this.ptr);
        return ret === 0xFFFFFF ? undefined : ret !== 0;
    }
    /**
    * @returns {number | undefined}
    */
    as_float() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cborspecial_as_float(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getFloat64Memory0()[retptr / 8 + 1];
            return r0 === 0 ? undefined : r1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {number | undefined}
    */
    as_unassigned() {
        var ret = wasm.cborspecial_as_unassigned(this.ptr);
        return ret === 0xFFFFFF ? undefined : ret;
    }
}
/**
*/
export class CBORValue {

    static __wrap(ptr) {
        const obj = Object.create(CBORValue.prototype);
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
        wasm.__wbg_cborvalue_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cborvalue_to_bytes(retptr, this.ptr);
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
    * @returns {CBORValue}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.cborvalue_from_bytes(ptr0, len0);
        return CBORValue.__wrap(ret);
    }
    /**
    * @param {Int} int
    * @returns {CBORValue}
    */
    static new_int(int) {
        _assertClass(int, Int);
        var ret = wasm.cborvalue_new_int(int.ptr);
        return CBORValue.__wrap(ret);
    }
    /**
    * @param {Uint8Array} bytes
    * @returns {CBORValue}
    */
    static new_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.cborvalue_new_bytes(ptr0, len0);
        return CBORValue.__wrap(ret);
    }
    /**
    * @param {string} text
    * @returns {CBORValue}
    */
    static new_text(text) {
        var ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.cborvalue_new_text(ptr0, len0);
        return CBORValue.__wrap(ret);
    }
    /**
    * @param {CBORArray} arr
    * @returns {CBORValue}
    */
    static new_array(arr) {
        _assertClass(arr, CBORArray);
        var ret = wasm.cborvalue_new_array(arr.ptr);
        return CBORValue.__wrap(ret);
    }
    /**
    * @param {CBORObject} obj
    * @returns {CBORValue}
    */
    static new_object(obj) {
        _assertClass(obj, CBORObject);
        var ret = wasm.cborvalue_new_object(obj.ptr);
        return CBORValue.__wrap(ret);
    }
    /**
    * @param {TaggedCBOR} tagged
    * @returns {CBORValue}
    */
    static new_tagged(tagged) {
        _assertClass(tagged, TaggedCBOR);
        var ret = wasm.cborvalue_new_tagged(tagged.ptr);
        return CBORValue.__wrap(ret);
    }
    /**
    * @param {CBORSpecial} special
    * @returns {CBORValue}
    */
    static new_special(special) {
        _assertClass(special, CBORSpecial);
        var ret = wasm.cborvalue_new_special(special.ptr);
        return CBORValue.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    kind() {
        var ret = wasm.cborvalue_kind(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {Int | undefined}
    */
    as_int() {
        var ret = wasm.cborvalue_as_int(this.ptr);
        return ret === 0 ? undefined : Int.__wrap(ret);
    }
    /**
    * @returns {Uint8Array | undefined}
    */
    as_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cborvalue_as_bytes(retptr, this.ptr);
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
    /**
    * @returns {string | undefined}
    */
    as_text() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cborvalue_as_text(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            let v0;
            if (r0 !== 0) {
                v0 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1);
            }
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {CBORArray | undefined}
    */
    as_array() {
        var ret = wasm.cborvalue_as_array(this.ptr);
        return ret === 0 ? undefined : CBORArray.__wrap(ret);
    }
    /**
    * @returns {CBORObject | undefined}
    */
    as_object() {
        var ret = wasm.cborvalue_as_object(this.ptr);
        return ret === 0 ? undefined : CBORObject.__wrap(ret);
    }
    /**
    * @returns {TaggedCBOR | undefined}
    */
    as_tagged() {
        var ret = wasm.cborvalue_as_tagged(this.ptr);
        return ret === 0 ? undefined : TaggedCBOR.__wrap(ret);
    }
    /**
    * @returns {CBORSpecial | undefined}
    */
    as_special() {
        var ret = wasm.cborvalue_as_special(this.ptr);
        return ret === 0 ? undefined : CBORSpecial.__wrap(ret);
    }
}
/**
*/
export class COSEEncrypt {

    static __wrap(ptr) {
        const obj = Object.create(COSEEncrypt.prototype);
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
        wasm.__wbg_coseencrypt_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.coseencrypt_to_bytes(retptr, this.ptr);
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
    * @returns {COSEEncrypt}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.coseencrypt_from_bytes(ptr0, len0);
        return COSEEncrypt.__wrap(ret);
    }
    /**
    * @returns {Headers}
    */
    headers() {
        var ret = wasm.coseencrypt0_headers(this.ptr);
        return Headers.__wrap(ret);
    }
    /**
    * @returns {Uint8Array | undefined}
    */
    ciphertext() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.coseencrypt0_ciphertext(retptr, this.ptr);
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
    /**
    * @returns {COSERecipients}
    */
    recipients() {
        var ret = wasm.coseencrypt_recipients(this.ptr);
        return COSERecipients.__wrap(ret);
    }
    /**
    * @param {Headers} headers
    * @param {Uint8Array | undefined} ciphertext
    * @param {COSERecipients} recipients
    * @returns {COSEEncrypt}
    */
    static new(headers, ciphertext, recipients) {
        _assertClass(headers, Headers);
        var ptr0 = isLikeNone(ciphertext) ? 0 : passArray8ToWasm0(ciphertext, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        _assertClass(recipients, COSERecipients);
        var ret = wasm.coseencrypt_new(headers.ptr, ptr0, len0, recipients.ptr);
        return COSEEncrypt.__wrap(ret);
    }
}
/**
*/
export class COSEEncrypt0 {

    static __wrap(ptr) {
        const obj = Object.create(COSEEncrypt0.prototype);
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
        wasm.__wbg_coseencrypt0_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.coseencrypt0_to_bytes(retptr, this.ptr);
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
    * @returns {COSEEncrypt0}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.coseencrypt0_from_bytes(ptr0, len0);
        return COSEEncrypt0.__wrap(ret);
    }
    /**
    * @returns {Headers}
    */
    headers() {
        var ret = wasm.coseencrypt0_headers(this.ptr);
        return Headers.__wrap(ret);
    }
    /**
    * @returns {Uint8Array | undefined}
    */
    ciphertext() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.coseencrypt0_ciphertext(retptr, this.ptr);
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
    /**
    * @param {Headers} headers
    * @param {Uint8Array | undefined} ciphertext
    * @returns {COSEEncrypt0}
    */
    static new(headers, ciphertext) {
        _assertClass(headers, Headers);
        var ptr0 = isLikeNone(ciphertext) ? 0 : passArray8ToWasm0(ciphertext, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.coseencrypt0_new(headers.ptr, ptr0, len0);
        return COSEEncrypt0.__wrap(ret);
    }
}
/**
*/
export class COSEKey {

    static __wrap(ptr) {
        const obj = Object.create(COSEKey.prototype);
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
        wasm.__wbg_cosekey_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cosekey_to_bytes(retptr, this.ptr);
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
    * @returns {COSEKey}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.cosekey_from_bytes(ptr0, len0);
        return COSEKey.__wrap(ret);
    }
    /**
    * @param {Label} key_type
    */
    set_key_type(key_type) {
        _assertClass(key_type, Label);
        wasm.cosekey_set_key_type(this.ptr, key_type.ptr);
    }
    /**
    * @returns {Label}
    */
    key_type() {
        var ret = wasm.cosekey_key_type(this.ptr);
        return Label.__wrap(ret);
    }
    /**
    * @param {Uint8Array} key_id
    */
    set_key_id(key_id) {
        var ptr0 = passArray8ToWasm0(key_id, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.cosekey_set_key_id(this.ptr, ptr0, len0);
    }
    /**
    * @returns {Uint8Array | undefined}
    */
    key_id() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cosekey_key_id(retptr, this.ptr);
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
    /**
    * @param {Label} algorithm_id
    */
    set_algorithm_id(algorithm_id) {
        _assertClass(algorithm_id, Label);
        wasm.cosekey_set_algorithm_id(this.ptr, algorithm_id.ptr);
    }
    /**
    * @returns {Label | undefined}
    */
    algorithm_id() {
        var ret = wasm.cosekey_algorithm_id(this.ptr);
        return ret === 0 ? undefined : Label.__wrap(ret);
    }
    /**
    * @param {Labels} key_ops
    */
    set_key_ops(key_ops) {
        _assertClass(key_ops, Labels);
        wasm.cosekey_set_key_ops(this.ptr, key_ops.ptr);
    }
    /**
    * @returns {Labels | undefined}
    */
    key_ops() {
        var ret = wasm.cosekey_key_ops(this.ptr);
        return ret === 0 ? undefined : Labels.__wrap(ret);
    }
    /**
    * @param {Uint8Array} base_init_vector
    */
    set_base_init_vector(base_init_vector) {
        var ptr0 = passArray8ToWasm0(base_init_vector, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.cosekey_set_base_init_vector(this.ptr, ptr0, len0);
    }
    /**
    * @returns {Uint8Array | undefined}
    */
    base_init_vector() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cosekey_base_init_vector(retptr, this.ptr);
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
    /**
    * @param {Label} label
    * @returns {CBORValue | undefined}
    */
    header(label) {
        _assertClass(label, Label);
        var ret = wasm.cosekey_header(this.ptr, label.ptr);
        return ret === 0 ? undefined : CBORValue.__wrap(ret);
    }
    /**
    * @param {Label} label
    * @param {CBORValue} value
    */
    set_header(label, value) {
        _assertClass(label, Label);
        _assertClass(value, CBORValue);
        wasm.cosekey_set_header(this.ptr, label.ptr, value.ptr);
    }
    /**
    * @param {Label} key_type
    * @returns {COSEKey}
    */
    static new(key_type) {
        _assertClass(key_type, Label);
        var ret = wasm.cosekey_new(key_type.ptr);
        return COSEKey.__wrap(ret);
    }
}
/**
*/
export class COSERecipient {

    static __wrap(ptr) {
        const obj = Object.create(COSERecipient.prototype);
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
        wasm.__wbg_coserecipient_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.coserecipient_to_bytes(retptr, this.ptr);
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
    * @returns {COSERecipient}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.coserecipient_from_bytes(ptr0, len0);
        return COSERecipient.__wrap(ret);
    }
    /**
    * @returns {Headers}
    */
    headers() {
        var ret = wasm.coseencrypt0_headers(this.ptr);
        return Headers.__wrap(ret);
    }
    /**
    * @returns {Uint8Array | undefined}
    */
    ciphertext() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.coseencrypt0_ciphertext(retptr, this.ptr);
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
    /**
    * @param {Headers} headers
    * @param {Uint8Array | undefined} ciphertext
    * @returns {COSERecipient}
    */
    static new(headers, ciphertext) {
        _assertClass(headers, Headers);
        var ptr0 = isLikeNone(ciphertext) ? 0 : passArray8ToWasm0(ciphertext, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.coseencrypt0_new(headers.ptr, ptr0, len0);
        return COSERecipient.__wrap(ret);
    }
}
/**
*/
export class COSERecipients {

    static __wrap(ptr) {
        const obj = Object.create(COSERecipients.prototype);
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
        wasm.__wbg_coserecipients_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.coserecipients_to_bytes(retptr, this.ptr);
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
    * @returns {COSERecipients}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.coserecipients_from_bytes(ptr0, len0);
        return COSERecipients.__wrap(ret);
    }
    /**
    * @returns {COSERecipients}
    */
    static new() {
        var ret = wasm.coserecipients_new();
        return COSERecipients.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.coserecipients_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {COSERecipient}
    */
    get(index) {
        var ret = wasm.coserecipients_get(this.ptr, index);
        return COSERecipient.__wrap(ret);
    }
    /**
    * @param {COSERecipient} elem
    */
    add(elem) {
        _assertClass(elem, COSERecipient);
        wasm.coserecipients_add(this.ptr, elem.ptr);
    }
}
/**
*/
export class COSESign {

    static __wrap(ptr) {
        const obj = Object.create(COSESign.prototype);
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
        wasm.__wbg_cosesign_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cosesign_to_bytes(retptr, this.ptr);
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
    * @returns {COSESign}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.cosesign_from_bytes(ptr0, len0);
        return COSESign.__wrap(ret);
    }
    /**
    * @returns {Headers}
    */
    headers() {
        var ret = wasm.coseencrypt0_headers(this.ptr);
        return Headers.__wrap(ret);
    }
    /**
    * @returns {Uint8Array | undefined}
    */
    payload() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.coseencrypt0_ciphertext(retptr, this.ptr);
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
    /**
    * @returns {COSESignatures}
    */
    signatures() {
        var ret = wasm.cosesign_signatures(this.ptr);
        return COSESignatures.__wrap(ret);
    }
    /**
    * @param {Headers} headers
    * @param {Uint8Array | undefined} payload
    * @param {COSESignatures} signatures
    * @returns {COSESign}
    */
    static new(headers, payload, signatures) {
        _assertClass(headers, Headers);
        var ptr0 = isLikeNone(payload) ? 0 : passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        _assertClass(signatures, COSESignatures);
        var ret = wasm.cosesign_new(headers.ptr, ptr0, len0, signatures.ptr);
        return COSESign.__wrap(ret);
    }
}
/**
*/
export class COSESign1 {

    static __wrap(ptr) {
        const obj = Object.create(COSESign1.prototype);
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
        wasm.__wbg_cosesign1_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cosesign1_to_bytes(retptr, this.ptr);
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
    * @returns {COSESign1}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.cosesign1_from_bytes(ptr0, len0);
        return COSESign1.__wrap(ret);
    }
    /**
    * @returns {Headers}
    */
    headers() {
        var ret = wasm.coseencrypt0_headers(this.ptr);
        return Headers.__wrap(ret);
    }
    /**
    * @returns {Uint8Array | undefined}
    */
    payload() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.coseencrypt0_ciphertext(retptr, this.ptr);
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
    /**
    * @returns {Uint8Array}
    */
    signature() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cosesign1_signature(retptr, this.ptr);
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
    * For verifying, we will want to reverse-construct this SigStructure to check the signature against
    * # Arguments
    * * `external_aad` - External application data - see RFC 8152 section 4.3. Set to None if not using this.
    * @param {Uint8Array | undefined} external_aad
    * @param {Uint8Array | undefined} external_payload
    * @returns {SigStructure}
    */
    signed_data(external_aad, external_payload) {
        var ptr0 = isLikeNone(external_aad) ? 0 : passArray8ToWasm0(external_aad, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(external_payload) ? 0 : passArray8ToWasm0(external_payload, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.cosesign1_signed_data(this.ptr, ptr0, len0, ptr1, len1);
        return SigStructure.__wrap(ret);
    }
    /**
    * @param {Headers} headers
    * @param {Uint8Array | undefined} payload
    * @param {Uint8Array} signature
    * @returns {COSESign1}
    */
    static new(headers, payload, signature) {
        _assertClass(headers, Headers);
        var ptr0 = isLikeNone(payload) ? 0 : passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passArray8ToWasm0(signature, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.cosesign1_new(headers.ptr, ptr0, len0, ptr1, len1);
        return COSESign1.__wrap(ret);
    }
}
/**
*/
export class COSESign1Builder {

    static __wrap(ptr) {
        const obj = Object.create(COSESign1Builder.prototype);
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
        wasm.__wbg_cosesign1builder_free(ptr);
    }
    /**
    * @param {Headers} headers
    * @param {Uint8Array} payload
    * @param {boolean} is_payload_external
    * @returns {COSESign1Builder}
    */
    static new(headers, payload, is_payload_external) {
        _assertClass(headers, Headers);
        var ptr0 = passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.cosesign1builder_new(headers.ptr, ptr0, len0, is_payload_external);
        return COSESign1Builder.__wrap(ret);
    }
    /**
    */
    hash_payload() {
        wasm.cosesign1builder_hash_payload(this.ptr);
    }
    /**
    * @param {Uint8Array} external_aad
    */
    set_external_aad(external_aad) {
        var ptr0 = passArray8ToWasm0(external_aad, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.cosesign1builder_set_external_aad(this.ptr, ptr0, len0);
    }
    /**
    * @returns {SigStructure}
    */
    make_data_to_sign() {
        var ret = wasm.cosesign1builder_make_data_to_sign(this.ptr);
        return SigStructure.__wrap(ret);
    }
    /**
    * @param {Uint8Array} signed_sig_structure
    * @returns {COSESign1}
    */
    build(signed_sig_structure) {
        var ptr0 = passArray8ToWasm0(signed_sig_structure, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.cosesign1builder_build(this.ptr, ptr0, len0);
        return COSESign1.__wrap(ret);
    }
}
/**
*/
export class COSESignBuilder {

    static __wrap(ptr) {
        const obj = Object.create(COSESignBuilder.prototype);
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
        wasm.__wbg_cosesignbuilder_free(ptr);
    }
    /**
    * @param {Headers} headers
    * @param {Uint8Array} payload
    * @param {boolean} is_payload_external
    * @returns {COSESignBuilder}
    */
    static new(headers, payload, is_payload_external) {
        _assertClass(headers, Headers);
        var ptr0 = passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.cosesignbuilder_new(headers.ptr, ptr0, len0, is_payload_external);
        return COSESignBuilder.__wrap(ret);
    }
    /**
    */
    hash_payload() {
        wasm.cosesign1builder_hash_payload(this.ptr);
    }
    /**
    * @param {Uint8Array} external_aad
    */
    set_external_aad(external_aad) {
        var ptr0 = passArray8ToWasm0(external_aad, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.cosesign1builder_set_external_aad(this.ptr, ptr0, len0);
    }
    /**
    * @returns {SigStructure}
    */
    make_data_to_sign() {
        var ret = wasm.cosesignbuilder_make_data_to_sign(this.ptr);
        return SigStructure.__wrap(ret);
    }
    /**
    * @param {COSESignatures} signed_sig_structure
    * @returns {COSESign}
    */
    build(signed_sig_structure) {
        _assertClass(signed_sig_structure, COSESignatures);
        var ret = wasm.cosesignbuilder_build(this.ptr, signed_sig_structure.ptr);
        return COSESign.__wrap(ret);
    }
}
/**
*/
export class COSESignature {

    static __wrap(ptr) {
        const obj = Object.create(COSESignature.prototype);
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
        wasm.__wbg_cosesignature_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cosesignature_to_bytes(retptr, this.ptr);
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
    * @returns {COSESignature}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.cosesignature_from_bytes(ptr0, len0);
        return COSESignature.__wrap(ret);
    }
    /**
    * @returns {Headers}
    */
    headers() {
        var ret = wasm.coseencrypt0_headers(this.ptr);
        return Headers.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    signature() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cosesignature_signature(retptr, this.ptr);
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
    * @param {Headers} headers
    * @param {Uint8Array} signature
    * @returns {COSESignature}
    */
    static new(headers, signature) {
        _assertClass(headers, Headers);
        var ptr0 = passArray8ToWasm0(signature, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.cosesignature_new(headers.ptr, ptr0, len0);
        return COSESignature.__wrap(ret);
    }
}
/**
*/
export class COSESignatures {

    static __wrap(ptr) {
        const obj = Object.create(COSESignatures.prototype);
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
        wasm.__wbg_cosesignatures_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cosesignatures_to_bytes(retptr, this.ptr);
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
    * @returns {COSESignatures}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.cosesignatures_from_bytes(ptr0, len0);
        return COSESignatures.__wrap(ret);
    }
    /**
    * @returns {COSESignatures}
    */
    static new() {
        var ret = wasm.coserecipients_new();
        return COSESignatures.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.coserecipients_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {COSESignature}
    */
    get(index) {
        var ret = wasm.cosesignatures_get(this.ptr, index);
        return COSESignature.__wrap(ret);
    }
    /**
    * @param {COSESignature} elem
    */
    add(elem) {
        _assertClass(elem, COSESignature);
        wasm.cosesignatures_add(this.ptr, elem.ptr);
    }
}
/**
*/
export class CounterSignature {

    static __wrap(ptr) {
        const obj = Object.create(CounterSignature.prototype);
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
        wasm.__wbg_countersignature_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.countersignature_to_bytes(retptr, this.ptr);
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
    * @returns {CounterSignature}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.countersignature_from_bytes(ptr0, len0);
        return CounterSignature.__wrap(ret);
    }
    /**
    * @param {COSESignature} cose_signature
    * @returns {CounterSignature}
    */
    static new_single(cose_signature) {
        _assertClass(cose_signature, COSESignature);
        var ret = wasm.countersignature_new_single(cose_signature.ptr);
        return CounterSignature.__wrap(ret);
    }
    /**
    * @param {COSESignatures} cose_signatures
    * @returns {CounterSignature}
    */
    static new_multi(cose_signatures) {
        _assertClass(cose_signatures, COSESignatures);
        var ret = wasm.countersignature_new_multi(cose_signatures.ptr);
        return CounterSignature.__wrap(ret);
    }
    /**
    * @returns {COSESignatures}
    */
    signatures() {
        var ret = wasm.countersignature_signatures(this.ptr);
        return COSESignatures.__wrap(ret);
    }
}
/**
*/
export class EdDSA25519Key {

    static __wrap(ptr) {
        const obj = Object.create(EdDSA25519Key.prototype);
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
        wasm.__wbg_eddsa25519key_free(ptr);
    }
    /**
    * @param {Uint8Array} pubkey_bytes
    * @returns {EdDSA25519Key}
    */
    static new(pubkey_bytes) {
        var ptr0 = passArray8ToWasm0(pubkey_bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.eddsa25519key_new(ptr0, len0);
        return EdDSA25519Key.__wrap(ret);
    }
    /**
    * @param {Uint8Array} private_key_bytes
    */
    set_private_key(private_key_bytes) {
        var ptr0 = passArray8ToWasm0(private_key_bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.eddsa25519key_set_private_key(this.ptr, ptr0, len0);
    }
    /**
    */
    is_for_signing() {
        wasm.eddsa25519key_is_for_signing(this.ptr);
    }
    /**
    */
    is_for_verifying() {
        wasm.eddsa25519key_is_for_verifying(this.ptr);
    }
    /**
    * @returns {COSEKey}
    */
    build() {
        var ret = wasm.eddsa25519key_build(this.ptr);
        return COSEKey.__wrap(ret);
    }
}
/**
*/
export class HeaderMap {

    static __wrap(ptr) {
        const obj = Object.create(HeaderMap.prototype);
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
        wasm.__wbg_headermap_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.headermap_to_bytes(retptr, this.ptr);
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
    * @returns {HeaderMap}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.headermap_from_bytes(ptr0, len0);
        return HeaderMap.__wrap(ret);
    }
    /**
    * @param {Label} algorithm_id
    */
    set_algorithm_id(algorithm_id) {
        _assertClass(algorithm_id, Label);
        wasm.headermap_set_algorithm_id(this.ptr, algorithm_id.ptr);
    }
    /**
    * @returns {Label | undefined}
    */
    algorithm_id() {
        var ret = wasm.headermap_algorithm_id(this.ptr);
        return ret === 0 ? undefined : Label.__wrap(ret);
    }
    /**
    * @param {Labels} criticality
    */
    set_criticality(criticality) {
        _assertClass(criticality, Labels);
        wasm.headermap_set_criticality(this.ptr, criticality.ptr);
    }
    /**
    * @returns {Labels | undefined}
    */
    criticality() {
        var ret = wasm.headermap_criticality(this.ptr);
        return ret === 0 ? undefined : Labels.__wrap(ret);
    }
    /**
    * @param {Label} content_type
    */
    set_content_type(content_type) {
        _assertClass(content_type, Label);
        wasm.cosekey_set_algorithm_id(this.ptr, content_type.ptr);
    }
    /**
    * @returns {Label | undefined}
    */
    content_type() {
        var ret = wasm.cosekey_algorithm_id(this.ptr);
        return ret === 0 ? undefined : Label.__wrap(ret);
    }
    /**
    * @param {Uint8Array} key_id
    */
    set_key_id(key_id) {
        var ptr0 = passArray8ToWasm0(key_id, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.headermap_set_key_id(this.ptr, ptr0, len0);
    }
    /**
    * @returns {Uint8Array | undefined}
    */
    key_id() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.headermap_key_id(retptr, this.ptr);
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
    /**
    * @param {Uint8Array} init_vector
    */
    set_init_vector(init_vector) {
        var ptr0 = passArray8ToWasm0(init_vector, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.cosekey_set_base_init_vector(this.ptr, ptr0, len0);
    }
    /**
    * @returns {Uint8Array | undefined}
    */
    init_vector() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.cosekey_base_init_vector(retptr, this.ptr);
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
    /**
    * @param {Uint8Array} partial_init_vector
    */
    set_partial_init_vector(partial_init_vector) {
        var ptr0 = passArray8ToWasm0(partial_init_vector, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.headermap_set_partial_init_vector(this.ptr, ptr0, len0);
    }
    /**
    * @returns {Uint8Array | undefined}
    */
    partial_init_vector() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.headermap_partial_init_vector(retptr, this.ptr);
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
    /**
    * @param {CounterSignature} counter_signature
    */
    set_counter_signature(counter_signature) {
        _assertClass(counter_signature, CounterSignature);
        wasm.headermap_set_counter_signature(this.ptr, counter_signature.ptr);
    }
    /**
    * @returns {CounterSignature | undefined}
    */
    counter_signature() {
        var ret = wasm.headermap_counter_signature(this.ptr);
        return ret === 0 ? undefined : CounterSignature.__wrap(ret);
    }
    /**
    * @param {Label} label
    * @returns {CBORValue | undefined}
    */
    header(label) {
        _assertClass(label, Label);
        var ret = wasm.headermap_header(this.ptr, label.ptr);
        return ret === 0 ? undefined : CBORValue.__wrap(ret);
    }
    /**
    * @param {Label} label
    * @param {CBORValue} value
    */
    set_header(label, value) {
        _assertClass(label, Label);
        _assertClass(value, CBORValue);
        wasm.headermap_set_header(this.ptr, label.ptr, value.ptr);
    }
    /**
    * @returns {Labels}
    */
    keys() {
        var ret = wasm.headermap_keys(this.ptr);
        return Labels.__wrap(ret);
    }
    /**
    * @returns {HeaderMap}
    */
    static new() {
        var ret = wasm.headermap_new();
        return HeaderMap.__wrap(ret);
    }
}
/**
*/
export class Headers {

    static __wrap(ptr) {
        const obj = Object.create(Headers.prototype);
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
        wasm.__wbg_headers_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.headers_to_bytes(retptr, this.ptr);
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
    * @returns {Headers}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.headers_from_bytes(ptr0, len0);
        return Headers.__wrap(ret);
    }
    /**
    * @returns {ProtectedHeaderMap}
    */
    protected() {
        var ret = wasm.headers_protected(this.ptr);
        return ProtectedHeaderMap.__wrap(ret);
    }
    /**
    * @returns {HeaderMap}
    */
    unprotected() {
        var ret = wasm.headers_unprotected(this.ptr);
        return HeaderMap.__wrap(ret);
    }
    /**
    * @param {ProtectedHeaderMap} protected_
    * @param {HeaderMap} unprotected_
    * @returns {Headers}
    */
    static new(protected_, unprotected_) {
        _assertClass(protected_, ProtectedHeaderMap);
        _assertClass(unprotected_, HeaderMap);
        var ret = wasm.headers_new(protected_.ptr, unprotected_.ptr);
        return Headers.__wrap(ret);
    }
}
/**
*/
export class Int {

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
    * @param {BigNum} x
    * @returns {Int}
    */
    static new(x) {
        _assertClass(x, BigNum);
        var ptr0 = x.ptr;
        x.ptr = 0;
        var ret = wasm.int_new(ptr0);
        return Int.__wrap(ret);
    }
    /**
    * @param {BigNum} x
    * @returns {Int}
    */
    static new_negative(x) {
        _assertClass(x, BigNum);
        var ptr0 = x.ptr;
        x.ptr = 0;
        var ret = wasm.int_new_negative(ptr0);
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
    * @returns {BigNum | undefined}
    */
    as_positive() {
        var ret = wasm.int_as_positive(this.ptr);
        return ret === 0 ? undefined : BigNum.__wrap(ret);
    }
    /**
    * @returns {BigNum | undefined}
    */
    as_negative() {
        var ret = wasm.int_as_negative(this.ptr);
        return ret === 0 ? undefined : BigNum.__wrap(ret);
    }
    /**
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
}
/**
*/
export class Label {

    static __wrap(ptr) {
        const obj = Object.create(Label.prototype);
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
        wasm.__wbg_label_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.label_to_bytes(retptr, this.ptr);
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
    * @returns {Label}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.label_from_bytes(ptr0, len0);
        return Label.__wrap(ret);
    }
    /**
    * @param {Int} int
    * @returns {Label}
    */
    static new_int(int) {
        _assertClass(int, Int);
        var ret = wasm.label_new_int(int.ptr);
        return Label.__wrap(ret);
    }
    /**
    * @param {string} text
    * @returns {Label}
    */
    static new_text(text) {
        var ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.label_new_text(ptr0, len0);
        return Label.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    kind() {
        var ret = wasm.label_kind(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {Int | undefined}
    */
    as_int() {
        var ret = wasm.label_as_int(this.ptr);
        return ret === 0 ? undefined : Int.__wrap(ret);
    }
    /**
    * @returns {string | undefined}
    */
    as_text() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.label_as_text(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            let v0;
            if (r0 !== 0) {
                v0 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1);
            }
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number} id
    * @returns {Label}
    */
    static from_algorithm_id(id) {
        var ret = wasm.label_from_algorithm_id(id);
        return Label.__wrap(ret);
    }
    /**
    * @param {number} key_type
    * @returns {Label}
    */
    static from_key_type(key_type) {
        var ret = wasm.label_from_key_type(key_type);
        return Label.__wrap(ret);
    }
    /**
    * @param {number} ec_key
    * @returns {Label}
    */
    static from_ec_key(ec_key) {
        var ret = wasm.label_from_ec_key(ec_key);
        return Label.__wrap(ret);
    }
    /**
    * @param {number} curve_type
    * @returns {Label}
    */
    static from_curve_type(curve_type) {
        var ret = wasm.label_from_curve_type(curve_type);
        return Label.__wrap(ret);
    }
    /**
    * @param {number} key_op
    * @returns {Label}
    */
    static from_key_operation(key_op) {
        var ret = wasm.label_from_key_operation(key_op);
        return Label.__wrap(ret);
    }
}
/**
*/
export class Labels {

    static __wrap(ptr) {
        const obj = Object.create(Labels.prototype);
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
        wasm.__wbg_labels_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.labels_to_bytes(retptr, this.ptr);
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
    * @returns {Labels}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.labels_from_bytes(ptr0, len0);
        return Labels.__wrap(ret);
    }
    /**
    * @returns {Labels}
    */
    static new() {
        var ret = wasm.coserecipients_new();
        return Labels.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    len() {
        var ret = wasm.coserecipients_len(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} index
    * @returns {Label}
    */
    get(index) {
        var ret = wasm.labels_get(this.ptr, index);
        return Label.__wrap(ret);
    }
    /**
    * @param {Label} elem
    */
    add(elem) {
        _assertClass(elem, Label);
        wasm.labels_add(this.ptr, elem.ptr);
    }
}
/**
*/
export class PasswordEncryption {

    static __wrap(ptr) {
        const obj = Object.create(PasswordEncryption.prototype);
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
        wasm.__wbg_passwordencryption_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.passwordencryption_to_bytes(retptr, this.ptr);
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
    * @returns {PasswordEncryption}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.passwordencryption_from_bytes(ptr0, len0);
        return PasswordEncryption.__wrap(ret);
    }
    /**
    * @param {COSEEncrypt0} data
    * @returns {PasswordEncryption}
    */
    static new(data) {
        _assertClass(data, COSEEncrypt0);
        var ret = wasm.passwordencryption_new(data.ptr);
        return PasswordEncryption.__wrap(ret);
    }
}
/**
*/
export class ProtectedHeaderMap {

    static __wrap(ptr) {
        const obj = Object.create(ProtectedHeaderMap.prototype);
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
        wasm.__wbg_protectedheadermap_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.protectedheadermap_to_bytes(retptr, this.ptr);
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
    * @returns {ProtectedHeaderMap}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.protectedheadermap_from_bytes(ptr0, len0);
        return ProtectedHeaderMap.__wrap(ret);
    }
    /**
    * @returns {ProtectedHeaderMap}
    */
    static new_empty() {
        var ret = wasm.protectedheadermap_new_empty();
        return ProtectedHeaderMap.__wrap(ret);
    }
    /**
    * @param {HeaderMap} header_map
    * @returns {ProtectedHeaderMap}
    */
    static new(header_map) {
        _assertClass(header_map, HeaderMap);
        var ret = wasm.protectedheadermap_new(header_map.ptr);
        return ProtectedHeaderMap.__wrap(ret);
    }
    /**
    * @returns {HeaderMap}
    */
    deserialized_headers() {
        var ret = wasm.protectedheadermap_deserialized_headers(this.ptr);
        return HeaderMap.__wrap(ret);
    }
}
/**
*/
export class PubKeyEncryption {

    static __wrap(ptr) {
        const obj = Object.create(PubKeyEncryption.prototype);
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
        wasm.__wbg_pubkeyencryption_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.pubkeyencryption_to_bytes(retptr, this.ptr);
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
    * @returns {PubKeyEncryption}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.pubkeyencryption_from_bytes(ptr0, len0);
        return PubKeyEncryption.__wrap(ret);
    }
    /**
    * @param {COSEEncrypt} data
    * @returns {PubKeyEncryption}
    */
    static new(data) {
        _assertClass(data, COSEEncrypt);
        var ret = wasm.pubkeyencryption_new(data.ptr);
        return PubKeyEncryption.__wrap(ret);
    }
}
/**
*/
export class SigStructure {

    static __wrap(ptr) {
        const obj = Object.create(SigStructure.prototype);
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
        wasm.__wbg_sigstructure_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.sigstructure_to_bytes(retptr, this.ptr);
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
    * @returns {SigStructure}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.sigstructure_from_bytes(ptr0, len0);
        return SigStructure.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    context() {
        var ret = wasm.sigstructure_context(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {ProtectedHeaderMap}
    */
    body_protected() {
        var ret = wasm.sigstructure_body_protected(this.ptr);
        return ProtectedHeaderMap.__wrap(ret);
    }
    /**
    * @returns {ProtectedHeaderMap | undefined}
    */
    sign_protected() {
        var ret = wasm.sigstructure_sign_protected(this.ptr);
        return ret === 0 ? undefined : ProtectedHeaderMap.__wrap(ret);
    }
    /**
    * @returns {Uint8Array}
    */
    external_aad() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.sigstructure_external_aad(retptr, this.ptr);
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
    payload() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.sigstructure_payload(retptr, this.ptr);
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
    * @param {ProtectedHeaderMap} sign_protected
    */
    set_sign_protected(sign_protected) {
        _assertClass(sign_protected, ProtectedHeaderMap);
        wasm.sigstructure_set_sign_protected(this.ptr, sign_protected.ptr);
    }
    /**
    * @param {number} context
    * @param {ProtectedHeaderMap} body_protected
    * @param {Uint8Array} external_aad
    * @param {Uint8Array} payload
    * @returns {SigStructure}
    */
    static new(context, body_protected, external_aad, payload) {
        _assertClass(body_protected, ProtectedHeaderMap);
        var ptr0 = passArray8ToWasm0(external_aad, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
        var len1 = WASM_VECTOR_LEN;
        var ret = wasm.sigstructure_new(context, body_protected.ptr, ptr0, len0, ptr1, len1);
        return SigStructure.__wrap(ret);
    }
}
/**
*/
export class SignedMessage {

    static __wrap(ptr) {
        const obj = Object.create(SignedMessage.prototype);
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
        wasm.__wbg_signedmessage_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.signedmessage_to_bytes(retptr, this.ptr);
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
    * @returns {SignedMessage}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.signedmessage_from_bytes(ptr0, len0);
        return SignedMessage.__wrap(ret);
    }
    /**
    * @param {COSESign} cose_sign
    * @returns {SignedMessage}
    */
    static new_cose_sign(cose_sign) {
        _assertClass(cose_sign, COSESign);
        var ret = wasm.signedmessage_new_cose_sign(cose_sign.ptr);
        return SignedMessage.__wrap(ret);
    }
    /**
    * @param {COSESign1} cose_sign1
    * @returns {SignedMessage}
    */
    static new_cose_sign1(cose_sign1) {
        _assertClass(cose_sign1, COSESign1);
        var ret = wasm.signedmessage_new_cose_sign1(cose_sign1.ptr);
        return SignedMessage.__wrap(ret);
    }
    /**
    * @param {string} s
    * @returns {SignedMessage}
    */
    static from_user_facing_encoding(s) {
        var ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.signedmessage_from_user_facing_encoding(ptr0, len0);
        return SignedMessage.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    to_user_facing_encoding() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.signedmessage_to_user_facing_encoding(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {number}
    */
    kind() {
        var ret = wasm.signedmessage_kind(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {COSESign | undefined}
    */
    as_cose_sign() {
        var ret = wasm.signedmessage_as_cose_sign(this.ptr);
        return ret === 0 ? undefined : COSESign.__wrap(ret);
    }
    /**
    * @returns {COSESign1 | undefined}
    */
    as_cose_sign1() {
        var ret = wasm.signedmessage_as_cose_sign1(this.ptr);
        return ret === 0 ? undefined : COSESign1.__wrap(ret);
    }
}
/**
*/
export class TaggedCBOR {

    static __wrap(ptr) {
        const obj = Object.create(TaggedCBOR.prototype);
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
        wasm.__wbg_taggedcbor_free(ptr);
    }
    /**
    * @returns {Uint8Array}
    */
    to_bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.taggedcbor_to_bytes(retptr, this.ptr);
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
    * @returns {TaggedCBOR}
    */
    static from_bytes(bytes) {
        var ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.taggedcbor_from_bytes(ptr0, len0);
        return TaggedCBOR.__wrap(ret);
    }
    /**
    * @returns {BigNum}
    */
    tag() {
        var ret = wasm.taggedcbor_tag(this.ptr);
        return BigNum.__wrap(ret);
    }
    /**
    * @returns {CBORValue}
    */
    value() {
        var ret = wasm.taggedcbor_value(this.ptr);
        return CBORValue.__wrap(ret);
    }
    /**
    * @param {BigNum} tag
    * @param {CBORValue} value
    * @returns {TaggedCBOR}
    */
    static new(tag, value) {
        _assertClass(tag, BigNum);
        var ptr0 = tag.ptr;
        tag.ptr = 0;
        _assertClass(value, CBORValue);
        var ret = wasm.taggedcbor_new(ptr0, value.ptr);
        return TaggedCBOR.__wrap(ret);
    }
}

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

export function __wbindgen_string_new(arg0, arg1) {
    var ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export function __wbindgen_debug_string(arg0, arg1) {
    var ret = debugString(getObject(arg1));
    var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len0 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len0;
    getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export function __wbindgen_rethrow(arg0) {
    throw takeObject(arg0);
};

