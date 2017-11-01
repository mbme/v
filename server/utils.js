import crypto from 'crypto'

export const sha256 = buffer => crypto.createHash('sha256').update(buffer).digest('hex')
