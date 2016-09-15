use std::collections::HashMap;

pub const UI_APP_VERSION: &'static str = include_str!("../../../web-client/prod/VERSION");

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
