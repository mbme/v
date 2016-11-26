import * as React from 'react'
import {observer} from 'mobx-react'

interface IProps {
  items: string[],
}

@observer
export class List extends React.Component<IProps, {}> {

  render(): JSX.Element {
    return (
      <ul className="List">
        {this.props.items.map(item => (<li>{item}</li>))}
      </ul>
    )
  }
}
