pub trait NoneOrEmpty {
    fn is_none_or_empty(&self) -> bool;
}

impl<T: NoneOrEmpty> NoneOrEmpty for &T {
    fn is_none_or_empty(&self) -> bool {
        (*self).is_none_or_empty()
    }
}

impl<T: NoneOrEmpty> NoneOrEmpty for Option<T> {
    fn is_none_or_empty(&self) -> bool {
        self.is_none() || self.as_ref().unwrap().is_none_or_empty()
    }
}
