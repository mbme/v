import * as React from 'react'
import Header from 'web-client/common/Header'

class PageNotFound extends React.Component<{}, {}> {
  render (): JSX.Element {
    return (
      <div className="PageNotFound">
        <Header />
        <h1>This is not the page you are looking for. Move along...</h1>
      </div>
    )
  }
}

export default PageNotFound
