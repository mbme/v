import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { networkEvents } from '../utils';
import { inject } from '../store';

class NetworkEventsObserver extends PureComponent {
  static propTypes = {
    withToasts: PropTypes.bool,

    showLocker: PropTypes.func.isRequired,
    showToast: PropTypes.func.isRequired,
    isAuthorized: PropTypes.bool,
    setAuthorized: PropTypes.func.isRequired,
  };

  onRequestStart = () => this.props.showLocker(true);

  onRequestEnd = () => {
    if (!this.props.isAuthorized) {
      this.props.setAuthorized(true);
    }
    this.props.showLocker(false);
  };

  onUnauthorized = () => {
    this.props.setAuthorized(false);
  };

  onRequestError = (e) => {
    if (this.props.withToasts) {
      this.props.showToast(e.toString());
    }
    this.props.showLocker(false);
  };

  componentDidMount() {
    networkEvents.on('start', this.onRequestStart);
    networkEvents.on('unauthorized', this.onUnauthorized);
    networkEvents.on('error', this.onRequestError);
    networkEvents.on('end', this.onRequestEnd);
  }

  componentWillUnmount() {
    networkEvents.off('start', this.onRequestStart);
    networkEvents.off('unauthorized', this.onUnauthorized);
    networkEvents.off('error', this.onRequestError);
    networkEvents.off('end', this.onRequestEnd);
  }

  render() {
    return null;
  }
}

const mapStoreToProps = (state, actions) => ({
  showLocker: actions.showLocker,
  showToast: actions.showToast,
  isAuthorized: state.isAuthorized,
  setAuthorized: actions.setAuthorized,
});

export default inject(mapStoreToProps, NetworkEventsObserver);
