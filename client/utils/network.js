import { serialize } from 'shared/protocol'
import { CONTENT_TYPE } from 'shared/api'

function POST(url, action, files = []) {
  const data = serialize(action, files)

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': CONTENT_TYPE,
      'Content-Length': data.length,
    },
    body: data,
  }).then((res) => {
    if (res.status === 400) {
      return res.json().then(body => new Error(body.error))
    }

    if (res.status !== 200) {
      throw new Error(`Server returned ${res.status} ${res.statusText}`)
    }

    return res.json().then(body => body.data)
  })
}

function GET(url) {
  return fetch(url).then((res) => {
    if (res.status === 404) {
      return null
    }

    if (res.status !== 200) {
      throw new Error(`Server returned ${res.status} ${res.statusText}`)
    }

    return res.buffer()
  })
}

export default { POST, GET }
