import * as React from 'react'
import {observer} from 'mobx-react'

import { todosStore } from 'web-client/store'
import { ITodo, TodoState, todoStates } from 'api-client/types'

import { Expandable, IconDone } from 'web-client/components'

const STATES = {
  IN_PROGRESS: todoStates('in-progress', 'blocked'),
  INBOX:       todoStates('todo'),
  COMPLETED:   todoStates('done', 'canceled'),
}

interface IProps {
  projectId: number,
  todos: ITodo[],
}

@observer
export default class ProjectTodosList extends React.Component<IProps, {}> {
  renderList(states: TodoState[]): JSX.Element[] {
    const todos = this.props.todos.filter(todo => states.indexOf(todo.state) > -1)

    if (!todos.length) {
      return [<div key="todo-nothing" className="Todo-nothing">No tasks</div>]
    }

    return todos.map((todo) => (
      <div key={todo.id} className="Todo">
        {states !== STATES.COMPLETED
         && <IconDone onClick={() => todosStore.updateTodoState(todo, 'done')} />}
        <span className="Todo-name">{todo.name}</span>
      </div>
    ))
  }

  onKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') {
      return
    }

    const el = e.currentTarget
    await todosStore.addTodo(this.props.projectId, el.value)

    el.value = ''
  }

  render(): JSX.Element {
    return (
      <div className="ProjectTodosList">
        <input className="ProjectTodosList-task-input"
               type="text"
               placeholder="Add task"
               onKeyPress={this.onKeyPress} />
        <Expandable expanded title="In Progress">
          {this.renderList(STATES.IN_PROGRESS)}
        </Expandable>
        <Expandable expanded title="Inbox">
          {this.renderList(STATES.INBOX)}
        </Expandable>
        <Expandable title="Completed">
          {this.renderList(STATES.COMPLETED)}
        </Expandable>
      </div>
    )
  }

}
