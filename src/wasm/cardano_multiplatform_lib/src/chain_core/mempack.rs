use std::error::Error;
use std::fmt;
use std::num::{NonZeroU32, NonZeroU64};

/// A local memory buffer to serialize data to
pub struct WriteBuf(Vec<u8>);

impl WriteBuf {
    pub fn new() -> Self {
        WriteBuf(Vec::new())
    }

    pub fn put_u8(&mut self, v: u8) {
        self.0.push(v)
    }
    pub fn put_u16(&mut self, v: u16) {
        self.0.extend_from_slice(&v.to_be_bytes())
    }
    pub fn put_u32(&mut self, v: u32) {
        self.0.extend_from_slice(&v.to_be_bytes())
    }
    pub fn put_u64(&mut self, v: u64) {
        self.0.extend_from_slice(&v.to_be_bytes())
    }
    pub fn put_u128(&mut self, v: u128) {
        self.0.extend_from_slice(&v.to_be_bytes())
    }
    pub fn put_bytes(&mut self, v: &[u8]) {
        self.0.extend_from_slice(v)
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ReadError {
    /// Return the number of bytes left and the number of bytes demanded
    NotEnoughBytes(usize, usize),
    /// Data is left in the buffer
    UnconsumedData(usize),
    /// Expecting a size that is above the limit
    SizeTooBig(usize, usize),
    /// Structure of data is not what it should be
    StructureInvalid(String),
    /// Unknown enumeration tag
    UnknownTag(u32),
}

impl fmt::Display for ReadError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            ReadError::NotEnoughBytes(left, demanded) => write!(
                f,
                "NotEnoughBytes: demanded {} bytes but got {}",
                demanded, left
            ),
            ReadError::UnconsumedData(len) => write!(f, "Unconsumed data: {} bytes left", len),
            ReadError::SizeTooBig(e, limit) => write!(
                f,
                "Ask for number of elements {} above expected limit value: {}",
                e, limit
            ),
            ReadError::StructureInvalid(s) => write!(f, "Structure invalid: {}", s),
            ReadError::UnknownTag(t) => write!(f, "Unknown tag: {}", t),
        }
    }
}

impl Error for ReadError {}

/// A local memory slice to read from memory
pub struct ReadBuf<'a> {
    offset: usize,
    data: &'a [u8],
    //trace: Vec<(usize, String)>,
}

impl<'a> ReadBuf<'a> {
    /// Create a readbuf from a slice
    pub fn from(slice: &'a [u8]) -> Self {
        ReadBuf {
            offset: 0,
            data: slice,
            //trace: Vec::new(),
        }
    }

    pub fn position(&self) -> usize {
        self.offset
    }

    fn left(&self) -> usize {
        self.data.len() - self.offset
    }

    fn assure_size(&self, expected: usize) -> Result<(), ReadError> {
        let left = self.left();
        if left >= expected {
            Ok(())
        } else {
            dbg!(self.debug());
            Err(ReadError::NotEnoughBytes(left, expected))
        }
    }

    /// Check if everything has been properly consumed
    pub fn expect_end(&mut self) -> Result<(), ReadError> {
        let l = self.left();
        if l == 0 {
            Ok(())
        } else {
            Err(ReadError::UnconsumedData(l))
        }
    }

    /// Check if we reach the end of the buffer
    pub fn is_end(&self) -> bool {
        self.left() == 0
    }

    /// Skip a number of bytes from the buffer.
    pub fn skip_bytes(&mut self, sz: usize) -> Result<(), ReadError> {
        self.assure_size(sz)?;
        self.offset += sz;
        Ok(())
    }

    /// Return a slice of the next bytes from the buffer
    pub fn get_slice(&mut self, sz: usize) -> Result<&'a [u8], ReadError> {
        self.assure_size(sz)?;
        let s = &self.data[self.offset..self.offset + sz];
        self.offset += sz;
        Ok(s)
    }

    pub fn get_slice_end(&mut self) -> &'a [u8] {
        let s = &self.data[self.offset..];
        self.offset = self.data.len();
        s
    }

    pub fn into_slice_mut(&mut self, slice: &mut [u8]) -> Result<(), ReadError> {
        let s = self.get_slice(slice.len())?;
        slice.copy_from_slice(s);
        Ok(())
    }

    /// Return a sub-buffer ending at the given byte offset
    pub fn split_to(&mut self, sz: usize) -> Result<ReadBuf<'a>, ReadError> {
        let slice = self.get_slice(sz)?;
        Ok(ReadBuf::from(slice))
    }

    /// Peek at the next u8 from the buffer. the cursor is **not** advanced to the next byte.
    pub fn peek_u8(&mut self) -> Result<u8, ReadError> {
        self.assure_size(1)?;
        let v = self.data[self.offset];
        Ok(v)
    }

    /// Return the next u8 from the buffer
    pub fn get_u8(&mut self) -> Result<u8, ReadError> {
        self.assure_size(1)?;
        let v = self.data[self.offset];
        self.offset += 1;
        Ok(v)
    }

    /// Return the next u16 from the buffer
    pub fn get_u16(&mut self) -> Result<u16, ReadError> {
        const SIZE: usize = 2;
        let mut buf = [0u8; SIZE];
        buf.copy_from_slice(self.get_slice(SIZE)?);
        Ok(u16::from_be_bytes(buf))
    }

    /// Return the next u32 from the buffer
    pub fn get_u32(&mut self) -> Result<u32, ReadError> {
        const SIZE: usize = 4;
        let mut buf = [0u8; SIZE];
        buf.copy_from_slice(self.get_slice(SIZE)?);
        Ok(u32::from_be_bytes(buf))
    }

    pub fn get_nz_u32(&mut self) -> Result<NonZeroU32, ReadError> {
        let v = self.get_u32()?;
        NonZeroU32::new(v).ok_or(ReadError::StructureInvalid("received zero u32".to_string()))
    }

    /// Return the next u64 from the buffer
    pub fn get_u64(&mut self) -> Result<u64, ReadError> {
        const SIZE: usize = 8;
        let mut buf = [0u8; SIZE];
        buf.copy_from_slice(self.get_slice(SIZE)?);
        Ok(u64::from_be_bytes(buf))
    }

    pub fn get_nz_u64(&mut self) -> Result<NonZeroU64, ReadError> {
        let v = self.get_u64()?;
        NonZeroU64::new(v).ok_or(ReadError::StructureInvalid("received zero u64".to_string()))
    }

    /// Return the next u128 from the buffer
    pub fn get_u128(&mut self) -> Result<u128, ReadError> {
        const SIZE: usize = 16;
        let mut buf = [0u8; SIZE];
        buf.copy_from_slice(self.get_slice(SIZE)?);
        Ok(u128::from_be_bytes(buf))
    }

    /*
    pub fn trace(&mut self, s: &str) {
        self.trace.push((self.offset, s.to_string()))
    }
    */

    pub fn debug(&self) -> String {
        let mut s = String::new();
        for (i, x) in self.data.iter().enumerate() {
            //self.trace.iter().find(|(ofs,_)| ofs == &i).map(|(_,name)| { s.push_str(&name); s.push(' ') });
            if i == self.offset {
                s.push_str(&".. ");
            }
            let bytes = format!("{:02x} ", x);
            s.push_str(&bytes);
        }
        s
    }
}

pub trait Readable: Sized {
    fn read<'a>(buf: &mut ReadBuf<'a>) -> Result<Self, ReadError>;

    fn read_validate<'a>(buf: &mut ReadBuf<'a>) -> Result<(), ReadError> {
        Self::read(buf).map(|_| ())
    }
}

impl Readable for () {
    fn read<'a>(_: &mut ReadBuf<'a>) -> Result<(), ReadError> {
        Ok(())
    }
    fn read_validate<'a>(buf: &mut ReadBuf<'a>) -> Result<(), ReadError> {
        Self::read(buf)
    }
}

macro_rules! read_prim_impl {
    ($Ty: ty, $meth: ident) => {
        impl Readable for $Ty {
            fn read<'a>(buf: &mut ReadBuf<'a>) -> Result<Self, ReadError> {
                buf.$meth()
            }
        }
    };
}

read_prim_impl! { u8, get_u8 }
read_prim_impl! { u16, get_u16 }
read_prim_impl! { u32, get_u32 }
read_prim_impl! { u64, get_u64 }
read_prim_impl! { u128, get_u128 }

macro_rules! read_array_impls {
    ($($N: expr)+) => {
        $(
        impl Readable for [u8; $N] {
            fn read<'a>(readbuf: &mut ReadBuf<'a>) -> Result<Self, ReadError> {
                let mut buf = [0u8; $N];
                buf.copy_from_slice(readbuf.get_slice($N)?);
                Ok(buf)
            }
        }
        )+
    };
}

read_array_impls! {
    4 8 12 16 20 24 28 32 64 96 128
}

/// read N times for a T elements in sequences
pub fn read_vec<'a, T: Readable>(readbuf: &mut ReadBuf<'a>, n: usize) -> Result<Vec<T>, ReadError> {
    let mut v = Vec::with_capacity(n);
    for _ in 0..n {
        let t = T::read(readbuf)?;
        v.push(t)
    }
    Ok(v)
}

/// Fill a mutable slice with as many T as filling requires
pub fn read_mut_slice<'a, T: Readable>(
    readbuf: &mut ReadBuf<'a>,
    v: &mut [T],
) -> Result<(), ReadError> {
    for i in 0..v.len() {
        let t = T::read(readbuf)?;
        v[i] = t
    }
    Ok(())
}

/// Transform a raw buffer into a Header
pub fn read_from_raw<T: Readable>(raw: &[u8]) -> Result<T, std::io::Error> {
    let mut rbuf = ReadBuf::from(raw);
    match T::read(&mut rbuf) {
        Err(e) => {
            return Err(std::io::Error::new(
                std::io::ErrorKind::InvalidData,
                format!("invalid data {:?} {:?}", e, raw).to_owned(),
            ));
        }
        Ok(h) => match rbuf.expect_end() {
            Err(e) => {
                return Err(std::io::Error::new(
                    std::io::ErrorKind::InvalidData,
                    format!("end of data {:?}", e).to_owned(),
                ));
            }
            Ok(()) => Ok(h),
        },
    }
}
