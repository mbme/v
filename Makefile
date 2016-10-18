GIT_COMMIT_HASH := $(shell git rev-parse --short HEAD)
export GIT_COMMIT_HASH

clean:
	rm -f ./server/target/debug/viter

dev-run: clean
	cd ./server && V_CONFIG="./config.json" cargo run

prod: web-prod
	cd ./server && cargo build --release

test:
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

.PHONY: clean dev-run prod test api-tests web-client-prod web-client-dev-run lint
