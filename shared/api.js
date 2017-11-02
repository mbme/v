/* eslint-env browser */

export default function createApiClient(baseUrl = '') {
  function apiRequest(action, data, files = []) {
    const formData = new FormData()
    formData.append('name', action)
    formData.append('data', JSON.stringify(data))
    files.forEach((file, i) => formData.append(`file${i}`, file.data, file.name))

    return fetch(`${baseUrl}/api`, {
      method: 'POST',
      body: formData,
    }).then((res) => {
      if (!res.ok) {
        return res.json().then((body) => {
          if (body) {
            throw new Error(body.error)
          }

          throw new Error(`Server returned ${res.status} ${res.statusText}`)
        })
      }

      return res.json().then(body => body.data)
    })
  }

  return {
    readFile(id) {
      return fetch(`${baseUrl}/api?fileId=${id}`)
        .then((res) => {
          if (res.status === 404) {
            return null
          }

          if (!res.ok) {
            throw new Error(`Server returned ${res.status} ${res.statusText}`)
          }

          return res.buffer()
        })
    },

    listRecords(type) {
      return apiRequest('LIST_RECORDS', { type })
    },

    createRecord(type, name, data, newFiles = []) {
      return apiRequest('CREATE_RECORD', { type, name, data }, newFiles)
    },

    updateRecord(id, name, data, newFiles = []) {
      return apiRequest('UPDATE_RECORD', { id, name, data }, newFiles)
    },

    deleteRecord(id) {
      return apiRequest('DELETE_RECORD', { id })
    },
  }
}
