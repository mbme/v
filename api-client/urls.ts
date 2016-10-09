import {Id, FileName} from 'api-client/types'

export function noteRecords(): string {
  return '/api/records/notes'
}

export function notes(): string {
  return '/api/notes'
}

export function note(id: Id): string {
  return `/api/notes/${id}`
}

export function noteFiles(id: Id): string {
  return `/api/notes/${id}/files`
}

export function noteFile(id: Id, name: FileName): string {
  return `/api/notes/${id}/files/${name}`
}
