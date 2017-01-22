import * as React from 'react'
import {observer} from 'mobx-react'

import { Button, WithModals } from 'web-client/components'
import {Note} from 'web-client/utils/types'

import UploadFileModal from './UploadFileModal'

interface IProps {
  label: string,
  note: Note,
}

@observer
export default class FilePicker extends WithModals<IProps, {}> {
  componentWillMount(): void {
    document.addEventListener('drop', this.onDrop)
  }

  componentWillUnmount(): void {
    document.removeEventListener('drop', this.onDrop)
  }

  render (): JSX.Element {
    return (
      <div className="FilePicker">
        {this.modal}

        <form ref="form">
          <input ref="fileInput" type="file" onChange={this.onFileSelected} />
        </form>

        <Button onClick={this.onClickSelect}>{this.props.label}</Button>
      </div>
    )
  }

  onClickSelect = () => {
    const fileInput = this.refs['fileInput'] as HTMLInputElement
    fileInput.click()
  }

  onFileSelected = (e: React.FormEvent<HTMLInputElement>) => {
    const fileInput = e.target as HTMLInputElement
    this.showFileUploadModal(fileInput.files!)

    const form = this.refs['form'] as HTMLFormElement
    form.reset()
  }

  onDrop = (e: DragEvent) => {
    this.showFileUploadModal(e.dataTransfer.files)
  }

  showFileUploadModal(files: FileList): void {
    this.setModal(
      <UploadFileModal note={this.props.note}
                       file={files[0]}
                       onClose={this.hideModal} />
    )
  }
}
