import * as React from 'react'
import {observer} from 'mobx-react'

import { UIStore } from './store'

interface IProps {
  store: UIStore,
}

@observer
class UIManager extends React.Component<IProps, {}> {

  render(): JSX.Element {
    return (
      <div>
        {this.props.store.pieces}
      </div>
    )
  }
}

export default UIManager
