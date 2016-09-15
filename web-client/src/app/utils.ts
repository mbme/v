interface IErrorDTO {
  readonly error: string,
}

export class ServerError extends Error {
  readonly status: number
  readonly error: string

  constructor(status: number, error: string) {
    super()

    this.status = status
    this.error = error
  }

  static new(response: Response): Promise<ServerError> {
    return response.json().then(
      (dto: IErrorDTO) => {
        throw new ServerError(response.status, dto.error)
      },
      () => {
        throw new ServerError(response.status, "can't parse response body")
      }
    )
  }

  toString(): string {
    return this.error || this.status.toString()
  }
}

function fetchData<T>(request: Request): Promise<T> {
  return fetch(request).then((response) => {
    if (response.status === 200) {
      return response.json()
    } else {
      return ServerError.new(response)
    }
  })
}

function fetchExec(request: Request): Promise<void> {
  return fetch(request).then((response) => {
    if (response.status === 200) {
      return Promise.resolve()
    } else {
      return ServerError.new(response)
    }
  })
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
    return fetchExec(new Request(url, {
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

const B_IN_KB = 1024
const B_IN_MB = B_IN_KB * 1024
const B_IN_GB = B_IN_MB * 1024

export function formatBytes (bytes: number): string {
  if (bytes < B_IN_KB) {
    return bytes + 'B'
  }

  if (bytes < B_IN_MB) {
    return (bytes / B_IN_KB).toFixed(1) + 'KB'
  }

  if (bytes < B_IN_GB) {
    return (bytes / B_IN_MB).toFixed(2) + 'MB'
  }

  return (bytes / B_IN_GB).toFixed(2) + 'GB'
}

// Fighting with TS structural type matching
// Classes which extend this class will not be
// structurally equal to interfaces with the same fields
export class BaseModel {
  private s: symbol

  constructor(name: string) {
    this.s = Symbol(name)
  }
}
