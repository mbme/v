import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { networkEvents, UnauthorizedError } from '../utils';
import { inject } from '../store';

class NetworkEventsObserver extends PureComponent {
  static propTypes = {
    showLocker: PropTypes.func.isRequired,
    showToast: PropTypes.func.isRequired,
    setAuthorized: PropTypes.func.isRequired,
  };

  onRequestStart = () => this.props.showLocker(true);
  onRequestEnd = () => this.props.showLocker(false);
  onRequestError = (e) => {
    if (e instanceof UnauthorizedError) {
      this.props.setAuthorized(false);
    }
    this.props.showToast(e.toString());
    this.props.showLocker(false);
  };

  componentDidMount() {
    networkEvents.on('start', this.onRequestStart);
    networkEvents.on('error', this.onRequestError);
    networkEvents.on('end', this.onRequestEnd);
  }

  componentWillUnmount() {
    networkEvents.off('start', this.onRequestStart);
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
  setAuthorized: actions.setAuthorized,
});

export default inject(mapStoreToProps, NetworkEventsObserver);
