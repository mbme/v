import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { inject } from '../store';

const TOAST_TIMEOUT_MS = 8000;

class Toaster extends PureComponent {
  static propTypes = {
    toast: PropTypes.node,
    showToast: PropTypes.func.isRequired,
  };

  toastTimeout = null;

  componentDidUpdate(prevProps) {
    if (this.props.toast && this.props.toast !== prevProps.toast) { // hide toast in few seconds
      clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(this.props.showToast, TOAST_TIMEOUT_MS, null);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.toastTimeout);
  }

  render() {
    return (
      <div className="Toaster-container">
        {this.props.toast}
      </div>
    );
  }
}

const mapStoreToProps = (state, actions) => ({
  toast: state.toast,
  showToast: actions.showToast,
});

export default inject(mapStoreToProps, Toaster);
