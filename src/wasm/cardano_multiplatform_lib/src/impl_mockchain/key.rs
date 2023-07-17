//! Module provides cryptographic utilities and types related to
//! the user keys.
//!
use crate::chain_core::mempack::{read_mut_slice, ReadBuf, ReadError, Readable};
use crate::chain_core::property;
use crate::chain_crypto as crypto;
use crate::chain_crypto::{
    AsymmetricKey, AsymmetricPublicKey, SecretKey, SigningAlgorithm, VerificationAlgorithm,
};
use rand_os::rand_core::{CryptoRng, RngCore};

#[derive(Clone)]
pub enum EitherEd25519SecretKey {
    Extended(crypto::SecretKey<crypto::Ed25519Extended>),
    Normal(crypto::SecretKey<crypto::Ed25519>),
}

impl EitherEd25519SecretKey {
    pub fn generate<R: RngCore + CryptoRng>(rng: R) -> Self {
        EitherEd25519SecretKey::Extended(SecretKey::generate(rng))
    }

    pub fn to_public(&self) -> crypto::PublicKey<crypto::Ed25519> {
        match self {
            EitherEd25519SecretKey::Extended(sk) => sk.to_public(),
            EitherEd25519SecretKey::Normal(sk) => sk.to_public(),
        }
    }

    pub fn sign<T: AsRef<[u8]>>(&self, dat: &T) -> crypto::Signature<T, crypto::Ed25519> {
        match self {
            EitherEd25519SecretKey::Extended(sk) => sk.sign(dat),
            EitherEd25519SecretKey::Normal(sk) => sk.sign(dat),
        }
    }

    pub fn sign_slice<T: ?Sized>(&self, dat: &[u8]) -> crypto::Signature<T, crypto::Ed25519> {
        match self {
            EitherEd25519SecretKey::Extended(sk) => sk.sign_slice(dat),
            EitherEd25519SecretKey::Normal(sk) => sk.sign_slice(dat),
        }
    }
}

pub type SpendingPublicKey = crypto::PublicKey<crypto::Ed25519>;
pub type SpendingSignature<T> = crypto::Signature<T, crypto::Ed25519>;

pub type Ed25519Signature<T> = crypto::Signature<T, crypto::Ed25519>;


fn chain_crypto_pub_err(e: crypto::PublicKeyError) -> ReadError {
    match e {
        crypto::PublicKeyError::SizeInvalid => {
            ReadError::StructureInvalid("publickey size invalid".to_string())
        }
        crypto::PublicKeyError::StructureInvalid => {
            ReadError::StructureInvalid("publickey structure invalid".to_string())
        }
    }
}
fn chain_crypto_sig_err(e: crypto::SignatureError) -> ReadError {
    match e {
        crypto::SignatureError::SizeInvalid { expected, got } => ReadError::StructureInvalid(
            format!("signature size invalid, expected {} got {}", expected, got),
        ),
        crypto::SignatureError::StructureInvalid => {
            ReadError::StructureInvalid("signature structure invalid".to_string())
        }
    }
}

#[inline]
pub fn serialize_public_key<A: AsymmetricPublicKey, W: std::io::Write>(
    key: &crypto::PublicKey<A>,
    mut writer: W,
) -> Result<(), std::io::Error> {
    writer.write_all(key.as_ref())
}
#[inline]
pub fn serialize_signature<A: VerificationAlgorithm, T, W: std::io::Write>(
    signature: &crypto::Signature<T, A>,
    mut writer: W,
) -> Result<(), std::io::Error> {
    writer.write_all(signature.as_ref())
}
#[inline]
pub fn deserialize_public_key<'a, A>(
    buf: &mut ReadBuf<'a>,
) -> Result<crypto::PublicKey<A>, ReadError>
where
    A: AsymmetricPublicKey,
{
    let mut bytes = vec![0u8; A::PUBLIC_KEY_SIZE];
    read_mut_slice(buf, &mut bytes[..])?;
    crypto::PublicKey::from_binary(&bytes).map_err(chain_crypto_pub_err)
}
#[inline]
pub fn deserialize_signature<'a, A, T>(
    buf: &mut ReadBuf<'a>,
) -> Result<crypto::Signature<T, A>, ReadError>
where
    A: VerificationAlgorithm,
{
    let mut bytes = vec![0u8; A::SIGNATURE_SIZE];
    read_mut_slice(buf, &mut bytes[..])?;
    crypto::Signature::from_binary(&bytes).map_err(chain_crypto_sig_err)
}

pub fn make_signature<T, A>(
    spending_key: &crypto::SecretKey<A>,
    data: &T,
) -> crypto::Signature<T, A::PubAlg>
where
    A: SigningAlgorithm,
    <A as AsymmetricKey>::PubAlg: VerificationAlgorithm,
    T: property::Serialize,
{
    let bytes = data.serialize_as_vec().unwrap();
    spending_key.sign(&bytes).coerce()
}

pub fn verify_signature<T, A>(
    signature: &crypto::Signature<T, A>,
    public_key: &crypto::PublicKey<A>,
    data: &T,
) -> crypto::Verification
where
    A: VerificationAlgorithm,
    T: property::Serialize,
{
    let bytes = data.serialize_as_vec().unwrap();
    signature.clone().coerce().verify(public_key, &bytes)
}

/// A serializable type T with a signature.
pub struct Signed<T, A: VerificationAlgorithm> {
    pub data: T,
    pub sig: crypto::Signature<T, A>,
}

pub fn signed_new<T: property::Serialize, A: SigningAlgorithm>(
    secret_key: &crypto::SecretKey<A>,
    data: T,
) -> Signed<T, A::PubAlg>
where
    A::PubAlg: VerificationAlgorithm,
{
    let bytes = data.serialize_as_vec().unwrap();
    let signature = secret_key.sign(&bytes).coerce();
    Signed {
        data: data,
        sig: signature,
    }
}

impl<T: property::Serialize, A: VerificationAlgorithm> property::Serialize for Signed<T, A>
where
    std::io::Error: From<T::Error>,
{
    type Error = std::io::Error;
    fn serialize<W: std::io::Write>(&self, mut writer: W) -> Result<(), Self::Error> {
        self.data.serialize(&mut writer)?;
        serialize_signature(&self.sig, &mut writer)?;
        Ok(())
    }
}

impl<T: Readable, A: VerificationAlgorithm> Readable for Signed<T, A> {
    fn read<'a>(buf: &mut ReadBuf<'a>) -> Result<Self, ReadError> {
        Ok(Signed {
            data: T::read(buf)?,
            sig: deserialize_signature(buf)?,
        })
    }
}

impl<T: PartialEq, A: VerificationAlgorithm> PartialEq<Self> for Signed<T, A> {
    fn eq(&self, other: &Self) -> bool {
        self.data.eq(&other.data) && self.sig.as_ref() == other.sig.as_ref()
    }
}
impl<T: PartialEq, A: VerificationAlgorithm> Eq for Signed<T, A> {}
impl<T: std::fmt::Debug, A: VerificationAlgorithm> std::fmt::Debug for Signed<T, A> {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(
            f,
            "Signed ( data: {:?}, signature: {:?} )",
            self.data,
            self.sig.as_ref()
        )
    }
}
impl<T: Clone, A: VerificationAlgorithm> Clone for Signed<T, A> {
    fn clone(&self) -> Self {
        Signed {
            data: self.data.clone(),
            sig: self.sig.clone(),
        }
    }
}
