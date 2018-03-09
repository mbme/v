export const CONTENT_TYPE = 'multipart/v-data';

export const getFileUrl = fileId => `/api?fileId=${fileId}`;

export default function createApiClient(baseUrl, network) {
  const apiPOST = network.post.bind(null, `${baseUrl}/api`);

  return {
    ping() {
      return apiPOST({ name: 'PING' });
    },

    getFileUrl(fileId) {
      return baseUrl + getFileUrl(fileId);
    },

    readFile(fileId) {
      return network.get(this.getFileUrl(fileId));
    },

    listNotes() {
      return apiPOST({ name: 'LIST_NOTES' });
    },

    readNote(id) {
      return apiPOST({ name: 'READ_NOTE', data: { id } });
    },

    createNote(name, data, newFiles = []) {
      return apiPOST({ name: 'CREATE_NOTE', data: { name, data } }, newFiles);
    },

    updateNote(id, name, data, newFiles = []) {
      return apiPOST({ name: 'UPDATE_NOTE', data: { id, name, data } }, newFiles);
    },

    deleteNote(id) {
      return apiPOST({ name: 'DELETE_NOTE', data: { id } });
    },
  };
}
