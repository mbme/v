import {observer} from 'mobx-react'
import * as React from 'react'
import {formatBytes} from 'utils'

import {IFileInfo, Id} from './store'

interface IProps {
  noteId: Id,
  file: IFileInfo,
}

@observer
class FileLink extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { file, noteId } = this.props
    const url = `/api/notes/${noteId}/files/${file.name}`

    return (
      <div className="FileLink">
        <a href={url} target="_blank">{file.name}</a>
        <span className="size">{formatBytes(file.size)}</span>
      </div>
    )
  }
}

export default FileLink
