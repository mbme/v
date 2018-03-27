import { SHOW_TOAST, SHOW_LOCKER, SHOW_NAV, SET_AUTHORIZED } from './actions';

const defaultState = {
  toast: null,
  showLocker: false,
  showNav: false,

  isAuthorized: true,
};

export default function chrome(state = defaultState, action) {
  switch (action.type) {
    case SHOW_TOAST:
      return {
        ...state,
        toast: action.data,
      };

    case SHOW_LOCKER:
      return {
        ...state,
        showLocker: action.show,
      };

    case SHOW_NAV:
      return {
        ...state,
        showNav: action.show,
      };

    case SET_AUTHORIZED:
      return {
        ...state,
        isAuthorized: action.authorized,
      };

    default:
      return state;
  }
}
