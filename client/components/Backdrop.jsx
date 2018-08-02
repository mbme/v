import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { classNames } from '../utils';

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
      <div className={classNames('Backdrop-container', className)} onClick={onClick}>
        {children}
      </div>,
      this.rootEl,
    );
  }
}
