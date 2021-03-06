import {observable} from 'mobx'
import {observer} from 'mobx-react'
import * as React from 'react'
import * as cx from 'classnames'

import { uiStore } from 'web-client/store'
import { Button, ButtonType } from '../Button'

interface IProps {
  className?: string,
}

type ReactProps = IProps & {
  children?: {} | undefined
}

@observer
export class Modal extends React.Component<IProps, {}> {
  id: number

  componentWillMount(): void {
    this.id = uiStore.openModal(
      this.renderModal(this.props)
    )
  }

  componentWillUpdate(nextProps: ReactProps): void {
    uiStore.updateModal(
      this.id, this.renderModal(nextProps)
    )
  }

  componentWillUnmount(): void {
    uiStore.closeModal(this.id)
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

interface IConfirmationModalConfig {
  title: string,
  body: string | JSX.Element,
  onCancel: () => void,
  onAction: () => void,
  actionBtnType?: ButtonType,
  actionBtnText: string,
  cancelBtnText?: string,
}
function confirmationModal({
  title,
  body,
  onCancel,
  onAction,
  actionBtnType = 'dangerous',
  actionBtnText,
  cancelBtnText = 'Cancel',
}: IConfirmationModalConfig): JSX.Element {
  return (
    <Modal>
      <ModalTitle>{title}</ModalTitle>

      <ModalBody>{body}</ModalBody>

      <ModalFooter>
        <Button type="secondary" onClick={onCancel}>
          {cancelBtnText}
        </Button>
        <Button type={actionBtnType} onClick={onAction}>
          {actionBtnText}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export class WithModals<T, S> extends React.Component<T, S> {
  @observable.ref modal?: JSX.Element

  setModal(modal?: JSX.Element): void {
    this.modal = modal
  }

  setConfirmationModal(config: IConfirmationModalConfig): void {
    this.setModal(confirmationModal(config))
  }

  hideModal = () => this.setModal()
}
