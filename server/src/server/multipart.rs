use multipart::server::{Multipart, MultipartData, MultipartFile};
use iron::request::Request;

use error::{Error, Result};
use storage::types::Blob;

use std::collections::HashMap;
use std::io::Read;

pub enum RequestData {
    File(Blob),
    Field(String),
}

fn read_file<B: Read>(file: &mut MultipartFile<B>) -> Result<Blob> {
    let mut bytes = vec![];
    if let Err(err) = file.read_to_end(&mut bytes) {
        return Err(Error::from(box err));
    }

    Ok(Blob(bytes))
}

pub fn parse_multipart(request: &mut Request) -> Result<HashMap<String, RequestData>> {
    let mut multipart = match Multipart::from_request(request) {
        Ok(multipart) => multipart,
        Err(_) => return Err(Error::from_str("request is not multipart")),
    };

    let mut values = HashMap::new();

    loop {
        match multipart.read_entry() {
            Ok(Some(mut field)) => { // process multipart field
                match field.data {
                    MultipartData::Text(text) => {
                        values.insert(field.name, RequestData::Field(text.into()));
                    },
                    MultipartData::File(ref mut file) => {
                        let blob = read_file(file)?;
                        values.insert(field.name, RequestData::File(blob));
                    },
                }
            },
            Ok(None) => return Ok(values), // no more fields

            Err(err) => return Err(Error::from(box err)), // error during parsing
        }
    }
}
