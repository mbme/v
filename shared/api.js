export const CONTENT_TYPE = 'multipart/v-data'

export default function createApiClient(baseUrl, network) {
  const apiPOST = network.POST.bind(null, `${baseUrl}/api`)

  return {
    getFileUrl(fileId) {
      return `${baseUrl}/api?fileId=${fileId}`
    },

    readFile(fileId) {
      return network.GET(this.getFileUrl(fileId))
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
