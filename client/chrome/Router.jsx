import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import router from 'client/router';
import { historyEvents, replace, propagateCurrentLocation } from 'client/history';
import { inject } from 'client/store';
import ScrollKeeper from './ScrollKeeper';

class Router extends PureComponent {
  static propTypes = {
    setResolvedRoute: PropTypes.func.isRequired,
    showLocker: PropTypes.func.isRequired,
  };

  state = {
    view: null,
    location: {
      pathname: '/',
      search: '',
      isPush: false,
    },
  };

  componentDidMount() {
    historyEvents.on('locationChange', this.resolveRoute);
    propagateCurrentLocation();
  }

  componentWillUnmount() {
    historyEvents.off('locationChange', this.resolveRoute);
  }

  resolveRoute = async (location) => {
    this.props.showLocker(true);

    const {
      route,
      params,
      query,
    } = await router.resolve(location.pathname, location.search);

    if (route.redirectTo) {
      replace(route.redirectTo);
      return;
    }

    const view = route.render(params, query);
    this.setState({ view, location });

    this.props.setResolvedRoute({ route, params, query });
    this.props.showLocker(false);
  };

  render() {
    const { view, location } = this.state;

    return (
      <ScrollKeeper location={location}>
        {view}
      </ScrollKeeper>
    );
  }
}

const mapStoreToProps = (state, actions) => ({
  setResolvedRoute: actions.setResolvedRoute,
  showLocker: actions.showLocker,
});

export default inject(mapStoreToProps, Router);
