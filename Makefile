lint:
	yarn run eslint

# requires https://github.com/AlDanial/cloc
cloc:
	cloc . --exclude-dir=node_modules,.git

dev:
	node --inspect server/index.js

test:
	jest

post-file:
	curl \
		-F "name=package.json" \
		-F "data=@package.json" \
		localhost:8080/api/files/1

.PHONY: lint cloc
