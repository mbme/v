import * as React from 'react'
import {observer} from 'mobx-react'

import * as cx from 'classnames'
import { STORE } from 'web-client/store'

import ProjectTodosList from './ProjectTodosList'

import { Button, Header, WithModals } from 'web-client/components'

@observer
export default class TodosView extends WithModals<{}, {}> {

  componentWillMount(): void {
    STORE.loadProjectsList()
  }

  renderProjects(): JSX.Element[] {
    return STORE.projects.map(
      ({ id, name }) => (
        <div key={id}
             className={cx('ProjectList-item', { 'is-open': STORE.openProjectId === id })}
             onClick={() => STORE.openProject(id)}>
          <div className="u-like-a-h">{name}</div>
        </div>
      )
    )
  }

  render (): JSX.Element {
    return (
      <div className="TodosView">
        <Header>
          <Button onClick={() => {}}>Add Todo</Button>
        </Header>
        <div className="TodosView-left">
          <div className="ProjectList-item is-disabled">Inbox</div>
          <div className="ProjectList-item is-disabled">Today</div>
          <div className="ProjectList-item is-disabled">Upcoming</div>
          <div className="ProjectList-projects">{this.renderProjects()}</div>
        </div>
        <div className="TodosView-center">
          <ProjectTodosList />
        </div>
      </div>
    )
  }
}
