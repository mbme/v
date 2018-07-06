export const getFileUrl = fileId => `/api?fileId=${fileId}`;

export default function createApiClient(baseUrl, network) {
  return new Proxy({}, {
    get(target, prop) {
      if (prop === 'READ_FILE') {
        return ({ fileId }) => network.get(baseUrl + getFileUrl(fileId));
      }

      return (data, newFiles) => network.post(`${baseUrl}/api`, { name: prop, data }, newFiles);
    },
  });
}
