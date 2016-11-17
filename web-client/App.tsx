import * as React from 'react'

import {observer} from 'mobx-react'

import DevTools from 'mobx-react-devtools'

import {InjectStore} from 'web-client/injector'
import RoutingStore from 'web-client/routingStore'

import ModalsContainer from 'web-client/modals/ModalsContainer'
import ToastsContainer from 'web-client/modals/ToastsContainer'

import MainPage from 'web-client/main/Page'
import PageNotFound from 'web-client/not-found/Page'
import NotesPage from 'web-client/notes/Page'

@observer
export default class App extends React.Component<{}, {}> {
  @InjectStore routingStore: RoutingStore

  renderPage(): JSX.Element {
    const { page, isLoading, error } = this.routingStore

    if (isLoading) {
      return (
        <div>
          Loading...
        </div>
      )
    }

    if (error) {
      return (
        <div>Something is not good!</div>
      )
    }

    switch (page.name) {
      case 'main':
        return <MainPage />

      case 'notes':
        return <NotesPage />

      case 'not-found':
        return <PageNotFound />

      default:
        throw new Error(`unexpected page ${page.name}`)
    }
  }

  render (): JSX.Element {
    let devTools: JSX.Element | undefined

    if (__DEV__) {
      const devToolsPosition = {
        bottom: 10,
        right: 10,
      }

      devTools = <DevTools position={devToolsPosition} />
    }

    return (
      <div className="App">
        <div className="PageContainer">
          {this.renderPage()}
        </div>
        <ModalsContainer />
        <ToastsContainer />
        {devTools}
      </div>
    )
  }
}
