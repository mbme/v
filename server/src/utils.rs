use std::fmt;

pub fn stringify<T>(x: T) -> Vec<String>
    where T: IntoIterator,
          T::Item: fmt::Display
{
    x.into_iter().map(|item| item.to_string()).collect()
}


pub fn convert_all_into<A, B>(v: Vec<A>) -> Vec<B> where A: Into<B> {
    v.into_iter().map(|a| a.into()).collect()
}

#[test]
fn test_stringify() {
    assert_eq!(stringify(vec![1, 2]).join(", "), "1, 2");
}
