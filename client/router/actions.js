export const PUSH = 'ROUTER/PUSH';
export function push({ name, params, query }) {
  return {
    type: PUSH,
    name,
    params,
    query,
  };
}

export const REPLACE = 'ROUTER/REPLACE';
export function replace({ name, params, query }) {
  return {
    type: REPLACE,
    name,
    params,
    query,
  };
}

export function replaceQueryParam(name, value) {
  return (dispatch, getState) => {
    const { route, params, query } = getState().router;

    return dispatch(replace({
      name: route.name,
      params,
      query: {
        ...query,
        [name]: value,
      },
    }));
  };
}

export const LOCATION_CHANGE = 'ROUTER/LOCATION_CHANGE';
export function locationChange(pathname, search, isPush = false) {
  return {
    type: LOCATION_CHANGE,
    pathname,
    search,
    isPush,
  };
}

export function propagateCurrentLocation(isPush = false) {
  return locationChange(window.location.pathname, window.location.search, isPush);
}

export const SET_VIEW = 'ROUTER/SET_VIEW';
export function setView(view, route, params, query) {
  return {
    type: SET_VIEW,
    view,
    route,
    params,
    query,
  };
}
