import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import readline from 'readline'
import { promisify } from 'util'

export const hash = hashType => buffer => crypto.createHash(hashType).update(buffer).digest('hex')
export const sha256 = hash('sha256')

export function aesEncrypt(text, password) {
  const iv = crypto.randomBytes(16) // always 16 for AES

  // password must be 256 bytes (32 characters)
  const cipher = crypto.createCipheriv('aes-256-cbc', sha256(password).substring(0, 32), iv)

  return iv.toString('hex') + ':' + cipher.update(text, 'utf8', 'hex') + cipher.final('hex')
}

export function aesDecrypt(text, password) {
  const [ iv, encryptedText ] = text.split(':')

  const decipher = crypto.createDecipheriv('aes-256-cbc', sha256(password).substring(0, 32), Buffer.from(iv, 'hex'))

  return decipher.update(encryptedText, 'hex', 'utf8') + decipher.final('utf8')
}

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

export const listFiles = promisify(fs.readdir)

// use sync version here cause fs.exists has been deprecated
export const existsFile = name => Promise.resolve(fs.existsSync(name))

export const readFile = promisify(fs.readFile)
export const readText = name => readFile(name, 'utf8')
export const readJSON = async name => JSON.parse(await readText(name))

export const writeFile = promisify(fs.writeFile)
export const writeText = (name, data) => writeFile(name, data, 'utf8')
export const writeJSON = (name, data) => writeText(name, JSON.stringify(data, null, 2))

export const deleteFile = promisify(fs.unlink)

export function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  return new Promise(resolve => rl.question(question, (answer) => {
    resolve(answer)
    rl.close()
  }))
}
