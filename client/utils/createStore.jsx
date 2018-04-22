/* eslint-disable react/no-multi-comp */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { mapObject } from 'shared/utils';

export default function createStore(name, store) {
  const StoreContext = React.createContext({});

  let currentState = store.initialState;

  class Store extends PureComponent {
    static propTypes = {
      children: PropTypes.node,
    };

    actions = mapObject(store.actions, action => (...args) => this.runAction(action, args));

    async runAction(action, args) {
      console.error('BEFORE', action.name, currentState.isAuthorized);
      currentState = await Promise.resolve(action(...args, currentState, this.actions));
      console.error('AFTER', action.name, currentState.isAuthorized);

      this.forceUpdate();
    }

    render() {
      return (
        <StoreContext.Provider value={{ state: currentState, actions: this.actions }}>
          {this.props.children}
        </StoreContext.Provider>
      );
    }
  }

  function inject(mapStoreToProps, Component) {
    return class extends PureComponent {
      static displayName = `StoreInjector<${name}>`;

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
