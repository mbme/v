import * as fs from 'fs'
import { expect } from 'chai'
import { ServerError } from 'api-client'

export function randomInt(): number {
  return Math.floor(Math.random() * 999999999999999)
}

// add uniq suffix to string
export function uniq(str: string): string {
  return `${str}_${randomInt()}`
}

export function readBinaryFile(path: string): Buffer {
  return fs.readFileSync(path)
}

export function forceTypeCast<T>(x: any): T { // tslint:disable-line:no-any
  return x
}

export function expectFailure<T>(promise: Promise<T>, status: number): Promise<T> {
  return promise.then(
    () => {
      throw new Error('must fail')
    },
    (err: ServerError) => {
      expect(err.status).to.equal(status)
      expect(err.error).to.be.a('string')
      expect(err.error.length).to.be.greaterThan(0)
    }
  )
}

export type NoteDTO = { name: string, data: string }

export function randomNote(): NoteDTO {
  return {
    'name': uniq('name'),
    'data': uniq('data'),
  }
}
