import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import s from 'client/styles';

const styles = s.styles({
  container: {
    backgroundColor: 'var(--bg-color-backdrop)',

    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,

    extend: [
      s.flex({ h: 'center', v: 'flex-start' }),
    ],
  },
});

export default class Backdrop extends PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    className: PropTypes.string,
  };

  rootEl = document.getElementById('modal');

  render() {
    const { className, onClick, children } = this.props;
    return ReactDOM.createPortal(
      <div className={s.cx(styles.container, className)} onClick={onClick}>
        {children}
      </div>,
      this.rootEl,
    );
  }
}
