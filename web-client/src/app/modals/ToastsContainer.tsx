import {observer} from 'mobx-react'
import * as React from 'react'
import ModalsStore from './store'

interface IProps {
  modalsStore?: ModalsStore,
}

@observer(['modalsStore'])
class ToastsContainer extends React.Component<IProps, {}> {

  render (): JSX.Element {
    const toasts = this.props.modalsStore!.toasts.map(
      toast => <div key={toast.id} className="Toast">{toast.content}</div>
    )

    return (
      <div className="ToastsContainer">
        {toasts}
      </div>
    )
  }

}

export default ToastsContainer
