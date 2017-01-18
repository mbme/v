export { Inject } from './injector'

export const config = {
  searchDelay:        200,
  searchIgnoreCase:   true,
  searchIgnoreSpaces: true,
  closeEditorOnSave:  false,
  toastExpirationMs:  5000,
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
