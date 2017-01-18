import * as React from 'react'
import {observer} from 'mobx-react'

import {Inject} from 'web-client/utils'
import Store from 'web-client/store'

import {
  Modal,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Button,
} from 'web-client/components'

interface IProps {
  show: boolean,
  onClose: () => void,
}

@observer
export default class AddNoteModal extends React.Component<IProps, {}> {
  @Inject store: Store

  render (): JSX.Element | null {
    if (!this.props.show) {
      return null
    }

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
    this.store.createNote(name).then(this.props.onClose)
  }
}
