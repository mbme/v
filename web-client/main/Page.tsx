import * as React from 'react'
import Header from 'web-client/common/Header'

class MainPage extends React.Component<{}, {}> {
  render (): JSX.Element {
    return (
      <div className="MainPage">
        <Header />
        <h1>HELLO WORLD!</h1>
      </div>
    )
  }
}

export default MainPage
