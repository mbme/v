import { LOCATION_CHANGE, SET_VIEW } from './actions';

const defaultState = {
  pathname: '/',
  search: '',
  isPush: false,
  isLoading: false,

  view: null,
  route: null,
  params: {},
  query: {},
};

export default function router(state = defaultState, action) {
  switch (action.type) {
    case LOCATION_CHANGE:
      return {
        ...defaultState,
        pathname: action.pathname,
        search: action.search,
        isPush: action.isPush,
        isLoading: true,
      };

    case SET_VIEW:
      return {
        ...state,
        isLoading: false,
        view: action.view,
        route: action.route,
        params: action.params,
        query: action.query,
      };

    default:
      return state;
  }
}
