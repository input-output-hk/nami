use crate::chain_crypto::{
    bech32::{self, Bech32},
    key,
};
use hex::FromHexError;
use std::{fmt, marker::PhantomData, str::FromStr};
use crate::typed_bytes::{ByteArray, ByteSlice};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Verification {
    Failed,
    Success,
}

impl From<bool> for Verification {
    fn from(b: bool) -> Self {
        if b {
            Verification::Success
        } else {
            Verification::Failed
        }
    }
}

#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub enum SignatureError {
    SizeInvalid { expected: usize, got: usize }, // expected, got in bytes
    StructureInvalid,
}

#[derive(Debug, Clone, PartialEq)]
pub enum SignatureFromStrError {
    HexMalformed(FromHexError),
    Invalid(SignatureError),
}

pub trait VerificationAlgorithm: key::AsymmetricPublicKey {
    type Signature: AsRef<[u8]> + Clone;

    const SIGNATURE_SIZE: usize;
    const SIGNATURE_BECH32_HRP: &'static str;

    fn verify_bytes(pubkey: &Self::Public, signature: &Self::Signature, msg: &[u8])
        -> Verification;

    fn signature_from_bytes(data: &[u8]) -> Result<Self::Signature, SignatureError>;
}

pub trait SigningAlgorithm: key::AsymmetricKey
where
    Self::PubAlg: VerificationAlgorithm,
{
    fn sign(key: &Self::Secret, msg: &[u8]) -> <Self::PubAlg as VerificationAlgorithm>::Signature;
}

pub struct Signature<T: ?Sized, A: VerificationAlgorithm> {
    signdata: A::Signature,
    phantom: PhantomData<T>,
}

impl<A: VerificationAlgorithm, T> fmt::Debug for Signature<T, A> {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", hex::encode(self.signdata.as_ref()))
    }
}
impl<A: VerificationAlgorithm, T> fmt::Display for Signature<T, A> {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", hex::encode(self.signdata.as_ref()))
    }
}
impl<T, A: VerificationAlgorithm> FromStr for Signature<T, A> {
    type Err = SignatureFromStrError;

    fn from_str(hex: &str) -> Result<Self, Self::Err> {
        let bytes = hex::decode(hex).map_err(SignatureFromStrError::HexMalformed)?;
        Self::from_binary(&bytes).map_err(SignatureFromStrError::Invalid)
    }
}

impl fmt::Display for SignatureError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            SignatureError::SizeInvalid { expected, got } => write!(
                f,
                "Invalid Signature size expecting {} got {}",
                expected, got
            ),
            SignatureError::StructureInvalid => write!(f, "Invalid Signature structure"),
        }
    }
}
impl fmt::Display for SignatureFromStrError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            SignatureFromStrError::HexMalformed(_) => "hex encoding malformed",
            SignatureFromStrError::Invalid(_) => "invalid signature data",
        }
        .fmt(f)
    }
}

impl std::error::Error for SignatureError {}
impl std::error::Error for SignatureFromStrError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            SignatureFromStrError::HexMalformed(e) => Some(e),
            SignatureFromStrError::Invalid(e) => Some(e),
        }
    }
}

impl<A: VerificationAlgorithm, T> Signature<T, A> {
    pub fn from_binary(sig: &[u8]) -> Result<Self, SignatureError> {
        Ok(Signature {
            signdata: A::signature_from_bytes(sig)?,
            phantom: PhantomData,
        })
    }
    pub fn coerce<U>(self) -> Signature<U, A> {
        Signature {
            signdata: self.signdata,
            phantom: PhantomData,
        }
    }

    pub fn safe_coerce<U: SafeSignatureCoerce<T>>(self) -> Signature<U, A> {
        Signature {
            signdata: self.signdata,
            phantom: PhantomData,
        }
    }
}

pub trait SafeSignatureCoerce<T> {}

impl<'a, T> SafeSignatureCoerce<ByteArray<T>> for ByteSlice<'a, T> {}

impl<A: VerificationAlgorithm, T: AsRef<[u8]>> Signature<T, A> {
    #[must_use]
    pub fn verify(&self, publickey: &key::PublicKey<A>, object: &T) -> Verification {
        <A as VerificationAlgorithm>::verify_bytes(&publickey.0, &self.signdata, object.as_ref())
    }
}

impl<A: VerificationAlgorithm, T: ?Sized> Signature<T, A> {
    #[must_use]
    pub fn verify_slice(&self, publickey: &key::PublicKey<A>, slice: &[u8]) -> Verification {
        <A as VerificationAlgorithm>::verify_bytes(&publickey.0, &self.signdata, slice)
    }
}

/*
impl<A: SigningAlgorithm, T: AsRef<[u8]>> Signature<T, A::Public>
    where <A as key::AsymmetricKey>::Public: VerificationAlgorithm,
{
    pub fn generate(secretkey: &key::SecretKey<A>, object: &T) -> Signature<T, A::Public> {
        Signature {
            signdata: <A as SigningAlgorithm>::sign(&secretkey.0, object.as_ref()),
            phantom: PhantomData,
        }
    }
}
*/
impl<A: SigningAlgorithm> key::SecretKey<A>
where
    <A as key::AsymmetricKey>::PubAlg: VerificationAlgorithm,
{
    pub fn sign<T: AsRef<[u8]>>(&self, object: &T) -> Signature<T, A::PubAlg> {
        Signature {
            signdata: <A as SigningAlgorithm>::sign(&self.0, object.as_ref()),
            phantom: PhantomData,
        }
    }

    pub fn sign_slice<T: ?Sized>(&self, slice: &[u8]) -> Signature<T, A::PubAlg> {
        Signature {
            signdata: <A as SigningAlgorithm>::sign(&self.0, slice),
            phantom: PhantomData,
        }
    }
}

impl<T, A: VerificationAlgorithm> Clone for Signature<T, A> {
    fn clone(&self) -> Self {
        Signature {
            signdata: self.signdata.clone(),
            phantom: std::marker::PhantomData,
        }
    }
}

impl<T: ?Sized, A: VerificationAlgorithm> AsRef<[u8]> for Signature<T, A> {
    fn as_ref(&self) -> &[u8] {
        self.signdata.as_ref()
    }
}

impl<T, A: VerificationAlgorithm> Bech32 for Signature<T, A> {
    const BECH32_HRP: &'static str = A::SIGNATURE_BECH32_HRP;

    fn try_from_bech32_str(bech32_str: &str) -> Result<Self, bech32::Error> {
        let bytes = bech32::try_from_bech32_to_bytes::<Self>(bech32_str)?;
        Self::from_binary(&bytes).map_err(bech32::Error::data_invalid)
    }

    fn to_bech32_str(&self) -> String {
        bech32::to_bech32_from_bytes::<Self>(self.as_ref())
    }
}

#[cfg(test)]
pub(crate) mod test {
    use super::*;
    use crate::chain_crypto::key::{AsymmetricKey, KeyPair};

    pub(crate) fn keypair_signing_ok<A: AsymmetricKey + SigningAlgorithm>(
        input: (KeyPair<A>, Vec<u8>),
    ) -> bool
    where
        <A as AsymmetricKey>::PubAlg: VerificationAlgorithm,
    {
        let (sk, pk) = input.0.into_keys();
        let data = input.1;

        let signature = sk.sign(&data);
        signature.verify(&pk, &data) == Verification::Success
    }

    pub(crate) fn keypair_signing_ko<A: AsymmetricKey + SigningAlgorithm>(
        input: (KeyPair<A>, KeyPair<A>, Vec<u8>),
    ) -> bool
    where
        <A as AsymmetricKey>::PubAlg: VerificationAlgorithm,
    {
        let (sk, pk) = input.0.into_keys();
        let pk_random = input.1.public_key();
        let data = input.2;

        if &pk == pk_random {
            return true;
        }

        let signature = sk.sign(&data);
        signature.verify(&pk_random, &data) == Verification::Failed
    }
}
