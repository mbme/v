/* tslint:disable:no-null-keyword */

import {observer} from 'mobx-react'
import * as React from 'react'
import * as cx from 'classnames'
import ModalsStore from './store'

interface IProps {
  className?: string,
  isOpen: boolean,
  modalsStore?: ModalsStore,
}

@observer(['modalsStore'])
class Modal extends React.Component<IProps, {}> {
  private static _counter: number = 0

  id: number

  componentWillMount(): void {
    this.id = Modal._counter += 1

    // show modal if required while rendering first time
    if (this.props.isOpen) {
      this.showModal()
    }
  }

  componentWillReceiveProps(props: IProps): void {
    // update modal visibility only if "isOpen" property changed
    if (this.props.isOpen === props.isOpen) {
      return
    }

    if (props.isOpen) {
      this.showModal()
    } else {
      this.hideModal()
    }
  }

  componentWillUnmount(): void {
    this.props.modalsStore!.close(this.id)
  }

  renderModal (): JSX.Element {
    return (
      <div className={cx('Modal', this.props.className)} >
        {this.props.children}
      </div>
    )
  }

  showModal(): void {
    this.props.modalsStore!.openOrUpdate(this.id, this.renderModal())
  }

  hideModal(): void {
    this.props.modalsStore!.close(this.id)
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
