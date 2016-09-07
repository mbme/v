import * as React from 'react'
import {observer} from 'mobx-react'

import {Name} from 'notes/store'

import Modal, { ModalTitle, ModalBody, ModalFooter } from 'modals/Modal'
import LinkButton from 'common/LinkButton'

interface IProps {
  isVisible: boolean,
  onCancel: () => void,
  onCreate: (name: Name) => void,
}

@observer
class AddNoteModal extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { isVisible } = this.props
    return (
      <Modal className="AddNoteModal" isOpen={isVisible}>
        <ModalTitle>Create new note</ModalTitle>

        <ModalBody>
          <input ref="name" type="text" placeholder="Note name" />
        </ModalBody>

        <ModalFooter>
          <LinkButton onClick={this.props.onCancel}>
            Cancel
          </LinkButton>
          <LinkButton onClick={this.onClickCreate}>
            Create
          </LinkButton>
        </ModalFooter>
      </Modal>
    )
  }

  onClickCreate = () => {
    const name = (this.refs['name'] as HTMLInputElement).value
    this.props.onCreate(name)
  }
}

export default AddNoteModal
