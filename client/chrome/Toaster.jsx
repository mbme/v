import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import s from 'client/styles';
import { inject } from 'client/store';

const styles = s.styles({
  toastContainer: {
    position: 'fixed',
    bottom: '0',
    left: '50%',
    transform: 'translateX(-50%)',

    width: '100%',
    maxWidth: 'var(--max-width)',

    backgroundColor: 'var(--color-dark)',
    color: 'var(--color-light)',
    borderRadius: '2px',
    textAlign: 'center',
    padding: 'var(--spacing-medium)',

    ':empty': {
      display: 'none',
    },
  },
});

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
      <div className={styles.toastContainer}>
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
