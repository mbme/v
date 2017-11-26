import React, { PureComponent } from 'react'
import s from 'client/styles'
import { Icon } from 'client/components'

const NoScroll = s.cx({
  height: '100vh',
  overflow: 'hidden',
})

const Spinner = s.cx({
  position: 'fixed',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  backgroundColor: '#ffffff',
  cursor: 'progress',
  animationName: s.animation({
    '0%': { opacity: '0.4' },
    '50%': { opacity: '0.8' },
    '100%': { opacity: '0.4' },
  }),
  animationDuration: '3s',
  animationIterationCount: 'infinite',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

const Loader = s.cx({
  width: '24px',
  height: '24px',
  animationName: s.animation({
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(359deg)' },
  }),
  animationDuration: '1.5s',
  animationIterationCount: 'infinite',
})


export default class ProgressLocker extends PureComponent {
  componentDidMount() {
    const { scrollTop } = document.documentElement
    document.body.className = NoScroll
    document.body.style = `margin-top: ${-scrollTop}px`
  }

  componentWillUnmount() {
    document.body.className = ''
    document.body.style = ''
  }

  render() {
    return (
      <div className={Spinner}>
        <Icon type="loader" className={Loader} />
      </div>
    )
  }
}
