export const PUSH = 'ROUTER/PUSH'
export const REPLACE = 'ROUTER/REPLACE'
export const GO = 'ROUTER/GO'
export const GO_BACK = 'ROUTER/GO_BACK'
export const GO_FORWARD = 'ROUTER/GO_FORWARD'

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
