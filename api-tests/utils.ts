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

function createDataGenerator (...fields: string[]): () => string[] {
  return function (): string[] {
    return fields.map(uniq)
  }
}

export const randomProject = createDataGenerator('name', 'description')

export const randomNote = createDataGenerator('name', 'data')

export const randomTodo = createDataGenerator('name', 'details')
