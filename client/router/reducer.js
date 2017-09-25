import { LOCATION_CHANGE } from './actions'

const defaultState = {
  pathname: '/',
  search: '',
  isPush: false,
}

export default function router(state = defaultState, action) {
  switch (action.type) {
    case LOCATION_CHANGE:
      return {
        pathname: action.pathname,
        search: action.search,
        isPush: action.isPush,
      }

    default:
      return state
  }
}
