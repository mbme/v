import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styles from 'client/styles'
import { Link } from 'client/components'

export function NotFoundView() {
  return (
    <div className="ViewContainer">
      <div className={styles.Heading}>NOT FOUND</div>
    </div>
  )
}

export function LoadingView() {
  return (
    <div className="ViewContainer">
      <div className={styles.Heading}>LOADING...</div>
    </div>
  )
}

class App extends PureComponent {
  static propTypes = {
    pathname: PropTypes.string.isRequired,
    isPush: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
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

  renderNavbar() {
    const route = this.props.routingSequence[0]

    return (
      <nav className="text-center">
        <Link to={{ name: 'notes' }} className={styles.cx('NavLink', route === 'notes' && 'is-selected')}>Notes</Link>
        <Link to={{ name: 'todos' }} className={styles.cx('NavLink', route === 'todos' && 'is-selected')}>Todos</Link>
        <Link to={{ name: 'one' }} className={styles.cx('NavLink', route === 'one' && 'is-selected')}>One</Link>
      </nav>
    )
  }

  render() {
    const { view, isLoading } = this.props

    const currentView = isLoading ? <LoadingView /> : (view || <NotFoundView />)

    return (
      <div className="AppContainer">
        {this.renderNavbar()}
        {currentView}
      </div>
    )
  }
}

const mapStateToProps = ({ router }) => ({
  pathname: router.pathname,
  isPush: router.isPush,
  isLoading: router.isLoading,
  view: router.view,
  routingSequence: router.routingSequence,
})

export default connect(mapStateToProps)(App)
