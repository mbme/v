import {observer} from 'mobx-react'
import * as React from 'react'
import ModalsStore from './store'
import Toast from './Toast'

interface IProps {
  modalsStore?: ModalsStore,
}

@observer(['modalsStore'])
class ToastsContainer extends React.Component<IProps, {}> {

  render (): JSX.Element {
    const toasts = this.props.modalsStore!.toasts.map(
      toast => <Toast key={toast.id} toast={toast} />
    )

    return (
      <div className="ToastsContainer">
        {toasts}
      </div>
    )
  }

}

export default ToastsContainer
