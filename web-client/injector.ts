/* tslint:disable:no-any object-literal-key-quotes */

type AppState = Map<Function, any>

let STATE: AppState | undefined

export function setState(newState: AppState): void {
  STATE = newState
}

/**
 * Property decorator.
 */
export function InjectStore(target: Object, key: string): void {
  const typeInfo = Reflect.getMetadata('design:type', target, key)

  const componentName = target.constructor.name

  if ((target as any)[key]) {
    throw new Error(
      `InjectStore: ${componentName}[${key}] must be empty to inject a store`
    )
  }

  // inject store getter
  Object.defineProperty(target, key, {
    get: () => {
      if (STATE) {
        return STATE.get(typeInfo)
      } else {
        throw new Error(
          `InjectStore: failed to set${componentName}[${key}]: no STATE yet`
        )
      }
    },
    enumerable: true,
    configurable: true
  })
}
