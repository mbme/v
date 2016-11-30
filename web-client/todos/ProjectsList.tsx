import * as React from 'react'
import {observer} from 'mobx-react'

import {Inject} from 'web-client/injector'
import Store from 'web-client/store'

@observer
export default class ProjectsList extends React.Component<{}, {}> {
  @Inject store: Store

  renderProjects(): JSX.Element[] {
    return this.store.projects.map(
      ({ id, name }) => (
        <div key={id} className="Project" onClick={() => this.store.openProject(id)}>{name}</div>
      )
    )
  }

  render(): JSX.Element {
    return (
      <div className="ProjectsList">
        <div className="Project">Inbox</div>
        <div className="Project">Today</div>
        <div className="Project">Upcoming</div>
        {this.renderProjects()}
      </div>
    )
  }
}
