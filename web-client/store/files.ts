import UIStore from './ui'

import * as api from 'api-client'
import { IFileInfo } from 'api-client/types'

export default class FilesStore {
  constructor(protected uiStore: UIStore) {}

  async uploadFile(recordId: number, name: string, file: File): Promise<void> {
    await this.uiStore.errorHandler(
      api.uploadFile(recordId, name, file),
      `failed to upload file for record ${recordId}`
    )
  }

  deleteFile(recordId: number, file: IFileInfo): Promise<void> {
    return this.uiStore.errorHandler(
      api.deleteFile(recordId, file.name),
      `failed to delete file of record ${recordId}`
    )
  }

  loadFiles(recordId: number): Promise<IFileInfo[]> {
    return this.uiStore.errorHandler(
      api.listFiles(recordId),
      `failed to list files of record ${recordId}`
    )
  }
}
