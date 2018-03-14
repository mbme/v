import Router from 'universal-router';
import generateUrls from 'universal-router/generateUrls';

function parseQuery(search) {
  if (!search.length) return {};

  return search.substring(1).split('&').reduce((acc, pair) => {
    const splitter = pair.indexOf('=');
    const key = decodeURIComponent(pair.substr(0, splitter));
    const value = decodeURIComponent(pair.substr(splitter + 1));
    acc[key] = value;

    return acc;
  }, {});
}

function stringifyQueryParams(params) {
  return Object.entries(params)
    .filter(([ , value ]) => value !== undefined)
    .map(([ key, value ]) => `${key}=${value}`)
    .join('&');
}

export default function createRouter(routes) {
  const router = new Router(routes, {
    resolveRoute({ route, params, query }) {
      return route.name ? { route, params, query } : undefined;
    },
  });

  const url = generateUrls(router);

  return {
    getUrl(name, params, query = {}) {
      const search = stringifyQueryParams(query);
      return url(name, params) + (search ? `?${search}` : '');
    },

    resolve(pathname, search) {
      return router.resolve({ pathname, query: parseQuery(search) });
    },
  };
}
