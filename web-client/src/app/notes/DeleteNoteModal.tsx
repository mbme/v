import * as React from 'react'
import {observer} from 'mobx-react'

import {Name} from 'notes/store'

import Modal, { ModalTitle, ModalBody, ModalFooter } from 'modals/Modal'
import LinkButton from 'common/LinkButton'

interface IProps {
  isVisible: boolean,
  name: Name,
  onCancel: () => void,
  onDelete: () => void,
}

@observer
class DeleteNoteModal extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { isVisible } = this.props
    return (
      <Modal className="DeleteNoteModal" isOpen={isVisible}>
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
