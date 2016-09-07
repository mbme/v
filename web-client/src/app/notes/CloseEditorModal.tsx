import * as React from 'react'
import {observer} from 'mobx-react'

import {Name} from 'notes/store'

import Modal, { ModalTitle, ModalBody, ModalFooter } from 'modals/Modal'
import LinkButton from 'common/LinkButton'

interface IProps {
  isVisible: boolean,
  name: Name,
  onCancel: () => void,
  onClose: () => void,
}

@observer
class CloseEditorModal extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { isVisible } = this.props
    return (
      <Modal isOpen={isVisible}>
        <ModalTitle>Close editor</ModalTitle>

        <ModalBody>
          There are unsaved changes in <b>{this.props.name}</b>. <br />
          Do you really want to close editor?
        </ModalBody>

        <ModalFooter>
          <LinkButton type="secondary" onClick={this.props.onCancel}>
            Cancel
          </LinkButton>
          <LinkButton type="dangerous" onClick={this.props.onClose}>
            Close
          </LinkButton>
        </ModalFooter>
      </Modal>
    )
  }
}

export default CloseEditorModal
