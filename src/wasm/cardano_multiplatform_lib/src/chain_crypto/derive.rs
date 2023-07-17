use crate::chain_crypto::key::{PublicKey, SecretKey};
use crate::chain_crypto::algorithms::{Ed25519, ed25519_derive::Ed25519Bip32, ed25519_extended::ExtendedPriv, ed25519::Pub};
use cryptoxide::hmac::Hmac;
use cryptoxide::pbkdf2::pbkdf2;
use cryptoxide::sha2::Sha512;
use ed25519_bip32::{DerivationError, DerivationScheme};
use ed25519_bip32::{XPrv, XPRV_SIZE};
use crate::chain_crypto::Ed25519Extended;

pub fn derive_sk_ed25519(key: &SecretKey<Ed25519Bip32>, index: u32) -> SecretKey<Ed25519Bip32> {
    let new_key = key.0.derive(DerivationScheme::V2, index);
    SecretKey(new_key)
}

pub fn derive_pk_ed25519(
    key: &PublicKey<Ed25519Bip32>,
    index: u32,
) -> Result<PublicKey<Ed25519Bip32>, DerivationError> {
    key.0.derive(DerivationScheme::V2, index).map(PublicKey)
}

pub fn to_raw_sk(key: &SecretKey<Ed25519Bip32>) -> SecretKey<Ed25519Extended> {
    SecretKey(ExtendedPriv::from_xprv(&key.0))
}

pub fn to_raw_pk(key: &PublicKey<Ed25519Bip32>) -> PublicKey<Ed25519> {
    PublicKey(Pub::from_xpub(&key.0))
}

pub fn from_bip39_entropy(entropy: &[u8], password: &[u8]) -> SecretKey<Ed25519Bip32> {
    let mut pbkdf2_result = [0; XPRV_SIZE];

    const ITER: u32 = 4096;
    let mut mac = Hmac::new(Sha512::new(), password);
    pbkdf2(&mut mac, entropy.as_ref(), ITER, &mut pbkdf2_result);

    SecretKey(XPrv::normalize_bytes_force3rd(pbkdf2_result))
}
