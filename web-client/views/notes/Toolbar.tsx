import * as React from 'react'
import {observer} from 'mobx-react'

import {Note} from 'web-client/utils/types'

import { Button, ButtonType } from 'web-client/components'

import FileLink from './FileLink'
import FilePicker from './FilePicker'

export interface IAction {
  label: string,
  type?: ButtonType,
  action: () => void,
}

interface IProps {
  note: Note,
  actions: IAction[]
}

@observer
export default class Toolbar extends React.Component<IProps, {}> {
  render(): JSX.Element {
    const { note, actions } = this.props

    const links = note.files.map(
      file => <FileLink key={file.name} editMode={note.editMode} recordId={note.id} file={file} />
    )

    if (!links.length) {
      links.push(<label key="no-files-label" className="u-like-secondary">No files</label>)
    }
    if (note.editMode) {
      links.push(<FilePicker key="file-picker" label="Attach file" note={note} />)
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
