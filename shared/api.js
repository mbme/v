/* eslint-disable global-require */
/* eslint-env browser */

import { serialize } from 'shared/serializer'

export const CONTENT_TYPE = 'multipart/v-data'

function nodeApiPOST(url, action, files = []) {
  const { readStream } = require('server/utils')

  const data = serialize(action, files)
  return new Promise((resolve, reject) => {
    const { protocol, hostname, port, pathname } = require('url').parse(url)
    const request = require('http').request({
      method: 'POST',
      protocol,
      hostname,
      port,
      path: pathname,
      headers: {
        'Content-Type': CONTENT_TYPE,
        'Content-Length': data.length,
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
    })
    request.on('error', reject)
    request.end(data)
  })
}

function nodeApiGET(url) {
  const { readStream } = require('server/utils')

  return new Promise((resolve, reject) => {
    require('http').get(url, (resp) => {
      if (resp.statusCode === 200) {
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

function browserApiPOST(url, action, files = []) {
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
  const apiPOST = (global.__CLIENT__ ? browserApiPOST : nodeApiPOST).bind(null, `${baseUrl}/api`)
  const apiGET = global.__CLIENT__ ? browserApiGET : nodeApiGET

  return {
    readFile(fileId) {
      return apiGET(`${baseUrl}/api?fileId=${fileId}`)
    },

    listRecords(type) {
      return apiPOST({ name: 'LIST_RECORDS', data: { type } })
    },

    createRecord(type, name, data, newFiles = []) {
      return apiPOST({ name: 'CREATE_RECORD', data: { type, name, data } }, newFiles)
    },

    updateRecord(id, name, data, newFiles = []) {
      return apiPOST({ name: 'UPDATE_RECORD', data: { id, name, data } }, newFiles)
    },

    deleteRecord(id) {
      return apiPOST({ name: 'DELETE_RECORD', data: { id } })
    },
  }
}
