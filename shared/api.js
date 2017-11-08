/* eslint-disable global-require */
/* eslint-env node, browser */

function nodeApiPOST(url, action, data, files) {
  const { readStream } = require('server/utils')

  return new Promise((resolve, reject) => {
    const boundary = '-------------------------69b2c2b9c464731d'
    const body = [
      `--${boundary}`,
      `\n\nContent-Disposition`,
    ]
    const { protocol, hostname, port, pathname, search } = require('url').parse(url)
    require('https').request({
      method: 'POST',
      protocol,
      hostname,
      port,
      path: pathname + search,
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
    }, async (resp) => {
      const body = (await readStream(resp)).toString('utf8')
      if (resp.statusCode === 200) {
        resolve(JSON.parse(body).data)
        return
      }

      if (resp.statusCode === 400) {
        reject(new Error(JSON.parse(body).error))
        return
      }

      reject(new Error(`Server returned ${resp.statusCode} ${resp.statusMessage}`))
    }).on('error', reject)
  })
}

function nodeApiGET(url) {
  const { readStream } = require('server/utils')

  return new Promise((resolve, reject) => {
    require('https').get(url, (resp) => {
      if (resp.status === 200) {
        resolve(readStream(resp))
        return
      }

      resp.resume() // consume response data to free up memory

      if (resp.statusCode === 404) {
        resolve(null)
        return
      }

      reject(new Error(`Server returned ${resp.statusCode} ${resp.statusMessage}`))
    }).on('error', reject)
  })
}

function browserApiPOST(url, action, data, files) {
  const formData = new FormData()
  formData.append('name', action)
  formData.append('data', JSON.stringify(data))
  files.forEach((file, i) => formData.append(`file${i}`, file.data, file.name))

  return fetch(url, { method: 'POST', body: formData }).then((res) => {
    if (res.status === 400) {
      return res.json().then(body => new Error(body.error))
    }

    if (res.status !== 200) {
      throw new Error(`Server returned ${res.status} ${res.statusText}`)
    }

    return res.json().then(body => body.data)
  })
}

function browserApiGET(url) {
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

export default function createApiClient(baseUrl = '') {
  const apiPOST = (__CLIENT__ ? browserApiPOST : nodeApiPOST).bind(null, `${baseUrl}/api`)
  const apiGET = __CLIENT__ ? browserApiGET : nodeApiGET

  return {
    readFile(fileId) {
      return apiGET(`${baseUrl}/api?fileId=${fileId}`)
    },

    listRecords(type) {
      return apiPOST('LIST_RECORDS', { type })
    },

    createRecord(type, name, data, newFiles = []) {
      return apiPOST('CREATE_RECORD', { type, name, data }, newFiles)
    },

    updateRecord(id, name, data, newFiles = []) {
      return apiPOST('UPDATE_RECORD', { id, name, data }, newFiles)
    },

    deleteRecord(id) {
      return apiPOST('DELETE_RECORD', { id })
    },
  }
}
