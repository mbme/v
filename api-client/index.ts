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

function intoPromise<T>(r: request.SuperAgentRequest): Promise<T> {
  return new Promise((resolve, reject) => {
    r.end((err, res) => {
      if (err) {
        reject(new ServerError(err.status, err.response ? err.response.text : ''))
      } else {
        resolve(res)
      }
    })
  })
}

export function listNotes(): Promise<INoteRecord[]> {
  return intoPromise(request.get(urls.notes()))
}

export function readNote(id: Id): Promise<INote> {
  return intoPromise(request.get(urls.note(id)))
}

export function createNote(name: Name): Promise<INote> {
  return intoPromise(request.post(urls.notes()).send({ name, 'data': '' }))
}

export function updateNote(id: Id, name: Name, data: NoteData): Promise<INote> {
  return intoPromise(request.put(urls.note(id)).send({ name, data }))
}

export function deleteNote(id: Id): Promise<void> {
  return intoPromise(request.delete(urls.note(id)))
}

export function uploadNoteFile(noteId: Id, name: FileName, file: File): Promise<IFileInfo> {
  const data = new FormData()
  data.append('name', name)
  data.append('data', file)

  return intoPromise(request.post(urls.noteFiles(noteId)).send(data))
}

export function deleteNoteFile(noteId: Id, name: FileName): Promise<void> {
  return intoPromise(request.delete(urls.noteFile(noteId, name)))
}

export function listNoteFiles(noteId: Id): Promise<IFileInfo[]> {
  return intoPromise(request.get(urls.noteFiles(noteId)))
}
