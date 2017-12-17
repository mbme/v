import { SHOW_TOAST, SHOW_LOCKER, SET_AUTHORIZED } from './actions'

const defaultState = {
  toast: null,
  showLocker: false,
  authorized: true,
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

    case SET_AUTHORIZED:
      return {
        ...state,
        authorized: action.authorized,
      }

    default:
      return state
  }
}
