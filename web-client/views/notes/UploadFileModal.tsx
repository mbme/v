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

interface IProps {
  file: File,
  noteName: string,
  onCancel: () => void,
  onUpload: (name: string, file: File) => Promise<void>,
}

class StateEdit {
  readonly error?: string

  constructor (error?: string) {
    this.error = error
  }
}

type ModalState = StateEdit | 'uploading'

@observer
class UploadFileModal extends React.Component<IProps, {}> {
  @observable modalState: ModalState = new StateEdit()

  @action switchModalState(state: ModalState): void {
    this.modalState = state
  }

  render (): JSX.Element {
    const { file, noteName } = this.props

    let error: string | undefined
    let footer: JSX.Element
    if (this.modalState instanceof StateEdit) {
      error = this.modalState.error
      footer = (
        <ModalFooter>
          <Button type="secondary" onClick={this.props.onCancel}>
            Cancel
          </Button>
          <Button onClick={this.onClickCreate}>
            Upload
          </Button>
        </ModalFooter>
      )
    } else {
      footer = (
        <ModalFooter>
          <div className="uploading">Uploading...</div>
        </ModalFooter>
      )
    }

    return (
      <Modal className="UploadFileModal">
        <ModalTitle>Upload file for "{noteName}"</ModalTitle>

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

    this.props.onUpload(name, this.props.file).catch(
      (err: Error) => this.switchModalState(new StateEdit(err.toString()))
    )
  }
}

export default UploadFileModal
