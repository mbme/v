import {observer} from 'mobx-react'
import * as React from 'react'
import * as cx from 'classnames'
import ModalsStore from './store'

interface IProps {
  modalsStore?: ModalsStore,
}

@observer(['modalsStore'])
class ModalsContainer extends React.Component<IProps, {}> {

  render (): JSX.Element {
    const modal = this.props.modalsStore!.visibleModal

    return (
      <div className={cx('ModalsContainer', { 'is-hidden': !modal })}>
        <div className="ModalsContainer-backdrop"></div>
        {modal ? modal.el : undefined}
      </div>
    )
  }

}

export default ModalsContainer
