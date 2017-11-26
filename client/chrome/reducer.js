import { SHOW_TOAST, SHOW_LOCKER } from './actions'

const defaultState = {
  toast: null,
  showLocker: false,
}

export default function chrome(state = defaultState, action) {
  switch (action.type) {
    case SHOW_TOAST:
      return {
        ...state,
        toast: action.data,
      }

    case SHOW_LOCKER:
      return {
        ...state,
        showLocker: action.show,
      }

    default:
      return state
  }
}
