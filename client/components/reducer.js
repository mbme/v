import { SHOW_MODAL, HIDE_MODAL } from './actions'

const defaultState = {
  modal: null,
}

export default function components(state = defaultState, action) {
  switch (action.type) {
    case SHOW_MODAL:
      return {
        modal: action.modal,
      }

    case HIDE_MODAL:
      if (action.modal === state.modal) {
        return defaultState
      }

      return state

    default:
      return state
  }
}
