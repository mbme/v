import { XMLHttpRequest } from 'xmlhttprequest'

function sendRequest (method, url, data) {
  const request = new XMLHttpRequest()
  request.responseType = 'json'
  request.open(method, url)

  return new Promise((resolve, reject) => {
    request.onload = () => resolve(JSON.parse(request.responseText))
    request.onerror = reject

    request.send(data)
  })
}

export default function createApiClient (baseUrl = '') {
  function apiUrl (path) {
    return baseUrl + '/api' + path
  }

  function apiRequest (action, data) {
    return sendRequest('POST', apiUrl(''), JSON.stringify({
      name: action,
      data,
    }))
  }

  return {
    async createFile (recordId, name, file) {
      await sendRequest('POST', apiUrl(`/files/${recordId}`), {
        name,
        data: file,
      })
    },

    listRecords (type) {
      return apiRequest('LIST_RECORDS', { type })
    },

    createRecord (type, name, data) {
      return apiRequest('CREATE_RECORD', {
        type,
        name,
        data,
      })
    },

    updateRecord (id, type, name, data) {
      return apiRequest('UPDATE_RECORD', {
        id,
        type,
        name,
        data,
      })
    },

    deleteRecord (id) {
      return apiRequest('DELETE_RECORD', { id })
    },
  }
}
