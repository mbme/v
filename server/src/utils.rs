use std::fmt;

pub fn stringify<T>(x: T) -> Vec<String>
    where T: IntoIterator,
          T::Item: fmt::Display
{
    x.into_iter().map(|item| item.to_string()).collect()
}

#[test]
fn test_stringify() {
    assert_eq!(stringify(vec![1, 2]).join(", "), "1, 2");
}
