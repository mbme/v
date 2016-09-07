import {observer} from 'mobx-react'
import * as React from 'react'
import * as cx from 'classnames'

type ButtonType = 'dangerous' | 'secondary'

interface IProps {
  className?: string,
  type?: ButtonType,
  onClick: () => void,
}

@observer
class LinkButton extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { type } = this.props
    return (
      <button className={cx('LinkButton', this.props.className, { [`is-${type}`]: !!type })}
              onClick={this.onClick}>
        [{this.props.children}]
      </button>
    )
  }

  onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    this.props.onClick()
  }
}

export default LinkButton
