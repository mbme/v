import { LOCATION_CHANGE, PUSH, REPLACE, propagateCurrentLocation, replace, setView } from './actions';

export default function routerMiddleware(router) {
  return (store) => {
    // handle browser back/forward buttons, and history.back()/forward()/go()
    window.addEventListener('popstate', () => store.dispatch(propagateCurrentLocation()));

    return next => (action) => { // eslint-disable-line consistent-return
      switch (action.type) {
        case PUSH:
          window.history.pushState(null, '', router.getUrl(action.name, action.params));
          store.dispatch(propagateCurrentLocation(true));
          break;

        case REPLACE:
          window.history.replaceState(null, '', router.getUrl(action.name, action.params));
          store.dispatch(propagateCurrentLocation(true));
          break;

        case LOCATION_CHANGE:
          router.resolve(action.pathname).then(({ route, params }) => {
            if (route.redirectTo) {
              store.dispatch(replace(route.redirectTo));
              return;
            }

            next(action);

            const initPromise = route.init ? route.init(store, params) : Promise.resolve();

            initPromise.then(
              () => route.render(params),
              (e) => {
                console.error(e);
                return null;
              },
            ).then(
              view => store.dispatch(setView(view, route, params)),
            );
          });
          break;

        default:
          return next(action);
      }
    };
  };
}
