function processError(res) {
  if (res.status === 400) {
    return res.json().then(({ error }) => {
      throw new Error(error)
    })
  }

  return res
}

export default function createApiClient(baseUrl = '') {
  function apiUrl(path) {
    return baseUrl + '/api' + path
  }

  function apiRequest(action, data) {
    return fetch(
      apiUrl(''),
      {
        method: 'POST',
        body: JSON.stringify({ name: action, data }),
      }
    )
      .then(processError)
      .then(res => res.json())
      .then(resObj => resObj.data)
  }

  return {
    createFile(recordId, name, file) {
      return fetch(
        apiUrl(`/files/${recordId}/${name}`),
        {
          method: 'POST',
          body: file,
        }
      ).then(processError)
    },

    readFile(recordId, name) {
      return fetch(apiUrl(`/files/${recordId}/${name}`))
        .then(processError)
        .then(res => res.status === 404 ? null : res.buffer())
    },

    deleteFile(recordId, name) {
      return fetch(apiUrl(`/files/${recordId}/${name}`), { method: 'DELETE' }).then(processError)
    },

    listRecords(type) {
      return apiRequest('LIST_RECORDS', { type })
    },

    createRecord(type, name, data) {
      return apiRequest('CREATE_RECORD', { type, name, data })
    },

    updateRecord(id, name, data) {
      return apiRequest('UPDATE_RECORD', { id, name, data })
    },

    deleteRecord(id) {
      return apiRequest('DELETE_RECORD', { id })
    },
  }
}
