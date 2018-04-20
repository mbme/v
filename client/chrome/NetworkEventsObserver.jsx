import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { UnauthorizedError } from 'client/utils/platform';
import { inject } from 'client/store';

class NetworkEventsObserver extends PureComponent {
  static propTypes = {
    showLocker: PropTypes.func.isRequired,
    showToast: PropTypes.func.isRequired,
    setAuthorized: PropTypes.func.isRequired,
    events: PropTypes.object.isRequired,
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
    this.props.events.on('start', this.onRequestStart);
    this.props.events.on('error', this.onRequestError);
    this.props.events.on('end', this.onRequestEnd);
  }

  componentWillUnmount() {
    this.props.events.off('start', this.onRequestStart);
    this.props.events.off('error', this.onRequestError);
    this.props.events.off('end', this.onRequestEnd);
  }
}

const mapStoreToProps = (state, actions) => ({
  showLocker: actions.showLocker,
  showToast: actions.showToast,
  setAuthorized: actions.setAuthorized,
});

export default inject(mapStoreToProps, NetworkEventsObserver);
