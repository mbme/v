export interface IFileInfo {
  readonly name: string,
  readonly size: number,
  readonly createTs: number,
}

export interface IRecord {
  readonly id: number,
  readonly name: string,
  readonly createTs: number,
  readonly updateTs: number,
}

export interface INote {
  readonly id: number,
  readonly name: string,
  readonly createTs: number,
  readonly updateTs: number,
  readonly data: string,
  readonly files: ReadonlyArray<IFileInfo>,
}

export interface IProject {
  readonly id: number,
  readonly name: string,
  readonly createTs: number,
  readonly updateTs: number,
  readonly description: string,
  readonly files: ReadonlyArray<IFileInfo>,
}

export type TodoState = 'inbox' | 'todo' | 'in-progress' | 'blocked' | 'done' | 'canceled'

export interface ITodoData {
  readonly name: string,
  readonly details: string,
  readonly startTs?: number,
  readonly endTs?: number,
}

export interface ITodo extends ITodoData {
  readonly id: number,
  readonly createTs: number,
  readonly updateTs: number,
  readonly projectId: number,
  readonly state: TodoState,
  readonly files: ReadonlyArray<IFileInfo>,
}
