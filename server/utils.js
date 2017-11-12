import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

export const sha256 = buffer => crypto.createHash('sha256').update(buffer).digest('hex')

export const readStream = stream => new Promise((resolve, reject) => {
  const body = []
  stream.on('data', chunk => body.push(chunk))
  stream.on('end', () => resolve(Buffer.concat(body)))
  stream.on('error', reject)
})

// Recursively synchronously list files in a dir (except skip dirs)
export function walkSync(dir, skipDir = [ '.git', 'node_modules' ]) {
  const fileList = []

  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file)

    if (fs.statSync(filePath).isDirectory()) {
      !skipDir.includes(file) && fileList.push(...walkSync(filePath))
    } else {
      fileList.push(filePath)
    }
  }

  return fileList
}
