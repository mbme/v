import * as React from 'react'
import {observer} from 'mobx-react'
import {action, observable, reaction} from 'mobx'
import {searchDelay} from 'web-client/config'

interface IProps {
  initialValue: string,
  onChange: (val: string) => void,
}

@observer
class RecordsFilter extends React.Component<IProps, {}> {

  @observable inputValue: string = ''

  componentWillMount(): void {
    // debounce search input
    reaction(
      () => this.inputValue,
      this.props.onChange,
      false,
      searchDelay
    )
  }

  @action
  updateInputValue(newValue: string): void {
    this.inputValue = newValue
  }

  onInputChange = (e: any) => { // tslint:disable-line:no-any
    this.updateInputValue(e.target.value)
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

export default RecordsFilter
