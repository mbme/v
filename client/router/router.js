import Router from 'universal-router';
import generateUrls from 'universal-router/generateUrls';

export default function createRouter(routes) {
  const router = new Router(routes, {
    resolveRoute({ route }, params) {
      return route.name ? { route, params } : undefined;
    },
  });

  const url = generateUrls(router, {
    stringifyQueryParams(params) { // treat unexpected params as query params
      return Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
    },
  });

  return {
    getUrl(name, params) {
      return url(name, params);
    },

    resolve(pathname) {
      return router.resolve(pathname);
    },
  };
}
