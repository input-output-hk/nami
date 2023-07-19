//! module to provide some handy interfaces atop the hashes so we have
//! the common interfaces for the project to work with.

use std::hash::{Hash, Hasher};
use std::str::FromStr;
use std::{error, fmt, result};

use cryptoxide::blake2b::Blake2b;
use cryptoxide::digest::Digest as _;
use cryptoxide::sha3;
use hex::FromHexError;

use crate::chain_crypto::bech32::{self, Bech32};

#[derive(Debug, PartialEq, Clone)]
pub enum Error {
    InvalidHashSize(usize, usize),
    InvalidHexEncoding(FromHexError),
}
impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Error::InvalidHashSize(sz, expected) => write!(
                f,
                "invalid hash size, expected {} but received {} bytes.",
                expected, sz
            ),
            Error::InvalidHexEncoding(_) => write!(f, "invalid hex encoding for hash value"),
        }
    }
}
impl error::Error for Error {
    fn source(&self) -> Option<&(dyn error::Error + 'static)> {
        match self {
            Error::InvalidHashSize(..) => None,
            Error::InvalidHexEncoding(err) => Some(err),
        }
    }
}

impl From<FromHexError> for Error {
    fn from(err: FromHexError) -> Self {
        Error::InvalidHexEncoding(err)
    }
}

pub type Result<T> = result::Result<T, Error>;

/// defines a blake2b object
macro_rules! define_blake2b_new {
    ($hash_ty:ty) => {
        impl $hash_ty {
            pub fn new(buf: &[u8]) -> Self {
                let mut b2b = Blake2b::new(Self::HASH_SIZE);
                let mut out = [0; Self::HASH_SIZE];
                b2b.input(buf);
                b2b.result(&mut out);
                Self::from(out)
            }
        }
    };
}
macro_rules! define_hash_object {
    ($hash_ty:ty, $constructor:expr, $hash_size:ident, $bech32_hrp:expr) => {
        impl $hash_ty {
            pub const HASH_SIZE: usize = $hash_size;

            pub fn as_hash_bytes(&self) -> &[u8; Self::HASH_SIZE] {
                &self.0
            }

            pub fn try_from_slice(slice: &[u8]) -> Result<Self> {
                if slice.len() != Self::HASH_SIZE {
                    return Err(Error::InvalidHashSize(slice.len(), Self::HASH_SIZE));
                }
                let mut buf = [0; Self::HASH_SIZE];

                buf[0..Self::HASH_SIZE].clone_from_slice(slice);
                Ok(Self::from(buf))
            }
        }
        impl AsRef<[u8]> for $hash_ty {
            fn as_ref(&self) -> &[u8] {
                self.0.as_ref()
            }
        }
        impl From<$hash_ty> for [u8; $hash_size] {
            fn from(bytes: $hash_ty) -> Self {
                bytes.0
            }
        }
        impl<'a> From<&'a $hash_ty> for &'a [u8; $hash_size] {
            fn from(bytes: &'a $hash_ty) -> Self {
                &bytes.0
            }
        }
        impl From<[u8; Self::HASH_SIZE]> for $hash_ty {
            fn from(bytes: [u8; Self::HASH_SIZE]) -> Self {
                $constructor(bytes)
            }
        }
        impl Hash for $hash_ty {
            fn hash<H: Hasher>(&self, state: &mut H) {
                self.0.hash(state)
            }
        }
        impl FromStr for $hash_ty {
            type Err = Error;
            fn from_str(s: &str) -> result::Result<Self, Self::Err> {
                let bytes = hex::decode(s)?;
                Self::try_from_slice(&bytes)
            }
        }
        impl fmt::Display for $hash_ty {
            fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
                write!(f, "{}", hex::encode(self.as_ref()))
            }
        }
        impl fmt::Debug for $hash_ty {
            fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
                f.write_str(concat!(stringify!($hash_ty), "(0x"))?;
                write!(f, "{}", hex::encode(self.as_ref()))?;
                f.write_str(")")
            }
        }
        impl Bech32 for $hash_ty {
            const BECH32_HRP: &'static str = $bech32_hrp;

            fn try_from_bech32_str(bech32_str: &str) -> bech32::Result<Self> {
                let bytes = bech32::try_from_bech32_to_bytes::<Self>(bech32_str)?;
                Self::try_from_slice(&bytes).map_err(bech32::Error::data_invalid)
            }

            fn to_bech32_str(&self) -> String {
                bech32::to_bech32_from_bytes::<Self>(self.as_ref())
            }
        }
    };
}

pub const HASH_SIZE_256: usize = 32;

/// Blake2b 256 bits
#[derive(PartialEq, Eq, PartialOrd, Ord, Copy, Clone)]
pub struct Blake2b256([u8; HASH_SIZE_256]);
define_hash_object!(Blake2b256, Blake2b256, HASH_SIZE_256, "blake2b256");
define_blake2b_new!(Blake2b256);

#[derive(PartialEq, Eq, PartialOrd, Ord, Copy, Clone)]
pub struct Sha3_256([u8; HASH_SIZE_256]);
define_hash_object!(Sha3_256, Sha3_256, HASH_SIZE_256, "sha3256");
impl Sha3_256 {
    pub fn new(buf: &[u8]) -> Self {
        let mut sh3 = sha3::Sha3_256::new();
        let mut out = [0; Self::HASH_SIZE];
        sh3.input(buf.as_ref());
        sh3.result(&mut out);
        Self::from(out)
    }
}
