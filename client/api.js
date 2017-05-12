function sendRequest (method, url, data) {
  const request = new XMLHttpRequest()
  request.responseType = 'json'
  request.open(method, url)

  return new Promise((resolve, reject) => {
    request.onload = () => resolve(request.response)
    request.onerror = e => reject(e)

    request.send(data)
  })
}

function apiUrl(path) {
  return '/api' + path
}

export async function createFile(recordId, name, file) {
  await sendRequest('POST', apiUrl(`/files/${recordId}`), {
    name,
    data: file,
  })
}

function apiRequest(action, data) {
  return sendRequest('POST', apiUrl(''), {
    name: action,
    data,
  })
}
