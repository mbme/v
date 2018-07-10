import { createPubSub } from '../shared/utils';
import router from './router';

const getCurrentLocation = isPush => ({
  pathname: window.location.pathname,
  search: window.location.search,
  isPush,
});

export const historyEvents = createPubSub();

export function propagateCurrentLocation() {
  historyEvents.emit('locationChange', getCurrentLocation(false));
}

export function push({ name, params, query }) {
  window.history.pushState(null, '', router.getUrl(name, params, query));
  historyEvents.emit('locationChange', getCurrentLocation(true));
}

export function replace({ name, params, query }) {
  window.history.replaceState(null, '', router.getUrl(name, params, query));
  historyEvents.emit('locationChange', getCurrentLocation(true));
}

export function replaceQueryParam(param, value) {
  const { route, params, query } = router.getState();

  replace({
    name: route.name,
    params,
    query: {
      ...query,
      [param]: value,
    },
  });
}

window.addEventListener('popstate', propagateCurrentLocation);
