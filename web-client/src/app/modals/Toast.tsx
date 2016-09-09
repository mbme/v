import {observer} from 'mobx-react'
import * as React from 'react'

interface IProps {
}

@observer
class Toast extends React.Component<IProps, {}> {
  render (): JSX.Element {
    return (
      <div className="Toast">
        {this.props.children}
      </div>
    )
  }
}

export default Toast
