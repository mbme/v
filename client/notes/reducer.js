import { LIST_CHANGE } from './actions'

const defaultState = {
  initialized: false,
  notes: [],
}

export default function notes(state = defaultState, action) {
  switch (action.type) {
    case LIST_CHANGE:
      return {
        initialized: true,
        notes: action.notes,
      }

    default:
      return state
  }
}
