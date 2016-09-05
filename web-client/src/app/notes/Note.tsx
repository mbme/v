import {observer} from 'mobx-react'
import * as React from 'react'
import {INote} from './store'

interface IProps {
  note: INote,
}

@observer
class Note extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { note } = this.props
    return (
      <div className="Note">
        <h1 className="Note-title">{note.name}</h1>
        <div className="Note-body">{note.data}</div>
      </div>
    )
  }
}

export default Note
