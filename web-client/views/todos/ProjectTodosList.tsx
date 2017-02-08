import * as React from 'react'
import {observer} from 'mobx-react'

import { todosStore } from 'web-client/store'
import { ITodo, TodoState } from 'api-client/types'

import { Expandable } from 'web-client/components'

interface IProps {
  projectId: number,
  todos: ITodo[],
}

@observer
export default class ProjectTodosList extends React.Component<IProps, {}> {
  renderList(...states: TodoState[]): JSX.Element[] {
    const todos = this.props.todos.filter(todo => states.indexOf(todo.state) > -1)

    if (!todos.length) {
      return [<div key="todo-nothing" className="Todo-nothing">No tasks</div>]
    }

    return todos.map(({ id, name }) => (
      <div key={id} className="Todo">
        -
        <span className="Todo-name">{name}</span>
      </div>
    ))
  }

  render(): JSX.Element {
    return (
      <div className="ProjectTodosList">
        <input className="ProjectTodosList-task-input"
               type="text"
               placeholder="Add task"
               onKeyPress={this.onKeyPress} />
        <Expandable expanded title="In Progress">
          {this.renderList('in-progress', 'blocked')}
        </Expandable>
        <Expandable expanded title="Inbox">
          {this.renderList('todo')}
        </Expandable>
        <Expandable title="Completed">
          {this.renderList('done', 'canceled')}
        </Expandable>
      </div>
    )
  }

  onKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') {
      return
    }

    const el = e.currentTarget
    await todosStore.addTodo(this.props.projectId, el.value)

    el.value = ''
  }
}
