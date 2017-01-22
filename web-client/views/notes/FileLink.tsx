import {observable, action} from 'mobx'
import {observer} from 'mobx-react'
import * as React from 'react'

import urls from 'api-client/urls'
import {IFileInfo} from 'api-client/types'

import { STORE } from 'web-client/store'
import {formatBytes} from 'web-client/utils'
import { Button, confirmationModal } from 'web-client/components'

interface IProps {
  recordId: number,
  file: IFileInfo,
  editMode?: boolean,
}

@observer
export default class FileLink extends React.Component<IProps, {}> {
  @observable showModal: boolean = false

  @action setShowModal(show: boolean): void {
    this.showModal = show
  }

  render (): JSX.Element {
    const { file, recordId, editMode = false } = this.props

    let modal
    if (this.showModal) {
      modal = confirmationModal({
        title: 'Delete file',
        body: (<span>Do you really want to delete file <b>{file.name}</b></span>),
        onCancel: () => this.setShowModal(false),
        onAction: () => STORE.deleteFile(recordId, file).then(() => this.setShowModal(false)),
        actionBtnText: 'Delete',
      })
    }

    let button
    if (editMode) {
      button = (<Button type="dangerous" onClick={() => this.setShowModal(true)}>Remove</Button>)
    }

    return (
      <div className="FileLink">
        {modal}
        <a href={urls.file(recordId, file.name)} target="_blank">{file.name}</a>
        <span className="size">{formatBytes(file.size)}</span>
        {button}
      </div>
    )
  }
}
