use crate::chain_crypto::key::{
    AsymmetricKey, AsymmetricPublicKey, PublicKeyError, SecretKeyError, SecretKeySizeStatic,
};
use crate::chain_crypto::sign::{
    SignatureError, SigningAlgorithm, Verification, VerificationAlgorithm,
};

use cryptoxide::digest::Digest;
use cryptoxide::hmac::Hmac;
use cryptoxide::mac::Mac;
use cryptoxide::sha2::Sha512;

use super::ed25519 as ei;
use cryptoxide::ed25519;
use ed25519_bip32::{XPrv, XPub, XPRV_SIZE, XPUB_SIZE};
use rand_os::rand_core::{CryptoRng, RngCore};

const CHAIN_CODE_SIZE: usize = 32;
const SEED_SIZE: usize = 64;

/// Legacy Daedalus algorithm
pub struct LegacyDaedalus;

#[derive(Clone)]
pub struct LegacyPriv([u8; XPRV_SIZE]);

impl AsRef<[u8]> for LegacyPriv {
    fn as_ref(&self) -> &[u8] {
        &self.0[..]
    }
}

impl LegacyPriv {
    pub fn from_xprv(xprv: &XPrv) -> Self {
        let mut buf = [0; XPRV_SIZE];
        buf[0..XPRV_SIZE].clone_from_slice(xprv.as_ref());
        LegacyPriv(buf)
    }

    pub fn inner_key(&self) -> [u8; ed25519::EXTENDED_KEY_LENGTH] {
        let mut buf = [0; ed25519::EXTENDED_KEY_LENGTH];
        buf.clone_from_slice(&self.0.as_ref()[0..ed25519::EXTENDED_KEY_LENGTH]);
        buf
    }

    pub fn chaincode(&self) -> [u8; CHAIN_CODE_SIZE] {
        let mut buf = [0; CHAIN_CODE_SIZE];
        buf.clone_from_slice(&self.0.as_ref()[ed25519::EXTENDED_KEY_LENGTH..XPRV_SIZE]);
        buf
    }
}

impl AsymmetricPublicKey for LegacyDaedalus {
    type Public = XPub;
    const PUBLIC_BECH32_HRP: &'static str = "legacy_xpub";
    const PUBLIC_KEY_SIZE: usize = XPUB_SIZE;
    fn public_from_binary(data: &[u8]) -> Result<Self::Public, PublicKeyError> {
        let xpub = XPub::from_slice(data)?;
        Ok(xpub)
    }
}

impl AsymmetricKey for LegacyDaedalus {
    type Secret = LegacyPriv;
    type PubAlg = LegacyDaedalus;

    const SECRET_BECH32_HRP: &'static str = "legacy_xprv";

    fn generate<T: RngCore + CryptoRng>(mut rng: T) -> Self::Secret {
        let mut seed = [0u8; SEED_SIZE];
        rng.fill_bytes(&mut seed);
        let mut mac = Hmac::new(Sha512::new(), &seed);

        let mut iter = 1;
        let mut out = [0u8; XPRV_SIZE];

        loop {
            let s = format!("Root Seed Chain {}", iter);
            mac.reset();
            mac.input(s.as_bytes());
            let mut block = [0u8; 64];
            mac.raw_result(&mut block);
            mk_ed25519_extended(&mut out[0..64], &block[0..32]);

            if (out[31] & 0x20) == 0 {
                out[64..96].clone_from_slice(&block[32..64]);
                break;
            }
            iter = iter + 1;
        }

        LegacyPriv(out)
    }

    fn compute_public(key: &Self::Secret) -> <Self as AsymmetricPublicKey>::Public {
        let ed25519e = key.inner_key();
        let pubkey = ed25519::extended_to_public(&ed25519e);
        let chaincode = key.chaincode();

        let mut buf = [0; XPUB_SIZE];
        buf[0..ed25519::PUBLIC_KEY_LENGTH].clone_from_slice(&pubkey);
        buf[ed25519::PUBLIC_KEY_LENGTH..XPUB_SIZE].clone_from_slice(&chaincode);

        XPub::from_bytes(buf)
    }

    fn secret_from_binary(data: &[u8]) -> Result<Self::Secret, SecretKeyError> {
        // Note: we do NOT verify that the bytes match proper bip32 format
        // this is because legacy Daedalus wallets do not match the format
        if data.len() != XPRV_SIZE {
            return Err(SecretKeyError::SizeInvalid);
        }
        let mut buf = [0; XPRV_SIZE];
        buf[0..XPRV_SIZE].clone_from_slice(data);
        Ok(LegacyPriv(buf))
    }
}

impl SecretKeySizeStatic for LegacyDaedalus {
    const SECRET_KEY_SIZE: usize = XPRV_SIZE;
}

type XSig = ed25519_bip32::Signature<u8>;

impl VerificationAlgorithm for LegacyDaedalus {
    type Signature = XSig;

    const SIGNATURE_SIZE: usize = ed25519_bip32::SIGNATURE_SIZE;
    const SIGNATURE_BECH32_HRP: &'static str = "legacy_xsig";

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

impl SigningAlgorithm for LegacyDaedalus {
    fn sign(key: &Self::Secret, msg: &[u8]) -> XSig {
        let buf = key.inner_key();
        let sig = ei::Sig(ed25519::signature_extended(msg, &buf));
        ed25519_bip32::Signature::from_bytes(sig.0)
    }
}

fn mk_ed25519_extended(extended_out: &mut [u8], secret: &[u8]) {
    assert!(extended_out.len() == 64);
    assert!(secret.len() == 32);
    let mut hasher = Sha512::new();
    hasher.input(secret);
    hasher.result(extended_out);
    extended_out[0] &= 248;
    extended_out[31] &= 63;
    extended_out[31] |= 64;
}

#[cfg(test)]
mod test {
    use super::*;

    use crate::chain_crypto::key::KeyPair;
    use crate::chain_crypto::sign::test::{keypair_signing_ko, keypair_signing_ok};

    #[quickcheck]
    fn sign_ok(input: (KeyPair<LegacyDaedalus>, Vec<u8>)) -> bool {
        keypair_signing_ok(input)
    }
    #[quickcheck]
    fn sign_ko(input: (KeyPair<LegacyDaedalus>, KeyPair<LegacyDaedalus>, Vec<u8>)) -> bool {
        keypair_signing_ko(input)
    }
}
