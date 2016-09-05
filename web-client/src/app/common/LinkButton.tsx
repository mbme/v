import {observer} from 'mobx-react'
import * as React from 'react'
import * as cx from 'classnames'

interface IProps {
  className?: string,
  onClick: () => void,
}

@observer
class LinkButton extends React.Component<IProps, {}> {
  render (): JSX.Element {
    return (
      <a className={cx('LinkButton', this.props.className)}
         href=""
         onClick={this.onClick}>
        [{this.props.children}]
      </a>
    )
  }

  onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    this.props.onClick()
  }
}

export default LinkButton
