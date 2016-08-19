use hyper::method::Method;
use hyper::server::Request;
use rustc_serialize::json::{Json, Object};

use types::{Categories, Id, Blob};
use errors::{Error, Result, WrapResult};

use super::actions;
use super::actions::Action;

pub trait RequestUtils {
    fn get_request_url(&self) -> String;
    fn matches(&self, Method, &str, bool) -> bool;
}

impl<'a, 'b> RequestUtils for Request<'a, 'b> {
    fn get_request_url(&self) -> String {
        use hyper::uri::RequestUri;

        match self.uri {
            RequestUri::AbsolutePath(ref url) => url.clone(),
            _ => "".into(),
        }
    }

    fn matches(&self, method: Method, pattern: &str, is_prefix: bool) -> bool {
        if self.method != method {
            return false;
        }

        let url = self.get_request_url();

        if is_prefix {
            url.starts_with(pattern)
        } else {
            url == pattern
        }
    }
}

fn json_as_id(json: &Json) -> Result<Id> {
    json.as_u64()
        .ok_or("can't cast to u64".into())
        .wrap_error(Error::ActionProcessingError)
}

fn json_as_obj(json: &mut Json) -> Result<&mut Object> {
    json.as_object_mut()
        .ok_or(Error::ActionProcessingError("bad action".into()))
}

fn parse_id(id_str: &str) -> Result<Id> {
    match id_str.parse() {
        Ok(id) => Ok(id),
        Err(_) => Err(Error::ActionProcessingError("failed to parse id".into())),
    }
}



fn parse_list_records(json: &mut Json) -> Result<Action> {
    if json.is_null() {
        Ok(Action::ListRecords)
    } else {
        Err(Error::ActionProcessingError("list-records has non-null params".into()))
    }
}

fn parse_get_note(json: &mut Json) -> Result<Action> {
    let id = try!(json_as_id(json));

    Ok(Action::GetNote(id))
}

fn parse_update_note(json: &mut Json) -> Result<Action> {
    let obj = try!(json_as_obj(json));

    let id = try!(
        get_obj_prop(obj, "id").and_then(json_as_id)
    );
    let name = try!(get_obj_string(obj, "name"));
    let data = try!(get_obj_string(obj, "data"));
    let categories = try!(
        get_obj_prop(obj, "categories").and_then(parse_categories)
    );

    Ok(Action::UpdateNote {
        id: id,
        name: name.into(),
        data: data.into(),
        categories: categories,
    })
}

fn parse_remove_note(json: &mut Json) -> Result<Action> {
    let id = try!(json_as_id(json));

    Ok(Action::RemoveNote(id))
}


fn parse_request(request_str: &str) -> Result<Action> {
    let mut json = try!(
        Json::from_str(request_str).wrap_error(Error::ActionParseError)
    );

    let data = try!(json_as_obj(&mut json));

    let mut params = try!(
        data.remove("params")
            .ok_or("bad params".to_string())
            .wrap_error(Error::ActionProcessingError)
    );

    let action_type = try!(get_obj_string(data, "action"));
    match action_type {
        actions::LIST_RECORDS => parse_list_records(&mut params),
        actions::CREATE_NOTE  => parse_create_note(&mut  params),
        actions::GET_NOTE     => parse_get_note(&mut     params),
        actions::UPDATE_NOTE  => parse_update_note(&mut  params),
        actions::REMOVE_NOTE  => parse_remove_note(&mut  params),
        action_name => Err(Error::UnknownActionType(action_name.into())),
    }
}

fn get_request_body(mut req: Request) -> Result<String> {
    use std::io::Read;

    let mut body = String::new();

    try!(req.read_to_string(&mut body).wrap_error(Error::RequestReadError));

    Ok(body)
}

pub fn parse_action(req: Request) -> Result<Action> {
    let body = try!(get_request_body(req));

    parse_request(&body)
}

pub fn add_file_action(req: Request) -> Result<Action> {
    use multipart::server::{Multipart, MultipartData};

    let mut multipart = match Multipart::from_request(req) {
        Ok(multipart) => multipart,
        Err(_) => return Err(
            Error::ActionProcessingError("request must be multipart".into())
        ),
    };

    let mut name = None::<String>;
    let mut data = None::<Blob>;

    if let Err(_) = multipart.foreach_entry(|mut field| {
        match field.data {
            MultipartData::Text(text) if field.name == "name" => {
                name = Some(text.into());
            },
            MultipartData::File(ref mut file) if field.name == "data" => {
                use std::io::Read;

                let mut bytes = vec![];
                if let Ok(_) = file.read_to_end(&mut bytes) {
                    data = Some(bytes);
                }
            },
            _ => (), // FIXME log something
        }
    }) {
        return Err(
            Error::ActionProcessingError("failed to process multipart request".into())
        );
    };

    let name = try!(name.ok_or(
        Error::ActionProcessingError("name is required".into())
    ));

    let data = try!(data.ok_or(
        Error::ActionProcessingError("data is required".into())
    ));

    Ok(Action::AddFile {
        name: name,
        data: data,
    })
}

pub fn get_file_action(id_str: String) -> Result<Action> {
    let id = try!(parse_id(&id_str));
    Ok(Action::GetFile(id))
}

pub fn remove_file_action(id_str: String) -> Result<Action> {
    let id = try!(parse_id(&id_str));
    Ok(Action::RemoveFile(id))
}


#[cfg(test)]
mod test {
    use super::parse_request;
    use server::actions::Action;
    use types::into_categories;

    #[test]
    fn test_parse_bad_request () {
        assert!(parse_request(r#"{
            "action": 123,
            "params": null
        }"#).is_err());

        assert!(parse_request("{}").is_err());
    }

    #[test]
    fn test_parse_list_records_bad () {
        assert!(parse_request(r#"{
            "action": "list-records",
            "params": 123
        }"#).is_err());
    }

    #[test]
    fn test_parse_list_records () {
        let action = parse_request(r#"{
            "action": "list-records",
            "params": null
        }"#).unwrap();

        assert!(match action {
            Action::ListRecords => true,
            _ => false
        });
    }

    #[test]
    fn test_parse_create_note () {
        let action = parse_request(r#"{
            "action": "create-note",
            "params": {
                "name": "name",
                "data": "data",
                "categories": ["1", "2"]
            }
        }"#).unwrap();

        match action {
            Action::CreateNote { name, data, categories } => {
                assert_eq!(name, "name");
                assert_eq!(data, "data");
                assert_eq!(categories, into_categories(vec!["1", "2"]));
            },
            _ => assert!(false),
        };
    }

    #[test]
    fn test_parse_create_note_bad () {
        assert!(parse_request(r#"{
            "action": "create-note",
            "params": {
                "name": 123,
                "data": "data",
                "categories": ["1", "2"]
            }
        }"#).is_err());

        assert!(parse_request(r#"{
            "action": "create-note",
            "params": {
                "name": "name",
                "data": "data",
                "categories": ["1", 2]
            }
        }"#).is_err());

        assert!(parse_request(r#"{
            "action": "create-note",
            "params": {}
        }"#).is_err());
    }

    #[test]
    fn test_parse_get_note () {
        let action = parse_request(r#"{
            "action": "get-note",
            "params": 1
        }"#).unwrap();

        match action {
            Action::GetNote(id) => {
                assert_eq!(id, 1);
            },
            _ => assert!(false),
        };
    }

    #[test]
    fn test_parse_get_note_bad () {
        assert!(parse_request(r#"{
            "action": "get-note",
            "params": null
        }"#).is_err());
    }

    #[test]
    fn test_parse_remove_note () {
        let action = parse_request(r#"{
            "action": "remove-note",
            "params": 1
        }"#).unwrap();

        match action {
            Action::RemoveNote(id) => {
                assert_eq!(id, 1);
            },
            _ => assert!(false),
        };
    }

    #[test]
    fn test_parse_remove_note_bad () {
        assert!(parse_request(r#"{
            "action": "remove-note",
            "params": null
        }"#).is_err());
    }

    #[test]
    fn test_parse_update_note () {
        let action = parse_request(r#"{
            "action": "update-note",
            "params": {
                "id": 100,
                "name": "name",
                "data": "data",
                "categories": ["1", "2"]
            }
        }"#).unwrap();

        match action {
            Action::UpdateNote { id, name, data, categories } => {
                assert_eq!(id, 100);
                assert_eq!(name, "name");
                assert_eq!(data, "data");
                assert_eq!(categories, into_categories(vec!["1", "2"]));
            },
            _ => assert!(false),
        };
    }
}
