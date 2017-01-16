GIT_COMMIT_HASH := $(shell git rev-parse --short HEAD)
export GIT_COMMIT_HASH

server-clean:
	rm -f ./server/target/debug/viter

server-dev-run:
	cd ./server && V_CONFIG="./config.json" cargo run

server-prod: web-client-prod
	cd ./server && cargo build --release

server-test:
	cd ./server && cargo test

api-tests:
	yarn run api-tests

web-client-prod:
	yarn run web-client-prod

web-client-dev-run:
	yarn run web-client-dev-run

lint:
	yarn run tslint
	yarn run eslint

# requires https://github.com/AlDanial/cloc
cloc:
	cloc . --exclude-dir=node_modules,web-build,target,.git --force-lang=TypeScript,ts

.PHONY: server-clean server-dev-run server-prod server-test api-tests web-client-prod web-client-dev-run lint cloc
