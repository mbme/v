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
  onClose: () => void,
}

@observer
class CloseEditorModal extends React.Component<IProps, {}> {
  render (): JSX.Element {
    return (
      <Modal>
        <ModalTitle>Close editor</ModalTitle>

        <ModalBody>
          There are unsaved changes in <b>{this.props.name}</b>. <br />
          Do you really want to close editor?
        </ModalBody>

        <ModalFooter>
          <Button type="secondary" onClick={this.props.onCancel}>
            Cancel
          </Button>
          <Button type="dangerous" onClick={this.props.onClose}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    )
  }
}

export default CloseEditorModal
