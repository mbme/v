import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { styled, mixins } from 'client/utils'
import { Flex, Section, FlatButton, RaisedButton } from './index'

export const ModalContainer = styled('ModalContainer', {
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

export const StyledModal = styled('StyledModal', {
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

    // we use this directly from App.jsx
    onClose: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  }

  static contextTypes = {
    modal$: PropTypes.object.isRequired,
  }

  componentWillMount() {
    this.context.modal$.next(this.props.children)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.children !== nextProps.children) {
      this.context.modal$.next(nextProps.children)
    }
  }

  componentWillUnmount() {
    const { modal$ } = this.context
    if (modal$.value === this.props.children) {
      modal$.next(null)
    }
  }

  render() {
    return null
  }
}

export function ConfirmationDialog({ children, confirmation, onConfirmed, onClose }) {
  return (
    <Modal onClose={onClose}>
      <Section>{children}</Section>
      <Flex justifyContent="flex-end">
        <FlatButton onClick={onClose}>CANCEL</FlatButton>
        <RaisedButton onClick={onConfirmed}>{confirmation}</RaisedButton>
      </Flex>
    </Modal>
  )
}

ConfirmationDialog.propTypes = {
  children: PropTypes.node.isRequired,
  confirmation: PropTypes.node.isRequired,
  onConfirmed: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}
