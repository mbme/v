export function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject

    reader.readAsArrayBuffer(file)
  })
}

function bytesToHexString(buffer) {
  return Array.from(new Uint8Array(buffer)).map(b => ('00' + b.toString(16)).slice(-2)).join('')
}

export function sha256(buffer) {
  return crypto.subtle.digest('SHA-256', buffer).then(bytesToHexString)
}
