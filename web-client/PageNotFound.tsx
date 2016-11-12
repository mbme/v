import * as React from 'react'

class PageNotFound extends React.Component<{}, {}> {
  render (): JSX.Element {
    return (
      <div className="PageNotFound">
        <h1>This is not the page you are looking for. Move along...</h1>
      </div>
    )
  }
}

export default PageNotFound
