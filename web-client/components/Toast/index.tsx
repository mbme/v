import {observer} from 'mobx-react'
import * as React from 'react'
import {Toast as ToastClass} from 'web-client/utils/types'

interface IProps {
  toast: ToastClass,
}

@observer
export class Toast extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { toast } = this.props
    return (
      <div className={`Toast is-${toast.type}`}>
        {toast.content}
      </div>
    )
  }
}
