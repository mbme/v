import * as React from 'react'

import Link from 'web-client/common/Link'

class Header extends React.Component<{}, {}> {
  render (): JSX.Element {
    return (
      <header className="Header">
        <Link to="main">Dashboard</Link>
        <Link to="notes">Notes</Link>
        <div className="Header-right">{this.props.children}</div>
      </header>
    )
  }
}

export default Header
