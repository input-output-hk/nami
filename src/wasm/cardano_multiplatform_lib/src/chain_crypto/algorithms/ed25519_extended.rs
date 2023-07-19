use crate::chain_crypto::key::{
    AsymmetricKey, AsymmetricPublicKey, SecretKeyError, SecretKeySizeStatic,
};
use crate::chain_crypto::sign::SigningAlgorithm;

use super::ed25519 as ei;

use cryptoxide::ed25519;
use rand_os::rand_core::{CryptoRng, RngCore};

use ed25519_bip32::{XPrv, XPRV_SIZE};

/// ED25519 Signing Algorithm with extended secret key
pub struct Ed25519Extended;

#[derive(Clone)]
pub struct ExtendedPriv([u8; ed25519::EXTENDED_KEY_LENGTH]);

impl AsRef<[u8]> for ExtendedPriv {
    fn as_ref(&self) -> &[u8] {
        &self.0[..]
    }
}

impl ExtendedPriv {
    pub fn from_xprv(xprv: &XPrv) -> Self {
        let mut buf = [0; ed25519::EXTENDED_KEY_LENGTH];
        xprv.get_extended_mut(&mut buf);
        ExtendedPriv(buf)
    }
}

impl AsymmetricKey for Ed25519Extended {
    type Secret = ExtendedPriv;
    type PubAlg = ei::Ed25519;

    const SECRET_BECH32_HRP: &'static str = "ed25519e_sk";

    fn generate<T: RngCore + CryptoRng>(mut rng: T) -> Self::Secret {
        let mut priv_bytes = [0u8; XPRV_SIZE];
        rng.fill_bytes(&mut priv_bytes);
        let xprv = XPrv::normalize_bytes_force3rd(priv_bytes);

        let mut out = [0u8; ed25519::EXTENDED_KEY_LENGTH];
        xprv.get_extended_mut(&mut out);
        ExtendedPriv(out)
    }

    fn compute_public(key: &Self::Secret) -> <Self::PubAlg as AsymmetricPublicKey>::Public {
        let pk = ed25519::extended_to_public(&key.0);
        ei::Pub(pk)
    }

    fn secret_from_binary(data: &[u8]) -> Result<Self::Secret, SecretKeyError> {
        if data.len() != ed25519::EXTENDED_KEY_LENGTH {
            return Err(SecretKeyError::SizeInvalid);
        }
        let mut buf = [0; ed25519::EXTENDED_KEY_LENGTH];
        buf.clone_from_slice(data);
        // TODO structure check
        Ok(ExtendedPriv(buf))
    }
}

impl SecretKeySizeStatic for Ed25519Extended {
    const SECRET_KEY_SIZE: usize = ed25519::PRIVATE_KEY_LENGTH;
}

impl SigningAlgorithm for Ed25519Extended {
    fn sign(key: &Self::Secret, msg: &[u8]) -> ei::Sig {
        ei::Sig(ed25519::signature_extended(msg, &key.0))
    }
}

#[cfg(test)]
mod test {
    use super::*;

    use crate::chain_crypto::key::KeyPair;
    use crate::chain_crypto::sign::test::{keypair_signing_ko, keypair_signing_ok};

    #[quickcheck]
    fn sign_ok(input: (KeyPair<Ed25519Extended>, Vec<u8>)) -> bool {
        keypair_signing_ok(input)
    }

    #[quickcheck]
    fn sign_ko(input: (KeyPair<Ed25519Extended>, KeyPair<Ed25519Extended>, Vec<u8>)) -> bool {
        keypair_signing_ko(input)
    }
}
