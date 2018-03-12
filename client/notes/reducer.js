import { CHANGE_LIST } from './actions';

const defaultState = {
  notes: [],
};

export default function notes(state = defaultState, action) {
  switch (action.type) {
    case CHANGE_LIST:
      return {
        notes: action.notes,
      };

    default:
      return state;
  }
}
