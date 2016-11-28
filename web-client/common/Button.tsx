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
export class Button extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { type } = this.props
    return (
      <button className={cx('Button', this.props.className, { [`is-${type}`]: !!type })}
              onClick={this.onClick}>
        [{this.props.children}]
      </button>
    )
  }

  onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    this.props.onClick()
  }
}
