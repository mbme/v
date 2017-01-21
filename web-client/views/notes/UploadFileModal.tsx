import * as React from 'react'
import {action, observable} from 'mobx'
import {observer} from 'mobx-react'

import {
  Modal,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Button,
} from 'web-client/components'
import {formatBytes} from 'web-client/utils'
import {Note} from 'web-client/utils/types'
import { STORE } from 'web-client/store'

interface IProps {
  file: File,
  note: Note,
  onClose: () => void,
}

type ModalState = 'ready' | 'uploading' | { error: string }

@observer
export default class UploadFileModal extends React.Component<IProps, {}> {
  @observable modalState: ModalState = 'ready'

  @action switchModalState(state: ModalState): void {
    this.modalState = state
  }

  render (): JSX.Element {
    const { file, note, onClose } = this.props

    let error: string | undefined
    let footer: JSX.Element

    if (this.modalState === 'uploading') {
      footer = (
        <ModalFooter>
          <div className="uploading">Uploading...</div>
        </ModalFooter>
      )
    } else {
      if (this.modalState !== 'ready') {
        error = this.modalState.error
      }

      footer = (
        <ModalFooter>
          <Button type="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={this.onClickCreate}>Upload</Button>
        </ModalFooter>
      )
    }

    return (
      <Modal className="UploadFileModal">
        <ModalTitle>Upload file for "{note.name}"</ModalTitle>

        <ModalBody>
          <input className="fileName"
                 ref="fileName"
                 type="text"
                 defaultValue={file.name} />
          <span className="fileType">{file.type}</span>
          <span className="fileSize">{formatBytes(file.size)}</span>
          <div className="error-msg">{error}</div>
        </ModalBody>

        {footer}
      </Modal>
    )
  }

  onClickCreate = () => {
    this.switchModalState('uploading')

    const name = (this.refs['fileName'] as HTMLInputElement).value

    STORE.uploadFile(this.props.note.id, name, this.props.file).then(
      this.props.onClose,
      (err: Error) => this.switchModalState({ error: err.toString() })
    )
  }
}
