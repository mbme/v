import * as React from 'react'
import {observer} from 'mobx-react'

import {Inject} from 'web-client/injector'
import Store from 'web-client/store'

import RecordsFilter from './RecordsFilter'

@observer
class SearchBox extends React.Component<{}, {}> {
  @Inject store: Store

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
