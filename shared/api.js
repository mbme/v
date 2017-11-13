export const CONTENT_TYPE = 'multipart/v-data'

export default function createApiClient(baseUrl, apiClient) {
  const apiPOST = apiClient.POST.bind(null, `${baseUrl}/api`)

  return {
    readFile(fileId) {
      return apiClient.GET(`${baseUrl}/api?fileId=${fileId}`)
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
