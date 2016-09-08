import * as React from 'react'
import {observer} from 'mobx-react'

import Modal, { ModalTitle, ModalBody, ModalFooter } from 'modals/Modal'
import LinkButton from 'common/LinkButton'
import {formatBytes} from 'utils'

interface IProps {
  files: File[],
  onCancel: () => void,
}

@observer
class UploadFileModal extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { files } = this.props
    const file = files[0]
    return (
      <Modal className="UploadFileModal">
        <ModalTitle>Upload files</ModalTitle>

        <ModalBody>
          <input ref="fileName" type="text" defaultValue={file.name} />
          <span className="fileSize">{formatBytes(file.size)}</span>
          <span className="fileType">{file.type}</span>
        </ModalBody>

        <ModalFooter>
          <LinkButton type="secondary" onClick={this.props.onCancel}>
            Cancel
          </LinkButton>
          <LinkButton onClick={this.onClickCreate}>
            Upload
          </LinkButton>
        </ModalFooter>
      </Modal>
    )
  }

  onClickCreate = () => {

  }
}

export default UploadFileModal
