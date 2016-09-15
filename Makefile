GIT_COMMIT_HASH := $(shell git rev-parse --short HEAD)
export GIT_COMMIT_HASH

clean:
	rm -f ./server/target/debug/viter

dev-run: clean
	cd ./server && V_CONFIG="./config.json" cargo run
