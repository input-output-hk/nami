//! Address creation and parsing
//!
//! Address components are:
//! * `HashedSpendingData` computed from `SpendingData`
//! * `Attributes`
//! * `AddrType`
//!
//! All this components form an `ExtendedAddr`, which serialized
//! to binary makes an `Addr`
//!

use crate::legacy_address::base58;
use crate::legacy_address::cbor;
use cbor_event::{self, de::Deserializer, se::Serializer, cbor};
use cryptoxide::blake2b::Blake2b;
use cryptoxide::digest::Digest;
use cryptoxide::sha3;
use ed25519_bip32::XPub;

use std::{
    convert::{TryFrom, TryInto},
    fmt,
    io::{BufRead, Write},
};

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Copy, Clone)]
#[cfg_attr(feature = "generic-serialization", derive(Serialize, Deserialize))]
pub enum AddrType {
    ATPubKey,
    ATScript,
    ATRedeem,
}
impl fmt::Display for AddrType {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            AddrType::ATPubKey => write!(f, "Public Key"),
            AddrType::ATScript => write!(f, "Script"),
            AddrType::ATRedeem => write!(f, "Redeem"),
        }
    }
}
// [TkListLen 1, TkInt (fromEnum t)]
impl AddrType {
    fn from_u64(v: u64) -> Option<Self> {
        match v {
            0 => Some(AddrType::ATPubKey),
            1 => Some(AddrType::ATScript),
            2 => Some(AddrType::ATRedeem),
            _ => None,
        }
    }
    fn to_byte(self) -> u8 {
        match self {
            AddrType::ATPubKey => 0,
            AddrType::ATScript => 1,
            AddrType::ATRedeem => 2,
        }
    }
}
impl cbor_event::se::Serialize for AddrType {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        serializer.write_unsigned_integer(self.to_byte() as u64)
    }
}
impl cbor_event::de::Deserialize for AddrType {
    fn deserialize<R: BufRead>(reader: &mut Deserializer<R>) -> cbor_event::Result<Self> {
        match AddrType::from_u64(reader.unsigned_integer()?) {
            Some(addr_type) => Ok(addr_type),
            None => Err(cbor_event::Error::CustomError(format!("Invalid AddrType"))),
        }
    }
}

type HDAddressPayload = Vec<u8>;

#[derive(Debug, Clone, Eq, Hash, Ord, PartialEq, PartialOrd)]
pub struct Attributes {
    pub derivation_path: Option<HDAddressPayload>,
    pub protocol_magic: Option<u32>,
}
impl Attributes {
    pub fn new_bootstrap_era(hdap: Option<HDAddressPayload>, protocol_magic: Option<u32>) -> Self {
        Attributes {
            derivation_path: hdap,
            protocol_magic,
        }
    }
}

const ATTRIBUTE_NAME_TAG_DERIVATION: u64 = 1;
const ATTRIBUTE_NAME_TAG_PROTOCOL_MAGIC: u64 = 2;

impl cbor_event::se::Serialize for Attributes {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        let mut len = 0;
        if let Some(_) = &self.derivation_path {
            len += 1
        };
        if let Some(_) = &self.protocol_magic {
            len += 1
        };
        let serializer = serializer.write_map(cbor_event::Len::Len(len))?;
        let serializer = match &self.derivation_path {
            &None => serializer,
            &Some(ref dp) => serializer
                .write_unsigned_integer(ATTRIBUTE_NAME_TAG_DERIVATION)?
                .write_bytes(&dp)?,
        };
        let serializer = match &self.protocol_magic {
            &None => serializer,
            &Some(protocol_magic) => serializer
                .write_unsigned_integer(ATTRIBUTE_NAME_TAG_PROTOCOL_MAGIC)?
                .write_bytes(cbor!(&protocol_magic)?)?,
        };
        Ok(serializer)
    }
}
impl cbor_event::de::Deserialize for Attributes {
    fn deserialize<R: BufRead>(reader: &mut Deserializer<R>) -> cbor_event::Result<Self> {
        let len = reader.map()?;
        let mut len = match len {
            cbor_event::Len::Indefinite => {
                return Err(cbor_event::Error::CustomError(format!(
                    "Invalid Attributes: received map of {:?} elements",
                    len
                )));
            }
            cbor_event::Len::Len(len) => len,
        };
        let mut derivation_path = None;
        let mut protocol_magic = None;
        while len > 0 {
            let key = reader.unsigned_integer()?;
            match key {
                ATTRIBUTE_NAME_TAG_DERIVATION => derivation_path = Some(reader.bytes()?),
                ATTRIBUTE_NAME_TAG_PROTOCOL_MAGIC => {
                    // Yes, this is an integer encoded as CBOR encoded as Bytes in CBOR.
                    let bytes = reader.bytes()?;
                    let n = Deserializer::from(std::io::Cursor::new(bytes)).deserialize::<u32>()?;
                    protocol_magic = Some(n);
                }
                _ => {
                    return Err(cbor_event::Error::CustomError(format!(
                        "invalid Attribute key {}",
                        key
                    )));
                }
            }
            len -= 1;
        }
        Ok(Attributes {
            derivation_path,
            protocol_magic,
        })
    }
}

// calculate the hash of the data using SHA3 digest then using Blake2b224
fn sha3_then_blake2b224(data: &[u8]) -> [u8; 28] {
    let mut sh3 = sha3::Sha3_256::new();
    let mut sh3_out = [0; 32];
    sh3.input(data.as_ref());
    sh3.result(&mut sh3_out);

    let mut b2b = Blake2b::new(28);
    let mut out = [0; 28];
    b2b.input(&sh3_out[..]);
    b2b.result(&mut out);
    out
}

fn hash_spending_data(addr_type: AddrType, xpub: &XPub, attrs: &Attributes) -> [u8; 28] {
    let buf = cbor!(&(&addr_type, &SpendingData(xpub), attrs))
        .expect("serialize the HashedSpendingData's digest data");
    sha3_then_blake2b224(&buf)
}

/// A valid cardano Address that is displayed in base58
#[derive(Debug, Clone, Eq, Hash, Ord, PartialEq, PartialOrd)]
pub struct Addr(Vec<u8>);

#[derive(Debug, Clone, Eq, Hash, Ord, PartialEq, PartialOrd)]
pub enum AddressMatchXPub {
    Yes,
    No,
}

impl Addr {
    pub fn deconstruct(&self) -> ExtendedAddr {
        let mut raw = Deserializer::from(std::io::Cursor::new(&self.0));
        cbor_event::de::Deserialize::deserialize(&mut raw).unwrap() // unwrap should never fail from addr to extended addr
    }

    /// Check if the Addr can be reconstructed with a specific xpub
    pub fn identical_with_pubkey(&self, xpub: &XPub) -> AddressMatchXPub {
        let ea = self.deconstruct();
        let newea = ExtendedAddr::new(xpub, ea.attributes);
        if self == &newea.to_address() {
            AddressMatchXPub::Yes
        } else {
            AddressMatchXPub::No
        }
    }

    /// mostly helper of the previous function, so not to have to expose the xpub construction
    pub fn identical_with_pubkey_raw(&self, xpub: &[u8]) -> AddressMatchXPub {
        match XPub::from_slice(xpub) {
            Ok(xpub) => self.identical_with_pubkey(&xpub),
            _ => AddressMatchXPub::No,
        }
    }
}

impl AsRef<[u8]> for Addr {
    fn as_ref(&self) -> &[u8] {
        self.0.as_ref()
    }
}

impl TryFrom<&[u8]> for Addr {
    type Error = cbor_event::Error;

    fn try_from(slice: &[u8]) -> Result<Self, Self::Error> {
        let mut v = Vec::new();
        // TODO we only want validation of slice here, but we don't have api to do that yet.
        {
            let mut raw = Deserializer::from(std::io::Cursor::new(&slice));
            let _: ExtendedAddr = cbor_event::de::Deserialize::deserialize(&mut raw)?;
        }
        v.extend_from_slice(slice);
        Ok(Addr(v))
    }
}

impl ::std::str::FromStr for Addr {
    type Err = ParseExtendedAddrError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let bytes = base58::decode(s).map_err(ParseExtendedAddrError::Base58Error)?;
        Self::try_from(&bytes[..]).map_err(ParseExtendedAddrError::EncodingError)
    }
}

impl From<ExtendedAddr> for Addr {
    fn from(ea: ExtendedAddr) -> Self {
        ea.to_address()
    }
}

impl fmt::Display for Addr {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", base58::encode(&self.0))
    }
}

impl cbor_event::se::Serialize for Addr {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        // Addr is already serialized
        serializer.write_raw_bytes(&self.0)
    }
}
impl cbor_event::de::Deserialize for Addr {
    fn deserialize<R: BufRead>(reader: &mut Deserializer<R>) -> cbor_event::Result<Self> {
        let ea: ExtendedAddr = cbor_event::de::Deserialize::deserialize(reader)?;
        Ok(ea.to_address())
    }
}

const EXTENDED_ADDR_LEN: usize = 28;

/// A valid cardano address deconstructed
#[derive(Debug, Clone, Eq, Ord, PartialEq, PartialOrd)]
pub struct ExtendedAddr {
    pub addr: [u8; EXTENDED_ADDR_LEN],
    pub attributes: Attributes,
    pub addr_type: AddrType,
}
impl ExtendedAddr {
    pub fn new(xpub: &XPub, attrs: Attributes) -> Self {
        ExtendedAddr {
            addr: hash_spending_data(AddrType::ATPubKey, xpub, &attrs),
            attributes: attrs,
            addr_type: AddrType::ATPubKey,
        }
    }

    // bootstrap era + no hdpayload address
    pub fn new_simple(xpub: &XPub, protocol_magic: Option<u32>) -> Self {
        ExtendedAddr::new(xpub, Attributes::new_bootstrap_era(None, protocol_magic))
    }

    pub fn to_address(&self) -> Addr {
        Addr(cbor!(self).unwrap()) // unwrap should never fail from strongly typed extended addr to addr
    }
}
#[derive(Debug)]
pub enum ParseExtendedAddrError {
    EncodingError(cbor_event::Error),
    Base58Error(base58::Error),
}

impl fmt::Display for ParseExtendedAddrError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        use ParseExtendedAddrError::*;
        match self {
            EncodingError(_error) => f.write_str("encoding error"),
            Base58Error(_error) => f.write_str("base58 error"),
        }
    }
}

impl std::error::Error for ParseExtendedAddrError {
    fn source<'a>(&'a self) -> Option<&'a (dyn std::error::Error + 'static)> {
        use ParseExtendedAddrError::*;
        match self {
            EncodingError(ref error) => Some(error),
            Base58Error(ref error) => Some(error),
        }
    }
}

impl ::std::str::FromStr for ExtendedAddr {
    type Err = ParseExtendedAddrError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let bytes = base58::decode(s).map_err(ParseExtendedAddrError::Base58Error)?;

        Self::try_from(&bytes[..]).map_err(ParseExtendedAddrError::EncodingError)
    }
}
impl TryFrom<&[u8]> for ExtendedAddr {
    type Error = cbor_event::Error;

    fn try_from(slice: &[u8]) -> Result<Self, Self::Error> {
        let mut raw = Deserializer::from(std::io::Cursor::new(slice));
        cbor_event::de::Deserialize::deserialize(&mut raw)
    }
}
impl cbor_event::se::Serialize for ExtendedAddr {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        let addr_bytes = cbor_event::Value::Bytes(self.addr.to_vec());
        cbor::util::encode_with_crc32_(&(&addr_bytes, &self.attributes, &self.addr_type), serializer)?;
        Ok(serializer)
    }
}
impl cbor_event::de::Deserialize for ExtendedAddr {
    fn deserialize<R: BufRead>(reader: &mut Deserializer<R>) -> cbor_event::Result<Self> {
        let bytes = cbor::util::raw_with_crc32(reader)?;
        let mut raw = Deserializer::from(std::io::Cursor::new(bytes));
        raw.tuple(3, "ExtendedAddr")?;
        let addr_bytes = raw.bytes()?;
        let addr = addr_bytes.as_slice().try_into().map_err(|_| {
            cbor_event::Error::WrongLen(
                addr_bytes.len() as u64,
                cbor_event::Len::Len(EXTENDED_ADDR_LEN as u64),
                "invalid extended address length",
            )
        })?;
        let attributes = cbor_event::de::Deserialize::deserialize(&mut raw)?;
        let addr_type = cbor_event::de::Deserialize::deserialize(&mut raw)?;
        Ok(ExtendedAddr { addr, addr_type, attributes })
    }
}
impl fmt::Display for ExtendedAddr {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.to_address())
    }
}

const SPENDING_DATA_TAG_PUBKEY: u64 = 0;

#[derive(Debug, PartialEq, Eq, Clone)]
pub struct SpendingData<'a>(&'a XPub);

impl<'a> cbor_event::se::Serialize for SpendingData<'a> {
    fn serialize<'se, W: Write>(
        &self,
        serializer: &'se mut Serializer<W>,
    ) -> cbor_event::Result<&'se mut Serializer<W>> {
        let ar: [u8; 64] = self.0.clone().into();
        serializer
            .write_array(cbor_event::Len::Len(2))?
            .write_unsigned_integer(SPENDING_DATA_TAG_PUBKEY)?
            .write_bytes(&ar[..])
    }
}

#[cfg(test)]
mod tests {
    use super::{Addr, AddressMatchXPub};
    use ed25519_bip32::XPub;

    fn assert_same_address(address: Addr, xpub: XPub) {
        assert_eq!(
            address.identical_with_pubkey(&xpub),
            AddressMatchXPub::Yes,
            "expected public key {} to match address {}",
            xpub,
            address,
        )
    }

    #[test]
    fn test_vector_1() {
        let address     = "DdzFFzCqrhsrcTVhLygT24QwTnNqQqQ8mZrq5jykUzMveU26sxaH529kMpo7VhPrt5pwW3dXeB2k3EEvKcNBRmzCfcQ7dTkyGzTs658C".parse().unwrap();
        let public_key = XPub::from_bytes([
            0x6a, 0x50, 0x96, 0x89, 0xc6, 0x53, 0x17, 0x58, 0x65, 0x98, 0x5a, 0xd1, 0xe0, 0xeb,
            0x5f, 0xf9, 0xad, 0xa6, 0x99, 0x7a, 0xa4, 0x03, 0xe6, 0x48, 0x61, 0x4b, 0x3b, 0x78,
            0xfc, 0xba, 0x9c, 0x27, 0x30, 0x82, 0x28, 0xd9, 0x87, 0x2a, 0xf8, 0xb6, 0x5b, 0x98,
            0x7f, 0xf2, 0x3e, 0x1a, 0x20, 0xcd, 0x90, 0xd8, 0x34, 0x6c, 0x31, 0xf0, 0xed, 0xb8,
            0x99, 0x89, 0x52, 0xdc, 0x67, 0x66, 0x55, 0x80,
        ]);
        assert_same_address(address, public_key)
    }

    #[test]
    fn test_vector_2() {
        let address = "DdzFFzCqrht4it4GYgBp4J39FNnKBsPFejSppARXHCf2gGiTJcwXzpRvgDmxPvKQ8aZZmVqcLUz5L66a8Ja46pfKVtFRaKyn9eKdvpaC".parse().unwrap();
        let public_key = XPub::from_bytes([
            0xff, 0x7b, 0xf1, 0x29, 0x9d, 0xf3, 0xd7, 0x17, 0x98, 0xae, 0xfd, 0xc4, 0xae, 0xa7,
            0xdb, 0x2f, 0x8d, 0xb7, 0x60, 0x46, 0x56, 0x94, 0x41, 0xea, 0xe5, 0x8b, 0x72, 0x23,
            0xb6, 0x8b, 0x44, 0x04, 0x82, 0x15, 0xcb, 0xac, 0x94, 0xbc, 0xb7, 0xf2, 0xcf, 0x33,
            0x6c, 0x6c, 0x18, 0xbc, 0x3e, 0x71, 0x3f, 0xfd, 0x82, 0x67, 0x59, 0x4f, 0xf6, 0x34,
            0x93, 0x32, 0xce, 0x4f, 0x98, 0x04, 0xa7, 0xff,
        ]);
        assert_same_address(address, public_key)
    }

    #[test]
    fn test_vector_3() {
        let address = "DdzFFzCqrhsvNQtyViTvEdGxfdc5T1E5RorzFWjYodqjhFDy8fQxfDPccmTc4ePbvkiwvRkR8dtqQ1SHpH53fDSoxD17fo9f6WkRjjAA".parse().unwrap();
        let public_key = XPub::from_bytes([
            0x5c, 0x36, 0x51, 0xe0, 0xeb, 0x9d, 0x6d, 0xc9, 0x64, 0x07, 0x13, 0x7c, 0xcc, 0x1f,
            0x37, 0x7a, 0x87, 0x94, 0x61, 0x77, 0xa5, 0x2c, 0xa3, 0x77, 0x2c, 0x6b, 0x4b, 0xeb,
            0x72, 0x39, 0x50, 0xdc, 0x50, 0x22, 0x46, 0x68, 0x21, 0x8b, 0x8b, 0x36, 0x62, 0x02,
            0xfe, 0x5b, 0x7d, 0x55, 0x6f, 0x50, 0x1c, 0x5c, 0x4e, 0x2d, 0x58, 0xe0, 0x54, 0x67,
            0xe1, 0xab, 0xc0, 0x44, 0xc6, 0xc1, 0xbf, 0x8e,
        ]);
        assert_same_address(address, public_key)
    }

    #[test]
    fn test_vector_4() {
        let address = "DdzFFzCqrhsn7ZAhKy8mxkzW6G3wryM7K6bH38VAjE2FesJMxia3UviivMvGz146TP1FpDharxTE6nUgCCnZx2fmtKpmxAosg9Tf5b8y".parse().unwrap();
        let public_key = XPub::from_bytes([
            0xcd, 0x84, 0x2e, 0x01, 0x0d, 0x81, 0xa6, 0xbe, 0x1e, 0x16, 0x9f, 0xd6, 0x35, 0x21,
            0xdb, 0xb9, 0x5f, 0x42, 0x41, 0xfc, 0x82, 0x3f, 0x45, 0xb1, 0xcf, 0x1a, 0x1c, 0xb4,
            0xc5, 0x89, 0x57, 0x27, 0x1d, 0x4d, 0x14, 0x2a, 0x22, 0x94, 0xea, 0x5f, 0xa3, 0x16,
            0xa4, 0xad, 0xbf, 0xcd, 0x59, 0x7a, 0x7c, 0x89, 0x6a, 0x52, 0xa9, 0xa3, 0xa9, 0xce,
            0x49, 0x64, 0x4a, 0x10, 0x2d, 0x00, 0x71, 0x99,
        ]);
        assert_same_address(address, public_key)
    }

    #[test]
    fn test_vector_5() {
        let address = "DdzFFzCqrhssTCJf4sv664bdQURovAwzx1hNKkMkNLwMNyaxZFuPSDdZTTRMcoDyXHuCiZhbD4umvMJcWGkvFMMzBoBUW5UBdBbDqXGX".parse().unwrap();
        let public_key = XPub::from_bytes([
            0x5a, 0xac, 0x2d, 0xd0, 0xa8, 0xdc, 0x5d, 0x61, 0x0a, 0x4b, 0x6f, 0xdf, 0x3f, 0x5e,
            0xf1, 0xb6, 0x4a, 0xcb, 0x76, 0xb1, 0xe8, 0x1f, 0x6a, 0x35, 0x70, 0x31, 0xfa, 0x19,
            0xd5, 0xe6, 0x56, 0x9d, 0xcc, 0x37, 0xb7, 0xae, 0x6f, 0x39, 0x15, 0x82, 0xfb, 0x05,
            0x4b, 0x72, 0xba, 0xda, 0x90, 0xab, 0x14, 0x6c, 0xdd, 0x01, 0x42, 0x0e, 0x4b, 0x40,
            0x18, 0xf1, 0xa0, 0x55, 0x29, 0x82, 0xd2, 0x31,
        ]);
        assert_same_address(address, public_key)
    }

    #[test]
    fn test_vector_6() {
        let address = "DdzFFzCqrhsfi5fFjJUHYPSnfTYrnMohzh3PrrtrVQgwua33HWPKUdTJXo3o77pSGCmDNrjYaAiZmJddaPW9iHyUDatvU2WhX7MgnNMy".parse().unwrap();
        let public_key = XPub::from_bytes([
            0x2a, 0x6a, 0xd1, 0x51, 0x09, 0x96, 0xff, 0x2d, 0x10, 0x89, 0xcb, 0x8e, 0xd5, 0xf5,
            0xc0, 0x61, 0xf6, 0xad, 0x0a, 0xfb, 0xb5, 0x3d, 0x95, 0x40, 0xa0, 0xfc, 0x89, 0xef,
            0xc0, 0xa2, 0x63, 0xb9, 0x6d, 0xac, 0x00, 0xbd, 0x0d, 0x7b, 0xda, 0x7d, 0x16, 0x3a,
            0x08, 0xdb, 0x20, 0xba, 0x64, 0xb6, 0x33, 0x4d, 0xca, 0x34, 0xea, 0xc8, 0x2c, 0xf7,
            0xb4, 0x91, 0xc3, 0x5f, 0x5c, 0xae, 0xc7, 0xb0,
        ]);
        assert_same_address(address, public_key)
    }

    #[test]
    fn test_vector_7() {
        let address = "DdzFFzCqrhsy2zYMDQRCF4Nw34C3P7aT5B7JwHFQ6gLAeoHgVXurCLPCm3AeV1nTa1Nd46uDoNt16cnsPFkb4fpLi1J17AmvphCtGFz2".parse().unwrap();
        let public_key = XPub::from_bytes([
            0x0c, 0xd2, 0x15, 0x54, 0xa0, 0xf9, 0xb8, 0x25, 0x9c, 0x46, 0x88, 0xdd, 0x00, 0xfc,
            0x01, 0x88, 0x43, 0x50, 0x79, 0x76, 0x4f, 0xa5, 0x50, 0xfb, 0x57, 0x38, 0x2b, 0xff,
            0x43, 0xe2, 0xd8, 0xd8, 0x27, 0x27, 0x4e, 0x2a, 0x12, 0x9f, 0x86, 0xc3, 0x80, 0x88,
            0x34, 0x37, 0x4d, 0xfe, 0x3f, 0xda, 0xa6, 0x28, 0x48, 0x30, 0xb8, 0xf6, 0xe4, 0x0d,
            0x29, 0x93, 0xde, 0xa2, 0xfb, 0x0a, 0xbe, 0x82,
        ]);
        assert_same_address(address, public_key)
    }

    #[test]
    fn test_vector_8() {
        let address = "DdzFFzCqrht8ygB5pLM4uVbS2x4ek2NTDx6R3DJqP7fUaWEkx8RA9UFR8CHitp2R74XLDP876Pe3KLUByHnrWrKWnffpqPpm14rPCxeP".parse().unwrap();
        let public_key = XPub::from_bytes([
            0x1f, 0x0a, 0xb8, 0x33, 0xfd, 0xb1, 0xfa, 0x49, 0x58, 0xce, 0x74, 0x04, 0x81, 0x84,
            0x5b, 0x3a, 0x26, 0x6e, 0xfa, 0xab, 0x2d, 0x65, 0xd1, 0x6b, 0xdd, 0x3d, 0xfe, 0x7f,
            0xcb, 0xe4, 0x46, 0x30, 0x25, 0x9e, 0xd1, 0x91, 0x98, 0x93, 0x03, 0x9d, 0xfd, 0x40,
            0x02, 0x4a, 0x72, 0x03, 0x45, 0x5b, 0x03, 0xd6, 0xd0, 0x0d, 0x0a, 0x5c, 0xd6, 0xee,
            0x82, 0xde, 0x2e, 0xce, 0x73, 0x8a, 0xa1, 0xbf,
        ]);
        assert_same_address(address, public_key)
    }

    #[test]
    fn test_vector_9() {
        let address = "DdzFFzCqrhssTywqjv3dw3EakpEydWQcc3phQzR3YF9NPgQN9Ftkx68FfLLnpJ4vhWo9mAjx5EcpM1wNvorSySrpARZGfk5QugHkVs58".parse().unwrap();
        let public_key = XPub::from_bytes([
            0x16, 0xf7, 0xd2, 0x55, 0x32, 0x6d, 0x77, 0x6e, 0xc1, 0xb5, 0xed, 0xd2, 0x5f, 0x75,
            0xd3, 0xe3, 0xeb, 0xe0, 0xb9, 0xd4, 0x9c, 0xdd, 0xb2, 0x46, 0xd8, 0x0c, 0xf4, 0x1b,
            0x25, 0x24, 0x64, 0xb6, 0x24, 0x50, 0xa2, 0x4e, 0xf5, 0x98, 0x7b, 0x4b, 0xd6, 0x5e,
            0x0d, 0x25, 0x23, 0x43, 0xab, 0xa8, 0xef, 0x77, 0x93, 0x34, 0x79, 0xde, 0xa8, 0xdd,
            0xe2, 0x9e, 0xec, 0x56, 0xcc, 0x6a, 0xc0, 0x69,
        ]);
        assert_same_address(address, public_key)
    }

    #[test]
    fn test_vector_10() {
        let address = "DdzFFzCqrhsqTG4t3uq5UBqFrxhxGVM6bvF4q1QcZXqUpizFddEEip7dx5rbife2s9o2fRU3hVKhRp4higog7As8z42s4AMw6Pcu8vL4".parse().unwrap();
        let public_key = XPub::from_bytes([
            0x97, 0xb8, 0x6c, 0x69, 0xd1, 0x2a, 0xf1, 0x64, 0xdc, 0x87, 0xf2, 0x71, 0x26, 0x8f,
            0x33, 0xbc, 0x4d, 0xee, 0xb0, 0xdf, 0xd3, 0x73, 0xc3, 0xfd, 0x3b, 0xac, 0xd4, 0x47,
            0x53, 0xa3, 0x1d, 0xe7, 0x8f, 0x10, 0xe5, 0x55, 0x03, 0x7c, 0xd4, 0x00, 0x43, 0x6c,
            0xcf, 0xd5, 0x38, 0x0d, 0xbb, 0xcd, 0x4d, 0x7c, 0x28, 0x0a, 0xef, 0x9e, 0xc7, 0x57,
            0x4a, 0xe0, 0xac, 0xac, 0x0c, 0xf7, 0x9e, 0x89,
        ]);
        assert_same_address(address, public_key)
    }
}
