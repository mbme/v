import React, { PureComponent } from 'react';
import { Icon, Backdrop } from '../components';
import { classNames } from '../utils';

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
      <Backdrop className={classNames('Progress-backdrop', { 'is-visible': this.state.visible })}>
        <Icon type="loader" className="Progress-spinner" />
      </Backdrop>
    );
  }
}
