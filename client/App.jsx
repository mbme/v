import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'client/components'

const ModalRenderer = connect(({ components }) => ({ modal: components.modal }))(({ modal }) => modal)

class App extends PureComponent {
  static propTypes = {
    pathname: PropTypes.string.isRequired,
    isPush: PropTypes.bool.isRequired,
    routingSequence: PropTypes.arrayOf(PropTypes.string).isRequired,
    view: PropTypes.node,
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

  componentWillUpdate(nextProps) {
    if (this.props.pathname !== nextProps.pathname) {
      // save scroll pos
      this.scrollPos[this.props.pathname] = { offsetX: window.pageXOffset, offsetY: window.pageYOffset }
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
    const { routingSequence } = this.props
    return (
      <div>
        <div>
          <Link to={{ name: 'notes' }}>Notes</Link>
          <Link to={{ name: 'todos' }}>Todos</Link>
          <Link to={{ name: 'one' }}>One</Link>
        </div>
        {this.props.view}
        <ModalRenderer />
      </div>
    )
  }
}

const mapStateToProps = ({ router }) => ({
  pathname: router.pathname,
  isPush: router.isPush,
  view: router.view,
  routingSequence: router.routingSequence,
})

export default connect(mapStateToProps)(App)
