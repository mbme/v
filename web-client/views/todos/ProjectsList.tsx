import * as React from 'react'
import {observer} from 'mobx-react'

import {Inject} from 'web-client/utils'
import Store from 'web-client/store'

@observer
export default class ProjectsList extends React.Component<{}, {}> {
  @Inject store: Store

  renderProjects(): JSX.Element[] {
    return this.store.projects.map(
      ({ id, name }) => (
        <div key={id}
             className="ProjectList-item"
             onClick={() => this.store.openProject(id)}>
          {name}
        </div>
      )
    )
  }

  render(): JSX.Element {
    return (
      <div className="ProjectList">
        <div className="ProjectList-item is-disabled">Inbox</div>
        <div className="ProjectList-item is-disabled">Today</div>
        <div className="ProjectList-item is-disabled">Upcoming</div>
        {this.renderProjects()}
      </div>
    )
  }
}
