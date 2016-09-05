import * as React from 'react'
import {observer} from 'mobx-react'

import NotesStore from './store'
import RecordsFilter from './RecordsFilter'

interface IProps {
  store: NotesStore,
}

@observer
class SearchBox extends React.Component<IProps, {}> {

  render (): JSX.Element {
    const { store } = this.props
    return (
      <div className="SearchBox">
        <RecordsFilter initialValue={store.recordsFilter} onChange={this.onInputChange} />
      </div>
    )
  }

  onInputChange = (val: string) => {
    this.props.store.setRecordsFilter(val)
  }
}

export default SearchBox
