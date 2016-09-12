use std::collections::HashMap;

const INDEX_HTML: &str = include_str!("../../../web-client/build/index.html");
const APP_JS: &str = include_str!("../../../web-client/build/app.js");
const APP_JS_MAP: &str = include_str!("../../../web-client/build/app.js.map");

pub fn get_static_files() -> HashMap<&'static str, &'static str> {
    let mut map = HashMap::new();

    map.insert("", INDEX_HTML);
    map.insert("index.html", INDEX_HTML);
    map.insert("app.js", APP_JS);
    map.insert("app.js.map", APP_JS_MAP);

    map
}
