export function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject

    reader.readAsArrayBuffer(file)
  })
}

const bytesToHexString = buffer => Array.from(new Uint8Array(buffer)).map(b => ('00' + b.toString(16)).slice(-2)).join('')

export const sha256 = buffer => crypto.subtle.digest('SHA-256', buffer).then(bytesToHexString)

const text2buffer = text => new TextEncoder().encode(text)

export async function aesEncrypt(text, password) {
  const alg = { name: 'AES-CBC', iv: crypto.getRandomValues(new Uint32Array(16)) }
  const passwordHash = await crypto.subtle.digest('SHA-256', text2buffer(password))
  const key = await crypto.subtle.importKey('raw', passwordHash.substring(0, 32), alg, false, [ 'encrypt' ])

  const encrypted = await crypto.subtle.encrypt(alg, key, text2buffer(text)).then(bytesToHexString)

  return bytesToHexString(alg.iv) + ':' + encrypted
}
