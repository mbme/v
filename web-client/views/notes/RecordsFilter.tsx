import * as React from 'react'
import {observer} from 'mobx-react'
import {observable, reaction} from 'mobx'
import { config } from 'web-client/utils'

interface IProps {
  initialValue: string,
  onChange: (val: string) => void,
}

@observer
export default class RecordsFilter extends React.Component<IProps, {}> {

  @observable inputValue: string = ''

  componentWillMount(): void {
    // debounce search input
    reaction( // FIXME dispose this?
      () => this.inputValue,
      this.props.onChange,
      { delay: config.searchDelay }
    )
  }

  onInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.inputValue = e.currentTarget.value
  }

  render (): JSX.Element {
    return (
      <input
          className="RecordsFilter"
          type="text"
          placeholder="Search"
          defaultValue={this.props.initialValue}
          onChange={this.onInputChange}
      />
    )
  }
}
