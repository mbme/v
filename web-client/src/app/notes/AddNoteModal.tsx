import * as React from 'react'
import {observer} from 'mobx-react'

import Modal from 'modals/Modal'
import LinkButton from 'common/LinkButton'

interface IProps {
  isVisible: boolean,
}

@observer
class AddNoteModal extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { isVisible } = this.props
    return (
      <Modal className="AddNote" isOpen={isVisible}>
        <h1>Create new note</h1>

        <input name="" type="text" placeholder="Note name"/>

        <div className="buttons">
          <LinkButton onClick={this.onClickCancel}>
            Cancel
          </LinkButton>
          <LinkButton onClick={this.onClickSave}>
            Save
          </LinkButton>
        </div>
      </Modal>
    )
  }

  onClickSave = () => {
    console.error('save')
  }

  onClickCancel = () => {
    console.error('cancel')
  }
}

export default AddNoteModal
