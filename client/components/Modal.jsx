/* eslint-disable react/no-multi-comp */

import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Button } from 'client/components';
import s from 'client/styles';

const BackdropContainer = s.cx({
  backgroundColor: 'rgba(255,255,255,.65)',
  position: 'fixed',
  zIndex: 10,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
});

const NoScroll = s.cx({
  height: '100vh',
  overflow: 'hidden',
});

export class Backdrop extends PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    className: PropTypes.string,
  }

  componentDidMount() {
    const { scrollTop } = document.documentElement;
    document.body.className = NoScroll;
    document.body.style = `margin-top: ${-scrollTop}px`;
  }

  componentWillUnmount() {
    document.body.className = '';
    document.body.style = '';
  }

  render() {
    const { className, onClick, children } = this.props;
    return (
      <div className={s.cx(BackdropContainer, className)} onClick={onClick}>
        {children}
      </div>
    );
  }
}

const ModalStyles = s.cx({
  backgroundColor: 'var(--bg-color)',
  marginTop: '17vh',
  minWidth: '375px',
  padding: 'var(--spacing-medium)',
}, 'with-border');

export class Modal extends PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onCancel: PropTypes.func.isRequired,
  }

  modalRootEl = null

  onModalClick = (e) => {
    if (e.target === e.currentTarget) {
      this.props.onCancel();
    }
  }

  componentWillMount() {
    this.modalRootEl = document.getElementById('modal');
  }

  render() {
    return ReactDOM.createPortal(
      <Backdrop onClick={this.onModalClick}>
        <div className={ModalStyles}>{this.props.children}</div>
      </Backdrop>,
      this.modalRootEl,
    );
  }
}

export function ConfirmationDialog({ children, confirmation, onConfirmed, onCancel }) {
  return (
    <Modal onCancel={onCancel}>
      <div className="section">{children}</div>
      <div className="flex flex-end flex-align-center">
        <Button onClick={onCancel}>CANCEL</Button>
        <Button raised primary onClick={onConfirmed}>{confirmation}</Button>
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
