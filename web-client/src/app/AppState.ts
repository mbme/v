/* tslint:disable:no-any object-literal-key-quotes */

import NotesStore from 'notes/store'
import ModalsStore from 'modals/store'

export type AppState = Map<Function, any>

function newState(): AppState {
  const map: AppState = new Map()

  map.set(NotesStore, new NotesStore())
  map.set(ModalsStore, new ModalsStore())

  return map
}

const STATE = newState()

/**
 * Property decorator.
 */
export function InjectStore(target: Object, key: string): void {
  const typeInfo = Reflect.getMetadata('design:type', target, key)

  if ((target as any)[key]) {
    const componentName = target.constructor.name
    throw new Error(
      `InjectStore: ${componentName}[${key}] must be empty to inject a store`
    )
  }

  function getter(): AppState {
    return STATE.get(typeInfo)
  }

  // inject store getter
  Object.defineProperty(target, key, {
    get: getter,
    enumerable: true,
    configurable: true
  })
}
