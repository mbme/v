export { styled, theme, mixins, createCondition } from './styled'

export function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject

    reader.readAsArrayBuffer(file)
  })
}
