import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

const ModalRenderer = connect(({ components }) => ({ modal: components.modal }))(({ modal }) => modal)

class App extends PureComponent {
  static propTypes = {
    router: PropTypes.object.isRequired,
    pathname: PropTypes.string.isRequired,
    isPush: PropTypes.bool.isRequired,
  }

  state = {
    view: null,
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
    if (this.props.pathname !== nextProps.pathname) {
      // save scroll pos
      this.scrollPos[this.props.pathname] = { offsetX: window.pageXOffset, offsetY: window.pageYOffset }

      this.updateView(nextProps.pathname)
    }
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

  render() {
    return (
      <div>
        {this.state.view}
        <ModalRenderer />
      </div>
    )
  }
}

const mapStateToProps = ({ router }) => ({
  pathname: router.pathname,
  isPush: router.isPush,
})

export default connect(mapStateToProps)(App)
