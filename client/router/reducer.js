import { LOCATION_CHANGE, SET_VIEW } from './actions';

const defaultState = {
  pathname: '/',
  search: '',
  query: {},
  isPush: false,
  isLoading: false,
  view: null,
  route: null,
  params: {},
};

function parseQuery(search) {
  if (!search.length) {
    return {};
  }

  return search.substring(1).split('&').reduce((acc, pair) => {
    const splitter = pair.indexOf('=');
    const key = decodeURIComponent(pair.substr(0, splitter));
    const value = decodeURIComponent(pair.substr(splitter + 1));
    acc[key] = value;

    return acc;
  }, {});
}

export default function router(state = defaultState, action) {
  switch (action.type) {
    case LOCATION_CHANGE:
      return {
        ...defaultState,
        pathname: action.pathname,
        search: action.search,
        query: parseQuery(action.search),
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
      };

    default:
      return state;
  }
}
