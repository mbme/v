import { serialize } from 'shared/protocol'
import { CONTENT_TYPE } from 'shared/api'
import { sha256, text2buffer, aesEncrypt } from 'client/utils'
import { showToast, showLocker, setAuthorized } from 'client/chrome/actions'

export async function setPassword(password) {
  const token = await aesEncrypt(`valid ${Date.now()}`, await sha256(text2buffer(password)))
  document.cookie = `token=${token}`
}

export default function createNetwork(getStore) {
  return {
    POST(url, action, files = []) {
      const store = getStore()
      store.dispatch(showLocker(true))

      const data = serialize(action, files)

      return fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': CONTENT_TYPE,
          'Content-Length': data.length,
        },
        body: data,
      }).then((res) => {
        if (res.status === 403) {
          store.dispatch(setAuthorized(false))
          throw new Error('Access denied')
        }

        if (res.status === 400) return res.json().then((body) => { throw new Error(body.error) })

        if (res.status !== 200) throw new Error(`Server returned ${res.status} ${res.statusText}`)

        return res.json().then(body => body.data)
      }).then(
        (result) => {
          store.dispatch(showLocker(false))
          return result
        },
        (e) => {
          store.dispatch(showLocker(false))
          store.dispatch(showToast(e.toString()))
          throw e
        },
      )
    },

    GET(url) {
      return fetch(url, { credentials: 'include' }).then((res) => {
        if (res.status === 404) return null

        if (res.status !== 200) throw new Error(`Server returned ${res.status} ${res.statusText}`)

        return res.buffer()
      })
    },
  }
}
