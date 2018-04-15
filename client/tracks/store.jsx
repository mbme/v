import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { mapObject } from 'shared/utils';

const x = createStore({
  name: 'tracks',

  state: {
    tracks: [],
  },

  actions: {
    async listTracks(filter = '', state) {
      const result = await apiClient.listTracks({ size: 0, filter });

      return { ...state, tracks: result.items };
    },
  },
});

function createStore(store) {
  const StoreContext = React.createContext({});

  return class extends PureComponent {
    static displayName = `Store<${store.name}>`;

    static propTypes = {
      children: PropTypes.node,
    };

    state = {
      state: store.state,
    };

    actions = mapObject(store.actions, action => (...args) => this.runAction(args, action));

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
  };
}
