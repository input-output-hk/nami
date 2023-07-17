mod builder;

pub use builder::ByteBuilder;
use std::marker::PhantomData;

/// A typed slice of bytes
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct ByteSlice<'a, T> {
    slice: &'a [u8],
    phantom: PhantomData<T>,
}

/// A typed Array of bytes
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct ByteArray<T: ?Sized> {
    array: Box<[u8]>,
    phantom: PhantomData<T>,
}

impl<T> AsRef<[u8]> for ByteArray<T> {
    fn as_ref(&self) -> &[u8] {
        self.as_slice()
    }
}

impl<'a, T> AsRef<[u8]> for ByteSlice<'a, T> {
    fn as_ref(&self) -> &[u8] {
        self.as_slice()
    }
}

impl<T> ByteArray<T> {
    pub fn as_byteslice(&self) -> ByteSlice<'_, T> {
        ByteSlice {
            slice: &self.array[..],
            phantom: self.phantom,
        }
    }
    pub fn as_slice(&self) -> &[u8] {
        &self.array[..]
    }

    fn from_vec(v: Vec<u8>) -> Self {
        ByteArray {
            array: v.into(),
            phantom: PhantomData,
        }
    }
}

impl<T> From<Vec<u8>> for ByteArray<T> {
    fn from(v: Vec<u8>) -> Self {
        ByteArray::from_vec(v)
    }
}

impl<'a, T> ByteSlice<'a, T> {
    pub fn as_slice(&self) -> &[u8] {
        self.slice
    }

    fn sub_byteslice<U>(&'a self, start: usize, size: usize) -> ByteSlice<'a, U> {
        ByteSlice {
            slice: &self.slice[start..start + size],
            phantom: PhantomData,
        }
    }
}

pub trait ByteAccessor<A> {
    const START_SIZE: (usize, usize);
}

impl<T> ByteArray<T> {
    pub fn sub<U>(&self) -> ByteSlice<'_, U>
    where
        T: ByteAccessor<U>,
    {
        let (start, size) = <T as ByteAccessor<U>>::START_SIZE;
        ByteSlice {
            slice: &self.array[start..start + size],
            phantom: PhantomData,
        }
    }
}

impl<'a, T> ByteSlice<'a, T> {
    pub fn sub<U>(&'a self) -> ByteSlice<'a, U>
    where
        T: ByteAccessor<U>,
    {
        let (start, sz) = <T as ByteAccessor<U>>::START_SIZE;
        self.sub_byteslice(start, sz)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    pub struct Big;
    pub struct Little;

    impl ByteAccessor<Little> for Big {
        const START_SIZE: (usize, usize) = (2, 3);
    }

    #[test]
    pub fn typed_accessor() {
        let v: Vec<u8> = vec![0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        let b: ByteArray<Big> = v.into();
        assert_eq!(b.sub::<Little>().as_slice(), [2, 3, 4])
    }
}
