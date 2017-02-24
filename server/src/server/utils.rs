use iron::prelude::*;
use iron::status;
use iron::mime::Mime;
use router::Router;

use serde::Serialize;
use serde_json;

use url::percent_encoding::percent_decode;

use error::{Result, Error, into_err};
use storage::types::Id;

pub fn get_request_body(req: &mut Request) -> Result<String> {
    use std::io::Read;

    let mut body = String::new();

    try!(req.body.read_to_string(&mut body).map_err(into_err));

    Ok(body)
}

pub fn create_response<T: Serialize> (data: &T) -> IronResult<Response> {
    let data = itry!(serde_json::to_string(data), status::InternalServerError);

    let content_type = "application/json".parse::<Mime>().unwrap();

    Ok(Response::with((content_type, status::Ok, data)))
}

pub fn get_url_param (req: &Request, name: &str) -> Result<String> {
    let result = req.extensions.get::<Router>().expect("failed to load Iron Router").find(name);

    if let Some(value) = result {
        let string = value.to_string();

        let decoded = percent_decode(string.as_bytes()).decode_utf8().map_err(into_err)?;

        Ok(decoded.into_owned())
    } else {
        Error::err_from_str(format!("can't find required url param :{}", name))
    }
}

pub fn parse_id (id_str: &str) -> Result<Id> {
    match id_str.parse() {
        Ok(id) => Ok(id),
        Err(_) => Error::err_from_str("can't parse id"),
    }
}

pub fn get_id (req: &Request) -> Result<Id> {
    parse_id(&get_url_param(req, "id")?)
}

pub fn convert_all_into<A, B>(v: Vec<A>) -> Vec<B> where A: Into<B> {
    v.into_iter().map(|a| a.into()).collect()
}
