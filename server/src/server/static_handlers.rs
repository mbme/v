use std::collections::HashMap;

use iron::prelude::*;
use iron::status;
use iron::Handler;

use mime_guess::guess_mime_type;

const INDEX_HTML: &'static str = include_str!("../../../web-client/prod/index.html");
const APP_JS:     &'static str = include_str!("../../../web-client/prod/app.js");
const APP_JS_MAP: &'static str = include_str!("../../../web-client/prod/app.js.map");

pub fn get_static_files() -> HashMap<&'static str, &'static str> {
    let mut map = HashMap::new();

    map.insert("", INDEX_HTML);
    map.insert("index.html", INDEX_HTML);
    map.insert("app.js", APP_JS);
    map.insert("app.js.map", APP_JS_MAP);

    map
}

fn create_static_response (file_name: &str, data: &str) -> Response {
    Response::with((guess_mime_type(file_name), status::Ok, data))
}

pub struct StaticFilesHandler(HashMap<&'static str, &'static str>);
impl StaticFilesHandler {
    pub fn new() -> StaticFilesHandler {
        StaticFilesHandler(get_static_files())
    }
}
impl Handler for StaticFilesHandler {
    fn handle(&self, req: &mut Request) -> IronResult<Response> {
        let path = req.url.path();

        if path.len() != 1 {
            return Ok(Response::with(status::NotFound));
        }

        let file_name = path[0];
        if let Some(&data) = self.0.get(file_name) {
            Ok(create_static_response(file_name, data))
        } else {
            Ok(Response::with((status::NotFound, "Not Found")))
        }
    }
}

pub struct StaticIndexHandler;
impl Handler for StaticIndexHandler {
    fn handle(&self, _: &mut Request) -> IronResult<Response> {
        Ok(create_static_response("index.html", INDEX_HTML))
    }
}
