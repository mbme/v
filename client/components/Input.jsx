import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'client/components';
import s from 'client/styles';

const styles = s.styles({
  container: light => ({
    position: 'relative',

    extend: [
      light && {
        backgroundColor: 'inherit',
        borderBottom: 'var(--border)',
      },
      !light && {
        backgroundColor: 'var(--bg-color)',
        boxShadow: 'var(--box-shadow)',
        border: 'var(--border)',
      },
    ],
  }),

  input: (light, withClear) => ({
    display: 'block',
    width: '100%',
    height: '100%',
    border: '0 none',
    backgroundColor: 'inherit',

    paddingTop: 'var(--spacing-small)',
    paddingRight: 'var(--spacing-small)',
    paddingBottom: 'var(--spacing-small)',
    paddingLeft: 'var(--spacing-small)',

    extend: [
      light && {
        paddingTop: 'var(--spacing-fine)',
        paddingBottom: 'var(--spacing-fine)',
      },
      withClear && {
        paddingRight: 'var(--spacing-medium)',
      },
    ],
  }),

  clearIcon: {
    position: 'absolute',
    right: 'var(--spacing-fine)',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--color-secondary)',
  },
});

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
      <div className={s.cx(styles.container(light), className)}>
        <input
          ref={this.saveRef}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          className={styles.input(light, !!onClear)}
          {...other}
        />
        {onClear && <Icon type="x" className={styles.clearIcon} onClick={this.onClickClear} />}
      </div>
    );
  }
}
