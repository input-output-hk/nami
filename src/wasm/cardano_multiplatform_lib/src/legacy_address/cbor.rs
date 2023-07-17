//! the CBOR util and compatible with the haskell usage...

pub mod util {
    //! CBor util and other stuff

    use crate::legacy_address::crc32::crc32;
    use cbor_event::{self, de::Deserializer, se::Serializer, Len, cbor};

    pub fn encode_with_crc32_<T, W>(t: &T, s: &mut Serializer<W>) -> cbor_event::Result<()>
    where
        T: cbor_event::Serialize,
        W: ::std::io::Write + Sized,
    {
        let bytes = cbor!(t)?;
        let crc32 = crc32(&bytes);
        s.write_array(Len::Len(2))?
            .write_tag(24)?
            .write_bytes(&bytes)?
            .write_unsigned_integer(crc32 as u64)?;
        Ok(())
    }
    pub fn raw_with_crc32<R: std::io::BufRead>(
        raw: &mut Deserializer<R>,
    ) -> cbor_event::Result<Vec<u8>> {
        let len = raw.array()?;
        assert!(len == Len::Len(2));

        let tag = raw.tag()?;
        if tag != 24 {
            return Err(cbor_event::Error::CustomError(format!(
                "Invalid Tag: {} but expected 24",
                tag
            )));
        }
        let bytes = raw.bytes()?;

        let crc = raw.unsigned_integer()?;

        let found_crc = crc32(&bytes);

        if crc != found_crc as u64 {
            return Err(cbor_event::Error::CustomError(format!(
                "Invalid CRC32: 0x{:x} but expected 0x{:x}",
                crc, found_crc
            )));
        }

        Ok(bytes)
    }

    #[cfg(test)]
    #[cfg(feature = "with-bench")]
    mod bench {
        use super::*;
        use cbor_event::{
            self,
            de::RawCbor,
            se::{Serialize, Serializer},
        };

        #[cfg(feature = "with-bench")]
        use test;

        const CBOR: &'static [u8] = &[
            0x82, 0xd8, 0x18, 0x53, 0x52, 0x73, 0x6f, 0x6d, 0x65, 0x20, 0x72, 0x61, 0x6e, 0x64,
            0x6f, 0x6d, 0x20, 0x73, 0x74, 0x72, 0x69, 0x6e, 0x67, 0x1a, 0x71, 0xad, 0x58, 0x36,
        ];

        const BYTES: &'static [u8] = b"some bytes";

        #[bench]
        fn encode_crc32_with_cbor_event(b: &mut test::Bencher) {
            b.iter(|| {
                let _ = encode_with_crc32_(&Test(BYTES), Serializer::new_vec()).unwrap();
            })
        }

        #[bench]
        fn decode_crc32_with_cbor_event(b: &mut test::Bencher) {
            b.iter(|| {
                let mut raw = RawCbor::from(CBOR);
                let bytes = raw_with_crc32(&mut raw).unwrap();
            })
        }

        struct Test(&'static [u8]);
        impl Serialize for Test {
            fn serialize<'se, W>(
                &self,
                serializer: &'se mut Serializer<W>,
            ) -> cbor_event::Result<&'se mut Serializer<W>>
            where
                W: ::std::io::Write,
            {
                serializer.write_bytes(self.0)
            }
        }
    }
}
