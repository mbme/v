import {Id, FileName} from 'api-client/types'

const prefix = `${__SERVER__}/api`

export function notes(): string {
  return `${prefix}/notes`
}

export function note(id: Id): string {
  return `${prefix}/notes/${id}`
}

export function files(recordId: Id): string {
  return `${prefix}/files/${recordId}`
}

export function file(recordId: Id, name: FileName): string {
  return `${prefix}/files/${recordId}/${name}`
}
