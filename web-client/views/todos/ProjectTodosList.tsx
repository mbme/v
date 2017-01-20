import * as React from 'react'
import {observer} from 'mobx-react'

import { STORE } from 'web-client/store'

@observer
export default class ProjectTodosList extends React.Component<{}, {}> {
  renderList(): JSX.Element[] | string {
    if (!STORE.openProjectId) {
      return ''
    }

    const todos = STORE.todos.get(STORE.openProjectId.toString()) || []

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
