/* tslint:disable:no-null-keyword */

import {observer} from 'mobx-react'
import * as React from 'react'
import * as cx from 'classnames'
import ModalsStore, {Id} from './store'

interface IProps {
  className?: string,
  modalsStore?: ModalsStore,
}

type ReactProps = IProps & {
  children?: {} | undefined
}

function renderModal (props: ReactProps): JSX.Element {
  return (
    <div className={cx('Modal', props.className)} >
      {props.children}
    </div>
  )
}

@observer(['modalsStore'])
class Modal extends React.Component<IProps, {}> {
  id: Id

  componentWillMount(): void {
    this.id = this.props.modalsStore!.openModal(
      renderModal(this.props)
    )
  }

  componentWillUpdate(nextProps: ReactProps): void {
    this.props.modalsStore!.updateModal(
      this.id, renderModal(nextProps)
    )
  }

  componentWillUnmount(): void {
    this.props.modalsStore!.closeModal(this.id)
  }

  render (): null {
    return null
  }
}

interface IModalProps {
  className?: string,
}

export class ModalTitle extends React.Component<IModalProps, {}> {
  render(): JSX.Element {
    return (
      <h2 className={cx('ModalTitle', this.props.className)}>
        {this.props.children}
      </h2>
    )
  }
}

export class ModalBody extends React.Component<IModalProps, {}> {
  render(): JSX.Element {
    return (
      <div className={cx('ModalBody', this.props.className)}>
        {this.props.children}
      </div>
    )
  }
}

export class ModalFooter extends React.Component<IModalProps, {}> {
  render(): JSX.Element {
    return (
      <div className={cx('ModalFooter', this.props.className)}>
        {this.props.children}
      </div>
    )
  }
}

export default Modal
