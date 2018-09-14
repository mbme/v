/* eslint-disable react/prop-types, react/no-multi-comp */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { inject } from '../store';

import NotFoundView from './NotFoundView';
import ThemeView from './ThemeView';
import NotesView from '../notes/NotesView';
import NoteView from '../notes/NoteView';
import NoteEditorView from '../notes/NoteEditorView';

const RouterContext = React.createContext({
  push: noop,
  replace: noop,
  replaceParam: noop,
});

export const { Consumer } = RouterContext;

export const locationShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  params: PropTypes.object,
});

export class Redirect extends PureComponent {
  static propTypes = {
    to: locationShape.isRequired,
  };

  router = null;

  componentDidMount() {
    this.router.replace(this.props.to);
  }

  render() {
    return (
      <Consumer>
        {(router) => {
          this.router = router;
        }}
      </Consumer>
    );
  }
}

const Routes = {
  '': () => <Redirect to={{ name: 'notes' }} />,
  'theme': () => <ThemeView />,
  'notes': () => <NotesView />,
  'note': ({ id }) => {
    if (!id) {
      return <NotFoundView />;
    }

    return <NoteView id={parseInt(id, 10)} />;
  },
  'note-editor': ({ id }) => <NoteEditorView id={id ? parseInt(id, 10) : null} />,
};


function createUrl({ name, params = {} }) {
  if (!Routes[name]) throw new Error(`Unexpected route "${name}"`);

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([ key, value ]) => {
    queryParams.set(key, value);
  });
  const paramsStr = queryParams.toString();

  const url = `${window.location.origin}/${name}`;

  if (!paramsStr) {
    return url;
  }

  return `${url}?${paramsStr}`;
}

class Router extends PureComponent {
  static propTypes = {
    route: PropTypes.object,
    setRoute: PropTypes.func.isRequired,
    render: PropTypes.func.isRequired,
  };

  state = {
    view: null,
  };

  static getDerivedStateFromProps({ route }) {
    if (!route) {
      return {
        view: null,
      };
    }

    const getView = Routes[route.name];
    if (!getView) {
      return {
        view: <NotFoundView />,
      };
    }

    return {
      view: getView(route.params),
    };
  }

  propagateCurrentLocation() {
    const location = new URL(document.location);
    const params = {};
    for (const [ key, value ] of location.searchParams) {
      params[key] = value;
    }

    this.props.setRoute({
      name: location.pathname.substring(1),
      params,
    });
  }

  push = (route) => {
    window.history.pushState(null, '', createUrl(route));
    this.propagateCurrentLocation();
  };

  replace = (route) => {
    window.history.replaceState(null, '', createUrl(route));
    this.propagateCurrentLocation();
  };

  replaceParam = (param, value) => {
    const { route } = this.props;

    const newRoute = {
      name: route.name,
      params: {
        ...route.params,
        [param]: value,
      },
    };

    window.history.replaceState(null, '', createUrl(newRoute));
    this.propagateCurrentLocation();
  };

  componentDidMount() {
    window.addEventListener('popstate', this.propagateCurrentLocation);

    this.propagateCurrentLocation();
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.propagateCurrentLocation);
  }

  render() {
    const router = {
      push: this.push,
      replace: this.replace,
      replaceParam: this.replaceParam,
    };

    return (
      <RouterContext.Provider value={router}>
        {this.props.render(this.state.view)}
      </RouterContext.Provider>
    );
  }
}

const mapStoreToProps = (state, actions) => ({
  route: state.route,
  setRoute: actions.setRoute,
});

export default inject(mapStoreToProps, Router);
