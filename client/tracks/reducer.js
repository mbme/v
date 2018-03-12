import { CHANGE_LIST } from './actions';

const defaultState = {
  tracks: [],
};

export default function tracks(state = defaultState, action) {
  switch (action.type) {
    case CHANGE_LIST:
      return {
        tracks: action.tracks,
      };

    default:
      return state;
  }
}
