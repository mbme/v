# requires https://github.com/AlDanial/cloc
cloc:
	cloc . --exclude-dir=node_modules,.git

post-file:
	curl \
		-F "name=package.json" \
		-F "data=@package.json" \
		localhost:8080/api/files/1

.PHONY: cloc post-file
