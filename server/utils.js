import crypto from 'crypto'

export const sha256 = buffer => crypto.createHash('sha256').update(buffer).digest('hex')

export const readStream = stream => new Promise((resolve, reject) => {
  const body = []
  stream.on('data', chunk => body.push(chunk))
  stream.on('end', () => resolve(Buffer.concat(body)))
  stream.on('error', reject)
})
