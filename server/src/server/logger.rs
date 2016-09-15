use iron::prelude::*;
use iron::{BeforeMiddleware, AfterMiddleware, typemap};
use iron::status;
use iron::mime::Mime;
use time::precise_time_ns;
use serde_json;

use super::dto::ErrorDTO;

fn shorten_url(url: &::iron::Url) -> String {
    url.path().iter().map(|s| format!("/{}", s)).collect()
}

fn stringify_status(status: Option<::iron::status::Status>) -> String {
    status.map_or("NO STATUS".into(), |s| s.to_string())
}

pub struct Logger;
impl typemap::Key for Logger { type Value = u64; }

impl BeforeMiddleware for Logger {
    fn before(&self, req: &mut Request) -> IronResult<()> {
        req.extensions.insert::<Logger>(precise_time_ns());
        Ok(())
    }
}

impl AfterMiddleware for Logger {
    fn after(&self, req: &mut Request, res: Response) -> IronResult<Response> {
        let start = *req.extensions.get::<Logger>().expect("no request start timestamp");
        let delta_ms = (precise_time_ns() - start) / 1_000_000;

        let log_prefix = format!(
            "{:>3}ms {:^7} {}", delta_ms, req.method.to_string(), shorten_url(&req.url)
        );

        println!("{} -> {}", log_prefix, stringify_status(res.status));

        Ok(res)
    }

    fn catch(&self, req: &mut Request, err: IronError) -> IronResult<Response> {
        let start = *req.extensions.get::<Logger>().expect("no request start timestamp");
        let delta_ms = (precise_time_ns() - start) / 1_000_000;

        let log_prefix = format!(
            "{:>3}ms {:^7} {}", delta_ms, req.method.to_string(), shorten_url(&req.url)
        );

        println!("{} -> {}", log_prefix, stringify_status(err.response.status));

        // serialize error to JSON

        let dto = ErrorDTO {
            error: format!("{}", err)
        };

        let data = itry!(serde_json::to_string(&dto), status::InternalServerError);

        println!("               {}", data);

        let status = err.response.status.unwrap_or(status::InternalServerError);
        let content_type = "application/json".parse::<Mime>().unwrap();

        Ok(Response::with((content_type, status, data)))
    }
}

#[cfg(test)]
mod test {
    use iron::Url;

    fn check(url: &str, short_url: &str) {
        assert_eq!(super::shorten_url(&Url::parse(url).unwrap()), short_url);
    }

    #[test]
    fn test_shorten() {
        check("http://127.0.0.1:8080/test", "/test");
        check("http://127.0.0.1:8080/", "/");
        check("http://127.0.0.1:8080", "/");
        check("http://127.0.0.1/test", "/test");
        check("https://127.0.0.1/test/x", "/test/x");
        check("https://google.com/test#test?x=123&y=21", "/test");
    }
}
