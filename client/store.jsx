import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { mapObject } from 'shared/utils';

function createStore(store) {
  const StoreContext = React.createContext({});

  class Store extends PureComponent {
    static propTypes = {
      children: PropTypes.node,
    };

    state = {
      state: store.state,
    };

    actions = mapObject(store.actions, action => (...args) => this.runAction(action, args));

    async runAction(action, args) {
      const newState = await Promise.resolve(action(...args, this.state.state));

      this.setState({ state: newState });
    }

    render() {
      return (
        <StoreContext.Provider value={{ state: this.state.state, actions: this.actions }}>
          {this.props.children}
        </StoreContext.Provider>
      );
    }
  }

  function inject(mapStoreToProps, Component) {
    return class StoreInjector extends PureComponent {
      renderComponent = ({ state, actions }) => {
        const mappedProps = mapStoreToProps(state, actions, this.props);

        return (
          <Component {...this.props} {...mappedProps} />
        );
      };

      render() {
        return (
          <StoreContext.Consumer>
            {this.renderComponent}
          </StoreContext.Consumer>
        );
      }
    };
  }

  return {
    Store,
    inject,
  };
}

const { Store, inject } = createStore({
  state: {
    toast: null,
    showLocker: false,
    showNav: false,

    isAuthorized: true,
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
  },
});

export { Store, inject };
