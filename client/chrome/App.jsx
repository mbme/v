import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import s from 'client/styles'
import { Link } from 'client/components'
import { showToast } from './actions'
import ProgressLocker from './ProgressLocker'

export function NotFoundView() {
  return (
    <div className="view-container">
      <div className="heading">NOT FOUND</div>
    </div>
  )
}

const AppContainer = s.cx({
  margin: '0 auto',
  maxWidth: 'var(--max-width)',
})

const ToastContainer = s.cx({
  position: 'fixed',
  bottom: '0',
  width: '100%',
  maxWidth: 'var(--max-width)',
  backgroundColor: '#323232',
  color: '#ffffff',
  borderRadius: '2px',
  textAlign: 'center',
  padding: 'var(--spacing-medium)',
  ':empty': {
    display: 'none',
  },
})

const NavLink = isSelected => s.cx({
  display: 'inline-block',
  margin: '0 var(--spacing-medium)',
  color: 'blue',
  ...s.if(isSelected, {
    borderBottom: '2px solid blue',
  }),
})

class App extends PureComponent {
  static propTypes = {
    pathname: PropTypes.string.isRequired,
    isPush: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    routingSequence: PropTypes.arrayOf(PropTypes.string).isRequired,
    view: PropTypes.node,
    apiClient: PropTypes.object.isRequired,
    toast: PropTypes.node,
    showToast: PropTypes.func.isRequired,
    showLocker: PropTypes.bool.isRequired,
  }

  static childContextTypes = {
    apiClient: PropTypes.object.isRequired,
  }

  scrollPos = {}
  toastTimeout = null

  constructor(props) {
    super(props)

    // Switch off the native scroll restoration behavior and handle it manually
    // https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }

  getChildContext() {
    return { apiClient: this.props.apiClient }
  }

  componentWillUpdate(nextProps) {
    if (this.props.pathname !== nextProps.pathname) {
      // save scroll pos
      this.scrollPos[this.props.pathname] = { offsetX: window.pageXOffset, offsetY: window.pageYOffset }
    }

    // hide toast in few seconds
    if (nextProps.toast && this.props.toast !== nextProps.toast) {
      clearTimeout(this.toastTimeout)
      this.toastTimeout = setTimeout(() => this.props.showToast(null), 8000)
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
      <nav className="text-center section">
        <Link to={{ name: 'notes' }} className={NavLink(route === 'notes')}>Notes</Link>
        <Link to={{ name: 'todos' }} className={NavLink(route === 'todos')}>Todos</Link>
        <Link to={{ name: 'one' }} className={NavLink(route === 'one')}>One</Link>
      </nav>
    )
  }

  render() {
    const { view, isLoading, toast, showLocker } = this.props

    const currentView = isLoading ? null : (view || <NotFoundView />)

    return (
      <div className={AppContainer}>
        {this.renderNavbar()}
        {currentView}
        <div className={ToastContainer}>
          {toast}
        </div>
        {showLocker && <ProgressLocker />}
      </div>
    )
  }
}

const mapStateToProps = ({ router, chrome }) => ({
  pathname: router.pathname,
  isPush: router.isPush,
  isLoading: router.isLoading,
  view: router.view,
  routingSequence: router.routingSequence,
  toast: chrome.toast,
  showLocker: router.isLoading || chrome.showLocker,
})

const mapDispatchToProps = {
  showToast,
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
