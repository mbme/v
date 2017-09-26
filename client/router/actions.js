export const PUSH = 'ROUTER/PUSH'
export function push(name, params) {
  return {
    type: PUSH,
    name,
    params,
  }
}

export const REPLACE = 'ROUTER/REPLACE'
export function replace(name, params) {
  return {
    type: REPLACE,
    name,
    params,
  }
}

export const GO = 'ROUTER/GO'
export function go(pos) {
  return {
    type: GO,
    pos,
  }
}


export const GO_BACK = 'ROUTER/GO_BACK'
export function goBack() {
  return {
    type: GO_BACK,
  }
}

export const GO_FORWARD = 'ROUTER/GO_FORWARD'
export function goForward() {
  return {
    type: GO_FORWARD,
  }
}

export const LOCATION_CHANGE = 'ROUTER/LOCATION_CHANGE'
export function locationChange(pathname, search, isPush = false) {
  return {
    type: LOCATION_CHANGE,
    pathname,
    search,
    isPush,
  }
}

export function propagateCurrentLocation(isPush = false) {
  return locationChange(window.location.pathname, window.location.search, isPush)
}
