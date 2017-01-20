import * as React from 'react'
import {observer} from 'mobx-react'

import { STORE } from 'web-client/store'

@observer
export default class ProjectsList extends React.Component<{}, {}> {
  renderProjects(): JSX.Element[] {
    return STORE.projects.map(
      ({ id, name }) => (
        <div key={id}
             className="ProjectList-item"
             onClick={() => STORE.openProject(id)}>
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
