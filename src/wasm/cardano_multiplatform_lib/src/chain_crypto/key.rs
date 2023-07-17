use crate::chain_crypto::bech32::{self, Bech32};
use hex::FromHexError;
use rand_os::rand_core::{CryptoRng, RngCore};
use std::fmt;
use std::hash::Hash;
use std::str::FromStr;

#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub enum SecretKeyError {
    SizeInvalid,
    StructureInvalid,
}

#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub enum PublicKeyError {
    SizeInvalid,
    StructureInvalid,
}

#[derive(Debug, Clone, PartialEq)]
pub enum PublicKeyFromStrError {
    HexMalformed(FromHexError),
    KeyInvalid(PublicKeyError),
}

pub trait AsymmetricPublicKey {
    type Public: AsRef<[u8]> + Clone + PartialEq + Eq + Hash;
    const PUBLIC_BECH32_HRP: &'static str;
    const PUBLIC_KEY_SIZE: usize;

    fn public_from_binary(data: &[u8]) -> Result<Self::Public, PublicKeyError>;
}

pub trait AsymmetricKey {
    // The name of the public key Algorithm to represent the public key
    // where PubAlg::Public is the public key type.
    type PubAlg: AsymmetricPublicKey;

    // the secret key type
    type Secret: AsRef<[u8]> + Clone;

    const SECRET_BECH32_HRP: &'static str;

    fn generate<T: RngCore + CryptoRng>(rng: T) -> Self::Secret;
    fn compute_public(secret: &Self::Secret) -> <Self::PubAlg as AsymmetricPublicKey>::Public;
    fn secret_from_binary(data: &[u8]) -> Result<Self::Secret, SecretKeyError>;
}

pub trait SecretKeySizeStatic: AsymmetricKey {
    const SECRET_KEY_SIZE: usize;
}

pub struct SecretKey<A: AsymmetricKey>(pub(crate) A::Secret);

pub struct PublicKey<A: AsymmetricPublicKey>(pub(crate) A::Public);

pub struct KeyPair<A: AsymmetricKey>(SecretKey<A>, PublicKey<A::PubAlg>);

impl<A: AsymmetricKey> KeyPair<A> {
    pub fn private_key(&self) -> &SecretKey<A> {
        &self.0
    }
    pub fn public_key(&self) -> &PublicKey<A::PubAlg> {
        &self.1
    }
    pub fn into_keys(self) -> (SecretKey<A>, PublicKey<A::PubAlg>) {
        (self.0, self.1)
    }
    pub fn generate<R: RngCore + CryptoRng>(rng: &mut R) -> Self {
        let sk = A::generate(rng);
        let pk = A::compute_public(&sk);
        KeyPair(SecretKey(sk), PublicKey(pk))
    }
}
impl<A: AsymmetricKey> std::fmt::Debug for KeyPair<A> {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "KeyPair(<secret key>, {:?})", self.public_key())
    }
}
impl<A: AsymmetricKey> std::fmt::Display for KeyPair<A> {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "KeyPair(<secret key>, {})", self.public_key())
    }
}

impl<A: AsymmetricPublicKey> fmt::Debug for PublicKey<A> {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", hex::encode(self.0.as_ref()))
    }
}
impl<A: AsymmetricPublicKey> fmt::Display for PublicKey<A> {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", hex::encode(self.0.as_ref()))
    }
}

impl<A: AsymmetricPublicKey> FromStr for PublicKey<A> {
    type Err = PublicKeyFromStrError;

    fn from_str(hex: &str) -> Result<Self, Self::Err> {
        let bytes = hex::decode(hex).map_err(PublicKeyFromStrError::HexMalformed)?;
        Self::from_binary(&bytes).map_err(PublicKeyFromStrError::KeyInvalid)
    }
}

impl fmt::Display for SecretKeyError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            SecretKeyError::SizeInvalid => write!(f, "Invalid Secret Key size"),
            SecretKeyError::StructureInvalid => write!(f, "Invalid Secret Key structure"),
        }
    }
}

impl fmt::Display for PublicKeyError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            PublicKeyError::SizeInvalid => write!(f, "Invalid Public Key size"),
            PublicKeyError::StructureInvalid => write!(f, "Invalid Public Key structure"),
        }
    }
}

impl fmt::Display for PublicKeyFromStrError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            PublicKeyFromStrError::HexMalformed(_) => "hex encoding malformed",
            PublicKeyFromStrError::KeyInvalid(_) => "invalid public key data",
        }
        .fmt(f)
    }
}

impl std::error::Error for SecretKeyError {}

impl std::error::Error for PublicKeyError {}

impl std::error::Error for PublicKeyFromStrError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            PublicKeyFromStrError::HexMalformed(e) => Some(e),
            PublicKeyFromStrError::KeyInvalid(e) => Some(e),
        }
    }
}

impl<A: AsymmetricPublicKey> AsRef<[u8]> for PublicKey<A> {
    fn as_ref(&self) -> &[u8] {
        self.0.as_ref()
    }
}

impl<A: AsymmetricKey> AsRef<[u8]> for SecretKey<A> {
    fn as_ref(&self) -> &[u8] {
        self.0.as_ref()
    }
}

impl<A: AsymmetricKey> From<SecretKey<A>> for KeyPair<A> {
    fn from(secret_key: SecretKey<A>) -> Self {
        let public_key = secret_key.to_public();
        KeyPair(secret_key, public_key)
    }
}

impl<A: AsymmetricKey> SecretKey<A> {
    pub fn generate<T: RngCore + CryptoRng>(rng: T) -> Self {
        SecretKey(A::generate(rng))
    }
    pub fn to_public(&self) -> PublicKey<A::PubAlg> {
        PublicKey(<A as AsymmetricKey>::compute_public(&self.0))
    }
    pub fn from_binary(data: &[u8]) -> Result<Self, SecretKeyError> {
        Ok(SecretKey(<A as AsymmetricKey>::secret_from_binary(data)?))
    }
}

impl<A: AsymmetricPublicKey> PublicKey<A> {
    pub fn from_binary(data: &[u8]) -> Result<Self, PublicKeyError> {
        Ok(PublicKey(<A as AsymmetricPublicKey>::public_from_binary(
            data,
        )?))
    }
}

impl<A: AsymmetricKey> Clone for SecretKey<A> {
    fn clone(&self) -> Self {
        SecretKey(self.0.clone())
    }
}
impl<A: AsymmetricPublicKey> Clone for PublicKey<A> {
    fn clone(&self) -> Self {
        PublicKey(self.0.clone())
    }
}
impl<A: AsymmetricKey> Clone for KeyPair<A> {
    fn clone(&self) -> Self {
        KeyPair(self.0.clone(), self.1.clone())
    }
}

impl<A: AsymmetricPublicKey> std::cmp::PartialEq<Self> for PublicKey<A> {
    fn eq(&self, other: &Self) -> bool {
        self.0.as_ref().eq(other.0.as_ref())
    }
}

impl<A: AsymmetricPublicKey> std::cmp::Eq for PublicKey<A> {}

impl<A: AsymmetricPublicKey> std::cmp::PartialOrd<Self> for PublicKey<A> {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        self.0.as_ref().partial_cmp(other.0.as_ref())
    }
}

impl<A: AsymmetricPublicKey> std::cmp::Ord for PublicKey<A> {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.0.as_ref().cmp(other.0.as_ref())
    }
}

impl<A: AsymmetricPublicKey> Hash for PublicKey<A> {
    fn hash<H>(&self, state: &mut H)
    where
        H: std::hash::Hasher,
    {
        self.0.as_ref().hash(state)
    }
}

impl<A: AsymmetricPublicKey> Bech32 for PublicKey<A> {
    const BECH32_HRP: &'static str = A::PUBLIC_BECH32_HRP;

    fn try_from_bech32_str(bech32_str: &str) -> Result<Self, bech32::Error> {
        let bytes = bech32::try_from_bech32_to_bytes::<Self>(bech32_str)?;
        Self::from_binary(&bytes).map_err(bech32::Error::data_invalid)
    }

    fn to_bech32_str(&self) -> String {
        bech32::to_bech32_from_bytes::<Self>(self.as_ref())
    }
}

impl<A: AsymmetricKey> Bech32 for SecretKey<A> {
    const BECH32_HRP: &'static str = A::SECRET_BECH32_HRP;

    fn try_from_bech32_str(bech32_str: &str) -> Result<Self, bech32::Error> {
        let bytes = bech32::try_from_bech32_to_bytes::<Self>(bech32_str)?;
        Self::from_binary(&bytes).map_err(bech32::Error::data_invalid)
    }

    fn to_bech32_str(&self) -> String {
        bech32::to_bech32_from_bytes::<Self>(self.0.as_ref())
    }
}

#[cfg(test)]
mod test {
    use super::*;

    // ONLY ALLOWED WHEN TESTING
    impl<A> std::fmt::Debug for SecretKey<A>
    where
        A: AsymmetricKey,
    {
        fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
            write!(f, "SecretKey ({:?})", self.0.as_ref())
        }
    }
}
