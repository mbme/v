import { serialize } from 'shared/protocol'
import { CONTENT_TYPE, AUTH_HEADER } from 'shared/api'
import { showToast, showLocker, setAuthorized } from 'client/chrome/actions'
import { sha256, text2buffer, aesEncrypt } from 'client/utils'

export default function createNetwork(getStore) {
  let token = sessionStorage.getItem('v-token')

  return {
    async setPassword(password) {
      token = await aesEncrypt(`valid ${Date.now()}`, await sha256(text2buffer(password)))
      sessionStorage.setItem('v-token')
    },

    POST(url, action, files = []) {
      const store = getStore()
      store.dispatch(showLocker(true))

      const data = serialize(action, files)

      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': CONTENT_TYPE,
          'Content-Length': data.length,
          [AUTH_HEADER]: token,
        },
        body: data,
      }).then((res) => {
        if (res.status === 403) {
          setAuthorized(false)
          throw new Error('Access denied')
        }

        if (res.status === 400) {
          return res.json().then((body) => { throw new Error(body.error) })
        }

        if (res.status !== 200) {
          throw new Error(`Server returned ${res.status} ${res.statusText}`)
        }

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
      return fetch(url, {
        headers: {
          [AUTH_HEADER]: token,
        },
      }).then((res) => {
        if (res.status === 404) {
          return null
        }

        if (res.status !== 200) {
          throw new Error(`Server returned ${res.status} ${res.statusText}`)
        }

        return res.buffer()
      })
    },
  }
}
