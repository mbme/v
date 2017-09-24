import { LOCATION_CHANGE } from './actions'

const defaultState = {
  pathname: '/',
  search: '',
  queries: {},
  hash: '',
}

export default function router(state = defaultState, action) {
  switch (action.type) {
    case LOCATION_CHANGE:
      return {
        ...state,
        ...action.payload,
      }

    default:
      return state
  }
}
