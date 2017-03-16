import * as React from 'react'
import {observer} from 'mobx-react'

import * as cx from 'classnames'
import { todosStore } from 'web-client/store'

import ProjectTodosList from './ProjectTodosList'

import { Button, Header, WithModals, Page, LeftPane } from 'web-client/components'

@observer
export default class TodosView extends WithModals<{}, {}> {

  componentWillMount(): void {
    todosStore.loadProjectsList()
  }

  renderProjects(): JSX.Element[] {
    return todosStore.projects.map(
      ({ id, name }) => (
        <div key={id}
             className={cx('ProjectList-item', { 'is-open': todosStore.projectId === id })}
             onClick={() => todosStore.openProject(id)}>
          <div className="u-like-a-h">{name}</div>
        </div>
      )
    )
  }

  render (): JSX.Element {
    let list
    const { todos, projectId } = todosStore
    if (todos) {
      if (!projectId) {
        throw new Error('this should never happen')
      }
      list = <ProjectTodosList key={projectId} projectId={projectId} todos={todos} />
    }

    return (
      <Page className="TodosView">
        <Header />
        <LeftPane>
          <div className="ProjectList-item is-disabled">Inbox</div>
          <div className="ProjectList-item is-disabled">Today</div>
          <div className="ProjectList-item is-disabled">Upcoming</div>
          <div className="ProjectList-projects">{this.renderProjects()}</div>
          <Button className="ProjectList-add-project" onClick={() => {}}>Add Project</Button>
        </LeftPane>
        {list}
      </Page>
    )
  }
}
