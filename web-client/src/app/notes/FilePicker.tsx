import * as React from 'react'
import {observer} from 'mobx-react'

import LinkButton from 'common/LinkButton'

interface IProps {
  label: string,
  onFilesPicked: (files: FileList) => void,
}

@observer
class FilePicker extends React.Component<IProps, {}> {
  render (): JSX.Element {
    return (
      <div className="FilePicker">
          <form ref="form">
            <input ref="fileInput" type="file" onChange={this.onFileSelected} />
          </form>
          <LinkButton onClick={this.onClickSelect}>{this.props.label}</LinkButton>
      </div>
    )
  }

  onClickSelect = () => {
    const fileInput = this.refs['fileInput'] as HTMLInputElement
    fileInput.click()
  }

  onFileSelected = (e: React.FormEvent<HTMLInputElement>) => {
    const fileInput = e.target as HTMLInputElement
    this.props.onFilesPicked(fileInput.files!)

    const form = this.refs['form'] as HTMLFormElement
    form.reset()
  }
}

export default FilePicker