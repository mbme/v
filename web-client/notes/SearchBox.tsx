import * as React from 'react'
import {observer} from 'mobx-react'

import {InjectStore} from 'web-client/injector'
import NotesStore from './store'

import RecordsFilter from './RecordsFilter'

@observer
class SearchBox extends React.Component<{}, {}> {
  @InjectStore store: NotesStore

  render (): JSX.Element {
    return (
      <div className="SearchBox">
        <RecordsFilter initialValue={this.store.recordsFilter}
                       onChange={this.onInputChange} />
      </div>
    )
  }

  onInputChange = (val: string) => {
    this.store.setRecordsFilter(val)
  }
}

export default SearchBox
