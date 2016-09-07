function fetchData<T>(request: Request): Promise<T> {
  return fetch(request).then(response => response.json())
}

export const http = {
  GET<T> (url: string): Promise<T> {
    return fetchData<T>(new Request(url))
  },

  POST<T> (url: string, data: FormData | string): Promise<T> {
    return fetchData<T>(new Request(url, {
      'method': 'POST',
      'body': data,
    }))
  },

  PUT<T> (url: string, data: FormData | string): Promise<T> {
    return fetchData<T>(new Request(url, {
      'method': 'PUT',
      'body': data,
    }))
  },

  DELETE (url: string): Promise<void> {
    return fetch(new Request(url, {
      'method': 'DELETE',
    }))
  },
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
