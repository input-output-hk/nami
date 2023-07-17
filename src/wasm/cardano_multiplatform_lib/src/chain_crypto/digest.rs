//! module to provide some handy interfaces atop the hashes so we have
//! the common interfaces for the project to work with.

use std::convert::TryFrom;
use std::hash::{Hash, Hasher};
use std::str::FromStr;
use std::{error, fmt, result};

use cryptoxide::blake2b::Blake2b;
use cryptoxide::digest::Digest as _;
use cryptoxide::sha3;
use hex::FromHexError;

use crate::typed_bytes::ByteSlice;

use crate::chain_crypto::bech32::{self, Bech32};
use crate::chain_crypto::hash::{Blake2b256, Sha3_256};

#[derive(Debug, PartialEq, Clone)]
pub enum Error {
    InvalidDigestSize { got: usize, expected: usize },
    InvalidHexEncoding(FromHexError),
}
impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Error::InvalidDigestSize { got: sz, expected } => write!(
                f,
                "invalid digest size, expected {} but received {} bytes.",
                expected, sz
            ),
            Error::InvalidHexEncoding(_) => write!(f, "invalid hex encoding for digest value"),
        }
    }
}

impl error::Error for Error {
    fn source(&self) -> Option<&(dyn error::Error + 'static)> {
        match self {
            Error::InvalidDigestSize {
                got: _,
                expected: _,
            } => None,
            Error::InvalidHexEncoding(err) => Some(err),
        }
    }
}

impl From<FromHexError> for Error {
    fn from(err: FromHexError) -> Self {
        Error::InvalidHexEncoding(err)
    }
}

#[derive(Debug, Copy, Clone)]
pub struct TryFromSliceError(());

impl fmt::Display for TryFromSliceError {
    #[inline]
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        fmt::Display::fmt("could not convert slice to digest", f)
    }
}

pub trait DigestAlg {
    const HASH_SIZE: usize;
    type DigestData: Clone + PartialEq + Hash + Send + AsRef<[u8]>;
    type DigestContext: Clone;

    fn try_from_slice(slice: &[u8]) -> Result<Self::DigestData, Error>;
    fn new() -> Self::DigestContext;
    fn append_data(ctx: &mut Self::DigestContext, data: &[u8]);
    fn finalize(ctx: Self::DigestContext) -> Self::DigestData;
}

impl DigestAlg for Blake2b256 {
    const HASH_SIZE: usize = 32;
    type DigestData = [u8; Self::HASH_SIZE];
    type DigestContext = Blake2b;

    fn try_from_slice(slice: &[u8]) -> Result<Self::DigestData, Error> {
        if slice.len() == Self::HASH_SIZE {
            let mut out = [0u8; Self::HASH_SIZE];
            out.copy_from_slice(slice);
            Ok(out)
        } else {
            Err(Error::InvalidDigestSize {
                expected: Self::HASH_SIZE,
                got: slice.len(),
            })
        }
    }

    fn new() -> Self::DigestContext {
        Blake2b::new(Self::HASH_SIZE)
    }

    fn append_data(ctx: &mut Self::DigestContext, data: &[u8]) {
        ctx.input(data)
    }

    fn finalize(mut ctx: Self::DigestContext) -> Self::DigestData {
        let mut out: Self::DigestData = [0; Self::HASH_SIZE];
        ctx.result(&mut out);
        out
    }
}

impl DigestAlg for Sha3_256 {
    const HASH_SIZE: usize = 32;
    type DigestData = [u8; Self::HASH_SIZE];
    type DigestContext = sha3::Sha3_256;

    fn try_from_slice(slice: &[u8]) -> Result<Self::DigestData, Error> {
        if slice.len() == Self::HASH_SIZE {
            let mut out = [0u8; Self::HASH_SIZE];
            out.copy_from_slice(slice);
            Ok(out)
        } else {
            Err(Error::InvalidDigestSize {
                expected: Self::HASH_SIZE,
                got: slice.len(),
            })
        }
    }

    fn new() -> Self::DigestContext {
        sha3::Sha3_256::new()
    }

    fn append_data(ctx: &mut Self::DigestContext, data: &[u8]) {
        ctx.input(data)
    }

    fn finalize(mut ctx: Self::DigestContext) -> Self::DigestData {
        let mut out: Self::DigestData = [0; Self::HASH_SIZE];
        ctx.result(&mut out);
        out
    }
}

/// A Digest Context for the H digest algorithm
pub struct Context<H: DigestAlg>(H::DigestContext);

impl<H: DigestAlg> Clone for Context<H> {
    fn clone(&self) -> Self {
        Self(self.0.clone())
    }
}

impl<H: DigestAlg> Context<H> {
    /// Create a new digest context
    pub fn new() -> Self {
        Self(H::new())
    }

    /// Append data in the context
    pub fn append_data(&mut self, data: &[u8]) {
        H::append_data(&mut self.0, data)
    }

    /// Finalize a context and create a digest
    pub fn finalize(self) -> Digest<H> {
        Digest(H::finalize(self.0))
    }
}

pub struct Digest<H: DigestAlg>(H::DigestData);

impl<H: DigestAlg> Clone for Digest<H> {
    fn clone(&self) -> Self {
        Self(self.0.clone())
    }
}

macro_rules! define_from_instances {
    ($hash_ty:ty, $hash_size:expr, $bech32_hrp:expr) => {
        impl From<Digest<$hash_ty>> for [u8; $hash_size] {
            fn from(digest: Digest<$hash_ty>) -> Self {
                digest.0
            }
        }

        impl<'a> From<&'a Digest<$hash_ty>> for &'a [u8; $hash_size] {
            fn from(digest: &'a Digest<$hash_ty>) -> Self {
                &digest.0
            }
        }

        impl From<[u8; $hash_size]> for Digest<$hash_ty> {
            fn from(bytes: [u8; $hash_size]) -> Self {
                Digest(bytes)
            }
        }
        impl From<$hash_ty> for Digest<$hash_ty> {
            fn from(bytes: $hash_ty) -> Self {
                let out: [u8; $hash_size] = bytes.into();
                out.into()
            }
        }
        impl Bech32 for Digest<$hash_ty> {
            const BECH32_HRP: &'static str = $bech32_hrp;

            fn try_from_bech32_str(bech32_str: &str) -> bech32::Result<Self> {
                let bytes = bech32::try_from_bech32_to_bytes::<Self>(bech32_str)?;
                Digest::try_from(&bytes[..]).map_err(bech32::Error::data_invalid)
            }

            fn to_bech32_str(&self) -> String {
                bech32::to_bech32_from_bytes::<Self>(self.as_ref())
            }
        }
    };
}

define_from_instances!(Sha3_256, 32, "sha3");
define_from_instances!(Blake2b256, 32, "blake2b");

unsafe impl<H: DigestAlg> Send for Digest<H> {}

impl<H: DigestAlg> PartialEq for Digest<H> {
    fn eq(&self, other: &Self) -> bool {
        self.0 == other.0
    }
}

impl<H: DigestAlg> Eq for Digest<H> {}

impl<H: DigestAlg> PartialOrd for Digest<H> {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

impl<H: DigestAlg> Ord for Digest<H> {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.as_ref().cmp(other.as_ref())
    }
}

impl<H: DigestAlg> AsRef<[u8]> for Digest<H> {
    fn as_ref(&self) -> &[u8] {
        self.0.as_ref()
    }
}

impl<H: DigestAlg> Hash for Digest<H> {
    fn hash<HA: Hasher>(&self, state: &mut HA) {
        self.0.hash(state)
    }
}

impl<H: DigestAlg> TryFrom<&[u8]> for Digest<H> {
    type Error = Error;
    fn try_from(slice: &[u8]) -> Result<Digest<H>, Self::Error> {
        <H as DigestAlg>::try_from_slice(slice).map(Digest)
    }
}

impl<H: DigestAlg> FromStr for Digest<H> {
    type Err = Error;
    fn from_str(s: &str) -> result::Result<Digest<H>, Self::Err> {
        let bytes = hex::decode(s)?;
        Digest::try_from(&bytes[..])
    }
}

impl<H: DigestAlg> fmt::Display for Digest<H> {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", hex::encode(self.as_ref()))
    }
}
impl<H: DigestAlg> fmt::Debug for Digest<H> {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        f.write_str(concat!(stringify!($hash_ty), "(0x"))?;
        write!(f, "{}", hex::encode(self.as_ref()))?;
        f.write_str(")")
    }
}

impl<H: DigestAlg> Digest<H> {
    /// Get the digest of a slice of data
    pub fn digest(slice: &[u8]) -> Self {
        let mut ctx = Context::new();
        ctx.append_data(slice);
        ctx.finalize()
    }
}

use std::marker::PhantomData;

/// A typed version of Digest
pub struct DigestOf<H: DigestAlg, T> {
    inner: Digest<H>,
    marker: PhantomData<T>,
}

unsafe impl<H: DigestAlg, T> Send for DigestOf<H, T> {}

impl<H: DigestAlg, T> Clone for DigestOf<H, T> {
    fn clone(&self) -> Self {
        DigestOf {
            inner: self.inner.clone(),
            marker: self.marker.clone(),
        }
    }
}

impl<H: DigestAlg, T> From<DigestOf<H, T>> for Digest<H> {
    fn from(d: DigestOf<H, T>) -> Self {
        d.inner
    }
}

impl<H: DigestAlg, T> From<Digest<H>> for DigestOf<H, T> {
    fn from(d: Digest<H>) -> Self {
        DigestOf {
            inner: d,
            marker: PhantomData,
        }
    }
}

impl<H: DigestAlg, T> PartialEq for DigestOf<H, T> {
    fn eq(&self, other: &Self) -> bool {
        &self.inner == &other.inner
    }
}

impl<H: DigestAlg, T> Eq for DigestOf<H, T> {}

impl<H: DigestAlg, T> PartialOrd for DigestOf<H, T> {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        self.inner.partial_cmp(&other.inner)
    }
}

impl<H: DigestAlg, T> Ord for DigestOf<H, T> {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.inner.cmp(&other.inner)
    }
}

impl<H: DigestAlg, T> AsRef<[u8]> for DigestOf<H, T> {
    fn as_ref(&self) -> &[u8] {
        self.inner.as_ref()
    }
}

impl<H: DigestAlg, T> Hash for DigestOf<H, T> {
    fn hash<HA: Hasher>(&self, state: &mut HA) {
        self.inner.hash(state)
    }
}

impl<H: DigestAlg, T> TryFrom<&[u8]> for DigestOf<H, T> {
    type Error = Error;
    fn try_from(slice: &[u8]) -> Result<Self, Self::Error> {
        Digest::<H>::try_from(slice).map(|d| d.into())
    }
}

impl<H: DigestAlg, T> FromStr for DigestOf<H, T> {
    type Err = Error;
    fn from_str(s: &str) -> result::Result<Self, Self::Err> {
        Digest::<H>::from_str(s).map(|d| d.into())
    }
}

impl<H: DigestAlg, T> fmt::Display for DigestOf<H, T> {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        self.inner.fmt(f)
    }
}
impl<H: DigestAlg, T> fmt::Debug for DigestOf<H, T> {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        self.inner.fmt(f)
    }
}

impl<H: DigestAlg, T> DigestOf<H, T> {
    /// Coerce a digest of T, to a digest of U
    pub fn coerce<U>(&self) -> DigestOf<H, U> {
        DigestOf {
            inner: self.inner.clone(),
            marker: PhantomData,
        }
    }

    pub fn digest_byteslice<'a>(byteslice: &ByteSlice<'a, T>) -> Self {
        let mut ctx = Context::new();
        ctx.append_data(byteslice.as_slice());
        DigestOf {
            inner: ctx.finalize(),
            marker: PhantomData,
        }
    }

    /// Get the digest of object T, given its AsRef<[u8]> implementation
    pub fn digest(obj: &T) -> Self
    where
        T: AsRef<[u8]>,
    {
        let mut ctx = Context::new();
        ctx.append_data(obj.as_ref());
        DigestOf {
            inner: ctx.finalize(),
            marker: PhantomData,
        }
    }

    /// Get the digest of object T, given its serialization function in closure
    pub fn digest_with<F>(obj: &T, f: F) -> Self
    where
        F: FnOnce(&T) -> &[u8],
    {
        let mut ctx = Context::new();
        ctx.append_data(f(obj));
        DigestOf {
            inner: ctx.finalize(),
            marker: PhantomData,
        }
    }
}

macro_rules! typed_define_from_instances {
    ($hash_ty:ty, $hash_size:expr, $bech32_hrp:expr) => {
        impl<T> From<DigestOf<$hash_ty, T>> for [u8; $hash_size] {
            fn from(digest: DigestOf<$hash_ty, T>) -> Self {
                digest.inner.into()
            }
        }
        impl<'a, T> From<&'a DigestOf<$hash_ty, T>> for &'a [u8; $hash_size] {
            fn from(digest: &'a DigestOf<$hash_ty, T>) -> Self {
                (&digest.inner).into()
            }
        }

        impl<T> From<[u8; $hash_size]> for DigestOf<$hash_ty, T> {
            fn from(bytes: [u8; $hash_size]) -> Self {
                Digest::from(bytes).into()
            }
        }

        impl<T> From<$hash_ty> for DigestOf<$hash_ty, T> {
            fn from(bytes: $hash_ty) -> Self {
                let out: [u8; $hash_size] = bytes.into();
                out.into()
            }
        }
        impl<T> Bech32 for DigestOf<$hash_ty, T> {
            const BECH32_HRP: &'static str = $bech32_hrp;

            fn try_from_bech32_str(bech32_str: &str) -> bech32::Result<Self> {
                let bytes = bech32::try_from_bech32_to_bytes::<Self>(bech32_str)?;
                Digest::try_from(&bytes[..])
                    .map_err(bech32::Error::data_invalid)
                    .map(|d| d.into())
            }

            fn to_bech32_str(&self) -> String {
                bech32::to_bech32_from_bytes::<Self>(self.inner.as_ref())
            }
        }
    };
}

typed_define_from_instances!(Sha3_256, 32, "sha3");
typed_define_from_instances!(Blake2b256, 32, "blake2b");
