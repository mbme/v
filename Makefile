lint:
	yarn run tslint
	yarn run eslint

# requires https://github.com/AlDanial/cloc
cloc:
	cloc . --exclude-dir=node_modules,.git --force-lang=TypeScript,ts

.PHONY: lint cloc
