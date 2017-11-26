import { SHOW_TOAST } from './actions'

const defaultState = {
  toast: null,
}

export default function chrome(state = defaultState, action) {
  switch (action.type) {
    case SHOW_TOAST:
      return {
        ...state,
        toast: action.data,
      }

    default:
      return state
  }
}
