import React, { PureComponent } from 'react';
import s from 'client/styles';
import { Icon, Backdrop } from 'client/components';

const styles = s.styles({
  backdrop: visible => ({
    cursor: 'progress',
    alignItems: 'center',
    opacity: 0,

    extend: [
      visible && {
        animationName: s.animation({
          '0%': { opacity: '0.7' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.7' },
        }),
        animationDuration: '3s',
        animationIterationCount: 'infinite',
      },
    ],
  }),

  spinner: {
    width: '24px',
    height: '24px',
    animationName: s.animation({
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(359deg)' },
    }),
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
  },
});

export default class ProgressLocker extends PureComponent {
  state = {
    visible: false,
  };

  timer = null;

  makeVisible = () => this.setState({ visible: true });

  componentDidMount() {
    this.timer = setTimeout(this.makeVisible, 1000);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  render() {
    return (
      <Backdrop className={styles.backdrop(this.state.visible)}>
        <Icon type="loader" className={styles.spinner} />
      </Backdrop>
    );
  }
}
