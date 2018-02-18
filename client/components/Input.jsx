import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import s from 'client/styles';

const inputStyles = ({ light }) => ({
  display: 'block',
  width: '100%',

  extend: [
    {
      condition: light,
      border: '0 none',
      borderBottom: 'var(--border)',
      backgroundColor: 'inherit',
      padding: 'var(--spacing-fine) var(--spacing-small)',
    },
    {
      condition: !light,
      backgroundColor: 'var(--bg-color)',
      padding: 'var(--spacing-small)',
      ...s.withBorder,
    },
  ],
});

export default class Input extends PureComponent {
  static propTypes = {
    autoFocus: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    light: PropTypes.bool,
    className: PropTypes.string,
  };

  ref = null;

  componentDidMount() {
    if (this.props.autoFocus) {
      this.ref.focus();
      const { length } = this.ref.value;
      this.ref.setSelectionRange(length, length); // put cursor at the end of the input
    }
  }

  render() {
    const { onChange, light, className, ...other } = this.props;
    return (
      <input
        ref={(ref) => { this.ref = ref; }}
        onChange={e => onChange(e.target.value)}
        className={s.cx(inputStyles({ light }), className)}
        {...other}
      />
    );
  }
}
