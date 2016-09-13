import {observer} from 'mobx-react'
import * as React from 'react'
import {Toast as ToastClass} from './store'

interface IProps {
  toast: ToastClass,
}

@observer
class Toast extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { toast } = this.props
    return (
      <div className={`Toast is-${toast.type}`}>
        {toast.content}
      </div>
    )
  }
}

export default Toast
