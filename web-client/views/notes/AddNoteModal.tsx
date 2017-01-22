import * as React from 'react'
import {observer} from 'mobx-react'

import { STORE } from 'web-client/store'

import {
  Modal,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Button,
} from 'web-client/components'

interface IProps {
  onClose: () => void,
}

@observer
export default class AddNoteModal extends React.Component<IProps, {}> {
  render (): JSX.Element {
    return (
      <Modal className="AddNoteModal">
        <ModalTitle>Create new note</ModalTitle>

        <ModalBody>
          <input ref="name" type="text" placeholder="Note name" />
        </ModalBody>

        <ModalFooter>
          <Button type="secondary" onClick={this.props.onClose}>
            Cancel
          </Button>
          <Button onClick={this.onClickCreate}>
            Create
          </Button>
        </ModalFooter>
      </Modal>
    )
  }

  onClickCreate = () => {
    const name = (this.refs['name'] as HTMLInputElement).value
    STORE.createNote(name).then(this.props.onClose)
  }
}
