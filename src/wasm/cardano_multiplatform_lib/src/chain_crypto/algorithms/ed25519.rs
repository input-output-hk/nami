use crate::chain_crypto::key::{
    AsymmetricKey, AsymmetricPublicKey, PublicKeyError, SecretKeyError, SecretKeySizeStatic,
};
use crate::chain_crypto::sign::{
    SignatureError, SigningAlgorithm, Verification, VerificationAlgorithm,
};
use cryptoxide::ed25519;
use rand_os::rand_core::{CryptoRng, RngCore};

use ed25519_bip32::XPub;

/// ED25519 Signing Algorithm
pub struct Ed25519;

#[derive(Clone)]
pub struct Priv([u8; ed25519::PRIVATE_KEY_LENGTH]);

#[derive(Clone, PartialEq, Eq, Hash)]
pub struct Pub(pub(crate) [u8; ed25519::PUBLIC_KEY_LENGTH]);

#[derive(Clone)]
pub struct Sig(pub(crate) [u8; ed25519::SIGNATURE_LENGTH]);

impl Pub {
    pub fn from_xpub(xpub: &XPub) -> Self {
        let mut buf = [0; ed25519::PUBLIC_KEY_LENGTH];
        xpub.get_without_chaincode(&mut buf);
        Pub(buf)
    }
}

impl AsRef<[u8]> for Priv {
    fn as_ref(&self) -> &[u8] {
        &self.0[..]
    }
}

impl AsRef<[u8]> for Pub {
    fn as_ref(&self) -> &[u8] {
        &self.0
    }
}

impl AsRef<[u8]> for Sig {
    fn as_ref(&self) -> &[u8] {
        &self.0
    }
}

impl AsymmetricPublicKey for Ed25519 {
    type Public = Pub;

    const PUBLIC_BECH32_HRP: &'static str = "ed25519_pk";
    const PUBLIC_KEY_SIZE: usize = ed25519::PUBLIC_KEY_LENGTH;

    fn public_from_binary(data: &[u8]) -> Result<Self::Public, PublicKeyError> {
        if data.len() != ed25519::PUBLIC_KEY_LENGTH {
            return Err(PublicKeyError::SizeInvalid);
        }
        let mut buf = [0; ed25519::PUBLIC_KEY_LENGTH];
        buf[0..ed25519::PUBLIC_KEY_LENGTH].clone_from_slice(data);
        Ok(Pub(buf))
    }
}

impl AsymmetricKey for Ed25519 {
    type Secret = Priv;
    type PubAlg = Ed25519;

    const SECRET_BECH32_HRP: &'static str = "ed25519_sk";

    fn generate<T: RngCore + CryptoRng>(mut rng: T) -> Self::Secret {
        let mut priv_bytes = [0u8; ed25519::PRIVATE_KEY_LENGTH];
        rng.fill_bytes(&mut priv_bytes);
        Priv(priv_bytes)
    }

    fn compute_public(key: &Self::Secret) -> <Self::PubAlg as AsymmetricPublicKey>::Public {
        let (_, pk) = ed25519::keypair(&key.0);
        Pub(pk)
    }

    fn secret_from_binary(data: &[u8]) -> Result<Self::Secret, SecretKeyError> {
        if data.len() != ed25519::PRIVATE_KEY_LENGTH {
            return Err(SecretKeyError::SizeInvalid);
        }
        let mut buf = [0; ed25519::PRIVATE_KEY_LENGTH];
        buf[0..ed25519::PRIVATE_KEY_LENGTH].clone_from_slice(data);
        Ok(Priv(buf))
    }
}

impl SecretKeySizeStatic for Ed25519 {
    const SECRET_KEY_SIZE: usize = ed25519::PRIVATE_KEY_LENGTH;
}

impl VerificationAlgorithm for Ed25519 {
    type Signature = Sig;

    const SIGNATURE_SIZE: usize = ed25519::SIGNATURE_LENGTH;
    const SIGNATURE_BECH32_HRP: &'static str = "ed25519_sig";

    fn signature_from_bytes(data: &[u8]) -> Result<Self::Signature, SignatureError> {
        if data.len() != ed25519::SIGNATURE_LENGTH {
            return Err(SignatureError::SizeInvalid {
                expected: ed25519::SIGNATURE_LENGTH,
                got: data.len(),
            });
        }
        let mut buf = [0; ed25519::SIGNATURE_LENGTH];
        buf[0..ed25519::SIGNATURE_LENGTH].clone_from_slice(data);
        Ok(Sig(buf))
    }

    fn verify_bytes(
        pubkey: &Self::Public,
        signature: &Self::Signature,
        msg: &[u8],
    ) -> Verification {
        ed25519::verify(msg, &pubkey.0, &signature.0).into()
    }
}

impl SigningAlgorithm for Ed25519 {
    fn sign(key: &Self::Secret, msg: &[u8]) -> Sig {
        let (sk, _) = ed25519::keypair(&key.0);
        Sig(ed25519::signature(msg, &sk))
    }
}

#[cfg(test)]
mod test {
    use super::*;

    use crate::chain_crypto::key::KeyPair;
    use crate::chain_crypto::sign::test::{keypair_signing_ko, keypair_signing_ok};

    #[quickcheck]
    fn sign_ok(input: (KeyPair<Ed25519>, Vec<u8>)) -> bool {
        keypair_signing_ok(input)
    }

    #[quickcheck]
    fn sign_ko(input: (KeyPair<Ed25519>, KeyPair<Ed25519>, Vec<u8>)) -> bool {
        keypair_signing_ko(input)
    }
}
