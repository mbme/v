GIT_COMMIT_HASH := $(shell git rev-parse --short HEAD)
export GIT_COMMIT_HASH

server-clean:
	rm -f ./server/target/debug/viter

server-dev-run: server-clean
	cd ./server && V_CONFIG="./config.json" cargo run

server-prod: web-client-prod
	cd ./server && cargo build --release

server-test:
	cd ./server && cargo test

api-tests:
	npm run api-tests

web-client-prod:
	npm run web-client-prod

web-client-dev-run:
	npm run web-client-dev-run

lint:
	npm run tslint
	npm run eslint

.PHONY: server-clean server-dev-run server-prod server-test api-tests web-client-prod web-client-dev-run lint
