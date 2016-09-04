import {action, observable} from 'mobx'
import {simpleFetch} from 'utils'

// type RecordType = 'note'

type Id = number
type Name = string
type Timestamp = number

interface INoteRecord {
  id: Id,
  name: Name,
  create_ts: Timestamp,
  update_ts: Timestamp,
}

type FileName = string
type FileSize = number

interface IFileInfo {
  name: FileName,
  size: FileSize,
  create_ts: Timestamp,
}

interface INote {
  id: Id,
  name: Name,
  create_ts: Timestamp,
  update_ts: Timestamp,
  data: string,
  files: IFileInfo[],
}

export default class NotesStore {
  @observable records: INoteRecord[] = []
  @observable openNotes: Map<Id, INote> = new Map()

  @action
  loadRecordsList(): void {
    simpleFetch('/api/records').then((data: INoteRecord[]) => {
      this.setRecordsList(data)
    })
  }

  @action
  private setRecordsList(records: INoteRecord[]): void {
    this.records = records
  }

}
