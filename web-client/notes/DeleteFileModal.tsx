import * as React from 'react'
import {observer} from 'mobx-react'

import {IFileInfo} from 'api-client/types'

import Modal, { ModalTitle, ModalBody, ModalFooter } from 'web-client/modals/Modal'
import LinkButton from 'web-client/common/LinkButton'

interface IProps {
  file: IFileInfo,
  onCancel: () => void,
  onDelete: (file: IFileInfo) => void,
}

@observer
class DeleteFileModal extends React.Component<IProps, {}> {
  render (): JSX.Element {
    return (
      <Modal>
        <ModalTitle>Delete file</ModalTitle>

        <ModalBody>
          Do you really want to delete file <b>{this.props.file.name}</b>?
        </ModalBody>

        <ModalFooter>
          <LinkButton type="secondary" onClick={this.props.onCancel}>
            Cancel
          </LinkButton>
          <LinkButton type="dangerous" onClick={this.onClickDelete}>
            Delete
          </LinkButton>
        </ModalFooter>
      </Modal>
    )
  }

  onClickDelete = () => {
    this.props.onDelete(this.props.file)
  }
}

export default DeleteFileModal
