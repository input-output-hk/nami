use bech32::{Error as Bech32Error, FromBase32, ToBase32};
use std::error::Error as StdError;
use std::fmt;
use std::result::Result as StdResult;

pub type Result<T> = StdResult<T, Error>;

pub trait Bech32 {
    const BECH32_HRP: &'static str;

    fn try_from_bech32_str(bech32_str: &str) -> Result<Self>
    where
        Self: Sized;

    fn to_bech32_str(&self) -> String;
}

pub fn to_bech32_from_bytes<B: Bech32>(bytes: &[u8]) -> String {
    bech32::encode(B::BECH32_HRP, bytes.to_base32())
        .unwrap_or_else(|e| panic!("Failed to build bech32: {}", e))
        .to_string()
}

pub fn try_from_bech32_to_bytes<B: Bech32>(bech32_str: &str) -> Result<Vec<u8>> {
    let (hrp, bech32_data) = bech32::decode(bech32_str)?;
    if hrp != B::BECH32_HRP {
        return Err(Error::HrpInvalid {
            expected: B::BECH32_HRP,
            actual: hrp
        });
    }
    Vec::<u8>::from_base32(&bech32_data).map_err(Into::into)
}

#[derive(Debug)]
pub enum Error {
    Bech32Malformed(Bech32Error),
    HrpInvalid {
        expected: &'static str,
        actual: String,
    },
    DataInvalid(Box<dyn StdError + Send + Sync + 'static>),
}

impl Error {
    pub fn data_invalid(cause: impl StdError + Send + Sync + 'static) -> Self {
        Error::DataInvalid(Box::new(cause))
    }
}

impl From<Bech32Error> for Error {
    fn from(error: Bech32Error) -> Self {
        Error::Bech32Malformed(error)
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter) -> StdResult<(), fmt::Error> {
        match self {
            Error::Bech32Malformed(_) => write!(f, "Failed to parse bech32, invalid data format"),
            Error::HrpInvalid { expected, actual } => write!(
                f,
                "Parsed bech32 has invalid HRP prefix '{}', expected '{}'",
                actual, expected
            ),
            Error::DataInvalid(_) => write!(f, "Failed to parse data decoded from bech32"),
        }
    }
}

impl StdError for Error {
    fn source(&self) -> Option<&(dyn StdError + 'static)> {
        match self {
            Error::Bech32Malformed(cause) => Some(cause),
            Error::DataInvalid(cause) => Some(&**cause),
            _ => None,
        }
    }
}
