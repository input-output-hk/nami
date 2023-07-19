//! chain core properties
//!
//! define the different properties a _supported_ chain needs to
//! implement to work in our models.
//!
//! # Block
//!
//! The Block is the atomic element that compose a chain. Or in other
//! words the chain is composed of a succession of `Block`.
//!
//! the `Block` trait implements the necessary feature we expect of
//! a `Block` in the chain. Having a function that requires the object
//! to implement the Block traits means that we are expecting to have
//! only access to:
//!
//! * the block and its parent's identifier (the block hash);
//! * the block number, its position in the blockchain relative
//!   to the beginning of the chain. We often call this number
//!   the block Date.
//!
//! # Ledger
//!
//! this trait is to make sure we are following the Transactions of the chain
//! appropriately.
//!
//! # LeaderSelection
//!
//! This trait is following the protocol of the blockchain is followed
//! properly and determined a given instance of the LeaderSelection object
//! is selected to write a block in the chain.
//!

use std::{fmt::Debug, hash::Hash};

/// Trait identifying the block identifier type.
pub trait BlockId: Eq + Ord + Clone + Debug + Hash + Serialize + Deserialize {
    /// A special ID used to denote a non-existent block (e.g. the
    /// parent of the first block).
    fn zero() -> Self;
}

/// A trait representing block dates.
pub trait BlockDate: Eq + Ord + Clone {
    fn from_epoch_slot_id(epoch: u32, slot_id: u32) -> Self;
}

pub trait ChainLength: Eq + Ord + Clone + Debug {
    fn next(&self) -> Self;
}

/// Trait identifying the transaction identifier type.
pub trait TransactionId: Eq + Hash + Debug {}

/// Trait identifying the block header type.
pub trait Header: Serialize {
    /// The block header id.
    type Id: BlockId;

    /// The block date.
    type Date: BlockDate;

    /// the length of the blockchain (number of blocks)
    type ChainLength: ChainLength;

    /// the type associated to the version of a block
    type Version;

    /// Retrieves the block's header id.
    fn id(&self) -> Self::Id;

    /// get the parent block identifier (the previous block in the
    /// blockchain).
    fn parent_id(&self) -> Self::Id;

    /// Retrieves the block's date.
    fn date(&self) -> Self::Date;

    /// access the version of a given block
    fn version(&self) -> Self::Version;

    /// get the block's chain length. The number of block
    /// created following this thread of blocks on the blockchain
    /// (including Self).
    fn chain_length(&self) -> Self::ChainLength;
}

/// Block property
///
/// a block is part of a chain of block called Blockchain.
/// the chaining is done via one block pointing to another block,
/// the parent block (the previous block).
///
/// This means that a blockchain is a link-list, ordered from the most
/// recent block to the furthest/oldest block.
///
/// The Oldest block is called the Genesis Block.
pub trait Block: Serialize + Deserialize {
    /// the Block identifier. It must be unique. This mean that
    /// 2 different blocks have 2 different identifiers.
    ///
    /// In bitcoin this block is a SHA2 256bits. For Cardano's
    /// blockchain it is Blake2b 256bits.
    type Id: BlockId;

    /// the block date (also known as a block number) represents the
    /// absolute position of the block in the chain. This can be used
    /// for random access (if the storage algorithm allows it) or for
    /// identifying the position of a block in a given epoch or era.
    type Date: BlockDate;

    /// the type associated to the version of a block
    type Version;

    /// the length of the blockchain (number of blocks)
    type ChainLength: ChainLength;

    /// return the Block's identifier.
    fn id(&self) -> Self::Id;

    /// get the parent block identifier (the previous block in the
    /// blockchain).
    fn parent_id(&self) -> Self::Id;

    /// get the block date of the block
    fn date(&self) -> Self::Date;

    /// access the version of a given block
    fn version(&self) -> Self::Version;

    /// get the block's chain length. The number of block
    /// created following this thread of blocks on the blockchain
    /// (including Self).
    fn chain_length(&self) -> Self::ChainLength;
}

/// Access to the block header.
///
/// If featured by the blockchain, the header can be used to transmit
/// block's metadata via a network protocol or in other uses where the
/// full content of the block is too bulky and not necessary.
pub trait HasHeader {
    /// The block header type.
    type Header: Header;

    /// Retrieves the block's header.
    fn header(&self) -> Self::Header;
}

/// Trait identifying the fragment identifier type.
pub trait FragmentId: Eq + Hash + Clone + Debug + Serialize + Deserialize {}

/// A fragment is some item contained in a block, such as a
/// transaction, a delegation-related certificate, an update proposal,
/// and so on. Fragments can be serialized (so that they can be
/// concatenated to form a binary block( and have a unique ID
/// (typically the hash of their serialization).
pub trait Fragment: Serialize + Deserialize {
    type Id: FragmentId;

    /// Return the message's identifier.
    fn id(&self) -> Self::Id;
}

/// Accessor to fragments within a block.
///
/// This trait has a lifetime parameter and is normally implemented by
/// reference types.
pub trait HasFragments<'a> {
    /// The type representing fragments in this block.
    type Fragment: 'a + Fragment;

    /// A by-reference iterator over block's fragments.
    type Fragments: 'a + Iterator<Item = &'a Self::Fragment>;

    /// Returns a by-reference iterator over the fragments in the block.
    fn fragments(self) -> Self::Fragments;
}

/// define a transaction within the blockchain. This transaction can be used
/// for the UTxO model. However it can also be used for any other elements that
/// the blockchain has (a transaction type to add Stacking Pools and so on...).
///
pub trait Transaction: Serialize + Deserialize {
    /// The input type of the transaction (if none use `()`).
    type Input;
    /// The output type of the transaction (if none use `()`).
    type Output;
    /// The iterable type of transaction inputs (if none use `Option<()>` and return `None`).
    type Inputs: ?Sized;
    /// The iterable type of transaction outputs (if none use `Option<()>` and return `None`).
    type Outputs: ?Sized;

    /// Returns a reference that can be used to iterate over transaction's inputs.
    fn inputs(&self) -> &Self::Inputs;

    /// Returns a reference that can be used to iterate over transaction's outputs.
    fn outputs(&self) -> &Self::Outputs;
}

pub trait State: Sized + Clone {
    type Error: std::error::Error;
    type Header: Header;
    type Content: Fragment;

    /// yield a new block in the state
    ///
    /// This will change the state in the sense that it acknowledge the creation
    /// of a new block in its internal state.
    fn apply_block<'a, I>(&self, header: &Self::Header, contents: I) -> Result<Self, Self::Error>
    where
        I: IntoIterator<Item = &'a Self::Content>,
        Self::Content: 'a;

    /// apply new block contents. This modify the state in small steps
    /// however it does not acknowledge the creation of a new block
    fn apply_contents<'a, I>(&self, contents: I) -> Result<Self, Self::Error>
    where
        I: IntoIterator<Item = &'a Self::Content>,
        Self::Content: 'a;
}

/// Define the Ledger side of the blockchain. This is not really on the blockchain
/// but should be able to maintain a valid state of the overall blockchain at a given
/// `Block`.
pub trait Ledger<T: Transaction>: Sized {
    /// Ledger's errors
    type Error: std::error::Error;

    fn input<'a, I>(
        &'a self,
        input: <T as Transaction>::Input,
    ) -> Result<&'a <T as Transaction>::Output, Self::Error>;
}

/// Trait identifying the leader identifier type.
pub trait LeaderId: Eq + Clone + Hash + Debug {}

/// interface for the leader selection algorithm
///
/// this is the interface that is responsible to verify the Block are
/// created by the right Leaders (i.e. that everyone follows the
/// consensus algorithm).
///
/// This is also the same interface that is used to detect if we are the
/// leader for the block at the given date.
pub trait LeaderSelection {
    /// the block that we will get the information from
    type Block: Block;

    /// Leader Selection error type
    type Error: std::error::Error;

    /// Identifier of the leader (e.g. a public key).
    type LeaderId: LeaderId;

    type State: State;

    fn retrieve(state: &Self::State) -> Self;

    /// return the ID of the leader of the blockchain at the given
    /// date.
    fn get_leader_at(
        &self,
        date: <Self::Block as Block>::Date,
    ) -> Result<Self::LeaderId, Self::Error>;
}

/// the settings of the blockchain this is something that can be used to maintain
/// the blockchain protocol update details:
///
pub trait Settings {
    type Block: Block;

    /// return the tip of the current branch
    ///
    fn tip(&self) -> <Self::Block as Block>::Id;

    /// the current chain_length
    fn chain_length(&self) -> <Self::Block as Block>::ChainLength;

    /// the number of transactions in a block
    fn max_number_of_transactions_per_block(&self) -> u32;

    /// the block version format
    fn block_version(&self) -> <Self::Block as Block>::Version;
}

/// Define that an object can be written to a `Write` object.
pub trait Serialize {
    type Error: std::error::Error + From<std::io::Error>;

    fn serialize<W: std::io::Write>(&self, writer: W) -> Result<(), Self::Error>;

    /// Convenience method to serialize into a byte vector.
    fn serialize_as_vec(&self) -> Result<Vec<u8>, Self::Error> {
        let mut data = vec![];
        self.serialize(&mut data)?;
        Ok(data)
    }
}

/// Define that an object can be read from a `Read` object.
pub trait Deserialize: Sized {
    type Error: std::error::Error + From<std::io::Error> + Send + Sync + 'static;

    fn deserialize<R: std::io::BufRead>(reader: R) -> Result<Self, Self::Error>;
}

/// Defines the way to parse the object from a UTF-8 string.
///
/// This is like the standard `FromStr` trait, except that it imposes
/// additional bounds on the error type to make it more usable for
/// aggregation to higher level errors and passing between threads.
pub trait FromStr: Sized {
    type Error: std::error::Error + Send + Sync + 'static;

    fn from_str(s: &str) -> Result<Self, Self::Error>;
}

impl<T> FromStr for T
where
    T: std::str::FromStr,
    <T as std::str::FromStr>::Err: std::error::Error + Send + Sync + 'static,
{
    type Error = <T as std::str::FromStr>::Err;

    fn from_str(s: &str) -> Result<Self, Self::Error> {
        std::str::FromStr::from_str(s)
    }
}

impl<T: Serialize> Serialize for &T {
    type Error = T::Error;

    fn serialize<W: std::io::Write>(&self, writer: W) -> Result<(), T::Error> {
        (**self).serialize(writer)
    }
}

#[cfg(feature = "property-test-api")]
pub mod testing {
    use super::super::mempack::{ReadBuf, Readable};
    use super::*;
    use quickcheck::{Arbitrary, TestResult};

    /// test that any arbitrary given object can serialize and deserialize
    /// back into itself (i.e. it is a bijection,  or a one to one match
    /// between the serialized bytes and the object)
    pub fn serialization_bijection<T>(t: T) -> TestResult
    where
        T: Arbitrary + Serialize + Deserialize + Eq,
    {
        let vec = match t.serialize_as_vec() {
            Err(error) => return TestResult::error(format!("serialization: {}", error)),
            Ok(v) => v,
        };
        let decoded_t = match T::deserialize(&vec[..]) {
            Err(error) => return TestResult::error(format!("deserialization: {}", error)),
            Ok(v) => v,
        };
        TestResult::from_bool(decoded_t == t)
    }

    /// test that any arbitrary given object can serialize and deserialize
    /// back into itself (i.e. it is a bijection,  or a one to one match
    /// between the serialized bytes and the object)
    pub fn serialization_bijection_r<T>(t: T) -> TestResult
    where
        T: Arbitrary + Serialize + Readable + Eq,
    {
        let vec = match t.serialize_as_vec() {
            Err(error) => return TestResult::error(format!("serialization: {}", error)),
            Ok(v) => v,
        };
        let mut buf = ReadBuf::from(&vec);
        let decoded_t = match T::read(&mut buf) {
            Err(error) => {
                return TestResult::error(format!("deserialization: {:?}\n{}", error, buf.debug()))
            }
            Ok(v) => v,
        };
        TestResult::from_bool(buf.expect_end().is_ok() && decoded_t == t)
    }
}
