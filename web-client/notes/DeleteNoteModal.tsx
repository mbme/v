import * as React from 'react'
import {observer} from 'mobx-react'

import Modal, { ModalTitle, ModalBody, ModalFooter } from 'web-client/modals/Modal'
import LinkButton from 'web-client/common/LinkButton'

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
          <LinkButton type="secondary" onClick={this.props.onCancel}>
            Cancel
          </LinkButton>
          <LinkButton type="dangerous" onClick={this.props.onDelete}>
            Delete
          </LinkButton>
        </ModalFooter>
      </Modal>
    )
  }
}

export default DeleteNoteModal
