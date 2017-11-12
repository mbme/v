#!/usr/bin/env node

require('babel-register')

const fs = require('fs')
const path = require('path')

const createApiClient = require('../shared/api').default
const { createTextGenerator } = require('../tools/random')
const { createArray } = require('../shared/utils')

function genData(port, recordsCount = 23) {
  const text = fs.readFileSync(path.join(__dirname, '../shared/text.txt'), 'utf-8')
  const generator = createTextGenerator(text)
  const api = createApiClient(`http://localhost:${port}`)

  const promises = createArray(recordsCount, () => {
    const name = generator.generateSentence(1, 8)
    const data = generator.generateText()
    return api.createRecord('note', name.substring(0, name.length - 1), data)
  })

  Promise.all(promises).then(
    () => console.log('Generated %s fake records', recordsCount),
    (err) => {
      console.log('Failed to generate fake records:')
      console.log(err)
    }
  )
}

if (require.main === module) { // if called from command line
  genData(8080)
}

module.exports = genData
