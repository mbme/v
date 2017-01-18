/* tslint:disable:no-any object-literal-key-quotes */
import Store from 'web-client/store'

let STORE: Store | undefined

export function setStore(store: Store): void {
  STORE = store
}

/**
 * Property decorator.
 */
export function Inject(target: Object, key: string): void {
  const componentName = target.constructor.name

  if ((target as any)[key]) {
    throw new Error(
      `Inject: ${componentName}[${key}] must be empty to inject a store`
    )
  }

  // inject store getter
  Object.defineProperty(target, key, {
    get: () => {
      if (STORE) {
        return STORE
      } else {
        throw new Error(
          `Inject: failed to set${componentName}[${key}]: no STORE yet`
        )
      }
    },
    enumerable: true,
    configurable: true
  })
}
