import * as React from 'react'
import {observable} from 'mobx'
import {observer} from 'mobx-react'

import {
  Modal,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Button,
} from 'web-client/components'
import {formatBytes} from 'web-client/utils'
import { filesStore } from 'web-client/store'

interface IProps {
  file: File,
  recordId: number,
  onFileUploaded: () => void,
  onClose: () => void,
}

type ModalState = 'ready' | 'uploading' | { error: string }

@observer
export default class UploadFileModal extends React.Component<IProps, {}> {
  @observable modalState: ModalState = 'ready'

  render (): JSX.Element {
    const { file, onClose } = this.props

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
        <ModalTitle>Upload file</ModalTitle>

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
    this.modalState = 'uploading'

    const { file, onClose, onFileUploaded } = this.props
    const name = (this.refs['fileName'] as HTMLInputElement).value

    filesStore.uploadFile(this.props.recordId, name, file).then(
      () => {
        onFileUploaded()
        onClose()
      },
      (err: Error) => this.modalState = { error: err.toString() }
    )
  }
}
