import {Id, FileName} from 'api-client/types'

const prefix = `${__SERVER__}/api`

export function notes(): string {
  return `${prefix}/notes`
}

export function note(id: Id): string {
  return `${prefix}/notes/${id}`
}

export function noteFiles(id: Id): string {
  return `${prefix}/notes/${id}/files`
}

export function noteFile(id: Id, name: FileName): string {
  return `${prefix}/notes/${id}/files/${name}`
}
