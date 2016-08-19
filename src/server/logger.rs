use iron::prelude::*;
use iron::Handler;
use router::Router;

pub struct LoggerHandler {
    router: Router
}

fn shorten_url(url: &::iron::Url) -> String {
    url.path().iter().map(|s| format!("/{}", s)).collect()
}

fn stringify_status(status: Option<::iron::status::Status>) -> String {
    status.map(|s| s.to_string()).unwrap_or("NO STATUS".into())
}

impl Handler for LoggerHandler {
    fn handle(&self, req: &mut Request) -> IronResult<Response> {
        let entry_ts = ::time::precise_time_ns();
        let res = self.router.handle(req);
        let total_time_ms = (::time::precise_time_ns() - entry_ts) / 1_000_000;

        let log_prefix = format!("{:>3}ms {:^7} {}", total_time_ms, req.method.to_string(), shorten_url(&req.url));

        match res {
            Ok(ref resp) => {
                println!("{} -> {}", log_prefix, stringify_status(resp.status));
            },
            Err(ref err) => {
                println!("{} -> {}", log_prefix, stringify_status(err.response.status));
                println!("               {:?}", err.error);
            },
        };

        res
    }
}

impl LoggerHandler {
    pub fn new(router: Router) -> Self {
        LoggerHandler {
            router: router
        }
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
