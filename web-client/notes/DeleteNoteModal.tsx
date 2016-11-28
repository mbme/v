import * as React from 'react'
import {observer} from 'mobx-react'

import {
  Modal,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Button,
} from 'web-client/common'

interface IProps {
  name: string,
  onCancel: () => void,
  onDelete: () => void,
}

@observer
class DeleteNoteModal extends React.Component<IProps, {}> {
  render (): JSX.Element {
    return (
      <Modal>
        <ModalTitle>Delete note</ModalTitle>

        <ModalBody>
          Do you really want to delete note <b>{this.props.name}</b>?
        </ModalBody>

        <ModalFooter>
          <Button type="secondary" onClick={this.props.onCancel}>
            Cancel
          </Button>
          <Button type="dangerous" onClick={this.props.onDelete}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    )
  }
}

export default DeleteNoteModal
