use crate::chain_crypto::key::{
    AsymmetricKey, AsymmetricPublicKey, PublicKeyError, SecretKeyError, SecretKeySizeStatic,
};
use crate::chain_crypto::sign::{SignatureError, SigningAlgorithm, Verification, VerificationAlgorithm};

use ed25519_bip32 as i;
use ed25519_bip32::{XPrv, XPub, XPRV_SIZE, XPUB_SIZE};
use rand_os::rand_core::{CryptoRng, RngCore};

/// Ed25519 BIP32 Signature algorithm
pub struct Ed25519Bip32;

impl From<i::PrivateKeyError> for SecretKeyError {
    fn from(v: i::PrivateKeyError) -> Self {
        match v {
            i::PrivateKeyError::HighestBitsInvalid => SecretKeyError::StructureInvalid,
            i::PrivateKeyError::LowestBitsInvalid => SecretKeyError::StructureInvalid,
            i::PrivateKeyError::LengthInvalid(_) => SecretKeyError::SizeInvalid,
        }
    }
}

impl From<i::PublicKeyError> for PublicKeyError {
    fn from(v: i::PublicKeyError) -> Self {
        match v {
            i::PublicKeyError::LengthInvalid(_) => PublicKeyError::SizeInvalid,
        }
    }
}

impl AsymmetricPublicKey for Ed25519Bip32 {
    type Public = XPub;
    const PUBLIC_BECH32_HRP: &'static str = "xpub";
    const PUBLIC_KEY_SIZE: usize = XPUB_SIZE;
    fn public_from_binary(data: &[u8]) -> Result<Self::Public, PublicKeyError> {
        let xpub = XPub::from_slice(data)?;
        Ok(xpub)
    }
}

impl AsymmetricKey for Ed25519Bip32 {
    type Secret = XPrv;
    type PubAlg = Ed25519Bip32;

    const SECRET_BECH32_HRP: &'static str = "xprv";

    fn generate<T: RngCore + CryptoRng>(mut rng: T) -> Self::Secret {
        let mut priv_bytes = [0u8; XPRV_SIZE];
        rng.fill_bytes(&mut priv_bytes);
        XPrv::normalize_bytes_force3rd(priv_bytes)
    }

    fn compute_public(key: &Self::Secret) -> <Self as AsymmetricPublicKey>::Public {
        key.public()
    }

    fn secret_from_binary(data: &[u8]) -> Result<Self::Secret, SecretKeyError> {
        let xprv = XPrv::from_slice_verified(data)?;
        Ok(xprv)
    }
}

impl SecretKeySizeStatic for Ed25519Bip32 {
    const SECRET_KEY_SIZE: usize = XPRV_SIZE;
}

impl From<i::SignatureError> for SignatureError {
    fn from(v: i::SignatureError) -> Self {
        match v {
            i::SignatureError::InvalidLength(got) => SignatureError::SizeInvalid {
                expected: ed25519_bip32::SIGNATURE_SIZE,
                got: got,
            },
        }
    }
}

type XSig = ed25519_bip32::Signature<u8>;

impl VerificationAlgorithm for Ed25519Bip32 {
    type Signature = XSig;

    const SIGNATURE_SIZE: usize = ed25519_bip32::SIGNATURE_SIZE;
    const SIGNATURE_BECH32_HRP: &'static str = "xsig";

    fn signature_from_bytes(data: &[u8]) -> Result<Self::Signature, SignatureError> {
        let xsig = XSig::from_slice(data)?;
        Ok(xsig)
    }

    fn verify_bytes(
        pubkey: &Self::Public,
        signature: &Self::Signature,
        msg: &[u8],
    ) -> Verification {
        pubkey.verify(msg, signature).into()
    }
}

impl SigningAlgorithm for Ed25519Bip32 {
    fn sign(key: &Self::Secret, msg: &[u8]) -> XSig {
        key.sign(msg)
    }
}

#[cfg(test)]
mod test {
    use super::*;

    use crate::chain_crypto::key::KeyPair;
    use crate::chain_crypto::sign::test::{keypair_signing_ko, keypair_signing_ok};

    #[quickcheck]
    fn sign_ok(input: (KeyPair<Ed25519Bip32>, Vec<u8>)) -> bool {
        keypair_signing_ok(input)
    }
    #[quickcheck]
    fn sign_ko(input: (KeyPair<Ed25519Bip32>, KeyPair<Ed25519Bip32>, Vec<u8>)) -> bool {
        keypair_signing_ko(input)
    }
}
