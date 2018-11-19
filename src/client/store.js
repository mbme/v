import createStore from './utils/createStore';

const { Store, inject } = createStore({
  initialState: {
    toast: null,
    showLocker: false,
    showNav: false,

    isAuthorized: undefined,

    route: null,
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
    setRoute(route, state) {
      return { ...state, route };
    },
  },
});

export { Store, inject };
