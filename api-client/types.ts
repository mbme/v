// type RecordType = 'note'

export type Id = number
export type Name = string
export type Timestamp = number

export type FileName = string
export type FileSize = number

export interface IFileInfo {
  readonly name: FileName,
  readonly size: FileSize,
  readonly create_ts: Timestamp,
}

export interface INoteRecord {
  readonly id: Id,
  readonly name: Name,
  readonly create_ts: Timestamp,
  readonly update_ts: Timestamp,
}
