const CRC_TABLE: [u32; 256] = [
    0x00000000u32,
    0x77073096u32,
    0xee0e612cu32,
    0x990951bau32,
    0x076dc419u32,
    0x706af48fu32,
    0xe963a535u32,
    0x9e6495a3u32,
    0x0edb8832u32,
    0x79dcb8a4u32,
    0xe0d5e91eu32,
    0x97d2d988u32,
    0x09b64c2bu32,
    0x7eb17cbdu32,
    0xe7b82d07u32,
    0x90bf1d91u32,
    0x1db71064u32,
    0x6ab020f2u32,
    0xf3b97148u32,
    0x84be41deu32,
    0x1adad47du32,
    0x6ddde4ebu32,
    0xf4d4b551u32,
    0x83d385c7u32,
    0x136c9856u32,
    0x646ba8c0u32,
    0xfd62f97au32,
    0x8a65c9ecu32,
    0x14015c4fu32,
    0x63066cd9u32,
    0xfa0f3d63u32,
    0x8d080df5u32,
    0x3b6e20c8u32,
    0x4c69105eu32,
    0xd56041e4u32,
    0xa2677172u32,
    0x3c03e4d1u32,
    0x4b04d447u32,
    0xd20d85fdu32,
    0xa50ab56bu32,
    0x35b5a8fau32,
    0x42b2986cu32,
    0xdbbbc9d6u32,
    0xacbcf940u32,
    0x32d86ce3u32,
    0x45df5c75u32,
    0xdcd60dcfu32,
    0xabd13d59u32,
    0x26d930acu32,
    0x51de003au32,
    0xc8d75180u32,
    0xbfd06116u32,
    0x21b4f4b5u32,
    0x56b3c423u32,
    0xcfba9599u32,
    0xb8bda50fu32,
    0x2802b89eu32,
    0x5f058808u32,
    0xc60cd9b2u32,
    0xb10be924u32,
    0x2f6f7c87u32,
    0x58684c11u32,
    0xc1611dabu32,
    0xb6662d3du32,
    0x76dc4190u32,
    0x01db7106u32,
    0x98d220bcu32,
    0xefd5102au32,
    0x71b18589u32,
    0x06b6b51fu32,
    0x9fbfe4a5u32,
    0xe8b8d433u32,
    0x7807c9a2u32,
    0x0f00f934u32,
    0x9609a88eu32,
    0xe10e9818u32,
    0x7f6a0dbbu32,
    0x086d3d2du32,
    0x91646c97u32,
    0xe6635c01u32,
    0x6b6b51f4u32,
    0x1c6c6162u32,
    0x856530d8u32,
    0xf262004eu32,
    0x6c0695edu32,
    0x1b01a57bu32,
    0x8208f4c1u32,
    0xf50fc457u32,
    0x65b0d9c6u32,
    0x12b7e950u32,
    0x8bbeb8eau32,
    0xfcb9887cu32,
    0x62dd1ddfu32,
    0x15da2d49u32,
    0x8cd37cf3u32,
    0xfbd44c65u32,
    0x4db26158u32,
    0x3ab551ceu32,
    0xa3bc0074u32,
    0xd4bb30e2u32,
    0x4adfa541u32,
    0x3dd895d7u32,
    0xa4d1c46du32,
    0xd3d6f4fbu32,
    0x4369e96au32,
    0x346ed9fcu32,
    0xad678846u32,
    0xda60b8d0u32,
    0x44042d73u32,
    0x33031de5u32,
    0xaa0a4c5fu32,
    0xdd0d7cc9u32,
    0x5005713cu32,
    0x270241aau32,
    0xbe0b1010u32,
    0xc90c2086u32,
    0x5768b525u32,
    0x206f85b3u32,
    0xb966d409u32,
    0xce61e49fu32,
    0x5edef90eu32,
    0x29d9c998u32,
    0xb0d09822u32,
    0xc7d7a8b4u32,
    0x59b33d17u32,
    0x2eb40d81u32,
    0xb7bd5c3bu32,
    0xc0ba6cadu32,
    0xedb88320u32,
    0x9abfb3b6u32,
    0x03b6e20cu32,
    0x74b1d29au32,
    0xead54739u32,
    0x9dd277afu32,
    0x04db2615u32,
    0x73dc1683u32,
    0xe3630b12u32,
    0x94643b84u32,
    0x0d6d6a3eu32,
    0x7a6a5aa8u32,
    0xe40ecf0bu32,
    0x9309ff9du32,
    0x0a00ae27u32,
    0x7d079eb1u32,
    0xf00f9344u32,
    0x8708a3d2u32,
    0x1e01f268u32,
    0x6906c2feu32,
    0xf762575du32,
    0x806567cbu32,
    0x196c3671u32,
    0x6e6b06e7u32,
    0xfed41b76u32,
    0x89d32be0u32,
    0x10da7a5au32,
    0x67dd4accu32,
    0xf9b9df6fu32,
    0x8ebeeff9u32,
    0x17b7be43u32,
    0x60b08ed5u32,
    0xd6d6a3e8u32,
    0xa1d1937eu32,
    0x38d8c2c4u32,
    0x4fdff252u32,
    0xd1bb67f1u32,
    0xa6bc5767u32,
    0x3fb506ddu32,
    0x48b2364bu32,
    0xd80d2bdau32,
    0xaf0a1b4cu32,
    0x36034af6u32,
    0x41047a60u32,
    0xdf60efc3u32,
    0xa867df55u32,
    0x316e8eefu32,
    0x4669be79u32,
    0xcb61b38cu32,
    0xbc66831au32,
    0x256fd2a0u32,
    0x5268e236u32,
    0xcc0c7795u32,
    0xbb0b4703u32,
    0x220216b9u32,
    0x5505262fu32,
    0xc5ba3bbeu32,
    0xb2bd0b28u32,
    0x2bb45a92u32,
    0x5cb36a04u32,
    0xc2d7ffa7u32,
    0xb5d0cf31u32,
    0x2cd99e8bu32,
    0x5bdeae1du32,
    0x9b64c2b0u32,
    0xec63f226u32,
    0x756aa39cu32,
    0x026d930au32,
    0x9c0906a9u32,
    0xeb0e363fu32,
    0x72076785u32,
    0x05005713u32,
    0x95bf4a82u32,
    0xe2b87a14u32,
    0x7bb12baeu32,
    0x0cb61b38u32,
    0x92d28e9bu32,
    0xe5d5be0du32,
    0x7cdcefb7u32,
    0x0bdbdf21u32,
    0x86d3d2d4u32,
    0xf1d4e242u32,
    0x68ddb3f8u32,
    0x1fda836eu32,
    0x81be16cdu32,
    0xf6b9265bu32,
    0x6fb077e1u32,
    0x18b74777u32,
    0x88085ae6u32,
    0xff0f6a70u32,
    0x66063bcau32,
    0x11010b5cu32,
    0x8f659effu32,
    0xf862ae69u32,
    0x616bffd3u32,
    0x166ccf45u32,
    0xa00ae278u32,
    0xd70dd2eeu32,
    0x4e048354u32,
    0x3903b3c2u32,
    0xa7672661u32,
    0xd06016f7u32,
    0x4969474du32,
    0x3e6e77dbu32,
    0xaed16a4au32,
    0xd9d65adcu32,
    0x40df0b66u32,
    0x37d83bf0u32,
    0xa9bcae53u32,
    0xdebb9ec5u32,
    0x47b2cf7fu32,
    0x30b5ffe9u32,
    0xbdbdf21cu32,
    0xcabac28au32,
    0x53b39330u32,
    0x24b4a3a6u32,
    0xbad03605u32,
    0xcdd70693u32,
    0x54de5729u32,
    0x23d967bfu32,
    0xb3667a2eu32,
    0xc4614ab8u32,
    0x5d681b02u32,
    0x2a6f2b94u32,
    0xb40bbe37u32,
    0xc30c8ea1u32,
    0x5a05df1bu32,
    0x2d02ef8du32,
];

/// structure to compute the CRC32 of chunks of bytes.
///
/// This structure allows implements the `Write` trait making it easier
/// to compute the crc32 of a stream.
///
pub struct Crc32(u32);
impl Crc32 {
    /// initialise a new CRC32 state
    #[inline]
    pub fn new() -> Self {
        Crc32(0xFFFF_FFFF)
    }

    /// update the CRC32 with the given bytes.
    ///
    /// beware that the order in which you update the Crc32
    /// matter.
    #[inline]
    pub fn update<'a, I>(&'a mut self, bytes: I) -> &mut Self
    where
        I: IntoIterator<Item = &'a u8>,
    {
        for byte in bytes {
            let index = (self.0 ^ (*byte as u32)) & 0xFF;
            self.0 = (self.0 >> 8) ^ CRC_TABLE[index as usize];
        }
        self
    }

    /// finalize the CRC32, recovering the computed value
    #[inline]
    pub fn finalize(self) -> u32 {
        self.0 ^ 0xFFFF_FFFF
    }
}
impl ::std::io::Write for Crc32 {
    #[inline]
    fn write(&mut self, bytes: &[u8]) -> Result<usize, std::io::Error> {
        self.update(bytes.iter());
        Ok(bytes.len())
    }
    #[inline]
    fn flush(&mut self) -> Result<(), std::io::Error> {
        Ok(())
    }
}

/// function is kept for compatibility. however prefer the
/// `Crc32` structure.
///
pub fn crc32(input: &[u8]) -> u32 {
    let mut crc32 = Crc32::new();
    crc32.update(input.iter());
    crc32.finalize()
}

#[cfg(test)]
mod tests {
    #[test]
    fn crc32() {
        let s = b"The quick brown fox jumps over the lazy dog";
        assert_eq!(0x414fa339, super::crc32(s));
    }
}
