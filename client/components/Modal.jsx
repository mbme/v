/* eslint-disable react/no-multi-comp */

import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Button } from 'client/components';
import s from 'client/styles';

const backdropContainerStyles = s.cx({
  backgroundColor: 'rgba(255,255,255,.65)',
  position: 'fixed',
  zIndex: 10,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
}, s.flex({ h: 'center', v: 'flex-start' }));

export class Backdrop extends PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    className: PropTypes.string,
  };

  scrollTop = null;

  componentDidMount() {
    this.scrollTop = document.documentElement.scrollTop;
    document.body.style.marginTop = `${-this.scrollTop}px`;
  }

  componentWillUnmount() {
    document.body.style.marginTop = '';
    document.documentElement.scrollTop = this.scrollTop;
  }

  render() {
    const { className, onClick, children } = this.props;
    return (
      <div className={s.cx(backdropContainerStyles, className)} onClick={onClick}>
        {children}
      </div>
    );
  }
}

const modalStyles = s.cx({
  backgroundColor: 'var(--bg-color)',
  marginTop: '17vh',
  minWidth: '375px',
  padding: 'var(--spacing-medium)',
}, s.withBorder);

export class Modal extends PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

  modalRootEl = null;

  onModalClick = (e) => {
    if (e.target === e.currentTarget) {
      this.props.onCancel();
    }
  };

  componentWillMount() {
    this.modalRootEl = document.getElementById('modal');
  }

  render() {
    return ReactDOM.createPortal(
      <Backdrop onClick={this.onModalClick}>
        <div className={modalStyles}>{this.props.children}</div>
      </Backdrop>,
      this.modalRootEl,
    );
  }
}

const buttonContainerStyles = s.cx(s.flex({ h: 'flex-end', v: 'center' }));

export function ConfirmationDialog({ children, confirmation, onConfirmed, onCancel }) {
  return (
    <Modal onCancel={onCancel}>
      <div className={s.cx(s.section)}>{children}</div>
      <div className={buttonContainerStyles}>
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
