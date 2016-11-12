/* tslint:disable:no-null-keyword */

import {observer} from 'mobx-react'
import * as React from 'react'
import * as cx from 'classnames'

import {InjectStore} from 'web-client/AppState'
import ModalsStore from './store'

interface IProps {
  className?: string,
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

@observer
class Modal extends React.Component<IProps, {}> {
  @InjectStore store: ModalsStore

  id: number

  componentWillMount(): void {
    this.id = this.store.openModal(
      renderModal(this.props)
    )
  }

  componentWillUpdate(nextProps: ReactProps): void {
    this.store.updateModal(
      this.id, renderModal(nextProps)
    )
  }

  componentWillUnmount(): void {
    this.store.closeModal(this.id)
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
