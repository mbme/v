import * as React from 'react'
import {observer} from 'mobx-react'

import { todosStore } from 'web-client/store'

@observer
export default class ProjectTodosList extends React.Component<{}, {}> {
  renderList(): JSX.Element[] | string {
    if (!todosStore.openProjectId) {
      return ''
    }

    const todos = todosStore.todos.get(todosStore.openProjectId.toString()) || []

    if (!todos.length) {
      return 'No todos :)'
    }

    return todos.map(
      ({ id, name }) => (
        <div key={id} className="Todo">
          <input type="checkbox" />
          <span className="Todo-name">{name}</span>
        </div>
      )
    )
  }

  render(): JSX.Element {
    return (
      <div className="ProjectTodosList">
        <input className="ProjectTodosList-task-input"
               type="text"
               placeholder="Add task"
               onKeyPress={this.onKeyPress} />
        {this.renderList()}
      </div>
    )
  }

  onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') {
      return
    }

    console.error(e.currentTarget.value);
  }
}
