import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Backdrop, Styled } from 'client/components';
import s from 'client/styles';

const styles = s.styles({
  modal: {
    backgroundColor: 'var(--bg-color)',
    marginTop: '17vh',
    minWidth: '375px',
    padding: 'var(--spacing-medium)',
    border: 'var(--border)',
    boxShadow: 'var(--box-shadow)',
  },

  buttonContainer: s.flex({ h: 'flex-end', v: 'center' }),
});

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
        <div className={styles.modal}>{this.props.children}</div>
      </Backdrop>
    );
  }
}

export function ConfirmationDialog({ children, confirmation, onConfirmed, onCancel }) {
  return (
    <Modal onCancel={onCancel}>
      <Styled $marginBottom="var(--spacing-medium)">
        {children}
      </Styled>
      <div className={styles.buttonContainer}>
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
