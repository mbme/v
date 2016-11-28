import {observer} from 'mobx-react'
import * as React from 'react'
import * as cx from 'classnames'

import {Inject} from 'web-client/injector'
import Store from 'web-client/store'

interface IProps {
  className?: string,
}

type ReactProps = IProps & {
  children?: {} | undefined
}

@observer
export class Modal extends React.Component<IProps, {}> {
  @Inject store: Store

  id: number

  componentWillMount(): void {
    this.id = this.store.openModal(
      this.renderModal(this.props)
    )
  }

  componentWillUpdate(nextProps: ReactProps): void {
    this.store.updateModal(
      this.id, this.renderModal(nextProps)
    )
  }

  componentWillUnmount(): void {
    this.store.closeModal(this.id)
  }

  renderModal(props: ReactProps): JSX.Element {
    return (
      <div className={cx('Modal', props.className)} >
        {props.children}
      </div>
    )
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
