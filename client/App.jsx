import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { ModalContainer, StyledModal } from 'client/components/Modal'

export default class App extends Component {
  static contextTypes = {
    view$: PropTypes.object.isRequired,
    modal$: PropTypes.object.isRequired,
  }

  state = {
    view: null,
    modal: null,
  }

  unsubscribeView = null
  unsubscribeModal = null

  componentWillMount() {
    const { view$, modal$ } = this.context

    this.setState({ view: view$.value, modal: modal$.value })

    this.unsubscribeView = view$.subscribe(view => this.setState({ view }))
    this.unsubscribeModal = modal$.subscribe(modal => this.setState({ modal }))
  }

  componentWillUnmount() {
    this.unsubscribeView()
    this.unsubscribeModal()
  }

  onClick = (e) => {
    if (e.target === e.currentTarget && this.state.modal) {
      this.state.modal.props.onClose()
    }
  }

  render() {
    const { view, modal } = this.state

    return (
      <div>
        {view}
        {modal && (
          <ModalContainer onClick={this.onModalClick}>
            <StyledModal>{modal}</StyledModal>
          </ModalContainer>

        )}
      </div>
    )
  }
}
