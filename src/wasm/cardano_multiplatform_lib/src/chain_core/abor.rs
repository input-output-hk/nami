/// ABOR Encoder
pub struct Encoder {
    data: Vec<u8>,
    hole: Vec<(usize, usize)>,
    current_element: usize,
}

/// ABOR Types
#[repr(u8)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Tag {
    U8 = 1,
    U16 = 2,
    U32 = 3,
    U64 = 4,
    U128 = 5,
    Bytes = 6,
    Array = 7,
}

impl Tag {
    pub fn from_u8(v: u8) -> Option<Tag> {
        match v {
            1 => Some(Tag::U8),
            2 => Some(Tag::U16),
            3 => Some(Tag::U32),
            4 => Some(Tag::U64),
            5 => Some(Tag::U128),
            6 => Some(Tag::Bytes),
            7 => Some(Tag::Array),
            _ => None,
        }
    }
}

impl Encoder {
    pub fn new() -> Self {
        Encoder {
            data: Vec::new(),
            hole: Vec::new(),
            current_element: 0,
        }
    }

    fn push_byte(self, u: u8) -> Self {
        let mut v = self.data;
        v.push(u);
        Self {
            data: v,
            hole: self.hole,
            current_element: self.current_element,
        }
    }

    fn push_tag(self, tag: Tag) -> Self {
        self.push_byte(tag as u8)
    }

    fn push_slice(self, s: &[u8]) -> Self {
        let mut v = self.data;
        v.extend_from_slice(s);
        Self {
            data: v,
            hole: self.hole,
            current_element: self.current_element,
        }
    }

    fn incr(self) -> Self {
        Self {
            data: self.data,
            hole: self.hole,
            current_element: self.current_element + 1,
        }
    }

    /// Add an unsigned byte
    pub fn u8(self, u: u8) -> Self {
        self.push_tag(Tag::U8).push_byte(u).incr()
    }

    /// Add a 16-bit unsigned value in little endian format
    pub fn u16(self, u: u16) -> Self {
        self.push_tag(Tag::U16).push_slice(&u.to_le_bytes()).incr()
    }

    /// Add a 32-bit unsigned value in little endian format
    pub fn u32(self, u: u32) -> Self {
        self.push_tag(Tag::U32).push_slice(&u.to_le_bytes()).incr()
    }

    /// Add a 64-bit unsigned value in little endian format
    pub fn u64(self, u: u64) -> Self {
        self.push_tag(Tag::U64).push_slice(&u.to_le_bytes()).incr()
    }

    /// Add a 128-bit unsigned value in little endian format
    pub fn u128(self, u: u128) -> Self {
        self.push_tag(Tag::U128).push_slice(&u.to_le_bytes()).incr()
    }

    /// cannot serialize more than 256 bytes of contiguous data
    pub fn bytes(self, bs: &[u8]) -> Self {
        assert!(bs.len() < 256);
        self.push_tag(Tag::Bytes)
            .push_byte(bs.len() as u8)
            .push_slice(&bs)
            .incr()
    }

    /// Array cannot contain more than 256 elements
    pub fn struct_start(self) -> Self {
        let mut d = self.push_tag(Tag::Array);
        let mut h = d.hole;
        let c = d.current_element + 1;
        h.push((c, d.data.len()));
        d.data.push(0xfe); // placeholder poison until struct end fill the actual size
        Self {
            data: d.data,
            hole: h,
            current_element: c,
        }
    }

    /// Terminate an array
    pub fn struct_end(self) -> Self {
        let mut h = self.hole;
        match h.pop() {
            None => panic!("unmatched end"),
            Some((start_element, ofs)) => {
                let mut v = self.data;
                let nb_elements = self.current_element - start_element;
                assert!(nb_elements < 256);
                v[ofs] = nb_elements as u8;
                Self {
                    data: v,
                    hole: h,
                    current_element: self.current_element,
                }
            }
        }
    }

    /// Finalize the encoder into an immutable array of data
    pub fn finalize(self) -> Box<[u8]> {
        assert_eq!(self.hole.len(), 0);
        self.data.into()
    }
}

/// Create a decoder on some data
pub struct Decoder<'a> {
    slice: &'a [u8],
    //ctx: Vec<usize>,
    //element: usize,
}

#[derive(Debug, Clone)]
pub enum DecodeError {
    EndOfStream,
    StreamTooSmall { want: usize, has: usize },
    StreamPending { left: usize },
    TypeUnknown(u8),
    TypeMismatch { got: Tag, expected: Tag },
}

impl<'a> Decoder<'a> {
    #[must_use]
    pub fn new(data: &'a [u8]) -> Self {
        Decoder { slice: data }
    }

    #[must_use]
    fn pop(&mut self) -> Result<u8, DecodeError> {
        if self.slice.len() > 0 {
            let v = self.slice[0];
            self.slice = &self.slice[1..];
            Ok(v)
        } else {
            Err(DecodeError::EndOfStream)
        }
    }

    #[must_use]
    fn expect_tag(&mut self, tag: Tag) -> Result<(), DecodeError> {
        let t = self.pop()?;
        match Tag::from_u8(t) {
            None => Err(DecodeError::TypeUnknown(self.slice[0])),
            Some(got) if got == tag => Ok(()),
            Some(got) => Err(DecodeError::TypeMismatch { got, expected: tag }),
        }
    }

    #[must_use]
    fn expect_size(&self, nb_bytes: usize) -> Result<(), DecodeError> {
        if nb_bytes <= self.slice.len() {
            Ok(())
        } else {
            Err(DecodeError::StreamTooSmall {
                want: nb_bytes,
                has: self.slice.len(),
            })
        }
    }

    #[must_use]
    fn expect_tag_size(&mut self, tag: Tag, nb_bytes: usize) -> Result<(), DecodeError> {
        self.expect_tag(tag)?;
        self.expect_size(nb_bytes)
    }

    #[must_use]
    pub fn array(&mut self) -> Result<usize, DecodeError> {
        self.expect_tag_size(Tag::Array, 1)?;
        let len = self.pop()?;
        Ok(len as usize)
    }

    #[must_use]
    pub fn u8(&mut self) -> Result<u8, DecodeError> {
        self.expect_tag_size(Tag::U8, 1)?;
        let len = self.pop()?;
        Ok(len)
    }

    #[must_use]
    pub fn u16(&mut self) -> Result<u16, DecodeError> {
        self.expect_tag_size(Tag::U16, 2)?;
        let v = {
            let mut b = [0; 2];
            b.copy_from_slice(&self.slice[0..2]);
            u16::from_le_bytes(b)
        };
        self.slice = &self.slice[2..];
        Ok(v)
    }

    #[must_use]
    pub fn u32(&mut self) -> Result<u32, DecodeError> {
        self.expect_tag_size(Tag::U32, 2)?;
        let v = {
            let mut b = [0; 4];
            b.copy_from_slice(&self.slice[0..4]);
            u32::from_le_bytes(b)
        };
        self.slice = &self.slice[4..];
        Ok(v)
    }

    #[must_use]
    pub fn u64(&mut self) -> Result<u64, DecodeError> {
        self.expect_tag_size(Tag::U64, 8)?;
        let v = {
            let mut b = [0; 8];
            b.copy_from_slice(&self.slice[0..8]);
            u64::from_le_bytes(b)
        };
        self.slice = &self.slice[8..];
        Ok(v)
    }

    #[must_use]
    pub fn u128(&mut self) -> Result<u128, DecodeError> {
        self.expect_tag_size(Tag::U128, 16)?;
        let v = {
            let mut b = [0; 16];
            b.copy_from_slice(&self.slice[0..16]);
            u128::from_le_bytes(b)
        };
        self.slice = &self.slice[16..];
        Ok(v)
    }

    #[must_use]
    pub fn bytes(&mut self) -> Result<Box<[u8]>, DecodeError> {
        self.expect_tag_size(Tag::Bytes, 1)?;
        let len = self.pop()? as usize;
        self.expect_size(len)?;
        let mut v = Vec::with_capacity(len);
        v.extend_from_slice(&self.slice[0..len]);
        self.slice = &self.slice[len..];
        Ok(v.into())
    }

    #[must_use]
    pub fn end(self) -> Result<(), DecodeError> {
        if self.slice.len() == 0 {
            Ok(())
        } else {
            Err(DecodeError::StreamPending {
                left: self.slice.len(),
            })
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    pub fn serialize_unit1() {
        let v = 0xf1235_fc;
        let e = Encoder::new().u32(v).finalize();
        let mut d = Decoder::new(&e);
        let ev = d.u32().unwrap();
        assert_eq!(d.end().is_ok(), true);
        assert_eq!(v, ev)
    }

    #[test]
    pub fn serialize_unit2() {
        let v1 = 10;
        let v2 = 0x12345;
        let v3 = 0xffeeddcc00112233;
        let v4 = 0xffeeddcc0011223321490219480912;
        let bs1 = vec![1, 2, 3, 4, 5, 6, 7, 8, 9];
        let e = Encoder::new()
            .u16(v1)
            .u32(v2)
            .u64(v3)
            .u128(v4)
            .bytes(&bs1[..])
            .finalize();
        let mut d = Decoder::new(&e);
        let ev1 = d.u16().unwrap();
        let ev2 = d.u32().unwrap();
        let ev3 = d.u64().unwrap();
        let ev4 = d.u128().unwrap();
        let ebs1 = d.bytes().unwrap();
        let is_end = d.end();
        assert_eq!(v1, ev1);
        assert_eq!(v2, ev2);
        assert_eq!(v3, ev3);
        assert_eq!(v4, ev4);
        assert_eq!(&bs1[..], &ebs1[..]);
        assert_eq!(
            is_end.is_ok(),
            true,
            "not reached end {:?}",
            is_end.unwrap_err()
        );
    }
}
