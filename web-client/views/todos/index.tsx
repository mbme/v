import * as React from 'react'
import {observable, action} from 'mobx'
import {observer} from 'mobx-react'

import {Inject} from 'web-client/injector'
import Store from 'web-client/store'

import ProjectsList from './ProjectsList'
import ProjectTodosList from './ProjectTodosList'

import { Button, Header } from 'web-client/components'

@observer
export default class TodosView extends React.Component<{}, {}> {
  @Inject store: Store

  @observable showModal: boolean = false

  componentWillMount(): void {
    this.store.loadProjectsList()
  }

  @action
  setShowModal(show: boolean): void {
    this.showModal = show
  }

  render (): JSX.Element {
    return (
      <div className="TodosView">
        <Header>
          <Button onClick={this.onClickPlus}>Add Todo</Button>
        </Header>
        <div className="TodosView-left">
          <ProjectsList />
        </div>
        <div className="TodosView-center">
          <ProjectTodosList />
        </div>
      </div>
    )
  }

  onClickPlus = () => {
    this.setShowModal(true)
  }

  onModalCancel = () => {
    this.setShowModal(false)
  }
}
