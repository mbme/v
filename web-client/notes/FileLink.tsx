import {observer} from 'mobx-react'
import * as React from 'react'
import {formatBytes} from 'web-client/utils'
import urls from 'api-client/urls'

import {IFileInfo, Id} from 'api-client/types'

interface IProps {
  noteId: Id,
  file: IFileInfo,
}

@observer
class FileLink extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { file, noteId, children } = this.props

    return (
      <div className="FileLink">
        <a href={urls.file(noteId, file.name)} target="_blank">{file.name}</a>
        <span className="size">{formatBytes(file.size)}</span>
        {children}
      </div>
    )
  }
}

export default FileLink
