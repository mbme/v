import React from 'react';
import PropTypes from 'prop-types';
import s from 'client/styles';

const button = ({ disabled, primary }) => ({
  borderRadius: '2px',
  cursor: 'pointer',
  userSelect: 'none',
  padding: 'var(--spacing-fine) var(--spacing-medium)',
  textTransform: 'uppercase',
  letterSpacing: '1.2px',
  transition: 'background-color 100ms linear',

  extend: [
    {
      condition: !primary,
      color: 'var(--color-text)',
      backgroundColor: 'var(--bg-color)',
      border: 'var(--border)',
      ':hover': {
        backgroundColor: 'var(--bg-color-darker)',
      },
    },
    {
      condition: !primary && disabled,
      cursor: 'auto',
      color: 'var(--color-light)',
      backgroundColor: 'var(--bg-color-darker)',
    },
    {
      condition: primary && !disabled,
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-light)',
      ...s.withBorder,
    },
  ],
});

export default function Button({ onClick, disabled, primary, children }) {
  const className = s.cx(button({ disabled, primary }));

  return (
    <button className={className} onClick={onClick} disabled={disabled}>{children}</button>
  );
}
Button.propTypes = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  primary: PropTypes.bool,
  children: PropTypes.node.isRequired,
};
