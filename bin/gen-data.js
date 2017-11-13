import path from 'path'

import createApiClient from 'shared/api'
import { createArray } from 'shared/utils'
import { createTextGenerator } from 'tools/random'
import { readText } from 'server/utils'
import nodeApiClient from 'server/apiClient'

export default async function genData(port, recordsCount = 23) {
  const text = await readText(path.join(__dirname, '../tools/text.txt'))
  const generator = createTextGenerator(text)
  const api = createApiClient(`http://localhost:${port}`, nodeApiClient)

  const promises = createArray(recordsCount, () => {
    const name = generator.generateSentence(1, 8)
    const data = generator.generateText()
    return api.createRecord('note', name.substring(0, name.length - 1), data)
  })

  await Promise.all(promises).then(
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
