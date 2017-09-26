import { LOCATION_CHANGE } from './actions'

const defaultState = {
  pathname: '/',
  search: '',
  isPush: false,
  view: null,
}

export default function router(state = defaultState, action) {
  switch (action.type) {
    case LOCATION_CHANGE:
      return {
        pathname: action.pathname,
        search: action.search,
        isPush: action.isPush,
        view: action.view,
      }

    default:
      return state
  }
}
