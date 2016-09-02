pub fn convert_all_into<A, B>(v: Vec<A>) -> Vec<B> where A: Into<B> {
    v.into_iter().map(|a| a.into()).collect()
}
