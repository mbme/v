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

/**
 * Check if needle fuzzy matches haystack.
 * @see https://github.com/bevacqua/fuzzysearch
 */
export function fuzzySearch(needle: string, haystack: string): boolean {
  const nlen = needle.length

  // if needle is empty then it matches everything
  if (!nlen) {
    return true
  }

  const hlen = haystack.length
  if (nlen > hlen) {
    return false
  }

  if (nlen === hlen) {
    return needle === haystack
  }

  outer: for (let i = 0, j = 0; i < nlen; i += 1) {
    const nch = needle.charCodeAt(i)
    while (j < hlen) {
      if (haystack.charCodeAt(j++) === nch) {
        continue outer
      }
    }
    return false
  }

  return true
}
