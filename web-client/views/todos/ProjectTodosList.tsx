import * as React from 'react'
import {observer} from 'mobx-react'

import { todosStore } from 'web-client/store'

interface IProps {
  projectId: number,
}

@observer
export default class ProjectTodosList extends React.Component<IProps, {}> {
  renderList(): JSX.Element[] | string {
    const todos = todosStore.todos.get(this.props.projectId.toString()) || []

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

  onKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') {
      return
    }

    const el = e.currentTarget
    await todosStore.addTodo(this.props.projectId!, el.value)

    el.value = ''
  }
}
