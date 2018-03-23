import React from 'react';
import PropTypes from 'prop-types';
import s from 'client/styles';

const button = ({ disabled, primary }) => s.cx({
  padding: 'var(--spacing-fine) var(--spacing-medium)',
  borderRadius: '2px',
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'background-color 100ms linear, transform 50ms ease-in',

  textTransform: 'uppercase',
  letterSpacing: '1.2px',
  fontSize: '80%',

  extend: [
    {
      condition: !primary && !disabled,
      color: 'var(--color-text)',
      backgroundColor: 'var(--bg-color)',
      border: 'var(--border)',
      ':hover': {
        backgroundColor: 'var(--bg-color-darker)',
      },
    },
    {
      condition: primary && !disabled,
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-light)',
      ...s.withBorder,
      ':hover': {
        transform: 'scale(1.05)',
      },
    },
    {
      condition: disabled,
      cursor: 'auto',
      color: 'var(--color-secondary)',
      backgroundColor: 'var(--bg-color-darker)',
      border: 'var(--border)',
    },
  ],
});

export default function Button({ onClick, disabled, primary, children }) {
  return (
    <button
      className={button({ disabled, primary })}
      onClick={onClick}
      disabled={disabled}
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
