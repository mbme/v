export const PUSH = 'ROUTER/PUSH'
export function push({ name, params }) {
  return {
    type: PUSH,
    name,
    params,
  }
}

export const REPLACE = 'ROUTER/REPLACE'
export function replace({ name, params }) {
  return {
    type: REPLACE,
    name,
    params,
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

export const SET_VIEW = 'ROUTER/SET_VIEW'
export function setView(view, routingSequence) {
  return {
    type: SET_VIEW,
    view,
    routingSequence,
  }
}
