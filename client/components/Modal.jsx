import { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { styled, mixins } from 'client/utils'

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
  ...mixins.border,
  extend: [
    ...mixins.paddings('all', 'medium'),
  ],
})

export class Modal extends PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
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
