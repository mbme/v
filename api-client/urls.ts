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

function projects(): string {
  return `${prefix}/projects`
}

function project(id: Id): string {
  return `${prefix}/projects/${id}`
}

function todos(projectId: Id): string {
  return `${prefix}/todos/project/${projectId}`
}

function todo(id: Id): string {
  return `${prefix}/todos/${id}`
}

export default {
  notes,
  note,
  files,
  file,
  projects,
  project,
  todos,
  todo,
}
