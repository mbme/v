import React, { PureComponent } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import styles from 'client/styles'

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
      <div className="ModalContainer" onClick={this.onModalClick}>
        <div className="StyledModal with-border">{this.props.children}</div>
      </div>,
      this.modalRootEl,
    )
  }
}

export function ConfirmationDialog({ children, confirmation, onConfirmed, onCancel }) {
  return (
    <Modal onCancel={onCancel}>
      <div className="Section">{children}</div>
      <div className="flex flex-end">
        <button className={styles.FlatButton} onClick={onCancel}>CANCEL</button>
        <button className={styles.RaisedButton} onClick={onConfirmed}>{confirmation}</button>
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
