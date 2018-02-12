import { LIST_CHANGE, LIST_OUTDATED } from './actions';

const defaultState = {
  fresh: false,
  notes: [],
};

export default function notes(state = defaultState, action) {
  switch (action.type) {
    case LIST_CHANGE:
      return {
        notes: action.notes,
        fresh: true,
      };

    case LIST_OUTDATED:
      return {
        ...state,
        fresh: false,
      };

    default:
      return state;
  }
}
