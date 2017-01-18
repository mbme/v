import * as React from 'react'
import {observer} from 'mobx-react'

import {Inject} from 'web-client/injector'
import Store from 'web-client/store'

import RecordsFilter from './RecordsFilter'

@observer
class SearchBox extends React.Component<{}, {}> {
  @Inject store: Store

  renderRecordsCount(): string {
    const recordsCount = this.store.records.length
    const visibleRecordsCount = this.store.visibleRecords.length

    if (!recordsCount) {
      return 'no records :('
    }

    if (visibleRecordsCount < recordsCount) {
      return `${visibleRecordsCount} out of ${recordsCount} records`
    }

    return `${recordsCount} records`
  }

  render (): JSX.Element {
    return (
      <div className="SearchBox">
        <RecordsFilter initialValue={this.store.recordsFilter}
                       onChange={this.onInputChange} />
        <div className="SearchBox-count">{this.renderRecordsCount()}</div>
      </div>
    )
  }

  onInputChange = (val: string) => {
    this.store.setRecordsFilter(val)
  }
}

export default SearchBox
