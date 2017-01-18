import {observer} from 'mobx-react'
import * as React from 'react'

import {IFileInfo} from 'api-client/types'

import { Button } from 'web-client/components'
import FileLink from './FileLink'

interface IProps {
  noteId: number,
  file: IFileInfo,
  onRemove: (file: IFileInfo) => void,
}

@observer
class AttachmentEditor extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { file, noteId } = this.props

    return (
      <FileLink noteId={noteId} file={file}>
        <Button className="remove"
                    type="dangerous"
                    onClick={this.onClickRemove}>
          Remove
        </Button>
      </FileLink>
    )
  }

  onClickRemove = () => {
    this.props.onRemove(this.props.file)
  }
}

export default AttachmentEditor
