export type Timestamp = number

export interface IFileInfo {
  readonly name: string,
  readonly size: number,
  readonly create_ts: Timestamp,
}

export interface IRecord {
  readonly id: number,
  readonly name: string,
  readonly create_ts: Timestamp,
  readonly update_ts: Timestamp,
}

export interface INote {
  readonly id: number,
  readonly name: string,
  readonly create_ts: Timestamp,
  readonly update_ts: Timestamp,
  readonly data: string,
  readonly files: ReadonlyArray<IFileInfo>,
}

export interface IProject {
  readonly id: number,
  readonly name: string,
  readonly create_ts: Timestamp,
  readonly update_ts: Timestamp,
  readonly description: string,
  readonly files: ReadonlyArray<IFileInfo>,
}

export type TodoState = 'inbox' | 'todo' | 'in-progress' | 'blocked' | 'done' | 'canceled'

export interface ITodo {
  readonly id: number,
  readonly name: string,
  readonly create_ts: Timestamp,
  readonly update_ts: Timestamp,
  readonly project_id: number,
  readonly details: string,
  readonly state: TodoState,
  readonly start_ts: Timestamp,
  readonly end_ts: Timestamp,
  readonly files: ReadonlyArray<IFileInfo>,
}
