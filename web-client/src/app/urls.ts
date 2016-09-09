import {Id, FileName} from 'types'

export function records(): string {
  return '/api/records'
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
