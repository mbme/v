export type Id = number
export type Timestamp = number

export type FileName = string
export type FileSize = number

export interface IFileInfo {
  readonly name: FileName,
  readonly size: FileSize,
  readonly create_ts: Timestamp,
}

export interface IRecord {
  readonly id: Id,
  readonly name: string,
  readonly create_ts: Timestamp,
  readonly update_ts: Timestamp,
}

export interface INote {
  readonly id: Id,
  readonly name: string,
  readonly create_ts: Timestamp,
  readonly update_ts: Timestamp,
  readonly data: string,
  readonly files: ReadonlyArray<IFileInfo>,
}

export interface IProject {
  readonly id: Id,
  readonly name: string,
  readonly create_ts: Timestamp,
  readonly update_ts: Timestamp,
  readonly description: string,
  readonly files: ReadonlyArray<IFileInfo>,
}

export type TodoState = 'inbox' | 'todo' | 'in-progress' | 'blocked' | 'done' | 'canceled'

export interface ITodo {
  readonly id: Id,
  readonly name: string,
  readonly create_ts: Timestamp,
  readonly update_ts: Timestamp,
  readonly project_id: Id,
  readonly details: string,
  readonly state: TodoState,
  readonly start_ts: Timestamp,
  readonly end_ts: Timestamp,
  readonly files: ReadonlyArray<IFileInfo>,
}
