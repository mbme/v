import {observer} from 'mobx-react'
import * as React from 'react'

import urls from 'api-client/urls'
import {IFileInfo} from 'api-client/types'

import { filesStore } from 'web-client/store'
import {formatBytes} from 'web-client/utils'
import { Button, WithModals } from 'web-client/components'

interface IProps {
  recordId: number,
  file: IFileInfo,
  editMode?: boolean,
  onRemove: () => void,
}

@observer
export default class FileLink extends WithModals<IProps, {}> {
  onClickRemove = () => {
    const { file, recordId, onRemove } = this.props

    this.setConfirmationModal({
      title: 'Delete file',
      body: (<span>Do you really want to delete file <b>{file.name}</b></span>),
      onCancel: this.hideModal,
      onAction: async () => {
        await filesStore.deleteFile(recordId, file)
        this.hideModal()
        onRemove()
      },
      actionBtnText: 'Delete',
    })
  }

  render (): JSX.Element {
    const { file, recordId, editMode = false } = this.props

    let button
    if (editMode) {
      button = (<Button type="dangerous" onClick={this.onClickRemove}>Remove</Button>)
    }

    return (
      <div className="FileLink">
        {this.modal}
        <a href={urls.file(recordId, file.name)} target="_blank">{file.name}</a>
        <span className="size">{formatBytes(file.size)}</span>
        {button}
      </div>
    )
  }
}
