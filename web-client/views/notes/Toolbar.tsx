import * as React from 'react'
import {action, observable} from 'mobx'
import {observer} from 'mobx-react'

import { Button, ButtonType } from 'web-client/components'
import { filesStore } from 'web-client/store'
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
  actions: IAction[]
}

@observer
export default class Toolbar extends React.Component<IProps, {}> {
  @observable files: IFileInfo[] = []
  @action setFiles(files: IFileInfo[]): void {
    this.files = files
  }

  reloadFiles = async () => {
    const files = await filesStore.loadFiles(this.props.recordId)
    this.setFiles(files)
  }

  componentDidMount(): void {
    this.reloadFiles()
  }

  render(): JSX.Element {
    const { recordId, edit, actions } = this.props

    const links = this.files.map(
      file => (
        <FileLink key={file.name}
                  editMode={edit}
                  recordId={recordId}
                  file={file}
                  onRemove={this.reloadFiles} />
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
                    onFileUploaded={this.reloadFiles} />
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
