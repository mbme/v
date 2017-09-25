import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { ModalContainer, StyledModal } from 'client/components/Modal'

class App extends Component {
  static propTypes = {
    router: PropTypes.object.isRequired,
    pathname: PropTypes.string.isRequired,
    isPush: PropTypes.bool.isRequired,
  }

  state = {
    view: null,
    modal: null,
  }

  scrollPos = {}

  constructor(props) {
    super(props)

    // Switch off the native scroll restoration behavior and handle it manually
    // https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }

  async updateView(pathname) {
    const view = await this.props.router.resolve(pathname)
    this.setState({ view })
  }

  componentDidMount() {
    this.updateView(this.props.pathname)
  }

  componentWillUpdate(nextProps) {
    this.scrollPos[this.props.pathname] = { offsetX: window.pageXOffset, offsetY: window.pageYOffset }
    this.updateView(nextProps.pathname)
  }

  componentDidUpdate() {
    const { isPush, pathname } = this.props

    if (isPush) {
      delete this.scrollPos[pathname] // delete stored scroll position for the next page
      window.scrollTo(0, 0)
    } else {
      // try to restore scroll position
      const { offsetX, offsetY } = this.scrollPos[pathname] || { offsetX: 0, offsetY: 0 }
      window.scrollTo(offsetX, offsetY)
    }
  }

  onModalClick = (e) => {
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

const mapStateToProps = ({ router }) => ({
  pathname: router.pathname,
  isPush: router.isPush,
})

export default connect(mapStateToProps)(App)
