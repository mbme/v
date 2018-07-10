import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { network, UnauthorizedError } from '../utils/platform';
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
    network.events.on('start', this.onRequestStart);
    network.events.on('error', this.onRequestError);
    network.events.on('end', this.onRequestEnd);
  }

  componentWillUnmount() {
    network.events.off('start', this.onRequestStart);
    network.events.off('error', this.onRequestError);
    network.events.off('end', this.onRequestEnd);
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
