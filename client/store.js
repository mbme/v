import createStore from './utils/createStore';

const { Store, inject } = createStore('global', {
  initialState: {
    toast: null,
    showLocker: false,
    showNav: false,

    isAuthorized: true,

    route: null,
    params: {},
    query: {},
  },

  actions: {
    showToast(toast, state) {
      return { ...state, toast };
    },
    showLocker(show, state) {
      return { ...state, showLocker: show };
    },
    showNav(show, state) {
      return { ...state, showNav: show };
    },
    setAuthorized(isAuthorized, state) {
      return { ...state, isAuthorized };
    },

    setResolvedRoute({ route, params, query }, state) {
      return {
        ...state,

        route,
        params,
        query,
      };
    },
  },
});

export { Store, inject };
