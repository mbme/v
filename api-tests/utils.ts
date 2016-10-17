import * as fs from 'fs'

export function randomInt(): number {
  return Math.floor(Math.random() * 999999999999999)
}

// add uniq suffix to string
export function uniq(str: string): string {
  return `${str}_${randomInt()}`
}

export function readBinaryFile(name: string): Buffer {
  return fs.readFileSync(name)
}

export function forceTypeCast<T>(x: any): T { // tslint:disable-line:no-any
  return x
}
