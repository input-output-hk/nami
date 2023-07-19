use super::*;
use crate::chain_crypto;
use cbor_event::{self};

// This file was code-generated using an experimental CDDL to rust tool:
// https://github.com/Emurgo/cddl-codegen

#[derive(Debug)]
pub enum Key {
    Str(String),
    Uint(u64),
}

impl std::fmt::Display for Key {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Key::Str(x) => write!(f, "\"{}\"", x),
            Key::Uint(x) => write!(f, "{}", x),
        }
    }
}

#[derive(Debug)]
pub enum DeserializeFailure {
    BadAddressType(u8),
    BreakInDefiniteLen,
    CBOR(cbor_event::Error),
    DefiniteLenMismatch(u64, Option<u64>),
    DuplicateKey(Key),
    EndingBreakMissing,
    ExpectedNull,
    ExpectedBool,
    FixedValueMismatch {
        found: Key,
        expected: Key,
    },
    MandatoryFieldMissing(Key),
    Metadata(JsError),
    NoVariantMatched,
    OutOfRange {
        min: usize,
        max: usize,
        found: usize,
    },
    PublicKeyError(chain_crypto::PublicKeyError),
    SignatureError(chain_crypto::SignatureError),
    TagMismatch {
        found: u64,
        expected: u64,
    },
    UnknownKey(Key),
    UnexpectedKeyType(cbor_event::Type),
    VariableLenNatDecodeFailed,
}

#[derive(Debug)]
pub struct DeserializeError {
    location: Option<String>,
    failure: DeserializeFailure,
}

impl DeserializeError {
    pub fn new<T: Into<String>>(location: T, failure: DeserializeFailure) -> Self {
        Self {
            location: Some(location.into()),
            failure,
        }
    }

    pub fn annotate<T: Into<String>>(self, location: T) -> Self {
        match self.location {
            Some(loc) => Self::new(format!("{}.{}", location.into(), loc), self.failure),
            None => Self::new(location, self.failure),
        }
    }
}

impl std::fmt::Display for DeserializeError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match &self.location {
            Some(loc) => write!(f, "Deserialization failed in {} because: ", loc),
            None => write!(f, "Deserialization: "),
        }?;
        match &self.failure {
            DeserializeFailure::BadAddressType(header) => {
                write!(f, "Encountered unknown address header {:#08b}", header)
            }
            DeserializeFailure::BreakInDefiniteLen => write!(
                f,
                "Encountered CBOR Break while reading definite length sequence"
            ),
            DeserializeFailure::CBOR(e) => e.fmt(f),
            DeserializeFailure::DefiniteLenMismatch(found, expected) => {
                write!(f, "Definite length mismatch: found {}", found)?;
                if let Some(expected_elems) = expected {
                    write!(f, ", expected: {}", expected_elems)?;
                }
                Ok(())
            }
            DeserializeFailure::DuplicateKey(key) => write!(f, "Duplicate key: {}", key),
            DeserializeFailure::EndingBreakMissing => write!(f, "Missing ending CBOR Break"),
            DeserializeFailure::ExpectedNull => write!(f, "Expected null, found other type"),
            DeserializeFailure::ExpectedBool => write!(f, "Expected bool, found other type"),
            DeserializeFailure::FixedValueMismatch { found, expected } => {
                write!(f, "Expected fixed value {} found {}", expected, found)
            }
            DeserializeFailure::MandatoryFieldMissing(key) => {
                write!(f, "Mandatory field {} not found", key)
            }
            DeserializeFailure::Metadata(e) => write!(f, "Metadata error: {:?}", e),
            DeserializeFailure::NoVariantMatched => write!(f, "No variant matched"),
            DeserializeFailure::OutOfRange { min, max, found } => write!(
                f,
                "Out of range: {} - must be in range {} - {}",
                found, min, max
            ),
            DeserializeFailure::PublicKeyError(e) => write!(f, "PublicKeyError error: {}", e),
            DeserializeFailure::SignatureError(e) => write!(f, "Signature error: {}", e),
            DeserializeFailure::TagMismatch { found, expected } => {
                write!(f, "Expected tag {}, found {}", expected, found)
            }
            DeserializeFailure::UnknownKey(key) => write!(f, "Found unexpected key {}", key),
            DeserializeFailure::UnexpectedKeyType(ty) => {
                write!(f, "Found unexpected key of CBOR type {:?}", ty)
            }
            DeserializeFailure::VariableLenNatDecodeFailed => {
                write!(f, "Variable length natural number decode failed")
            }
        }
    }
}

impl From<DeserializeError> for JsError {
    fn from(e: DeserializeError) -> JsError {
        JsError::from_str(&e.to_string())
    }
}

impl From<DeserializeFailure> for DeserializeError {
    fn from(failure: DeserializeFailure) -> DeserializeError {
        DeserializeError {
            location: None,
            failure,
        }
    }
}

impl From<cbor_event::Error> for DeserializeError {
    fn from(err: cbor_event::Error) -> DeserializeError {
        DeserializeError {
            location: None,
            failure: DeserializeFailure::CBOR(err),
        }
    }
}

impl From<chain_crypto::SignatureError> for DeserializeError {
    fn from(err: chain_crypto::SignatureError) -> DeserializeError {
        DeserializeError {
            location: None,
            failure: DeserializeFailure::SignatureError(err),
        }
    }
}

impl From<chain_crypto::PublicKeyError> for DeserializeError {
    fn from(err: chain_crypto::PublicKeyError) -> DeserializeError {
        DeserializeError {
            location: None,
            failure: DeserializeFailure::PublicKeyError(err),
        }
    }
}

// Generic string error that is replaced with JsError on wasm builds but still usable from non-wasm builds
// since JsError panics when used for non-constants in non-wasm builds even just creating one

#[cfg(all(target_arch = "wasm32", not(target_os = "emscripten")))]
pub type JsError = wasm_bindgen::prelude::JsValue;

#[cfg(not(all(target_arch = "wasm32", not(target_os = "emscripten"))))]
#[derive(Debug, Clone)]
pub struct JsError {
    msg: String,
}

#[cfg(not(all(target_arch = "wasm32", not(target_os = "emscripten"))))]
impl JsError {
    pub fn from_str(s: &str) -> Self {
        Self { msg: s.to_owned() }
    }

    // to match JsValue's API even though to_string() exists
    pub fn as_string(&self) -> Option<String> {
        Some(self.msg.clone())
    }
}

#[cfg(not(all(target_arch = "wasm32", not(target_os = "emscripten"))))]
impl std::fmt::Display for JsError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.msg)
    }
}
