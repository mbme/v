import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link, Heading, ViewContainer } from 'client/components'
import { styled, mixins } from 'client/utils'


export function NotFoundView() {
  return (
    <ViewContainer>
      <Heading>NOT FOUND</Heading>
    </ViewContainer>
  )
}

export function LoadingView() {
  return (
    <ViewContainer>
      <Heading>LOADING...</Heading>
    </ViewContainer>
  )
}

const AppContainer = styled('AppContainer', {
  margin: '0 auto',
  maxWidth: '42rem',
})

const Navbar = styled('Navbar', {
  textAlign: 'center',
  extend: [
    ...mixins.margins('vertical', 'medium'),
  ],
})

const NavbarLink = styled('NavbarLink', ({ selected }) => ({
  display: 'inline-block',
  margin: '0 ',
  color: 'blue',
  cursor: 'pointer',
  extend: [
    ...mixins.margins('horizontal', 'medium'),
    {
      condition: selected,
      style: {
        borderBottom: '2px solid blue',
      },
    },
  ],
}), Link)

class App extends PureComponent {
  static propTypes = {
    pathname: PropTypes.string.isRequired,
    isPush: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
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
      <Navbar>
        <NavbarLink to={{ name: 'notes' }} selected={route === 'notes'}>Notes</NavbarLink>
        <NavbarLink to={{ name: 'todos' }} selected={route === 'todos'}>Todos</NavbarLink>
        <NavbarLink to={{ name: 'one' }} selected={route === 'one'}>One</NavbarLink>
      </Navbar>
    )
  }

  render() {
    const { view, loading } = this.props

    const currentView = loading ? <LoadingView /> : (view || <NotFoundView />)

    return (
      <AppContainer>
        {this.renderNavbar()}
        {currentView}
      </AppContainer>
    )
  }
}

const mapStateToProps = ({ router }) => ({
  pathname: router.pathname,
  isPush: router.isPush,
  loading: router.loading,
  view: router.view,
  routingSequence: router.routingSequence,
})

export default connect(mapStateToProps)(App)
