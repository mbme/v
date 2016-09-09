/* tslint:disable:no-null-keyword */

import {observer} from 'mobx-react'
import * as React from 'react'
import * as cx from 'classnames'
import ModalsStore from './store'

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
  private static _counter: number = 0

  id: number

  componentWillMount(): void {
    this.id = Modal._counter += 1
    this.props.modalsStore!.open(
      this.id, renderModal(this.props)
    )
  }

  componentWillUpdate(nextProps: ReactProps): void {
    this.props.modalsStore!.update(
      this.id, renderModal(nextProps)
    )
  }

  componentWillUnmount(): void {
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
