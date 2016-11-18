import {action, observable} from 'mobx'
import {Id, Timestamp} from 'api-client/types'
import * as api from 'api-client'
import { IRecord } from 'api-client/types'
import {ApiErrorHandler} from 'web-client/utils'

class ProjectRecord {
  readonly id: Id
  readonly name: string
  readonly createTs: Timestamp
  readonly updateTs: Timestamp

  constructor(dto: IRecord) {
    this.id = dto.id
    this.name = dto.name
    this.createTs = dto.create_ts
    this.updateTs = dto.update_ts
  }
}

export default class ProjectsStore {
  @observable projects: ProjectRecord[] = []

  constructor(private errorHandler: ApiErrorHandler) {}

  @action
  async loadProjectsList(): Promise<void> {
    const data = await this.errorHandler(api.listProjects(), `failed to load projects list`)
    this.setProjectsList(data.map(dto => new ProjectRecord(dto)))
  }

  @action
  private setProjectsList(projects: ProjectRecord[]): void {
    this.projects = projects
  }
}
