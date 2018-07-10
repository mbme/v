import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import router from '../router';
import { historyEvents, replace, propagateCurrentLocation } from '../history';
import { inject } from '../store';

class Router extends PureComponent {
  static propTypes = {
    setResolvedRoute: PropTypes.func.isRequired,
    showLocker: PropTypes.func.isRequired,
  };

  state = {
    view: null,
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
    this.setState({ view });

    this.props.setResolvedRoute({ route, params, query });
    this.props.showLocker(false);
  };

  render() {
    return this.state.view;
  }
}

const mapStoreToProps = (state, actions) => ({
  setResolvedRoute: actions.setResolvedRoute,
  showLocker: actions.showLocker,
});

export default inject(mapStoreToProps, Router);
