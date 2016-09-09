import {observer} from 'mobx-react'
import * as React from 'react'

import {IFileInfo, Id} from './store'

import LinkButton from 'common/LinkButton'
import FileLink from './FileLink'

interface IProps {
  noteId: Id,
  file: IFileInfo,
  onRemove: (file: IFileInfo) => void,
}

@observer
class AttachmentEditor extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { file, noteId } = this.props

    return (
      <div className="Attachment">
        <FileLink noteId={noteId} file={file} />

        <LinkButton className="remove"
                    type="dangerous"
                    onClick={this.onClickRemove}>
          Remove
        </LinkButton>
      </div>
    )
  }

  onClickRemove = () => {
    this.props.onRemove(this.props.file)
  }
}

export default AttachmentEditor
