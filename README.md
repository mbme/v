# QUANTUM v

```
If a sentence has the word "quantum" in it, and if it is coming out of a non–physicist's mouth,
you can almost be certain that there's a huge quantum of bullshit being dumped on your head.

Physicist Devashish Singh
```

### Build Scripts

```sh
# prod mode
yarn build && yarn start

# dev mode
yarn dev

# run tests
yarn test

# lint
yarn lint

# count lines of code, requires https://github.com/AlDanial/cloc
yarn cloc

```

### Syntax
based on org-mode and markdown

* header1 `# Header`
* header2 `## Header`


`$ref = http://link | file-id`

* link `[[$ref][link name]]`
* image `[[image:$ref][alt text]]`

* bold `*text*`
* mono `` `text` ``
* striketrough `~text~`
* superscript `text^{1}`
* subscript `text_{2}`

* unordered list `* list item`
* ordered list `- list item`

* code:
````
```js
// Code here
```
````

* blockquote:
````
```quote
Quote here
```
````


maybe later:
* line break (2 spaces at the end of the line)
* tables
* footnotes `^[note text]`
* italic `_text_`
