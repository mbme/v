import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { styled, mixins } from 'client/utils'
import * as componentActions from './actions'
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

class ModalComponent extends PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onCancel: PropTypes.func.isRequired,
    showModal: PropTypes.func.isRequired,
    hideModal: PropTypes.func.isRequired,
  }

  modal = null

  onModalClick = (e) => {
    if (e.target === e.currentTarget) {
      this.props.onCancel()
    }
  }

  showModal(children) {
    this.modal = (
      <ModalContainer onClick={this.onModalClick}>
        <StyledModal>{children}</StyledModal>
      </ModalContainer>
    )
    this.props.showModal(this.modal)
  }

  componentWillMount() {
    this.showModal(this.props.children)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.children !== nextProps.children) {
      this.showModal(nextProps.children)
    }
  }

  componentWillUnmount() {
    this.props.hideModal(this.modal)
  }

  render() {
    return null
  }
}

const mapDispatchToProps = {
  showModal: componentActions.showModal,
  hideModal: componentActions.hideModal,
}

export const Modal = connect(null, mapDispatchToProps)(ModalComponent)

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
