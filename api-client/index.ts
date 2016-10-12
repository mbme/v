import * as request from 'superagent'
import * as urls from 'api-client/urls'
import {
  IFileInfo,
  INoteRecord,
  INote,
  Id,
  Name,
  NoteData,
  FileName,
} from 'api-client/types'

export class ServerError extends Error {
  readonly status: number
  readonly error: string

  constructor(status: number, error: string) {
    super()

    this.status = status
    this.error = error
  }

  static new(err: any = {}): ServerError { // tslint:disable-line:no-any
    const status = err.status || 0
    const msg = err.response ? err.response.text : ''
    return new ServerError(status, msg)
  }

  toString(): string {
    return this.error || this.status.toString()
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
        resolve(res.body)
      }
    })
  })
}

function GET<T>(url: string): Promise<T> {
  return wrapRequest(
    request.get(url),
    (status) => maybeLog('  GET', url, status)
  )
}

function POST<T>(url: string, data: Object): Promise<T> {
  return wrapRequest(
    request.post(url).send(data),
    (status) => maybeLog('  POST', url, status)
  )
}

function PUT<T>(url: string, data: Object): Promise<T> {
  return wrapRequest(
    request.put(url).send(data),
    (status) => maybeLog('   PUT', url, status)
  )
}

function DELETE<T>(url: string): Promise<T> {
  return wrapRequest(
    request.delete(url),
    (status) => maybeLog('DELETE', url, status)
  )
}

export function listNotes(): Promise<INoteRecord[]> {
  return GET(urls.notes())
}

export function readNote(id: Id): Promise<INote> {
  return GET(urls.note(id))
}

export function createNote(name: Name): Promise<INote> {
  return POST(urls.notes(), { name, 'data': '' })
}

export function updateNote(id: Id, name: Name, data: NoteData): Promise<INote> {
  return PUT(urls.note(id), { name, data })
}

export function deleteNote(id: Id): Promise<void> {
  return DELETE(urls.note(id))
}

export function uploadNoteFile(noteId: Id, name: FileName, file: File): Promise<IFileInfo> {
  const data = new FormData()
  data.append('name', name)
  data.append('data', file)

  return POST(urls.noteFiles(noteId), data)
}

export function deleteNoteFile(noteId: Id, name: FileName): Promise<void> {
  return DELETE(urls.noteFile(noteId, name))
}

export function listNoteFiles(noteId: Id): Promise<IFileInfo[]> {
  return GET(urls.noteFiles(noteId))
}
