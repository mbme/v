import { CHANGE_LIST, SET } from './actions';

const defaultState = {
  notes: [],
  note: {},
};

export default function notes(state = defaultState, action) {
  switch (action.type) {
    case CHANGE_LIST:
      return {
        ...state,
        notes: action.notes,
      };

    case SET: {
      return {
        ...state,
        note: {
          ...state.note,
          [action.id]: action.note,
        },
      };
    }

    default:
      return state;
  }
}
