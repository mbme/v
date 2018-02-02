export const CONTENT_TYPE = 'multipart/v-data'

export const getFileUrl = fileId => `/api?fileId=${fileId}`

export default function createApiClient(baseUrl, network) {
  const apiPOST = network.POST.bind(null, `${baseUrl}/api`)

  return {
    ping() {
      return apiPOST({ name: 'PING' })
    },

    getFileUrl(fileId) {
      return baseUrl + getFileUrl(fileId)
    },

    readFile(fileId) {
      return network.GET(this.getFileUrl(fileId))
    },

    listRecords(type) {
      return apiPOST({ name: 'LIST_RECORDS', data: { type } })
    },

    readRecord(id) {
      return apiPOST({ name: 'READ_RECORD', data: { id } })
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
