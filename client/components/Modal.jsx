import React, { PureComponent } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { styled, mixins } from 'client/utils'
import { Flex, Section, FlatButton, RaisedButton } from './index'

const ModalContainer = styled('ModalContainer', {
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

const StyledModal = styled('StyledModal', {
  backgroundColor: '#ffffff',
  marginTop: '17vh',
  width: 375,
  ...mixins.border,
  extend: [
    ...mixins.paddings('all', 'medium'),
  ],
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
      <ModalContainer onClick={this.onModalClick}>
        <StyledModal>{this.props.children}</StyledModal>
      </ModalContainer>,
      this.modalRootEl,
    )
  }
}

export function ConfirmationDialog({ children, confirmation, onConfirmed, onCancel }) {
  return (
    <Modal onCancel={onCancel}>
      <Section>{children}</Section>
      <Flex justifyContent="flex-end">
        <FlatButton onClick={onCancel}>CANCEL</FlatButton>
        <RaisedButton onClick={onConfirmed}>{confirmation}</RaisedButton>
      </Flex>
    </Modal>
  )
}

ConfirmationDialog.propTypes = {
  children: PropTypes.node.isRequired,
  confirmation: PropTypes.node.isRequired,
  onConfirmed: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}
