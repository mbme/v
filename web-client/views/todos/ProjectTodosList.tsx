import * as React from 'react'
import {observer} from 'mobx-react'

import {Inject} from 'web-client/injector'
import Store from 'web-client/store'

@observer
export default class ProjectTodosList extends React.Component<{}, {}> {
  @Inject store: Store

  renderList(): JSX.Element[] | string {
    if (!this.store.openProjectId) {
      return ''
    }

    const todos = this.store.todos.get(this.store.openProjectId.toString()) || []

    if (!todos.length) {
      return 'No todos :)'
    }

    return todos.map(
      ({ id, name }) => <div key={id} className="Todo">{name}</div>
    )
  }

  render(): JSX.Element {
    return (
      <div className="ProjectTodosList">
        {this.renderList()}
      </div>
    )
  }
}
