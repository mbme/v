import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils';
import { Icon } from './index';

export default class Input extends PureComponent {
  static propTypes = {
    autoFocus: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    light: PropTypes.bool,
    onClear: PropTypes.func,
    className: PropTypes.string,
  };

  ref = null;

  componentDidMount() {
    if (this.props.autoFocus) this.focus();
  }

  saveRef = (ref) => {
    this.ref = ref;
  };

  onChange = e => this.props.onChange(e.target.value);

  onKeyDown = (e) => {
    if (e.key === 'Escape') this.blur();
  };

  focus = () => {
    if (!this.ref) return;

    this.ref.focus();
    const { length } = this.ref.value;
    this.ref.setSelectionRange(length, length); // put cursor at the end of the input
  };

  blur = () => {
    if (!this.ref) return;

    this.ref.blur();
  };

  onClickClear = () => {
    this.props.onChange('');
    this.props.onClear();
  };

  render() {
    const { onChange, light, className, onClear, ...other } = this.props;
    return (
      <div className={classNames('Input-container', { 'is-light': light }, className)}>
        <input
          ref={this.saveRef}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          className={classNames('Input-input', { 'is-light': light, 'is-with-clear': onClear })}
          {...other}
        />
        {onClear && <Icon type="x" className="Input-clear" onClick={this.onClickClear} />}
      </div>
    );
  }
}
