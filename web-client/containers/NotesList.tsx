import * as React from 'react'
import {observer} from 'mobx-react'
import { Store } from 'web-client/store'
import { List } from 'web-client/components'

interface IProps {
  store: Store,
}

@observer
export class NotesList extends React.Component<IProps, {}> {
  componentWillMount(): void {
    this.props.store.loadNoteRecords()
  }

  render(): JSX.Element {
    const items = this.props.store.noteRecords.map(
      ({ id, name }) => ({ key: id.toString(), el: name})
    )

    return (
      <List items={items} />
    )
  }
}
