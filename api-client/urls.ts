import {Id, FileName} from 'api-client/types'

const prefix = `${__SERVER__}/api`

function notes(): string {
  return `${prefix}/notes`
}

function note(id: Id): string {
  return `${prefix}/notes/${id}`
}

function files(recordId: Id): string {
  return `${prefix}/files/${recordId}`
}

function file(recordId: Id, name: FileName): string {
  return `${prefix}/files/${recordId}/${name}`
}

export default {
  notes, note, files, file
}
