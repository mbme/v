import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import s from 'client/styles'
import { Link } from 'client/components'

export function NotFoundView() {
  return (
    <div className={s.ViewContainer}>
      <div className={s.Heading}>NOT FOUND</div>
    </div>
  )
}

export function LoadingView() {
  return (
    <div className={s.ViewContainer}>
      <div className={s.Heading}>LOADING...</div>
    </div>
  )
}

const AppContainer = {
  margin: '0 auto',
  maxWidth: '42rem',
}

const NavLink = isSelected => ({
  display: 'inline-block',
  cursor: 'pointer',
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
        <Link to={{ name: 'notes' }} className={s.cx(NavLink(route === 'notes'))}>Notes</Link>
        <Link to={{ name: 'todos' }} className={s.cx(NavLink(route === 'todos'))}>Todos</Link>
        <Link to={{ name: 'one' }} className={s.cx(NavLink(route === 'one'))}>One</Link>
      </nav>
    )
  }

  render() {
    const { view, isLoading } = this.props

    const currentView = isLoading ? <LoadingView /> : (view || <NotFoundView />)

    return (
      <div className={s.cx(AppContainer)}>
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
