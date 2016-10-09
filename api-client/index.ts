import * as request from 'superagent'
import * as urls from 'api-client/urls'
import { INoteRecord } from 'api-client/types'

export function listNotes(): Promise<INoteRecord[]> {
  return request.get(urls.notes())
}
