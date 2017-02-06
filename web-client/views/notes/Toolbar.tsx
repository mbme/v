import * as React from 'react'
import {observer} from 'mobx-react'

import { Button, ButtonType } from 'web-client/components'
import {IFileInfo} from 'api-client/types'

import FileLink from './FileLink'
import FilePicker from './FilePicker'

export interface IAction {
  label: string,
  type?: ButtonType,
  action: () => void,
}

interface IProps {
  recordId: number,
  edit: boolean,
  actions: IAction[],
  files: IFileInfo[],
  reloadFiles: () => void,
}

@observer
export default class Toolbar extends React.Component<IProps, {}> {
  render(): JSX.Element {
    const { recordId, edit, actions, files, reloadFiles } = this.props

    const links = files.map(
      file => (
        <FileLink key={file.name}
                  editMode={edit}
                  recordId={recordId}
                  file={file}
                  onRemove={reloadFiles} />
      )
    )

    if (!links.length) {
      links.push(<label key="no-files-label" className="u-like-secondary">No files</label>)
    }

    if (edit) {
      links.push(
        <FilePicker key="file-picker"
                    label="Attach file"
                    recordId={recordId}
                    onFileUploaded={reloadFiles} />
      )
    }

    const buttons = actions.map(
      ({ label, action, type }) =>
        <Button key={label} className="Toolbar-action" type={type} onClick={action}>{label}</Button>
    )

    return (
      <div className="Toolbar">
        <label key="title-actions" className="title">ACTIONS</label>
        {buttons}
        <label key="title-files" className="title">FILES</label>
        {links}
      </div>
    )
  }
}
