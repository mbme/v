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
  show: boolean,
  onCancel: () => void,
  onCreate: (name: string) => void,
}

@observer
export default class AddNoteModal extends React.Component<IProps, {}> {
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
          <Button type="secondary" onClick={this.props.onCancel}>
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
    this.props.onCreate(name)
  }
}
