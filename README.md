# QUANTUM v

```
If a sentence has the word "quantum" in it, and if it is coming out of a non–physicist's mouth,
you can almost be certain that there's a huge quantum of bullshit being dumped on your head.

Physicist Devashish Singh
```

### Build Scripts

```sh
# prod mode
yarn start

# dev mode
yarn dev
# start dev server and generate random data
yarn dev --gen-data

# run tests
yarn test

# lint
yarn lint

# count lines of code, requires https://github.com/AlDanial/cloc
yarn cloc

```

### External Dependencies
* [Unix `file` command](https://en.wikipedia.org/wiki/File_(command))
* [`ffprobe` (part of `ffmpeg`)](https://www.ffmpeg.org/ffprobe.html))
* [`cURL` command line tool](https://en.wikipedia.org/wiki/CURL)


### Dir structure
```
/${id}.mb # record
/files/${id} # file
```
Record is a json file: `{ type: string, fields: {}, updatedTs: number }`

### Syntax
based on org-mode and markdown

* header1 `# Header`
* header2 `## Header`

`$ref = http://link | file-id`

* link `[[$ref][description]]`, description is optional
* image `[[image:$ref][description]]`, description is optional

* bold `*text*`
* mono `` `text` ``
* striketrough `~text~`

* unordered list `* list item`

* code:
````
```js
// Code here
```
````

* blockquote:
````
```quote:source
Quote here
```
````

--------


* superscript `text^{1}`
* subscript `text_{2}`
* ordered list `- list item`
* line break (2 spaces at the end of the line)
* tables
* footnotes `^[note text]`
* italic `_text_`
