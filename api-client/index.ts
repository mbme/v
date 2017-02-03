import * as request from 'superagent'
import urls from 'api-client/urls'
import {
  IFileInfo,
  IRecord,
  INote,
  IProject,
  ITodo,
  ITodoData,
  TodoState,
} from 'api-client/types'

export class ServerError extends Error {
  constructor(readonly status: number = 0, readonly error: string = '') {
    super()
  }

  toString(): string {
    return this.error || `status code ${this.status}`
  }
}

function maybeLog(prefix: string, url: string, status: number): void {
  if (__DEV__) {
    console.log('%s %s -> %s', prefix, url, status) // tslint:disable-line:no-console
  }
}

function wrapRequest<T>(r: request.SuperAgentRequest, onResponse: (status: number) => void): Promise<T> { // tslint:disable-line:max-line-length
  return new Promise((resolve, reject) => {
    r.end((err, res) => {
      if (err) {
        onResponse(err.status)
        reject(new ServerError(err.status, err.response ? err.response.text : ''))
      } else {
        onResponse(res.status)
        resolve(renameProps(res.body, toCamelCase))
      }
    })
  })
}

function toCamelCase(s: string): string {
  return s.replace(/(_[a-z])/g, c => c.charAt(1).toUpperCase())
}

function toSnakeCase(s: string): string {
  return s.replace(/([a-z][A-Z])/g, c => c.charAt(0) + '_' + c.charAt(1).toLowerCase())
}

function renameProps(data: any, convert: (s: string) => string): any {
  const type = Object.prototype.toString.call(data)

  if (type === '[object Array]') {
    return data.map((item: any) => renameProps(item, convert))
  }

  if (type === '[object Object]') {
    const result: any = {}

    Object.keys(data).forEach(prop => result[convert(prop)] = renameProps(data[prop], convert))

    return result
  }

  return data
}

function GET<T>(url: string): Promise<T> {
  return wrapRequest(request.get(url), status => maybeLog('  GET', url, status))
}

function POST_FILE<T>(url: string, addData: (req: request.Request) => void): Promise<T> {
  const req = request.post(url)
  addData(req)

  return wrapRequest(req, status => maybeLog('  POST', url, status))
}

function POST<T>(url: string, data: Object): Promise<T> {
  return POST_FILE(url, req => req.send(renameProps(data, toSnakeCase)))
}

function PUT<T>(url: string, data: Object): Promise<T> {
  return wrapRequest(
    request.put(url).send(renameProps(data, toSnakeCase)),
    status => maybeLog('   PUT', url, status)
  )
}

function DELETE<T>(url: string): Promise<T> {
  return wrapRequest(request.delete(url), status => maybeLog('DELETE', url, status))
}

export function listNotes(): Promise<IRecord[]> {
  return GET(urls.notes())
}

export function readNote(id: number): Promise<INote> {
  return GET(urls.note(id))
}

export function createNote(name: string, data: string = ''): Promise<INote> {
  return POST(urls.notes(), { name, data })
}

export function updateNote(id: number, name: string, data: string): Promise<INote> {
  return PUT(urls.note(id), { name, data })
}

export function deleteNote(id: number): Promise<void> {
  return DELETE<void>(urls.note(id))
}

export function readFile(recordId: number, name: string): Promise<Buffer> {
  return GET(urls.file(recordId, name))
}

export function uploadFile(
  recordId: number,
  name: string,
  file: File | Buffer
): Promise<IFileInfo> {
  return POST_FILE(
    urls.files(recordId),
    (req) => req.field('name', name).attach('data', file as any) // tslint:disable-line:no-any
  )
}

export function deleteFile(recordId: number, name: string): Promise<void> {
  return DELETE<void>(urls.file(recordId, name))
}

export function listFiles(recordId: number): Promise<IFileInfo[]> {
  return GET(urls.files(recordId))
}

export function listProjects(): Promise<IRecord[]> {
  return GET(urls.projects())
}

export function createProject(name: string, description: string = ''): Promise<IProject> {
  return POST(urls.projects(), { name, description })
}

export function updateProject(id: number, name: string, description: string): Promise<IProject> {
  return PUT(urls.project(id), { name, description })
}

export function readProject(id: number): Promise<IProject> {
  return GET(urls.project(id))
}

export function listProjectTodos(projectId: number): Promise<ITodo[]> {
  return GET(urls.todos(projectId))
}

export function createTodo(projectId: number, data: ITodoData): Promise<ITodo> {
  return POST(urls.todos(projectId), data)
}

export function updateTodo(id: number, data: ITodoData, state: TodoState): Promise<ITodo> {
  return PUT(urls.todo(id), { ...data, state })
}

export function readTodo(todoId: number): Promise<ITodo> {
  return GET(urls.todo(todoId))
}
