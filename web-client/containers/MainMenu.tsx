import * as React from 'react'
import {observer} from 'mobx-react'
import { List, IListItem } from 'web-client/components'

interface IProps {
  items: IListItem[],
}

@observer
export class MainMenu extends React.Component<IProps, {}> {

  render(): JSX.Element {
    return (
      <List className="MainMenu" items={this.props.items} />
    )
  }
}
