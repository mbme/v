import {observer} from 'mobx-react'
import * as React from 'react'
import * as cx from 'classnames'

import {InjectStore} from 'web-client/AppState'
import ModalsStore from './store'

@observer
class ModalsContainer extends React.Component<{}, {}> {
  @InjectStore store: ModalsStore

  render (): JSX.Element {
    const modal = this.store.visibleModal

    return (
      <div className={cx('ModalsContainer', { 'is-hidden': !modal })}>
        <div className="ModalsContainer-backdrop"></div>
        {modal ? modal.el : undefined}
      </div>
    )
  }
}

export default ModalsContainer
