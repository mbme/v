import React from 'react'
import { isObject, isArray } from './utils'

function wrap (val, handler) {
  if (isObject(val)) {
    const wrappedVal = {}

    Object.keys(val).forEach((key) => {
      wrappedVal[key] = wrap(val[key], handler)
    })

    return new Proxy(wrappedVal, handler)
  }

  if (isArray(val)) {
    return new Proxy(val.map(item => wrap(item, handler)), handler)
  }

  return val
}

export function watchChanges (obj, cb) {
  const handler = {
    set (target, property, value, receiver) {
      Reflect.set(target, property, wrap(value, handler), receiver)
      cb()

      return true
    },
  }

  return wrap(obj, handler)
}

export function asyncWatchChanges (obj, cb) {
  let timeout

  return watchChanges(obj, () => {
    if (timeout) {
      return
    }

    timeout = setTimeout(() => {
      timeout = null
      cb()
    }, 0)
  })
}

export default function connect (initStore) {
  return WrappedComponent =>
    class extends React.Component {
      static displayName = 'Connected' + (WrappedComponent.displayName || WrappedComponent.name || 'Component')

      mounted = false

      componentWillMount () {
        this.store = asyncWatchChanges(initStore(), () => {
          if (this.mounted) {
            this.forceUpdate()
          }
        })
      }

      componentDidMount () {
        this.mounted = true
      }

      componentWillUnmount () {
        this.mounted = false
      }

      render () {
        return <WrappedComponent store={this.store} {...this.props} />
      }
    }
}
