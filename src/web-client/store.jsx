/* eslint-disable react/no-unused-state */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export const StoreContext = React.createContext({});

export default class StoreProvider extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
  };

  state = {
    route: null,
    setRoute: this.setRoute,
  };

  setRoute = (route) => {
    this.setState({ route });
  };

  render() {
    return (
      <StoreContext.Provider value={this.state}>
        {this.props.children}
      </StoreContext.Provider>
    );
  }
}
