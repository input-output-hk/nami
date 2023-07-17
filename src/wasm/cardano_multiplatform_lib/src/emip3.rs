use super::*;
use super::error::JsError;

use cryptoxide::chacha20poly1305::ChaCha20Poly1305;
use cryptoxide::hmac::Hmac;
use cryptoxide::pbkdf2::pbkdf2;
use cryptoxide::sha2::{Sha512};
use hex::{ToHex};

use std::iter::repeat;


// taken from js-cardano-wasm

mod password_encryption_parameter {
    pub const ITER: u32 = 19_162;
    pub const SALT_SIZE: usize = 32;
    pub const NONCE_SIZE: usize = 12;
    pub const KEY_SIZE: usize = 32;
    pub const TAG_SIZE: usize = 16;

    pub const METADATA_SIZE: usize = SALT_SIZE + NONCE_SIZE + TAG_SIZE;

    pub const SALT_START: usize = 0;
    pub const SALT_END: usize = SALT_START + SALT_SIZE;
    pub const NONCE_START: usize = SALT_END;
    pub const NONCE_END: usize = NONCE_START + NONCE_SIZE;
    pub const TAG_START: usize = NONCE_END;
    pub const TAG_END: usize = TAG_START + TAG_SIZE;
    pub const ENCRYPTED_START: usize = TAG_END;
}

#[wasm_bindgen]
pub fn encrypt_with_password(
    password: &str,
    salt: &str,
    nonce: &str,
    data: &str,
) -> Result<String, JsError> {
    use password_encryption_parameter::*;

    let password = hex::decode(password).map_err(|e| JsError::from_str(&e.to_string()))?;
    let salt = hex::decode(salt).map_err(|e| JsError::from_str(&e.to_string()))?;
    let nonce = hex::decode(nonce).map_err(|e| JsError::from_str(&e.to_string()))?;
    let data = hex::decode(data).map_err(|e| JsError::from_str(&e.to_string()))?;

    if salt.len() != SALT_SIZE {
        return Err(JsError::from_str(&format!("salt len must be {}, found {} bytes", SALT_SIZE, salt.len())));
    }
    if nonce.len() != NONCE_SIZE {
        return Err(JsError::from_str(&format!("nonce len must be {}, found {} bytes", NONCE_SIZE, nonce.len())));
    }
    if password.len() == 0 {
      return Err(JsError::from_str("Password len cannot be 0"));
    }

    let key = {
        let mut mac = Hmac::new(Sha512::new(), &password);
        let mut key: Vec<u8> = repeat(0).take(KEY_SIZE).collect();
        pbkdf2(&mut mac, &salt[..], ITER, &mut key);
        key
    };

    let mut tag = [0; TAG_SIZE];
    let mut encrypted: Vec<u8> = repeat(0).take(data.len()).collect();
    {
        ChaCha20Poly1305::new(&key, &nonce, &[]).encrypt(&data, &mut encrypted, &mut tag);
    }

    let mut output = Vec::with_capacity(data.len() + METADATA_SIZE);
    output.extend_from_slice(&salt);
    output.extend_from_slice(&nonce);
    output.extend_from_slice(&tag);
    output.extend_from_slice(&encrypted);

    Ok(output.encode_hex::<String>())
}

#[wasm_bindgen]
pub fn decrypt_with_password(
    password: &str,
    data: &str,
) -> Result<String, JsError> {
    use password_encryption_parameter::*;
    let password = hex::decode(password).map_err(|e| JsError::from_str(&e.to_string()))?;
    let data = hex::decode(data).map_err(|e| JsError::from_str(&e.to_string()))?;

    if data.len() <= METADATA_SIZE {
        // not enough input to decrypt.
        return Err(JsError::from_str("Missing input data"));
    }

    let salt = &data[SALT_START..SALT_END];
    let nonce = &data[NONCE_START..NONCE_END];
    let tag = &data[TAG_START..TAG_END];
    let encrypted = &data[ENCRYPTED_START..];

    let key = {
        let mut mac = Hmac::new(Sha512::new(), &password);
        let mut key: Vec<u8> = repeat(0).take(KEY_SIZE).collect();
        pbkdf2(&mut mac, &salt[..], ITER, &mut key);
        key
    };

    let mut decrypted: Vec<u8> = repeat(0).take(encrypted.len()).collect();
    let decryption_succeed =
        { ChaCha20Poly1305::new(&key, &nonce, &[]).decrypt(&encrypted, &mut decrypted, &tag) };

    if decryption_succeed {
        Ok(decrypted.encode_hex::<String>())
    } else {
        Err(JsError::from_str("Decryption error"))
    }
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encryption() {
        let password = String::from("70617373776f7264");
        let salt = String::from("50515253c0c1c2c3c4c5c6c750515253c0c1c2c3c4c5c6c750515253c0c1c2c3");
        let nonce = String::from("50515253c0c1c2c3c4c5c6c7");
        let data = String::from("736f6d65206461746120746f20656e6372797074");
        let encrypted_data = encrypt_with_password(&password, &salt, &nonce, &data).unwrap();
        let decrypted_data = decrypt_with_password(&password, &encrypted_data).unwrap();
        assert_eq!(data, decrypted_data);
    }
}
