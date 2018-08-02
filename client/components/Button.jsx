import React from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils';

export default function Button({ onClick, disabled, primary, children }) {
  const className = classNames('Button', {
    'is-disabled': disabled,
    'is-primary': !disabled && primary,
    'is-secondary': !disabled && !primary,
  });

  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
}
Button.propTypes = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  primary: PropTypes.bool,
  children: PropTypes.node.isRequired,
};
