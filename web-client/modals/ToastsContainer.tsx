import {observer} from 'mobx-react'
import * as React from 'react'

import {InjectStore} from 'web-client/injector'
import ModalsStore from './store'

import Toast from './Toast'

@observer
class ToastsContainer extends React.Component<{}, {}> {
  @InjectStore store: ModalsStore

  render (): JSX.Element {
    const toasts = this.store.toasts.map(
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
