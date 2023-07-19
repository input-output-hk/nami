cfg_if! {
    if #[cfg(test)] {
        mod testing;
    } else if #[cfg(feature = "property-test-api")] {
        pub mod testing;
    }
}

pub mod algorithms;
pub mod bech32;
pub mod derive;
pub mod digest;
pub mod hash;
mod sign;
mod key;

pub use algorithms::*;
pub use hash::{Blake2b256, Sha3_256};
pub use key::{
    AsymmetricKey, AsymmetricPublicKey, KeyPair, PublicKey, PublicKeyError, PublicKeyFromStrError,
    SecretKey, SecretKeyError, SecretKeySizeStatic,
};
pub use sign::{
    Signature, SignatureError, SignatureFromStrError, SigningAlgorithm, Verification,
    VerificationAlgorithm,
};
