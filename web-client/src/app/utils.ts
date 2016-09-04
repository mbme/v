/**
 * Simple wrapper around fetch that rejects on anything but a succesful json response
 */
export function simpleFetch<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    window.fetch(url)
      .then((res) => {
        if (res.ok) {
          res.json().then(resolve).catch(reject)
        } else {
          reject(res)
        }
      })
      .catch(reject)
  })
}
