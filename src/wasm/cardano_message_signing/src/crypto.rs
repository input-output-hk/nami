//use curve25519_dalek::FieldElement;

// pub fn get_ed25519_x(xpub: &ed25519_bip32::XPub) -> Option<()> {
    
//     // let compressed_y = CompressedEdwardsY::from_slice(&bytes[..]);
//     // let edwards_point = compressed_y.decompress()?;
//     // let proj_point = edwards_point.to_projective();
//     //let Y = FieldElement::from_bytes(bytes);
//     None
// }

use cryptoxide::blake2b::Blake2b;
use pruefung::fnv::fnv32::Fnv32a;

pub (crate) fn blake2b224(data: &[u8]) -> [u8; 28] {
    let mut out = [0; 28];
    Blake2b::blake2b(&mut out, data, &[]);
    out
}

pub (crate) fn fnv32a(data: &[u8]) -> u32 {
    use core::hash::Hasher;
    let mut hasher = Fnv32a::default();
    hasher.write(data);
    hasher.finish() as u32
}

// #[cfg(test)]
// mod tests {
//     use super::*;

//     #[test]
//     fn x_coord() {
//         let pub_bytes = [
//             0xd7, 0x5a, 0x98, 0x01, 0x82, 0xb1, 0x0a, 0xb7, 0xd5, 0x4b, 0xfe, 0xd3, 0xc9, 0x64, 0x07, 0x3a,
//             0x0e, 0xe1, 0x72, 0xf3, 0xda, 0xa6, 0x23, 0x25, 0xaf, 0x02, 0x1a, 0x68, 0xf7, 0x07, 0x51, 0x1a
//         ];
//         let compr_y = curve25519_dalek::edwards::CompressedEdwardsY::from_slice(&pub_bytes[..]);
//         let x_computed = compr_y.compute_x_as_bytes().unwrap();
//         let x_expected = base64_url::decode("11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo").unwrap();
//         println!("pub_bytes = {:?}", pub_bytes);
//         println!("x_expected = {:?}", x_expected);
//         println!("x_computed = {:?}", x_computed);
//         assert_eq!(pub_bytes, x_expected.as_ref());
//     }
// }