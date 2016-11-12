/* tslint:disable:no-any object-literal-key-quotes */

import NotesStore from 'web-client/notes/store'
import ModalsStore from 'web-client/modals/store'
import RoutingStore from 'web-client/routingStore'

type AppState = Map<Function, any>

function newState(): AppState {
  const map: AppState = new Map()

  map.set(NotesStore, new NotesStore())
  map.set(ModalsStore, new ModalsStore())
  map.set(RoutingStore, new RoutingStore())

  return map
}

export const STATE = newState()

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

  // inject store getter
  Object.defineProperty(target, key, {
    get: () => STATE.get(typeInfo),
    enumerable: true,
    configurable: true
  })
}
