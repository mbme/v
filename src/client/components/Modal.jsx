import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Backdrop } from './index';

export default class Modal extends PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

  onModalClick = (e) => {
    if (e.target === e.currentTarget) this.props.onCancel();
  };

  render() {
    return (
      <Backdrop onClick={this.onModalClick}>
        <div className="Modal-modal">{this.props.children}</div>
      </Backdrop>
    );
  }
}

export function ConfirmationDialog({ children, confirmation, onConfirmed, onCancel }) {
  return (
    <Modal onCancel={onCancel}>
      <div className="g-section">
        {children}
      </div>
      <div className="Modal-buttons">
        <Button onClick={onCancel}>CANCEL</Button>
        <Button primary onClick={onConfirmed}>{confirmation}</Button>
      </div>
    </Modal>
  );
}

ConfirmationDialog.propTypes = {
  children: PropTypes.node.isRequired,
  confirmation: PropTypes.node.isRequired,
  onConfirmed: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
