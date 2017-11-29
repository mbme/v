import React, { PureComponent } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { Button } from 'client/components'
import s from 'client/styles'

const ModalContainer = s.cx({
  backgroundColor: 'rgba(255,255,255,.65)',
  position: 'absolute',
  zIndex: 10,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
})

const ModalStyles = s.cx({
  backgroundColor: 'var(--bg-light)',
  marginTop: '17vh',
  width: '375px',
  padding: 'var(--spacing-medium)',
  ...s.withBorder,
})

export class Modal extends PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onCancel: PropTypes.func.isRequired,
  }

  modalRootEl = null

  onModalClick = (e) => {
    if (e.target === e.currentTarget) {
      this.props.onCancel()
    }
  }

  componentWillMount() {
    this.modalRootEl = document.getElementById('modal')
  }

  render() {
    return ReactDOM.createPortal(
      <div className={ModalContainer} onClick={this.onModalClick}>
        <div className={ModalStyles}>{this.props.children}</div>
      </div>,
      this.modalRootEl,
    )
  }
}

export function ConfirmationDialog({ children, confirmation, onConfirmed, onCancel }) {
  return (
    <Modal onCancel={onCancel}>
      <div className="section">{children}</div>
      <div className="flex flex-end">
        <Button onClick={onCancel}>CANCEL</Button>
        <Button raised onClick={onConfirmed}>{confirmation}</Button>
      </div>
    </Modal>
  )
}

ConfirmationDialog.propTypes = {
  children: PropTypes.node.isRequired,
  confirmation: PropTypes.node.isRequired,
  onConfirmed: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}
