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

integration-test:
	cd ./server-tests && npm test

web-prod:
	cd ./web-client && npm run prod

web-dev:
	cd ./web-client && npm start

.PHONY: clean dev-run test integration-test web-prod web-dev
