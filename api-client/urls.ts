const prefix = `${__SERVER__}/api`

function notes(): string {
  return `${prefix}/notes`
}

function note(id: number): string {
  return `${prefix}/notes/${id}`
}

function files(recordId: number): string {
  return `${prefix}/files/${recordId}`
}

function file(recordId: number, name: string): string {
  return `${prefix}/files/${recordId}/${name}`
}

function projects(): string {
  return `${prefix}/projects`
}

function project(id: number): string {
  return `${prefix}/projects/${id}`
}

function todos(projectId: number): string {
  return `${prefix}/todos/project/${projectId}`
}

function todo(id: number): string {
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
